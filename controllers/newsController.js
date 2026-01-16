import { processStockNews } from "../services/newsService.js";
import { sendResponse } from "../utils/api_response.js";
import db from "../models/index.js";
import { Op } from "sequelize";
const { stockNewsBlog } = db;
export const fetchAndSaveNews = async (req, res) => {
  try {
    const result = await processStockNews();
    return sendResponse(res, 200, "News scraping completed", result);
  } catch (error) {
    console.error("Error in fetchAndSaveNews:", error);
    return sendResponse(res, 500, "Error fetching news", { error: error.message });
  }
};

export const getAllNewsSummary = async (req, res) => {
  try {
    const news = await stockNewsBlog.findAll({
      order: [['created_at', 'DESC'], ['time', 'DESC']],
      attributes:{exclude: ['ai_generated','source','news_image','title','description','ai_title','ai_description'],
      include: [
       ['ai_title', 'title'], // alias ai_title as title
       ['ai_description', 'description'] // alias ai_description as description
       ]  
      }
    });
    return sendResponse(res, 200, "News summary retrieved", news);
  } catch (error) {
    console.error("Error getting news summary:", error);
    return sendResponse(res, 500, "Error retrieving news summary", { error: error.message });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.query;
    const news = await stockNewsBlog.findByPk(id,{
      attributes:{exclude: ['source','news_image','title','description','ai_title','ai_description'],
       include: [
        ['ai_title', 'title'], // alias ai_title as title
        ['ai_description', 'description'] // alias ai_description as description
        ]
      }
    });

    if (!news) {
      return sendResponse(res, 404, "News not found", []);
    }

    return sendResponse(res, 200, "News retrieved", news);
  } catch (error) {
    console.error("Error getting news by ID:", error);
    return sendResponse(res, 500, "Error retrieving news", { error: error.message });
  }
};

export const getNewsByMetaTitle = async (req, res) => {
  try {
    let { meta_title } = req.query;
    const news = await stockNewsBlog.findOne({
      where: {
        meta_title: { [Op.iLike]: meta_title }
      },
      attributes:{exclude: ['source','news_image','title','description','ai_title','ai_description'],
      include: [
       ['ai_title', 'title'], // alias ai_title as title
       ['ai_description', 'description'] // alias ai_description as description
       ]  
      }
    });

    if (!news) {
      return sendResponse(res, 404, "News not found", []);
    }

    return sendResponse(res, 200, "News retrieved", news);
  } catch (error) {
    console.error("Error getting news by ID:", error);
    return sendResponse(res, 500, "Error retrieving news", { error: error.message });
  }
};

export const searchNewsByTitle = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return sendResponse(res, 400, "Query parameter is required", []);
    }

    const news = await stockNewsBlog.findAll({
      where: {
        title: {
          [db.Sequelize.Op.ilike]: `%${query}%`
        }
      },
      attributes: ['id',['ai_title', 'title']]
    });

    return sendResponse(res, 200, "Search results", news);
  } catch (error) {
    console.error("Error searching news:", error);
    return sendResponse(res, 500, "Error searching news", { error: error.message });
  }
};