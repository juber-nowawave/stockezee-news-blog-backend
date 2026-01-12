import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_kEY,
  },
});

const IMAGE_GENERATION_API = process.env.IMAGE_GENERATION_API;

export const generateAndUploadImage = async (title, description) => {
  try {
    console.log(`Generating image for: ${title}`);
    
    // 1. Call External API
    const response = await axios.post(
      IMAGE_GENERATION_API,
      { title, description },
      { responseType: "arraybuffer" } // Expecting image binary
    );

    if (!response.data) {
      throw new Error("No data received from image generation API");
    }

    // 2. Upload to S3
    // Generate a unique filename
    const filename = `news-images/${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50)}.jpg`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: response.data,
      ContentType: "image/jpeg", // Assuming JPEG, can check headers if needed
      // ACL: "public-read", // Optional: depends on bucket settings
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    console.log(`Image uploaded to S3: ${s3Url}`);
    
    return s3Url;

  } catch (error) {
    console.error("Error in generateAndUploadImage:", error.message);
    return null; // Return null so the main flow can continue without an AI image
  }
};
