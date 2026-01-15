import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import dotenv from "dotenv";
import { generateImage } from "../ai/imageGenerator.js";
import fs from "fs";
dotenv.config();

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_kEY,
  },
});

export const generateAndUploadImage = async (title, description, imageUrl) => {
  try {
    console.log(`Generating image for: ${title}`);
    const response = await generateImage(title, description, imageUrl);

    if (!response || !response.success || !response.local_path) {
      throw new Error("-------------------No valid image generated-------------------");
    }

    // 2. Upload to S3
    // Read file from local path
    const fileContent = fs.readFileSync(response.local_path);

    // Generate a unique filename
    const filename = `${process.env.S3_BUCKET_FOLDER_PATH}/${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50)}.webp`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: fileContent,
      ContentType: "image/webp",
      // ACL: "public-read", // Optional: depends on bucket settings
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const s3Url = `${process.env.IMAGE_ACCESS_DOMAIN}/${filename}`;
    console.log(`Image uploaded to S3: ${s3Url}`);
    
    return s3Url;

  } catch (error) {
    console.error("Error in generateAndUploadImage:", error.message);
    return null;
  }
};
