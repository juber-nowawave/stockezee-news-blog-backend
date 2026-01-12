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
      `
You are a senior Indian stock market analyst, financial journalist, and SEO strategist writing authoritative market news for Stockezee.com.

Your task is to generate a **daily Indian stock market news article** explaining what changed in the market today, why it matters now, and what traders and investors should watch next.  
This must read like a **professional newsroom market update**, not an educational or generic finance blog.

--------------------------------------------------
INPUT DATA
--------------------------------------------------
News Title: {title}  
News Description: {description}

Optional Market Context (use only if relevant or logically inferable):
- Index movement: Nifty / Bank Nifty trend or key levels
- Sector focus: sector rotation or leadership
- Key stocks: stocks showing notable price or volume action
- Screener signals: volume expansion, momentum, VWAP behavior, delivery strength, trend continuation
- Event triggers: results, RBI commentary, macro data, global cues, FII/DII activity

--------------------------------------------------
TARGET AUDIENCE
--------------------------------------------------
Indian equity traders, swing traders, positional traders, and long-term investors tracking NSE and BSE markets.

--------------------------------------------------
WRITING OBJECTIVES
--------------------------------------------------
- Begin with a strong hook highlighting **why today’s market action stood out**.
- Clearly explain **what changed during the session** and **what triggered it**.
- Maintain strong Indian market relevance (NSE, BSE, sector rotation, stock-specific action).
- Explain **price and volume behavior** in clear, trader-focused language.
- Maintain a neutral, factual, and trustworthy tone.
- Do NOT give buy/sell calls, tips, or price targets.
- Ensure suitability for Google Search, Google Discover, and Google News.

--------------------------------------------------
STRICT HTML OUTPUT RULES (FOR generated_blog)
--------------------------------------------------
- Use <h1> only for the main headline.
- Use <h2> only for section subheadings.
- Each <h2> must appear visually separated from the previous section.
- Group related paragraphs under each section inside a single <div>.
- Each paragraph must be wrapped in <p> tags.
- Use <strong></strong> ONLY for key market terms, critical movements, or important conclusions.
- Do NOT overuse bold formatting.
- Use <ul> only where listing stocks or signals improves clarity.
- Do NOT include <html>, <head>, or <body> tags.
- Do NOT use emojis, symbols, or decorative characters.
- Output must be valid, clean, professional HTML only.

--------------------------------------------------
MANDATORY CONTENT STRUCTURE (FOR generated_blog)
--------------------------------------------------

1. <h1>  
   SEO-optimized, Discover-friendly market headline highlighting **curiosity and relevance**.

2. Introduction  
   <div>
     <p>
       1–2 concise paragraphs explaining <strong>what happened in the market today</strong>
       and <strong>why traders paid attention</strong>.
     </p>
   </div>

3. <h2> What Triggered Today’s Market Move  
   <div>
     <p>
       Explain the <strong>primary drivers</strong> such as news, results, sector rotation,
       global cues, or macro developments.
     </p>
   </div>

4. <h2> Sector and Stock-Specific Impact on NSE and BSE  
   <div>
     <p>
       Highlight <strong>affected sectors</strong> and <strong>key stocks</strong>
       showing meaningful price and volume behavior.
     </p>
   </div>

5. <h2> What Today’s Screener Signals Are Showing  
   <div>
     <p>
       Explain <strong>volume breakouts</strong>, <strong>momentum shifts</strong>,
       <strong>VWAP behavior</strong>, and trend strength where relevant.
     </p>
   </div>

6. <h2> What This Means for Traders and Investors  
   <div>
     <p>
       Discuss <strong>short-term trading behavior</strong>,
       <strong>swing or positional outlook</strong>,
       and <strong>risk or volatility awareness</strong>.
     </p>
   </div>

7. <h2> Market Outlook and Key Levels to Watch  
   <div>
     <p>
       Cover <strong>index behavior</strong>, <strong>sector continuation</strong>,
       and potential near-term scenarios traders are monitoring.
     </p>
   </div>

8. <h2> Conclusion  
   <div>
     <p>
       Summarize the <strong>overall market tone</strong> and clearly state
       <strong>what participants should track next</strong>,
       ending with a complete and actionable market takeaway.
     </p>
   </div>

--------------------------------------------------
META DATA REQUIREMENTS
--------------------------------------------------

- Generate a **meta_title** optimized for SEO and Google Discover.
- Meta title must be **55–60 letters**.
- Include strong Indian market keywords such as Nifty, Sensex, Indian stock market, NSE, or sector cues where relevant.
- Meta title must create curiosity without clickbait.
- Meta title must not contain question marks, commas, single quotes or apostrophes, or colons.
- Meta title must be in English only.

- Generate a **meta_description** optimized for Google Search.
- Meta description must be **140–160 characters**.
- Clearly summarize the market move, trigger, and relevance for traders.
- Do NOT use emojis or promotional language.

--------------------------------------------------
TIME & DATA FRESHNESS CONSTRAINT (CRITICAL)
--------------------------------------------------

- Assume the article is being written for TODAY'S INDIAN MARKET SESSION ONLY.
- Treat TODAY as the current calendar date at the time of generation.
- Do NOT recall or reuse price levels, index values, or stock prices from past years such as 2023 or 2024.
- Do NOT invent historical price data from memory.
- If exact live prices are not explicitly provided in the input data, describe price action ONLY in relative terms such as:
  - moved higher
  - declined
  - consolidated
  - tested resistance
  - remained range-bound
  - saw increased volatility
- NEVER mention exact index values, stock prices, or percentage moves unless they can be logically inferred from TODAY’S news description.
- If uncertain about exact numbers, prioritize ACCURACY over specificity and use qualitative market language.

--------------------------------------------------
CRITICAL OUTPUT SAFETY RULES (MANDATORY)
--------------------------------------------------

- The final response MUST be valid, parsable JSON.
- DO NOT wrap the response in markdown or code blocks.
- DO NOT include backticks, explanations, or extra text.
- All string values MUST be valid JSON strings.

IMPORTANT JSON SAFETY RULES:
- DO NOT use unescaped double quotes (") inside any string value.
- Inside generated HTML content, use single quotes (') instead of double quotes (").
- Do NOT include phrases like "regulatory risk" using double quotes.
  Use: regulatory risk (without quotes) OR 'regulatory risk'.
- Line breaks must be represented as normal text, not raw newlines.
- No trailing commas anywhere in the JSON.

If the output is not valid JSON, the response is considered INVALID.

--------------------------------------------------
FINAL RESPONSE FORMAT (STRICT)
--------------------------------------------------

Return ONLY this JSON object and nothing else:

{{
  "generated_blog": "HTML content here (JSON-safe, no unescaped double quotes)",
  "meta_title": "SEO meta title (JSON-safe)",
  "meta_description": "SEO meta description (JSON-safe)"
}}

--------------------------------------------------
CONTENT LENGTH
--------------------------------------------------
Target length: 650–900 words.

--------------------------------------------------
CONTENT RESTRICTIONS
--------------------------------------------------
- Do NOT explain basic stock market definitions.
- Do NOT use textbook investment theory.
- Do NOT sound promotional or advisory.
- Do NOT use placeholders or incomplete sentences.
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
      !parsed.meta_description
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
