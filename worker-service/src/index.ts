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
        if(!res) return console.error(`queue is empty`)
        
        const projectId = res.element;
        console.log(`processing project: ${projectId}`);
        const sharedWorkspace = `src/tmp/${projectId}`;
        await downloadFolderFromS3(`st/output/${projectId}/`, sharedWorkspace);
        await buildInContainer(projectId);
        // the built code has successfully reached the src/tmp/projectId/dist folder
        console.log(`successfully built: ${projectId}`);
    }
    // const projectId = "ackw4";
    // await buildInContainer(projectId);
}
main();