import { exec } from "child_process"
import path from "path";
import { promisify } from "util";
const execPromise = promisify(exec);

export async function buildInContainer(projectId: string) {
    const workspacePath = `/tmp/${projectId}`;
    const buildScript = `
        cd /workspace && 
        npm install && 
        npm run build
    `;

    const dockerCmd = [
        `docker run`,
        `--rm`,                     // auto-delete container when finished
        `--name build-${projectId}`,             
        `--memory="1g"`,                         
        `--cpus="1.0"`,                          
    `--network="host"`,             // needed if it needs to reach local services
        `-v ${workspacePath}:/workspace`,        
        `node:20-alpine`,                        
        `/bin/sh -c "${buildScript}"`            
    ].join(" ");

    console.log(`[${projectId}] booting build container...`);

    try {
        const { stdout, stderr } = await execPromise(dockerCmd);
        
        console.log(`[${projectId}] Build Successful:\n`, stdout);
        
        // after the container is gone, the built files are sitting in /tmp/{projectId}/dist
        return true;

    } catch (error) {
        console.error(`[${projectId}] Build Failed:\n`, error);
        throw new Error("Container build failed");
    }
}