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
    return null; 
  }
};

const cleanText = (text) => text ? text.replace(/\s+/g, " ").trim() : "";

// --- Individual Scrapers (INDIAN CONTEXT) ---

const scrapeMoneyControl = async () => {
    // Stocks & Commodities
    console.log("Scraping MoneyControl (India)...");
    const urls = [
        "https://www.moneycontrol.com/news/business/stocks/",
        "https://www.moneycontrol.com/news/business/commodities/"
    ];

    const promises = urls.map(async (url) => {
        const $ = await getCheerioDoc(url);
        if (!$) return [];
        const items = [];
        
        $("li.clearfix").each((i, el) => {
            if (i > 10) return;
            const titleEl = $(el).find("h2 a");
            const imgEl = $(el).find("img");
            
            items.push({
                title: cleanText(titleEl.attr("title") || titleEl.text()),
                description: cleanText($(el).find("p").text()),
                image: imgEl.attr("data-src") || imgEl.attr("src") || "",
                url: titleEl.attr("href"),
                source: "MoneyControl"
            });
        });
        return items;
    });

    const results = await Promise.all(promises);
    return results.flat();
};

const scrapeEconomicTimes = async () => {
    console.log("Scraping Economic Times (India)...");
    // ET automatically serves India content, but we target specific sections
    const urls = [
        "https://economictimes.indiatimes.com/markets/stocks/news",
        "https://economictimes.indiatimes.com/markets/commodities/news"
    ];

    const promises = urls.map(async (url) => {
        const $ = await getCheerioDoc(url);
        if (!$) return [];
        const items = [];

        $("div.eachStory").each((i, el) => {
            if (i > 10) return;
            const titleEl = $(el).find("h3 a");
            const imgEl = $(el).find("span.imgContainer img");
            
            const link = titleEl.attr("href");
            const fullLink = link && link.startsWith("/") ? `https://economictimes.indiatimes.com${link}` : link;

            items.push({
                title: cleanText(titleEl.text()),
                description: cleanText($(el).find("p").text()),
                image: imgEl.attr("data-original") || imgEl.attr("src") || "",
                url: fullLink,
                source: "Economic Times"
            });
        });
        return items;
    });

    const results = await Promise.all(promises);
    return results.flat();
};

const scrapeLiveMint = async () => {
    console.log("Scraping LiveMint (India)...");
    const urls = [
        "https://www.livemint.com/market/stock-market-news",
        "https://www.livemint.com/market/commodities"
    ];

    const promises = urls.map(async (url) => {
        const $ = await getCheerioDoc(url);
        if (!$) return [];
        const items = [];

        // Primary list view
        $("#listView .listtostory").each((i, el) => {
             if (i > 10) return;
             const titleEl = $(el).find(".headline a");
             const imgEl = $(el).find(".thumbnail img");
             
             const link = titleEl.attr("href");
             const fullLink = link && link.startsWith("/") ? `https://www.livemint.com${link}` : link;

             items.push({
               title: cleanText(titleEl.text()),
               description: cleanText($(el).find("h2.intro").textStart? $(el).find("h2.intro").text() : ""),
               image: imgEl.attr("data-src") || imgEl.attr("src") || "",
               url: fullLink,
               source: "LiveMint"
             });
        });

        // Fallback for card view which Mint sometimes uses
        if (items.length === 0) {
             $(".listingSec .listing").each((i, el) => {
                 const titleEl = $(el).find("h2 a");
                 const link = titleEl.attr("href");
                 const fullLink = link && link.startsWith("/") ? `https://www.livemint.com${link}` : link;
                 
                 items.push({
                     title: cleanText(titleEl.text()),
                     description: "",
                     image: "",
                     url: fullLink,
                     source: "LiveMint"
                 })
             })
        }

        return items;
    });

    const results = await Promise.all(promises);
    return results.flat();
};

const scrapeBusinessStandard = async () => {
    console.log("Scraping Business Standard (India)...");
    const urls = [
        "https://www.business-standard.com/category/markets-news-1060101.htm", // Markets
        "https://www.business-standard.com/category/markets-commodities-1060601.htm" // Commodities
    ];

    const promises = urls.map(async (url) => {
        const $ = await getCheerioDoc(url);
        if (!$) return [];
        const items = [];

        $(".listing-txt").each((i, el) => {
           if (i > 10) return;
           const titleEl = $(el).find("h2 a");
           const date = $(el).find("p").text(); 
           
           const link = titleEl.attr("href");
           const fullLink = link && link.startsWith("/") ? `https://www.business-standard.com${link}` : link;
           
           items.push({
               title: cleanText(titleEl.text()),
               description: cleanText(date), 
               image: "", 
               url: fullLink,
               source: "Business Standard"
           });
        });
        return items;
    });

    const results = await Promise.all(promises);
    return results.flat();
}

