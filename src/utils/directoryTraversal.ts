import * as fs from 'fs';
import * as path from 'path';

export function traverseDirectory(dirPath: string, callback: (filePath: string) => void): void {
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dirPath, dirent.name);
        if (dirent.isDirectory()) {
            traverseDirectory(fullPath, callback);
        } else if (dirent.isFile()) {
            callback(fullPath);
        }
    });
}