import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 8192,
  apiKey: process.env.GEMINI_API_KEY,
});

const generateBlogContent = async (title, description) => {
  try {
    const prompt = PromptTemplate.fromTemplate(
`You are a senior Indian stock market analyst, financial journalist, and SEO editor writing for Stockezee.com Markets.
 
Your task is to generate a same-day Indian market news article that explains what happened in TODAY’S market session, why it matters, and what traders and investors are watching next. The tone must be factual, newsroom-style, and neutral.
 
--------------------------------------------------
INPUT DATA
--------------------------------------------------
 
Title Input:
{title}
 
Description Input:
{description}
 
--------------------------------------------------
TIME & DATA FRESHNESS CONSTRAINT (CRITICAL)
--------------------------------------------------
 
- Treat TODAY as the current Indian market trading day.
- Do NOT recall or reuse price levels, index values, or stock prices from past years.
- Do NOT invent numerical data.
- If exact prices or percentage moves are not explicitly present in the input, describe price action ONLY in qualitative terms such as:
  moved higher
  declined
  consolidated
  remained range bound
  saw increased volatility
  tested key levels
- NEVER mention exact numbers unless they are clearly stated in the input description.
- Accuracy must always be prioritized over specificity.
 
--------------------------------------------------
WRITING OBJECTIVES
--------------------------------------------------
 
- Start with a strong hook explaining why today’s market development matters.
- Clearly explain the market trigger or event.
- Focus on Indian market relevance including NSE, BSE, sector movement, and sentiment.
- Explain stock and sector reaction in trader-friendly language.
- Maintain a serious, professional, non-promotional tone.
- Do NOT provide buy or sell advice.
 
--------------------------------------------------
STRICT HTML OUTPUT RULES (FOR generated_blog)
--------------------------------------------------
- The <h1> tag is STRICTLY FORBIDDEN.
- Do NOT use <h1> anywhere in the generated_blog.
- If a main headline is required, use <h2> instead.
- All headings must use <h2> or other appropriate heading tags, but NEVER <h1>.
- Each <h2> must appear visually separated from the previous section.
- Group related paragraphs under each section inside a single <div>.
- Each paragraph must be wrapped in <p> tags.
- Use <strong></strong> ONLY for key market terms, critical movements, or important conclusions.
- Do NOT overuse bold formatting.
- Use <ul> only where listing stocks or signals improves clarity.
- Do NOT include <html>, <head>, or <body> tags.
- Do NOT use emojis, symbols, or decorative characters.
- Output must be valid, clean, professional HTML only.
- Before returning the final output, recheck the content.
- The character * must never appear anywhere in the output.
- This includes single or double asterisks.
- If emphasis is needed use HTML strong tags only.
- If a star character appears the response is invalid.
 
--------------------------------------------------
MANDATORY CONTENT STRUCTURE
--------------------------------------------------
 
1. <h1>
   SEO-optimized newsroom headline aligned with the input title.
 
2. Introduction
   1–2 paragraphs explaining what happened today in the Indian market and why it drew attention.
 
3. <h2> What Triggered the Market Reaction Today
   Explain the news event or development driving sentiment.
 
4. <h2> Impact on Indian Markets and Key Sectors
   Describe how sectors and stocks reacted in qualitative terms.
 
5. <h2> What This Means for Traders and Investors
   Explain short-term sentiment and near-term considerations without advice.
 
6. <h2> Market Outlook Going Ahead
   Discuss possible continuation, caution, or monitoring points using neutral language.
 
7. <h2> Conclusion
   Summarize the key takeaway for Indian market participants.
   End with a clear, complete closing paragraph.
 
--------------------------------------------------
CONTENT LENGTH
--------------------------------------------------
 
Target length: 650 to 900 words.
 
--------------------------------------------------
FINAL META TITLE VALIDATION CRITICAL
--------------------------------------------------
 
Before returning the final JSON:
- Verify that meta_title contains ONLY English letters and spaces.
- If any symbol, punctuation, number, or special character exists, regenerate meta_title until compliant.
- Do NOT mention this validation in the output.
 
--------------------------------------------------
CRITICAL OUTPUT SAFETY RULES
--------------------------------------------------
 
- The final response MUST be valid parsable JSON.
- Do NOT wrap the output in markdown or code blocks.
- Do NOT include explanations, comments, or extra text.
- Do NOT include backticks.
- All values must be valid JSON strings.
- Do NOT use unescaped double quotes inside any string.
- Use single quotes inside generated HTML content.
- No trailing commas anywhere in the JSON.
 
--------------------------------------------------
FINAL OUTPUT FORMAT STRICT
--------------------------------------------------
 
Return ONLY this JSON object and nothing else:
 
{{
  "generated_blog": "HTML content here",
  "ai_title": "AI generated newsroom style headline",
  "ai_description": "AI generated editorial summary aligned with the article",
  "meta_title": "SEO compliant title using only letters and spaces",
  "meta_description": "SEO meta description summarizing the article clearly"
}}
`
    );

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);

    const rawResponse = await chain.invoke({
      title: title,
      description: description,
    });
    if (!rawResponse || typeof rawResponse !== "string") {
      throw new Error("Invalid AI response");
    }

    let cleaned = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    cleaned = cleaned.replace(/,\s*}/g, "}");

    const parsed = JSON.parse(cleaned);

    if (
      !parsed.generated_blog ||
      !parsed.meta_title ||
      !parsed.meta_description ||
      !parsed.ai_title ||
      !parsed.ai_description
    ) {
      throw new Error("Missing required fields in AI response");
    }
    return parsed;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};

export { generateBlogContent };
