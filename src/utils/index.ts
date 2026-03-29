import fs from 'fs';
import path from 'path';

export const generate = () => {
    const subset = "123456789qwertyuiopasdfghjklzxcvbnm";
    const length = 5;
    let id = "";
    for (let i = 0; i < length; i++) {
        id += subset[Math.floor(Math.random() * subset.length)];
    }
    return id;
}

export const getFilePaths = (folderPath: string, basePath = folderPath): string[] => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);

    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);

        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getFilePaths(fullFilePath, basePath));
        } else {
            response.push(path.relative(basePath, fullFilePath)); 
        }
    });

    return response;
};