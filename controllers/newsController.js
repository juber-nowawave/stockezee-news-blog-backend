import { processStockNews } from "../services/newsService.js";
import db from "../models/index.js";
const { stockNewsBlog } = db;
export const fetchAndSaveNews = async (req, res) => {
  try {
    const result = await processStockNews();

    res.status(200).json({
      message: "News scraping completed",
      ...result
    });
  } catch (error) {
    console.error("Error in fetchAndSaveNews:", error);
    res.status(500).json({ message: "Error fetching news", error: error.message });
  }
};

export const getAllNews = async (req, res) => {
  try {
    const news = await stockNewsBlog.findAll({
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
    const news = await stockNewsBlog.findByPk(id);

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

    const news = await stockNewsBlog.findAll({
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
    const news = await stockNewsBlog.findAll({
      attributes: ['id', 'image', 'title', 'description','created_at','time'],
      order: [['created_at', 'DESC'], ['time', 'DESC']]
    });
    
    res.status(200).json(news);
  } catch (error) {
    console.error("Error getting news summary:", error);
    res.status(500).json({ message: "Error retrieving news summary" });
  }
};
