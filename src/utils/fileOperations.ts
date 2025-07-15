import * as fs from 'fs';
import * as path from 'path';

export function copyDirectory(source: string, destination: string): void {
    fs.mkdirSync(destination, { recursive: true });
    fs.readdirSync(source, { withFileTypes: true }).forEach(dirent => {
        const srcPath = path.join(source, dirent.name);
        const destPath = path.join(destination, dirent.name);

        if (dirent.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

export function copyFile(source: string, destination: string): void {
    fs.copyFileSync(source, destination);
}
