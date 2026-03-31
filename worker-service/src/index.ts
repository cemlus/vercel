import { createClient } from "redis";
import { downloadFolderFromS3 } from "./s3.js";
import { buildInContainer } from "./worker.js";

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main () {
    while(1) {
        const res = await subscriber.brPop(
            'build-queue', 0
        );
        const projectId = res?.element;
        if(!projectId) return console.error(`Queue is empty`)
        const sharedWorkspace = `/tmp/${projectId}`;
        await downloadFolderFromS3(`st/${projectId}`, sharedWorkspace);
        const build = await buildInContainer(projectId);
        
    }
}