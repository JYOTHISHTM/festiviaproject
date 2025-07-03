// utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((err, result) => {
      if (err || !result) return reject(err);
      resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
