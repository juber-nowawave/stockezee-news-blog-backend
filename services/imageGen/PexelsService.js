import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_SAVE_DIR = path.join(__dirname, '../../public/images');

class PexelsService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = { 'Authorization': apiKey };
    this.baseUrl = "https://api.pexels.com/v1/search";
  }

  async search(query) {
    if (!this.apiKey) return null;
    try {
      const response = await axios.get(this.baseUrl, {
        headers: this.headers,
        params: {
          query: query,
          per_page: 1,
          orientation: 'landscape'
        },
        timeout: 10000
      });

      if (response.status === 200 && response.data.photos && response.data.photos.length > 0) {
        return response.data.photos[0];
      }
    } catch (error) {
      console.error(`❌ Pexels Error: ${error.message}`);
    }
    return null;
  }

  async download(url, articleId) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      if (response.status === 200) {
        if (!fs.existsSync(IMAGES_SAVE_DIR)) {
          fs.mkdirSync(IMAGES_SAVE_DIR, { recursive: true });
        }
        const filename = `article_${articleId}.jpg`;
        const filePath = path.join(IMAGES_SAVE_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(response.data));
        return filePath;
      }
    } catch (error) {
      console.error(`❌ Pexels Download Error: ${error.message}`);
    }
    return null;
  }
}

export { PexelsService };
