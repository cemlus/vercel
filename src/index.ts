import express from 'express';
import cors from 'cors';
import { simpleGit } from 'simple-git';
import { generate } from './utils/index.js'

const app = express();

app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
    res.json({
        message: `server is up`
    })
})

// add auth 


app.post('/deploy', async (req, res) => {
    const { repoUrl } = req.body;
    const id = generate();
    // const SimpleGit = simpleGit();
    await simpleGit().clone(repoUrl, `output/${id}`)
    res.json({
        message: `here's the id for the project:`,
        id: id
    })
})


const PORT = 3000
app.listen(PORT, () => {
    console.log(`server started on PORT:${PORT}`);
})