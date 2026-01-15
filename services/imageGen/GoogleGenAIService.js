import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WatermarkService } from './WatermarkService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_SAVE_DIR = path.join(__dirname, '../../public/images');

// Ensure save directory exists
if (!fs.existsSync(IMAGES_SAVE_DIR)) {
  fs.mkdirSync(IMAGES_SAVE_DIR, { recursive: true });
}

class GoogleImagenGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.IMAGEN_API_URL;
  }

  async generate(prompt, articleId) {
    if (!this.apiKey) {
      console.error("GOOGLE_API_KEY is not set");
      return null;
    }
    const url = `${this.baseUrl}?key=${this.apiKey}`;
    
    console.log(`🎨 Google Imagen Generating: '${prompt.substring(0, 40)}...'`);

    const payload = {
      instances: [
        {
          prompt: prompt
        }
      ],
      parameters: {
        aspectRatio: "16:9" 
      }
    };

    try {
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      if (response.status === 200) {
        const data = response.data;
        if (data.predictions && data.predictions.length > 0) {
          const b64Image = data.predictions[0].bytesBase64Encoded;
          const imgBuffer = Buffer.from(b64Image, 'base64');
          return await this._saveImage(imgBuffer, articleId, "google_imagen");
        } else {
          console.error(`❌ No predictions in response: ${JSON.stringify(data)}`);
        }
      } else {
        console.error(`❌ Google API Error ${response.status}: ${response.statusText}`);
        if(response.data) console.error("Error Detail:", JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
       console.error(`❌ Google GenAI Exception: ${error.message}`);
       if (error.response) console.error("Full Error Response:", JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }

  _saveImage(buffer, articleId, sourceTag) {
    const filename = `article_${articleId}.jpg`;
    const filePath = path.join(IMAGES_SAVE_DIR, filename);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Saved to ${filePath}`);
    
    // APPLY WATERMARK
    // We need to await this, but _saveImage is not async in the original call chain if we are not careful.
    // However, in JS file operations with sharp are async. 
    // Let's make _saveImage async and await it in generate.
    // But generate calls it at the end. 
    
    return this._applyWatermarkAndReturn(filePath, sourceTag, filename);
  }

  async _applyWatermarkAndReturn(filePath, sourceTag, filename) {
      const newPath = await WatermarkService.applyWatermark(filePath);
      const newFilename = path.basename(newPath);
      
      return {
        source: sourceTag,
        local_path: newPath,
        relative_path: `/public/images/${newFilename}`
      };
  }
}

class GeminiVisionAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.GEMINI_FLASH_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  }

  async analyzeAndSynthesize(imageUrl, headline, summary) {
    console.log(`👁️ Gemini Vision Analyzing: ${imageUrl.substring(0, 40)}...`);
    
    const base64Img = await this._prepareReferenceImage(imageUrl);
    if (!base64Img) {
      console.log("❌ Failed to prepare image for Vision Analysis");
      return null;
    }

    const url = `${this.baseUrl}?key=${this.apiKey}`;
    const payload = {
      contents: [{
        parts: [
          {
            text: `You are a professional News Photo Editor. 
TASK: Create a text-to-image prompt for the news headline: '${headline}'.
CONTEXT: ${summary}
REFERENCE: The attached image is the Style/Tone reference. 
INSTRUCTIONS: 
1. Analyze the reference image style. 
2. Fill in the bracketed placeholders [PRIMARY FINANCIAL SUBJECT] and [CLEAR PHYSICAL ACTION] based on the news headline.
3. Output ONLY the final prompt string based on this template:

Photorealistic editorial news image of [PRIMARY FINANCIAL SUBJECT], [CLEAR PHYSICAL ACTION OR MARKET CONTEXT DIRECTLY RELATED TO THE HEADLINE].

Scene & Objects: Depict real-world financial elements such as stock market trading screens, commodity assets (gold bars, silver coins, oil barrels), currency notes, financial charts displayed on monitors, trading floors, industrial infrastructure, ports, refineries, vaults, or urban financial districts, depending on the news topic.
Composition: Strong central subject, clean background, balanced framing suitable for a news thumbnail, shallow depth of field, no clutter, subject clearly readable at small sizes.
Lighting: Professional newsroom lighting — realistic, high contrast, cinematic yet natural, emphasizing textures of physical objects (metal, glass, paper, screens).
Style: Match the exact visual style, tone, lighting, color grading, and camera perspective of the provided reference image — realistic editorial photography, neutral colors, sharp focus, credible news aesthetics.
Mood: Serious, factual, market-driven, credible, global finance tone — no dramatization, no exaggeration.
Camera: DSLR or full-frame mirrorless, 35–50mm lens look, high resolution, ultra-realistic details.
Restrictions: No text, no numbers, no logos, no charts floating in air, no abstract symbols, no illustrations, no CGI look, no watermarks.
Purpose: High-impact financial news thumbnail for a professional market news website.`
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Img
            }
          }
        ]
      }]
    };

    try {
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 150000
      });

      if (response.status === 200) {
        const data = response.data;
        if (data.candidates && data.candidates.length > 0) {
          const generatedPrompt = data.candidates[0].content.parts[0].text;
          console.log(`🧠 Gemini Vision Prompt: '${generatedPrompt.substring(0, 80)}...'`);
          return generatedPrompt.trim();
        }
      }
       console.error(`❌ Gemini Vision Error ${response.status}`);
       if (response.data) {
           console.error("Error Detail:", JSON.stringify(response.data, null, 2));
       }
    } catch (error) {
       console.error(`❌ Gemini Vision Exception: ${error.message}`);
       if (error.response) {
           console.error("Full Error Response:", JSON.stringify(error.response.data, null, 2));
       }
    }
    return null;
  }

  async _prepareReferenceImage(imageUrl) {
      if (!imageUrl) return null;
      try {
          console.log(`⬇️ Downloading reference: ${imageUrl.substring(0, 50)}...`);
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
          if (response.status !== 200) return null;
          
          const buffer = Buffer.from(response.data);
          
          // Note: In Node.js we might want to use sharp to resize/normalize like in Python
          // For now, we just pass the base64.
          // TODO: Add resizing if needed using sharp.
          
          return buffer.toString('base64');
      } catch (error) {
          console.error(`❌ Image Processing Error: ${error.message}`);
          return null;
      }
  }
}

export { GoogleImagenGenerator, GeminiVisionAnalyzer };
