import axios from "axios";
import 'dotenv/config';

const listModels = async () => {
    try {
        const apiKey =  `AIzaSyCA1XUqpt1cvjEOfy2IJQIIwzAEmePw5gM`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        
        console.log("Available Models:");
        response.data.models.forEach(model => {
            if (model.name.includes("image") || model.name.includes("generate")) {
                 console.log(`- ${model.name} (${model.version}) - ${model.supportedGenerationMethods}`);
            }
        });
    } catch (error) {
        console.error("Error listing models:", error.response ? error.response.data : error.message);
    }
};

listModels();
