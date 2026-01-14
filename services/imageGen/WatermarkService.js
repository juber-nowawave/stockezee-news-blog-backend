import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.join(__dirname, '../../stockezee_logo.png'); // Assuming logo is in root

class WatermarkService {
    static async applyWatermark(imagePath) {
        if (!fs.existsSync(LOGO_PATH)) {
            console.warn("⚠️ Watermark logo not found at:", LOGO_PATH);
            return;
        }

        try {
            const image = sharp(imagePath);
            const metadata = await image.metadata();
            const width = metadata.width;
            const height = metadata.height;

            // Resize Logo (20% of image width)
            const logoWidth = Math.round(width * 0.20);
            
            const logoBuffer = await sharp(LOGO_PATH)
                .resize({ width: logoWidth })
                .toBuffer();
    
            const logoMetadata = await sharp(logoBuffer).metadata();
            const logoHeight = logoMetadata.height;

            // Calculate Position (Bottom Right with 3% padding)
            const padding = Math.round(width * 0.03);
            const left = width - logoWidth - padding;
            const top = height - logoHeight - padding;

            const buffer = await image
                .composite([{ input: logoBuffer, top: top, left: left }])
                .toBuffer();

            // Overwrite original
            await sharp(buffer).toFile(imagePath); // sharp can't overwrite in place effectively without buffer first
            
            console.log("💧 Watermark applied successfully.");
        } catch (error) {
            console.error(`❌ Watermarking Error: ${error.message}`);
        }
    }
}

export { WatermarkService };
