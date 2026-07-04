import { cloudinary } from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  publicId: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "tickets",
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadPdfToCloudinary = (
  buffer: Buffer,
  publicId: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "tickets/pdf",
        public_id: `${publicId}.pdf`,
        resource_type: "raw",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};