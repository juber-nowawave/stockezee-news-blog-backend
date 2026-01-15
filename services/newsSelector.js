import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 1024,
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2, // Keep it deterministic
});

/**
 * Selects the top 1 most impactful news items for Indian stock traders.
 * @param {Array} newsList - List of scraped news objects { title, description, source, ... }
 * @returns {Promise<Array>} - Array of the 1 selected news objects.
 */
export const selectTopNews = async (newsList) => {
  if (!newsList || newsList.length === 0) {
    return [];
  }

  // If we have very few items, just return them (upto 1)
  if (newsList.length <= 1) {
    console.log("Only 1 or fewer news items found. Returning all.");
    return newsList;
  }

  try {
    // 1. Prepare input for AI
    // We send index + title + description to save context window and make it easy to reference back.
    const newsInput = newsList.map((news, index) => {
      return `Article ID: ${index}\nTitle: ${news.title}\nSource: ${news.source}\nDescription: ${news.description}\n-------------------`;
    }).join("\n");

    const prompt = PromptTemplate.fromTemplate(`
You are an expert Indian Stock Market Analyst.
Your task is to review the following list of news articles and identify exactly ONE (1) story that is the MOST impactful for an Indian stock market trader right now.

Criteria for selection:
1. Material Impact: News that will move specific stocks or sectors immediately.
2. Credibility: Prefer reliable sources and factual developments over opinion.
3. Market Relevance: Prioritize earnings results, regulatory changes, macro data, or major corporate actions.

INPUT NEWS LIST:
{news_input}

OUTPUT FORMAT:
Return a JSON object containing an array of the 1 Selected Article IDs.
Example: {{ "selected_ids": [0] }}

Return ONLY valid JSON.
    `);

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);

    console.log(`Analyzing ${newsList.length} articles to pick top 1...`);

    const rawResponse = await chain.invoke({
      news_input: newsInput,
    });

    // Clean and parse
    let cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.selected_ids || !Array.isArray(parsed.selected_ids)) {
      console.warn("AI returned invalid format. Defaulting to first 1 articles.");
      return newsList.slice(0, 1);
    }

    const selectedIndices = parsed.selected_ids.slice(0, 1); // Ensure max 1
    
    const selectedNews = selectedIndices.map(index => newsList[index]).filter(item => item !== undefined);

    console.log(`Selected ${selectedNews.length} articles based on AI analysis.`);
    return selectedNews;

  } catch (error) {
    console.error("Error in selectTopNews:", error);
    // Fallback: return first 1
    return newsList.slice(0, 1);
  }
};
