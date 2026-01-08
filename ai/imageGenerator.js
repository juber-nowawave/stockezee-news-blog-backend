import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { HfInference } from '@huggingface/inference';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY); // Initialize once outside the function for efficiency

const generateImage = async (title) => {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("HUGGINGFACE_API_KEY is not set");
      return null;
    }

    const prompt = `
Create a high-quality, text-free editorial hero image inspired by the following Indian stock market news title:
 
"${title}"
 
The image must visually represent market emotion, momentum, or uncertainty using symbolic and metaphorical elements only, not literal data.
 
-------------------
STRICT VISUAL RULES
-------------------
- NO text, NO numbers, NO charts, NO tickers, NO labels
- NO screens, NO dashboards, NO graph axes
- NO logos, NO branding, NO watermark
- Do NOT show trading terminals or mobile apps
- Do NOT display currency symbols or percentages
 
-------------------
ALLOWED VISUAL ELEMENTS
-------------------
Use only abstract and symbolic elements such as:
- flowing light trails suggesting momentum
- glowing paths or rising/falling directional motion
- abstract wave patterns
- bull or bear silhouettes without markings
- human silhouettes reacting to movement
- city skyline outlines with atmospheric depth
- layered geometric shapes suggesting volatility
 
-------------------
MOOD & STORY
-------------------
The image should visually communicate one of these emotions based on the news:
- optimism and breakout
- tension and uncertainty
- sudden momentum
- cautious consolidation
 
Use lighting, motion blur, and composition to express the mood, not symbols or text.
 
-------------------
STYLE
-------------------
- Cinematic financial news illustration
- Premium editorial look
- Clean composition with strong focal point
- Soft dramatic lighting
- Depth of field for professional photography feel
- Subtle Indian market context via:
  • warm tones
  • monsoon sky hues
  • city silhouettes
  (no flags, no monuments, no cultural symbols)
 
-------------------
COMPOSITION
-------------------
- Clear central subject
- Strong contrast for thumbnail visibility
- Minimal clutter
- Designed to work well as mobile feed preview
 
-------------------
TECHNICAL
-------------------
- Aspect ratio: 16:9 (use 1792x1008 resolution)
- Ultra high resolution
- Sharp foreground, soft background
- Natural color grading
`;

    const result = await hf.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: prompt,
      parameters: {
        num_inference_steps: 28,
        guidance_scale: 7.5,
        width: 1792, // For 16:9 aspect
        height: 1008,
        negative_prompt: "text, numbers, charts, logos, people with faces, low quality, blurry"
      }
    });

    if (!result) {
      console.error("No image generated from API");
      return null;
    }

    // Convert Blob to Buffer (Node.js)
    const arrayBuffer = await result.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Create public/images directory if it doesn't exist
    const publicDir = path.join(__dirname, "../public/images");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate a unique filename
    const filename = `news_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const filePath = path.join(publicDir, filename);

    // Save the file
    fs.writeFileSync(filePath, imageBuffer);

    // Return the relative URL path
    return `/public/images/${filename}`;

  } catch (error) {
    console.error("Error generating image:", error.message || error);
    return null;
  }
};

export { generateImage };