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
const prompt = PromptTemplate.fromTemplate(`
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
STRICT HTML OUTPUT RULES
--------------------------------------------------
- Use <h1> only for the main headline.
- Use <h2> only for section subheadings.
- Each <h2> must appear visually separated from the previous section (assume top spacing).
- Group related paragraphs under each section inside a single <div>.
- Each paragraph must be wrapped in <p> tags.
- Use <strong><u>...</u></strong> ONLY for key market terms, critical movements, or important conclusions.
- Do NOT overuse bold or underline formatting.
- Use <ul> only where listing stocks or signals improves clarity.
- Do NOT include <html>, <head>, or <body> tags.
- Do NOT use emojis, symbols, or decorative characters.
- Output must be valid, clean, professional HTML only.

--------------------------------------------------
MANDATORY CONTENT STRUCTURE
--------------------------------------------------

1. <h1>  
   SEO-optimized, Discover-friendly market headline highlighting **curiosity and relevance**.

2. Introduction  
   <div>
     <p> 1–2 concise paragraphs explaining <strong><u>what happened in the market today</u></strong> and <strong><u>why traders paid attention</u></strong>. </p>
   </div>

3. <h2> What Triggered Today’s Market Move  
   <div>
     <p> Explain the <strong><u>primary drivers</u></strong> such as news, results, sector rotation, global cues, or macro developments. </p>
   </div>

4. <h2> Sector and Stock-Specific Impact on NSE and BSE  
   <div>
     <p> Highlight <strong><u>affected sectors</u></strong> and <strong><u>key stocks</u></strong> showing meaningful price and volume behavior. </p>
   </div>

5. <h2> What Today’s Screener Signals Are Showing  
   <div>
     <p> Explain <strong><u>volume breakouts</u></strong>, <strong><u>momentum shifts</u></strong>, <strong><u>VWAP behavior</u></strong>, and trend strength where relevant. </p>
   </div>

6. <h2> What This Means for Traders and Investors  
   <div>
     <p> Discuss <strong><u>short-term trading behavior</u></strong>, <strong><u>swing or positional outlook</u></strong>, and <strong><u>risk or volatility awareness</u></strong>. </p>
   </div>

7. <h2> Market Outlook and Key Levels to Watch  
   <div>
     <p> Cover <strong><u>index behavior</u></strong>, <strong><u>sector continuation</u></strong>, and potential near-term scenarios traders are monitoring. </p>
   </div>

8. <h2> Conclusion  
   <div>
     <p> Summarize the <strong><u>overall market tone</u></strong> and clearly state <strong><u>what participants should track next</u></strong>, ending with a complete and actionable market takeaway. </p>
   </div>

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

--------------------------------------------------
FINAL OUTPUT REQUIREMENT
--------------------------------------------------
Return ONLY the final, fully completed HTML-formatted article.
Do NOT include explanations, notes, or extra text.
`);


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
