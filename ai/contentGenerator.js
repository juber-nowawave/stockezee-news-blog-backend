import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 2048,
  apiKey: process.env.GEMINI_API_KEY,
});

const generateBlogContent = async (title, description) => {
  try {
    const prompt = PromptTemplate.fromTemplate(
      `
You are a senior Indian stock market analyst, financial journalist, and SEO expert.

Write a complete, high-quality, engaging blog post of approximately 500–800 words based on the following news:

News Title: {title}
News Description: {description}

IMPORTANT COMPLETION RULES:
- The blog must be fully completed from introduction to conclusion.
- Do NOT stop mid-sentence or mid-paragraph.
- End the blog with a clear, meaningful conclusion paragraph.
- Ensure every sentence is complete and grammatically correct.
- The final paragraph must clearly summarize the key insights and provide a takeaway for Indian traders or investors.

Target Audience:
Indian stock market traders, long-term investors, and finance enthusiasts.

Writing Objectives:
- Start with a strong hook explaining why this news matters in the Indian stock market context.
- Explain the news clearly in professional, easy-to-understand language.
- Focus on Indian market relevance including NSE, BSE, sector impact, and investor sentiment.
- Maintain accuracy, neutrality, and trustworthiness.
- Follow Google Search, Google Discover, and SEO content quality guidelines.

SEO Requirements:
- Naturally include keywords such as Indian stock market, NSE, BSE, stocks, traders, investors, market outlook, and sector impact.
- Use semantic SEO and related terms instead of keyword stuffing.
- Ensure smooth flow, logical structure, and high readability.

HTML Formatting Rules (Strict):
- Use <h1> for the main title.
- Use <h2> for all subheadings.
- Wrap every paragraph strictly inside <p> tags.
- Use <ul> or <ol> only when necessary for clarity.
- Use <strong> and <em> tags sparingly for emphasis.
- Do not include <html>, <head>, or <body> tags.
- Do not use star symbols or decorative characters.

Mandatory Content Structure:
1. <h1> SEO-optimized and engaging headline.
2. Introduction section with 1–2 complete paragraphs, each wrapped in <p> tags.
3. <h2> Background or context of the news, explained in complete <p> paragraphs.
4. <h2> Impact on Indian stock market and relevant sectors or stocks, written in <p> tags.
5. <h2> What this means for traders and investors, covering short-term and long-term perspectives in <p> tags.
6. <h2> Market outlook or expert-style analysis, written in well-structured <p> tags.
7. <h2> Conclusion with a clear summary and actionable insight for Indian market participants, written in <p> tags.

Final Output Requirement:
- Return ONLY the final, fully completed HTML-formatted blog.
- Do NOT add explanations, notes, or placeholders.
- Ensure the blog ends naturally with a completed conclusion paragraph.
       `
    );

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
      title: title,
      description: description,
    });
    return response;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null; 
  }
};

export { generateBlogContent };