const scrapeYahooFinanceIndia = async () => {
    console.log("Scraping Yahoo Finance (India)...");
    // Targeting IN domain
    const $ = await getCheerioDoc("https://in.finance.yahoo.com/topic/stock-market-news");
    if (!$) return [];
    const newsList = [];
    
    $("li.js-stream-content").each((i, el) => {
        if (i > 10) return;
        const titleEl = $(el).find("h3 a");
        const descEl = $(el).find("p");
        
        const link = titleEl.attr("href");
        let fullLink = link;
        if (link && link.startsWith("/")) {
             fullLink = `https://in.finance.yahoo.com${link}`;
        }

        if (titleEl.length) {
            newsList.push({
                title: cleanText(titleEl.text()),
                description: cleanText(descEl.text()),
                image: "", 
                url: fullLink,
                source: "Yahoo Finance India"
            });
        }
    });
    return newsList;
}

const scrapeInvestingIndia = async () => {
    console.log("Scraping Investing.com (India)...");
    const urls = [
        "https://in.investing.com/news/stock-market-news",
        "https://in.investing.com/news/commodities-news"
    ];

    const promises = urls.map(async (url) => {
        const $ = await getCheerioDoc(url);
        if (!$) return [];
        const items = [];
        
        $("article").each((i, el) => {
             if (i > 10) return;
             const titleEl = $(el).find("a.title");
             const imgEl = $(el).find("img");
             
             const link = titleEl.attr("href");
             const fullLink = link && link.startsWith("/") ? `https://in.investing.com${link}` : link;

             if (titleEl.length > 0) {
                 items.push({
                     title: cleanText(titleEl.text()),
                     description: "",
                     image: imgEl.attr("src") || "",
                     url: fullLink,
                     source: "Investing.com India"
                 });
             }
        });
        return items;
    });

    const results = await Promise.all(promises);
    return results.flat();
}

const scrapeCNBC = async () => {
     console.log("Scraping CNBC (Asia/India)...");
     // CNBC doesn't have a dedicated easy-to-scrape "India" news page without dynamic loading often, 
     // but 'asia-markets' is the closest standard section.
     const $ = await getCheerioDoc("https://www.cnbc.com/asia-markets/");
     if (!$) return [];
     const newsList = [];

     $(".Card-titleContainer").each((i, el) => {
         if (i > 10) return;
         const titleEl = $(el).find("a");
         const link = titleEl.attr("href");
         const title = cleanText(titleEl.text());

         // Simple filter for India relevance if possible, otherwise take Asian market news
         if (link) {
            newsList.push({
                title: title,
                description: "",
                image: "",
                url: link,
                source: "CNBC Asia"
            });
         }
     });
     return newsList;
}

const scrapeReutersIndia = async () => {
    console.log("Scraping Reuters (India)...");
    // Reuters India specific section
    const $ = await getCheerioDoc("https://www.reuters.com/world/india/");
    if (!$) return [];
    const newsList = [];

    $("li[class*='story-collection']").each((i, el) => {
         const titleEl = $(el).find("a[data-testid='Heading']");
         const link = titleEl.attr("href");
         const fullLink = link && link.startsWith("/") ? `https://www.reuters.com${link}` : link;

         if (titleEl.length) {
             newsList.push({
                 title: cleanText(titleEl.text()),
                 description: "",
                 image: "",
                 url: fullLink,
                 source: "Reuters India"
             });
         }
    });
    return newsList;
}


export const scrapeStockNews = async () => {
  console.log("Starting INDIAN MARKET scrape...");
  
  const results = await Promise.allSettled([
    scrapeMoneyControl(),
    scrapeEconomicTimes(),
    scrapeLiveMint(),
    scrapeBusinessStandard(),
    scrapeYahooFinanceIndia(),
    scrapeInvestingIndia(),
    scrapeCNBC(),
    scrapeReutersIndia()
  ]);

  const allNews = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .flat()
    .filter(n => n.title && n.url);
    
  // Post-processing: Filter for India/Commodity relevance if needed?
  // Currently we just trust the source URL context.
    
  console.log(`Scraped ${allNews.length} articles total.`);
  return allNews;
};
