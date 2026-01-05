import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize Gemini
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 2048,
  apiKey: process.env.GEMINI_API_KEY,
});

const generateBlogContent = async (title, description) => {
  try {
    const prompt = PromptTemplate.fromTemplate(
      `You are an expert financial stock market analyst and blogger.
       Write a detailed, engaging blog post (approximately 500 words) based on the following news:
       
       News Title: {title}
       News Description: {description}

       Format the output specifically as HTML.
       - Use <h1> for the main title.
       - Use <h2> for subheadings.
       - Use <p> for paragraphs.
       - Use <ul> or <ol> if listing points.
       - Do not include <html>, <head>, or <body> tags, just the content structure.
       - Make it SEO friendly and professional.
       `
    );

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
      title: title,
      description: description,
    });
    console.log('---->>',response);
    
    return response;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null; 
  }
};

export { generateBlogContent };
