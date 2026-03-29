import dotenv from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "node:path";
import fs from 'fs';
import { getFilePaths } from "../utils/index.js";

dotenv.config();

const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing env: ${key}`);
    return value;
};

export const s3Client = new S3Client({
    region: getEnv("AWS_REGION"),
    credentials: {
        accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
    },
});

// fileName => output/12312/src/App.jsx
// filePath => /Users/siddhant/vercel/dist/output/12312/src/App.jsx

// uploads individual files to S3
export const uploadFileToS3 = async (
    filePath: string,
    rootDir: string,
    projectId: string) => {

    const fullPath = path.join(rootDir, filePath);
    const fileContent = fs.readFileSync(fullPath);

    const command = new PutObjectCommand({
        Bucket: getEnv("S3_BUCKET_NAME"),
        Key: `${projectId}/${filePath}`,
        Body: fileContent
    })

    await s3Client.send(command)
}

export const uploadFolderToS3 = async (folderPath: string, projectId: string) => {
    const filePaths = getFilePaths(folderPath);

    await Promise.all(
        filePaths.map(filePath =>
            uploadFileToS3(filePath, folderPath, projectId)
        )
    );

    console.log("Upload completed");
    // Now push the ID of the project to Queue from where the deplyment server can pick it up
};

