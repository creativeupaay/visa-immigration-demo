import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const upload = multer({
  // You’re telling multer to use S3 as the storage destination instead of local storage.
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
});

/**
 * Function to delete an image from S3
 * @param {string} imageUrl 
 * @returns {Promise<void>}
 */
export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const bucketUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

    const key = decodeURIComponent(imageUrl.replace(bucketUrl, ""));

    // console.log(key)

    if (!key) {
      console.warn("S3 key not found in the image URL:", imageUrl);
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3.send(command);
    console.log(`Image deleted successfully: ${key}`);
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    throw error; 
  }
};
