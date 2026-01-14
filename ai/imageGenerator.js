import dotenv from 'dotenv';
import { GoogleImagenGenerator, GeminiVisionAnalyzer } from '../services/imageGen/GoogleGenAIService.js';
import { PexelsService } from '../services/imageGen/PexelsService.js';
import { PromptSynthesizer, VisualEntityExtractor } from '../services/imageGen/PromptSynthesizer.js';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_SAVE_DIR = path.join(__dirname, '../public/images');

const googleKey = process.env.GEMINI_API_KEY;
if(googleKey) console.log("Debug: Key starts with:", googleKey.substring(0, 8) + "..."); 
const pexelsKey = process.env.PEXELS_API_KEY;

const vision = new GeminiVisionAnalyzer(googleKey);
const imagen = new GoogleImagenGenerator(googleKey);
const pexels = new PexelsService(pexelsKey);

const generateImage = async (headline, summary, imageUrl = null, articleId = 'temp') => {
  console.log(`\n==================================================`);
  console.log(`🖼️ Processing: ${headline.substring(0, 50)}...`);

  let finalPrompt = "";

  // 1. MULTIMODAL PROMPT SYNTHESIS (Vision + Text)
  if (imageUrl) {
    // Vision -> Prompt
    finalPrompt = await vision.analyzeAndSynthesize(imageUrl, headline, summary);
  } else {
    // Fallback logic
     const visualDesc = VisualEntityExtractor.extractVisualDescription(headline, summary);
     finalPrompt = PromptSynthesizer.synthesize(headline, summary, visualDesc);
  }
  
  // If Vision failed or returned null, ensure we have a prompt
  if (!finalPrompt) {
     const visualDesc = VisualEntityExtractor.extractVisualDescription(headline, summary);
     finalPrompt = PromptSynthesizer.synthesize(headline, summary, visualDesc);
  }

  // 2. GENERATION (Google Imagen)
  const result = await imagen.generate(finalPrompt, articleId);
  if (result) {
    return {
        success: true,
        local_path: result.local_path,
        relative_path: result.relative_path,
        keywords: result.keywords
    };
  }

  // 3. FALLBACK (Pexels)
  const visualDesc = VisualEntityExtractor.extractVisualDescription(headline, summary);
  console.log(`⚠️ AI Failed, Searching Pexels for: '${visualDesc}'`);
  
  const pexelsData = await pexels.search(visualDesc);
  if (pexelsData) {
      console.log(`✅ Found on Pexels: ${pexelsData.url}`);
      const localPath = await pexels.download(pexelsData.src.large2x, articleId);
      if (localPath) {
          const relativePath = `/public/images/${path.basename(localPath)}`;
          return {
              success: true,
              local_path: localPath,
              relative_path: relativePath,
              keywords: [visualDesc]
          };
      }
  }

  return null;
};

export { generateImage };