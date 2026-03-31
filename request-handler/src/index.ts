import express from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { Readable } from "node:stream";
import { env } from "./config.js";

const app = express();
const s3 = new S3Client({
    region: env.AWS_REGION, credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
})

app.use(async (req, res) => {
    const hostname = req.hostname; 
    const subdomain = hostname.split('.')[0];

    // check DB for assigned domain for the projectID
    const projectId = subdomain;

    let filePath = req.path;
    if (filePath === "/") filePath = "/index.html";

    const s3Key = `st/deployed/${projectId}${filePath}`;
    console.log(`[Proxy] Fetching: ${s3Key}`);

    try {
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: s3Key,
        });

        const response = await s3.send(command);
        const contentType = mime.lookup(filePath) || "application/octet-stream";

        res.set("Content-Type", contentType);
        const s3Stream = response.Body as Readable;
        s3Stream.pipe(res);

    } catch (error) {
        console.error(`[Error] Could not find ${s3Key}`);
        res.status(404).send("404 - Deployment Not Found");
    }
});

app.listen(env.PORT, () => {
    console.log(`Request Handler running on port ${env.PORT}`);
});