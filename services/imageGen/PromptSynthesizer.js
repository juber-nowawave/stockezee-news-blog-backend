
class VisualEntityExtractor {
    static VISUAL_MAPPINGS = {
        "copper": "copper metal pipes and raw copper sheets in a warehouse",
        "gold": "gold bullion bars stacked in a secure vault",
        "silver": "silver bullion bars and raw silver metal",
        "zinc": "zinc metal ingots and industrial metal processing",
        "oil": "oil refinery pipes and industrial storage tanks",
        "energy": "solar panels and electrical power transmission lines",
        "bank": "modern bank building exterior with glass facade",
        "finance": "modern financial district skyline with skyscrapers",
        "market": "bustling stock exchange floor with traders and screens",
        "stock": "digital stock market display board with green uptrend charts",
        "sensex": "digital stock market display board with green uptrend charts",
        "nifty": "digital stock market display board with green uptrend charts",
        "rate": "financial graphs on monitors showing interest rate trends",
        "fed": "Federal Reserve building exterior in Washington DC",
        "dollar": "US Dollar currency notes stacked on a table",
        "rupee": "Indian Rupee currency notes and coins",
        "tech": "modern server room with rack servers and blue lighting",
        "chip": "macro shot of a computer silicon processor chip",
        "ai": "futuristic data center with glowing fiber optics",
        "auto": "modern car assembly line in a factory",
        "jewellers": "luxury jewelry display with gold necklaces and diamonds",
        "rail": "freight train moving through an industrial landscape",
        "pharma": "pharmaceutical laboratory with glass equipment",
        "results": "business professionals analyzing financial reports in a meeting",
    };

    static extractVisualDescription(headline, summary) {
        const text = (headline + " " + summary).toLowerCase();

        // 1. Check direct semantic mappings (Priority)
        for (const [key, description] of Object.entries(this.VISUAL_MAPPINGS)) {
            if (text.includes(key)) {
                return description;
            }
        }

        // 2. Extract Proper Nouns (Simplified from Python)
        // Note: JS doesn't have a built-in simplified NLTK equivalent, so we'll do a basic regex for capitalized words
        const words = headline.split(/\s+/);
        const properNouns = [];
        const skipWords = new Set(["The", "A", "An", "In", "On", "At", "For", "To", "Of", "With", "By", "From", "Is", "Are"]);

        for (const w of words) {
            const cleanW = w.replace(/^['":\-!?]+|['":\-!?]+$/g, "");
            if (cleanW && cleanW[0] === cleanW[0].toUpperCase() && !skipWords.has(cleanW)) {
                properNouns.push(cleanW);
            }
        }

        if (properNouns.length >= 2) {
            const entity = properNouns.slice(0, 3).join(" ");
            return `modern corporate office building of ${entity}`;
        }

        // 3. Fallback
        return "modern corporate meeting room with professionals";
    }
}

class PromptSynthesizer {
    static TEMPLATE = 
        "Photorealistic editorial photograph of: {CORE_OBJECTS}. " +
        "Scene: {ENVIRONMENT}, {INDUSTRY_CONTEXT}. " +
        "Style: news agency photography, natural lighting, realistic materials, sharp focus. " +
        "Constraints: no charts, no text, no numbers, no illustration, no CGI, no fantasy.";

    static synthesize(headline, summary, visualEntity) {
        // 1. CORE_OBJECTS
        const coreObjects = visualEntity;

        // 2. ENVIRONMENT/CONTEXT
        const contextLower = (headline + " " + summary).toLowerCase();
        let environment = "modern industrial setting";
        
        if (contextLower.includes("market") || contextLower.includes("trade")) {
            environment = "bustling trading floor (people only)";
        } else if (visualEntity.includes("office")) {
            environment = "modern corporate architecture";
        } else if (visualEntity.includes("factory") || visualEntity.includes("plant")) {
            environment = "heavy industrial facility";
        }

        let industry = "general business";
        if (contextLower.includes("tech")) industry = "technology sector";
        else if (contextLower.includes("finance")) industry = "financial district";
        else if (contextLower.includes("auto")) industry = "automotive manufacturing";

        // 3. Construct Prompt
        const finalPrompt = PromptSynthesizer.TEMPLATE
            .replace("{CORE_OBJECTS}", coreObjects)
            .replace("{ENVIRONMENT}", environment)
            .replace("{INDUSTRY_CONTEXT}", industry);

        console.log(`🧠 Synthesized Prompt: ${finalPrompt.substring(0, 80)}...`);
        return finalPrompt;
    }
}

export { PromptSynthesizer, VisualEntityExtractor };
