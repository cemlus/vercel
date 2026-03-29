import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing env: ${key}`);
    return value;
};

export const s3 = new S3Client({
    region: getEnv("AWS_REGION"),
    credentials: {
        accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
    },
});