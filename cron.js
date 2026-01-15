import cron from 'node-cron';
import { processStockNews } from './services/newsService.js';

// Schedule task to run every 3 hours
cron.schedule('0 */3 * * *', async () => {
  console.log('Running scheduled news scraping...');
  try {
    const result = await processStockNews();
    console.log('News scraping completed:', result);
  } catch (error) {
    console.error('Error in scheduled news scraping:', error);
  }
},{
    timezone: 'Asia/Kolkata'
});

console.log('Cron jobs scheduled');
