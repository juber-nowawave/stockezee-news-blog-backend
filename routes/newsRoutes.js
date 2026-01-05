import express from "express";
import { fetchAndSaveNews, getAllNews } from "../controllers/newsController.js";

const router = express.Router();

// Route to trigger scraping manually
router.get("/scrape", fetchAndSaveNews);

// Route to get all stored news
router.get("/", getAllNews);

export default router;
