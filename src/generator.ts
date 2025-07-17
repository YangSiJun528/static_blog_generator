import * as fs from 'fs';
import * as path from 'path';
import { copyDirectory } from './utils/fileOperations';
import { traverseDirectory } from './utils/directoryTraversal';
import { parseMarkdown } from './parser';
import { generateHtmlPage, generateDirectoryPageHtml } from './htmlGenerator';
import { addToggleFunctionality } from './toggleGenerator';

const CONTENT_DIR_NAME = 'content';
const ASSETS_DIR_NAME = 'assets';
const STATICS_DIR_NAME = 'statics'; // New constant for static files
const OUTPUT_DIR_NAME = 'output';

interface DirectoryItem {
    name: string;
    type: 'file' | 'directory';
    link: string; // Link relative to the current index.html
}

const directoryStructure = new Map<string, DirectoryItem[]>(); // Map<relativeOutputDirPath, DirectoryItem[]>

export function generateStaticBlog(projectRoot: string): void {
    console.log("Starting static blog generation...");

    const contentDirPath = path.join(projectRoot, CONTENT_DIR_NAME);
    const outputDirPath = path.join(projectRoot, OUTPUT_DIR_NAME);
    
    const assetsDirPath = path.join(projectRoot, ASSETS_DIR_NAME);

    // Ensure output directory exists and is clean
    if (fs.existsSync(outputDirPath)) {
        fs.rmSync(outputDirPath, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDirPath, { recursive: true });

    // 1. Copy content, assets, and statics to output directory
    if (fs.existsSync(contentDirPath)) {
        copyDirectory(contentDirPath, outputDirPath);
    }
    if (fs.existsSync(assetsDirPath)) {
        copyDirectory(assetsDirPath, path.join(outputDirPath, ASSETS_DIR_NAME));
    }
    

    // Copy static files to output directory
    const staticsDirPath = path.join(projectRoot, STATICS_DIR_NAME);
    if (fs.existsSync(staticsDirPath)) {
        copyDirectory(staticsDirPath, outputDirPath);
    }
    // Copy normalize.css to output assets
    const normalizeCssPath = path.join(projectRoot, ASSETS_DIR_NAME, 'normalize.css');
    const outputCssDir = path.join(outputDirPath, ASSETS_DIR_NAME);
    if (!fs.existsSync(outputCssDir)) {
        fs.mkdirSync(outputCssDir, { recursive: true });
    }
    if (fs.existsSync(normalizeCssPath)) {
        fs.copyFileSync(normalizeCssPath, path.join(outputCssDir, 'normalize.css'));
    }

    // 2. Traverse content directory, parse markdown, and generate HTML
    traverseDirectory(contentDirPath, (filePath: string) => {
        if (filePath.endsWith('.md')) {
            const relativePathFromContent = path.relative(contentDirPath, filePath); // e.g., '2025/07/first-post.md'
            const outputFileName = relativePathFromContent.replace(/\.md$/, '.html'); // e.g., '2025/07/first-post.html'
            const outputFilePath = path.join(outputDirPath, outputFileName); // Absolute path to output HTML
            const outputDirForFile = path.dirname(outputFilePath); // Absolute path to output directory for this file

            fs.mkdirSync(outputDirForFile, { recursive: true });

            const markdownContent = fs.readFileSync(filePath, 'utf-8');
            
            // Pass contentRoot and currentFileRelativePath to parseMarkdown
            const htmlContent = parseMarkdown(markdownContent, {
                contentRoot: contentDirPath,
                currentFileRelativePath: relativePathFromContent
            });

            const title = path.basename(filePath, '.md');
            const currentPathForHtml = '/' + relativePathFromContent.replace(/\.md$/, ''); // Path for HTML header/breadcrumbs (e.g., '/2025/07/first-post')
            const finalHtml = addToggleFunctionality(generateHtmlPage(title, htmlContent, currentPathForHtml));
            fs.writeFileSync(outputFilePath, finalHtml);
            console.log(`Generated: ${outputFilePath}`);

            // Populate directoryStructure for index.html generation
            let currentRelativeOutputDir = path.dirname(relativePathFromContent); // e.g., '2025/07'
            if (currentRelativeOutputDir === '.') currentRelativeOutputDir = ''; // Handle root directory

            // Add the file to its parent directory's listing
            if (!directoryStructure.has(currentRelativeOutputDir)) {
                directoryStructure.set(currentRelativeOutputDir, []);
            }
            directoryStructure.get(currentRelativeOutputDir)?.push({
                name: path.basename(outputFileName),
                type: 'file',
                link: outputFileName // Link is the full path relative to the output directory
            });

            // Add parent directories to their parent's listing
            let tempRelativeDir = currentRelativeOutputDir;
            while (tempRelativeDir !== '') {
                let parentDir = path.dirname(tempRelativeDir); // e.g., '2025' from '2025/07'
                if (parentDir === '.') parentDir = ''; // Ensure root is always ''

                const dirName = path.basename(tempRelativeDir); // e.g., '07' from '2025/07'

                if (!directoryStructure.has(parentDir)) {
                    directoryStructure.set(parentDir, []);
                }
                const existingDirEntry = directoryStructure.get(parentDir)?.find(item => item.name === dirName && item.type === 'directory');
                if (!existingDirEntry) {
                    directoryStructure.get(parentDir)?.push({
                        name: dirName,
                        type: 'directory',
                        link: path.join(parentDir, dirName, 'index.html').replace(/\\/g, '/')
                    });
                }
                tempRelativeDir = parentDir;
            }

        } else {
            // Copy other files to the output directory
            const relativePathFromContent = path.relative(contentDirPath, filePath);
            const outputFilePath = path.join(outputDirPath, relativePathFromContent);
            const outputDirForFile = path.dirname(outputFilePath);
            if (!fs.existsSync(outputDirForFile)) {
                fs.mkdirSync(outputDirForFile, { recursive: true });
            }
            fs.copyFileSync(filePath, outputFilePath);
        }
    });

    // 3. Generate index.html for directories
    directoryStructure.forEach((items, relativeOutputDir) => {
        const fullOutputDirPath = path.join(outputDirPath, relativeOutputDir);
        fs.mkdirSync(fullOutputDirPath, { recursive: true }); // Ensure directory exists

        const currentPathForHtml = '/' + relativeOutputDir; // Path for HTML header/breadcrumbs
        const indexHtmlContent = generateDirectoryPageHtml(currentPathForHtml, items);
        fs.writeFileSync(path.join(fullOutputDirPath, 'index.html'), indexHtmlContent);
        console.log(`Generated directory index: ${path.join(fullOutputDirPath, 'index.html')}`);
    });

    console.log("Static blog generation complete.");
}

// Example usage (for testing purposes)
// generateStaticBlog(process.cwd());
