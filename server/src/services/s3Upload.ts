import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const isDemoUploadMode =
  process.env.DEMO_UPLOAD_MODE === "true" || process.env.NODE_ENV !== "production";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "demo_access_key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "demo_secret_key",
  },
});

const createDummyFileUrl = (originalName: string) => {
  const safeName = encodeURIComponent(originalName || "demo-file.pdf");
  return `https://demo.visademo.local/uploads/${Date.now()}-${safeName}`;
};

const addDummyUrlsToRequestFiles = (req: Request) => {
  if (req.file) {
    (req.file as any).location = createDummyFileUrl(req.file.originalname);
  }

  if (Array.isArray(req.files)) {
    (req.files as Express.Multer.File[]).forEach((file) => {
      (file as any).location = createDummyFileUrl(file.originalname);
    });
  }
};

const createWrappedUploader = (uploader: multer.Multer) => {
  return {
    single: (fieldName: string) => {
      const middleware = uploader.single(fieldName);
      return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, (err) => {
          if (err) return next(err);
          if (isDemoUploadMode) addDummyUrlsToRequestFiles(req);
          return next();
        });
      };
    },
    array: (fieldName: string, maxCount?: number) => {
      const middleware = uploader.array(fieldName, maxCount);
      return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, (err) => {
          if (err) return next(err);
          if (isDemoUploadMode) addDummyUrlsToRequestFiles(req);
          return next();
        });
      };
    },
  };
};

const realUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME || "demo-bucket",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
});

const demoUpload = multer({ storage: multer.memoryStorage() });

export const upload = createWrappedUploader(isDemoUploadMode ? demoUpload : realUpload);

/**
 * Function to delete an image from S3
 * @param {string} imageUrl 
 * @returns {Promise<void>}
 */
export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    if (isDemoUploadMode || imageUrl.includes("demo.visademo.local/uploads")) {
      console.log("[DEMO MODE] Skipping S3 delete for", imageUrl);
      return;
    }

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
