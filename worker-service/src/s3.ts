import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from './config.js';
import path from 'node:path';
import fs from 'fs';
import { type Readable } from 'node:stream';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
})

export async function downloadFolderFromS3(prefix: string, localBaseDir: string) {
    const listCommand = new ListObjectsV2Command({
        Bucket: env.S3_BUCKET_NAME,
        Prefix: prefix
    })
    try {
        const { Contents } = await s3.send(listCommand);
        if (!Contents) {
            console.log("No files found with that prefix.");
            return;
        }

        for (const object of Contents) {
            if (!object.Key) continue;
            // 'source/id/index.js' -> 'localDir/index.js'
            const relativePath = object.Key.replace(prefix, "");
            const localFilePath = path.join(localBaseDir, relativePath);
            const directory = path.dirname(localFilePath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            const getObjectCommand = new GetObjectCommand({
                Bucket: env.S3_BUCKET_NAME,
                Key: object.Key
            });
            const response = await s3.send(getObjectCommand);
            const s3Stream = response.Body as Readable;
            const fileWriteStream = createWriteStream(localFilePath);
            // moves data in small chunks (usually 64KB) from S3 to Disk
            await pipeline(s3Stream, fileWriteStream)
            console.log(`Streamed to disk: ${object.Key}`);
        }
        console.log(`All files are downloaded sucessfully.`);
    } catch (err) {
        console.error("Error during download:", err);
        throw err;
    }

}