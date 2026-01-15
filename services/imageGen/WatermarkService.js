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

            // 1. Resize/Crop to 861x381
            const TARGET_WIDTH = 861;
            const TARGET_HEIGHT = 381;

            const resizedBuffer = await image
                .resize({
                    width: TARGET_WIDTH,
                    height: TARGET_HEIGHT,
                    fit: sharp.fit.cover, // Crop if aspect ratio doesn't match
                    position: sharp.strategy.attention // Focus on interesting parts
                })
                .toBuffer();

            // 2. Prepare Watermark
            // Resize Logo (15% of target width for better proportion)
            const logoWidth = Math.round(TARGET_WIDTH * 0.15);
            
            const logoBuffer = await sharp(LOGO_PATH)
                .resize({ width: logoWidth })
                .toBuffer();
    
            const logoMetadata = await sharp(logoBuffer).metadata();
            const logoHeight = logoMetadata.height;

            // 3. Calculate Position (Bottom LEFT with padding)
            const padding = Math.round(TARGET_WIDTH * 0.02); // 2% padding
            const left = padding; // Bottom LEFT
            const top = TARGET_HEIGHT - logoHeight - padding;

            // 4. Composite
            const finalBuffer = await sharp(resizedBuffer)
                .composite([{ input: logoBuffer, top: top, left: left }])
                .toBuffer();

            // Save as WebP
            const newPath = imagePath.replace(/\.[^/.]+$/, ".webp");
            await sharp(finalBuffer).webp({ quality: 90 }).toFile(newPath);
            
            // Delete original file if different
            if (imagePath !== newPath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            console.log(`💧 Watermark applied & Converted to WebP: ${newPath}`);
            return newPath;
        } catch (error) {
            console.error(`❌ Watermarking Error: ${error.message}`);
        }
    }
}

export { WatermarkService };
