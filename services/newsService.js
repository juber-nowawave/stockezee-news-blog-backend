import db from "../models/index.js";
import dotenv from "dotenv";
import { scrapeStockNews } from "./newsScraper.js";
import { generateBlogContent } from "../ai/contentGenerator.js";
import { generateImage } from "../ai/imageGenerator.js";
import { generateAndUploadImage } from "./newsImageService.js";
import { selectTopNews } from "./newsSelector.js";
import moment from "moment";
dotenv.config();
const StockNewsBlog = db.stockNewsBlog;

export const processStockNews = async () => {
  console.log("Starting news processing...");
  const newsData = await scrapeStockNews();
  let savedCount = 0;

  // 1. FILTER: Identify which news items are actually NEW (not in DB)
  const newNewsCandidates = [];
  for (const news of newsData) {
    const existing = await StockNewsBlog.findOne({
        where: { title: news.title },
    });
    if (!existing) {
        newNewsCandidates.push(news);
    }
  }

  console.log(`Found ${newNewsCandidates.length} new articles candidates out of ${newsData.length} scraped.`);

  if (newNewsCandidates.length === 0) {
      console.log("No new news to process.");
      return { totalScraped: newsData.length, savedNew: 0, data: newsData };
  }

  // 2. SELECT: Pick top 2 most important from the NEW candidates
  const topNews = await selectTopNews(newNewsCandidates);

  // 3. PROCESS: Generate content and save strictly for the selected ones
  for (const news of topNews) {
    try {
        let aiContent = null;
        
        // Generate AI content if not present
          aiContent = await generateBlogContent(news.title, news.description);
          if(!aiContent){
            continue;
          }
        // Fetch AI Image from external service and upload to S3
        let aiImageUrl = await generateAndUploadImage(news.title, news.description, news.image);
        if (!aiImageUrl) {
          aiImageUrl = process.env.FALL_BACK_IMAGE;
          console.log('------>>>',aiImageUrl,'<<<------');
        }

        await StockNewsBlog.create({
          title: news.title,
          description: news.description,
          image: news.image,
          source: news.source,
          ai_generated: aiContent.generated_blog,
          meta_title: aiContent.meta_title,
          meta_description: aiContent.meta_description,
          news_image: news.image,
          ai_image: aiImageUrl || '',
          time: moment().tz("Asia/Kolkata").format("HH:mm:ss"),
          created_at: moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
        });
        savedCount++;
        console.log(`Saved new article: ${news.title}`);

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
