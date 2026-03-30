import express from 'express';
import cors from 'cors';
import { simpleGit } from 'simple-git';
import { generateRandomID, getAllFiles } from './utils.js'
import { env } from './config.js';
import { listFiles, uploadFileToS3 } from './s3.js';
import { dirname } from 'path';
import { createClient } from 'redis';
const publisher = createClient();
publisher.connect();


const app = express();

app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
    res.json({
        message: `server is up`
    })
})

app.post('/deploy', async (req, res) => {
    const { repoUrl } = req.body;
    const id = generateRandomID();

    if (!repoUrl) return res.status(400).json({ error: "Missing repoUrl" });
    const SimpleGit = simpleGit();

    await SimpleGit.clone(repoUrl, `dist/output/${id}`);

    const files = getAllFiles(`dist/output/${id}`)
    try {
        files.forEach(async (file) => {
            await uploadFileToS3(file.slice(dirname.length + 1), file);
        })

        publisher.lPush("build-queue", id);

        res.json({
            message: `here's the id for the project:`,
            id: id
        })
    } catch (error) {
        return res.status(400).json({
            message: `error while uploading to S3`
        })
    }
})


app.get('/listFiles', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.json({ message: `no ID provided` })
    try {
        const files = await listFiles(env.S3_BUCKET_NAME, `st/output/${id}/`)
        res.json({
            message: `here are the files in the S3 bucket of the name ${env.S3_BUCKET_NAME}:`,
            files: files
        })
    } catch (error) {
        res.status(403).json({
            message: `error while retrieving files`
        })
    }
})

app.listen(env.PORT, () => {
    console.log(`server started on PORT:${env.PORT}`);
})