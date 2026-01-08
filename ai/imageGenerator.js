import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateImage = async (title) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return null;
    }

const prompt = `
Create a high-quality, text-free conceptual image inspired by the following news title:

"${title}"

Visual rules (strict):
- NO text, NO numbers, NO charts, NO tickers, NO labels
- NO screens, NO dashboards, NO graph axes
- Use ONLY symbolic, metaphorical elements
- Abstract market emotion and movement, not literal data
- Examples of allowed elements:
  • flowing lines
  • light trails
  • abstract shapes
  • human silhouettes
  • city skyline outlines
  • bull or bear silhouettes (no numbers)
  • glowing arrows without markings

Style:
- Cinematic, premium, editorial illustration
- Clean background
- Soft lighting
- Professional financial-news mood
- Indian context through color palette and environment (not text or logos)

Technical:
- Aspect ratio 16:9
- Ultra high quality
- No branding, no watermark
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        sample_count: 1, 
        aspect_ratio: "16:9" // Trying both cases as API versions vary
      },
    };

    const response = await axios.post(url, requestBody, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    // Check if we got a valid response with bytesBase64Encoded
    const predictions = response.data.predictions;
    if (!predictions || predictions.length === 0 || !predictions[0].bytesBase64Encoded) {
        console.error("No image data received from API:", JSON.stringify(response.data));
        return null;
    }

    const base64Image = predictions[0].bytesBase64Encoded;
    const imageBuffer = Buffer.from(base64Image, 'base64');

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
    console.error("Error generating image:", error.response ? error.response.data : error.message);
    return null;
  }
};

export { generateImage };
