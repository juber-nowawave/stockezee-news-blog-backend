import db from "../models/index.js";
import { scrapeStockNews } from "../services/newsScraper.js";
import { generateBlogContent } from "../ai/contentGenerator.js";

const StockNewsBlog = db.stockNewsBlog;
export const fetchAndSaveNews = async (req, res) => {
  try {
    const newsData = await scrapeStockNews();
    let savedCount = 0;

    for (const news of newsData) {
      // Check if news with same title already exists to avoid duplicates
      // Note: In a real app, you might want a more robust unique check (e.g. hash or URL)
      // Since the model doesn't have a unique constraint on title purely defined in what I saw,
      // I'll do a findOne check.
      
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
          // time: new Date().toLocaleTimeString(), // handled by defaultValue/DB usually, but let's see
          // created_at: new Date() // handled by defaultValue
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
