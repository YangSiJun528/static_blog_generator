import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
    '.mp4', '.mov', '.avi', '.mkv',
    '.zip', '.tar', '.gz', '.rar'
]);

export function traverseDirectory(dirPath: string, callback: (filePath: string) => void): void {
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dirPath, dirent.name);
        if (dirent.isDirectory()) {
            traverseDirectory(fullPath, callback);
        } else if (dirent.isFile()) {
            const relativePath = path.relative(process.cwd(), fullPath);
            const ext = path.extname(fullPath).toLowerCase();

            if (ext !== '.md') {
                if (!relativePath.startsWith('content/files')) {
                    if (!ALLOWED_EXTENSIONS.has(ext)) {
                        throw new Error(`Disallowed file outside content/files: ${relativePath}`);
                    }
                }
            }
            callback(fullPath);
        }
    });
}