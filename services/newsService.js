import db from "../models/index.js";
import { scrapeStockNews } from "./newsScraper.js";
import { generateBlogContent } from "../ai/contentGenerator.js";
import { generateImage } from "../ai/imageGenerator.js";
import moment from "moment";

const StockNewsBlog = db.stockNewsBlog;

export const processStockNews = async () => {
  console.log("Starting news processing...");
  const newsData = await scrapeStockNews();
  let savedCount = 0;

  for (const news of newsData) {
    try {
      const existing = await StockNewsBlog.findOne({
        where: { title: news.title },
      });

      if (!existing) {
        let aiContent = null;
        // let imageUrl = news.image;
        // imageUrl = await generateImage(news.title);

        // Generate AI content if not present
        if (!aiContent) {
          aiContent = await generateBlogContent(news.title, news.description);
        }
        console.log("22222---->>", aiContent);

        await StockNewsBlog.create({
          title: news.title,
          description: news.description,
          image: news.image,
          ai_generated: aiContent.generated_blog,
          meta_title: aiContent.meta_title,
          meta_description: aiContent.meta_description,
          news_image: news.image,
          ai_image: news.image,
          time: moment().tz("Asia/Kolkata").format("HH:mm:ss"),
          created_at: moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
        });
        savedCount++;
        console.log(`Saved new article: ${news.title}`);
      }
    } catch (err) {
      console.error(`Error processing news item ${news.title}:`, err);
      // Continue to next item even if one fails
    }
  }

  return {
    totalScraped: newsData.length,
    savedNew: savedCount,
    data: newsData,
  };
};
