import express from "express";
import { fetchAndSaveNews, getAllNewsSummary, getNewsById, searchNewsByTitle, getNewsByMetaTitle } from "../controllers/newsController.js";

const router = express.Router();

router.get("/scrape", fetchAndSaveNews);
router.get("/all", getAllNewsSummary);
router.get("/search", searchNewsByTitle);
router.get("/details", getNewsById);
router.get("/meta-title", getNewsByMetaTitle);
export default router;
