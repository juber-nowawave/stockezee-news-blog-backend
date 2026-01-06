import express from "express";
import { fetchAndSaveNews, getAllNewsSummary, getNewsById, searchNewsByTitle } from "../controllers/newsController.js";

const router = express.Router();

router.get("/scrape", fetchAndSaveNews);
router.get("/", getAllNewsSummary);
router.get("/search", searchNewsByTitle);
router.get("/:id", getNewsById);

export default router;
