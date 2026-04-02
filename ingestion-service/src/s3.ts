import fs from "fs";
import { PutObjectCommand, S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { env } from "./config.js";

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
});

// fileName => output/12312/src/App.jsx
// filePath => /Users/siddhant/vercel/dist/output/12312/src/App.jsx
export async function uploadFileToS3(fileName: string, localFilePath: string) {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Body: fileContent,
      Key: fileName
    })
  );

  console.log(response);
}

export async function listFiles(bucketName: string, prefix?: string) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  try {
    const { Contents } = await s3.send(command);
    if (!Contents) {
      console.log("Bucket is empty.");
      return [];
    }
    const fileList = Contents.map((file) => ({
      name: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
    }));

    console.log(fileList);
    return fileList;
  } catch (err) {
    console.error("Error listing objects:", err);
  }
}
