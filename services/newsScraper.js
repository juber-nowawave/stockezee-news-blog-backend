import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const axiosInstance = axios.create({
  headers: {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  timeout: 10000 
});

const getCheerioDoc = async (url) => {
  try {
    const { data } = await axiosInstance.get(url);
    return cheerio.load(data);
  } catch (error) {
    console.warn(`Failed to fetch ${url}: ${error.code || error.response?.status}`);
    return null; // Return null to handle gracefully
  }
};

// --- Helper to clean text
const cleanText = (text) => text ? text.replace(/\s+/g, " ").trim() : "";

// --- Individual Scrapers ---

const scrapeMoneyControl = async () => {
  console.log("Scraping MoneyControl...");
  const $ = await getCheerioDoc("https://www.moneycontrol.com/news/business/stocks/");
  if (!$) return [];
  const newsList = [];
  
  $("li.clearfix").each((i, el) => {
    if (i > 15) return;
    const titleEl = $(el).find("h2 a");
    const imgEl = $(el).find("img");
    
    newsList.push({
      title: cleanText(titleEl.attr("title") || titleEl.text()),
      description: cleanText($(el).find("p").text()),
      image: imgEl.attr("data-src") || imgEl.attr("src") || "",
      url: titleEl.attr("href"),
      source: "MoneyControl"
    });
  });
  return newsList;
};

const scrapeEconomicTimes = async () => {
  console.log("Scraping Economic Times...");
  const $ = await getCheerioDoc("https://economictimes.indiatimes.com/markets/stocks/news");
  if (!$) return [];
  const newsList = [];

  $("div.eachStory").each((i, el) => {
    if (i > 15) return;
    const titleEl = $(el).find("h3 a");
    const imgEl = $(el).find("span.imgContainer img");
    
    const link = titleEl.attr("href");
    const fullLink = link && link.startsWith("/") ? `https://economictimes.indiatimes.com${link}` : link;

    newsList.push({
      title: cleanText(titleEl.text()),
      description: cleanText($(el).find("p").text()),
      image: imgEl.attr("data-original") || imgEl.attr("src") || "",
      url: fullLink,
      source: "Economic Times"
    });
  });
  return newsList;
};

const scrapeLiveMint = async () => {
  console.log("Scraping LiveMint...");
  const $ = await getCheerioDoc("https://www.livemint.com/market/stock-market-news");
  if (!$) return [];
  const newsList = [];

  $(".headlineSec").each((i, el) => { // Review this selector if needed, Mint changes often
     if (i > 15) return;
     const titleEl = $(el).find("a"); // Often logic is simpler
     // Fallback for list items
     // Mint often uses different layouts.
     // Let's try flexible search inside standard card list
  });
  
  // Specific for Mint's recent layout
  $("#listView .listtostory").each((i, el) => {
      if (i > 15) return;
      const titleEl = $(el).find(".headline a");
      const imgEl = $(el).find(".thumbnail img");
      
      const link = titleEl.attr("href");
      const fullLink = link && link.startsWith("/") ? `https://www.livemint.com${link}` : link;

      newsList.push({
        title: cleanText(titleEl.text()),
        description: cleanText($(el).find("h2.intro").textStart? $(el).find("h2.intro").text() : ""), // Mint summaries
        image: imgEl.attr("data-src") || imgEl.attr("src") || "",
        url: fullLink,
        source: "LiveMint"
      });
  });

  return newsList;
};

const scrapeBusinessStandard = async () => {
    console.log("Scraping Business Standard...");
    const $ = await getCheerioDoc("https://www.business-standard.com/category/markets-news-1060101.htm");
    if (!$) return [];
    const newsList = [];

    $(".listing-txt").each((i, el) => {
       if (i > 15) return;
       const titleEl = $(el).find("h2 a");
       const date = $(el).find("p").text(); 
       
       const link = titleEl.attr("href");
       const fullLink = link && link.startsWith("/") ? `https://www.business-standard.com${link}` : link;

       // BS listing often doesn't show images purely in the text list, they are side by side in some views
       // Adjust for their specific list view structure
       
       newsList.push({
           title: cleanText(titleEl.text()),
           description: cleanText(date), // Often just date/author
           image: "", // Often hard to get from simple list without specific class
           url: fullLink,
           source: "Business Standard"
       });
    });
    return newsList;
}

const scrapeYahooFinance = async () => {
    console.log("Scraping Yahoo Finance...");
    // Yahoo often dynamic, but RSS feed or basic html works
    const $ = await getCheerioDoc("https://finance.yahoo.com/topic/stock-market-news/");
    if (!$) return [];
    const newsList = [];
    
    $("li.js-stream-content").each((i, el) => {
        if (i > 15) return;
        const titleEl = $(el).find("h3 a");
        const descEl = $(el).find("p");
        // Yahoo images are often weirdly loaded or encrypted classes
        
        const link = titleEl.attr("href");
        let fullLink = link;
        if (link && link.startsWith("/")) {
             fullLink = `https://finance.yahoo.com${link}`;
        }

        if (titleEl.length) {
            newsList.push({
                title: cleanText(titleEl.text()),
                description: cleanText(descEl.text()),
                image: "", // Hard to reliable extract without JS
                url: fullLink,
                source: "Yahoo Finance"
            });
        }
    });
    return newsList;
}

const scrapeCNBC = async () => {
     console.log("Scraping CNBC...");
     const $ = await getCheerioDoc("https://www.cnbc.com/stocks/");
     if (!$) return [];
     const newsList = [];

     $(".Card-titleContainer").each((i, el) => {
         if (i > 15) return;
         const titleEl = $(el).find("a");
         const link = titleEl.attr("href");
         
         if (link) {
            newsList.push({
                title: cleanText(titleEl.text()),
                description: "",
                image: "",
                url: link,
                source: "CNBC"
            });
         }
     });
     return newsList;
}

const scrapeInvestingCom = async () => {
    console.log("Scraping Investing.com...");
    const $ = await getCheerioDoc("https://www.investing.com/news/stock-market-news");
    if (!$) return [];
    const newsList = [];
    
    // LargeArticle class or similar
    $("article").each((i, el) => {
         if (i > 15) return;
         const titleEl = $(el).find("a.title");
         const imgEl = $(el).find("img");
         
         const link = titleEl.attr("href");
         const fullLink = link && link.startsWith("/") ? `https://www.investing.com${link}` : link;

         if (titleEl.length > 0) {
             newsList.push({
                 title: cleanText(titleEl.text()),
                 description: "",
                 image: imgEl.attr("src") || "",
                 url: fullLink,
                 source: "Investing.com"
             });
         }
    });

    return newsList;
}

const scrapeReuters = async () => {
    // Reuters is notoriously hard with axios due to strict blocking, but we try
    console.log("Scraping Reuters...");
    const $ = await getCheerioDoc("https://www.reuters.com/markets/stocks/");
    if (!$) return [];
    const newsList = [];

    $("li[class*='story-collection']").each((i, el) => {
         // Generic attempt at their structure
         const titleEl = $(el).find("a[data-testid='Heading']");
         const link = titleEl.attr("href");
         const fullLink = link && link.startsWith("/") ? `https://www.reuters.com${link}` : link;

         if (titleEl.length) {
             newsList.push({
                 title: cleanText(titleEl.text()),
                 description: "",
                 image: "",
                 url: fullLink,
                 source: "Reuters"
             });
         }
    });
    return newsList;
}

// --- Main Aggregator ---

export const scrapeStockNews = async () => {
  console.log("Starting multi-source scrape...");
  
  // Parallel execution for speed
  const results = await Promise.allSettled([
    scrapeMoneyControl(),
    scrapeEconomicTimes(),
    scrapeLiveMint(),
    scrapeBusinessStandard(),
    scrapeYahooFinance(),
    scrapeCNBC(),
    scrapeInvestingCom(),
    scrapeReuters()
    // Add others if selectors are known and site is permissive
  ]);

  // Flatten results
  const allNews = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .flat()
    .filter(n => n.title && n.url); // Basic validation
    
  console.log(`Scraped ${allNews.length} articles total.`);
  return allNews;
};
