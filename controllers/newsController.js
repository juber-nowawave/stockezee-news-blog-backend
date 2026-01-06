import db from "../models/index.js";
import { scrapeStockNews } from "../services/newsScraper.js";
import { generateBlogContent } from "../ai/contentGenerator.js";

const StockNewsBlog = db.stockNewsBlog;
export const fetchAndSaveNews = async (req, res) => {
  try {
    const newsData = await scrapeStockNews();
    let savedCount = 0;

    for (const news of newsData) {
      const existing = await StockNewsBlog.findOne({ where: { title: news.title } });
      let aiContent = null;
      if (!existing) {
          aiContent = await generateBlogContent(news.title, news.description);
        try {
        } catch (err) {
            console.error(`AI generation failed for ${news.title}:`, err);
        }

        await StockNewsBlog.create({
          title: news.title,
          description: news.description,
          image: news.image,
          ai_generated: aiContent
        });
        savedCount++;
      }
    }

    res.status(200).json({
      message: "News scraping completed",
      totalScraped: newsData.length,
      savedNew: savedCount,
      data: newsData
    });
  } catch (error) {
    console.error("Error in fetchAndSaveNews:", error);
    res.status(500).json({ message: "Error fetching news", error: error.message });
  }
};

export const getAllNews = async (req, res) => {
  try {
    const news = await StockNewsBlog.findAll({
      order: [['created_at', 'DESC'], ['time', 'DESC']]
    });
    res.status(200).json(news);
  } catch (error) {
    console.error("Error getting news:", error);
    res.status(500).json({ message: "Error retrieving news" });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await StockNewsBlog.findByPk(id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    console.error("Error getting news by ID:", error);
    res.status(500).json({ message: "Error retrieving news" });
  }
};

export const searchNewsByTitle = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const news = await StockNewsBlog.findAll({
      where: {
        title: {
          [db.Sequelize.Op.ilike]: `%${query}%`
        }
      },
      attributes: ['id', 'title']
    });

    res.status(200).json(news);
  } catch (error) {
    console.error("Error searching news:", error);
    res.status(500).json({ message: "Error searching news" });
  }
};

export const getAllNewsSummary = async (req, res) => {
  try {
    const news = await StockNewsBlog.findAll({
      attributes: ['id', 'image', 'title', 'description'],
      order: [['created_at', 'DESC'], ['time', 'DESC']]
    });
    
    res.status(200).json(news);
  } catch (error) {
    console.error("Error getting news summary:", error);
    res.status(500).json({ message: "Error retrieving news summary" });
  }
};
