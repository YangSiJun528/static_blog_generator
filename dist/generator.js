"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStaticBlog = generateStaticBlog;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fileOperations_1 = require("./utils/fileOperations");
const directoryTraversal_1 = require("./utils/directoryTraversal");
const parser_1 = require("./parser");
const htmlGenerator_1 = require("./htmlGenerator");
const toggleGenerator_1 = require("./toggleGenerator");
const NOTES_DIR_NAME = 'notes';
const FILES_DIR_NAME = 'files';
const ASSETS_DIR_NAME = 'assets';
const OUTPUT_DIR_NAME = 'output';
const directoryStructure = new Map(); // Map<relativeOutputDirPath, DirectoryItem[]>
function generateStaticBlog(projectRoot) {
    console.log("Starting static blog generation...");
    const notesDirPath = path.join(projectRoot, NOTES_DIR_NAME);
    const outputDirPath = path.join(projectRoot, OUTPUT_DIR_NAME);
    const filesDirPath = path.join(projectRoot, FILES_DIR_NAME);
    const assetsDirPath = path.join(projectRoot, ASSETS_DIR_NAME);
    // Ensure output directory exists and is clean
    if (fs.existsSync(outputDirPath)) {
        fs.rmSync(outputDirPath, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDirPath, { recursive: true });
    // 1. Copy assets and files to output directory
    if (fs.existsSync(assetsDirPath)) {
        (0, fileOperations_1.copyDirectory)(assetsDirPath, path.join(outputDirPath, ASSETS_DIR_NAME));
    }
    if (fs.existsSync(filesDirPath)) {
        (0, fileOperations_1.copyDirectory)(filesDirPath, path.join(outputDirPath, FILES_DIR_NAME));
    }
    // 2. Traverse notes directory, parse markdown, and generate HTML
    (0, directoryTraversal_1.traverseDirectory)(notesDirPath, (filePath) => {
        var _a, _b, _c;
        if (filePath.endsWith('.md')) {
            const relativePathFromNotes = path.relative(notesDirPath, filePath); // e.g., '2025/07/first-post.md'
            const outputFileName = relativePathFromNotes.replace(/\.md$/, '.html'); // e.g., '2025/07/first-post.html'
            const outputFilePath = path.join(outputDirPath, outputFileName); // Absolute path to output HTML
            const outputDirForFile = path.dirname(outputFilePath); // Absolute path to output directory for this file
            fs.mkdirSync(outputDirForFile, { recursive: true });
            const markdownContent = fs.readFileSync(filePath, 'utf-8');
            // Pass notesRoot and currentFileRelativePath to parseMarkdown
            const htmlContent = (0, parser_1.parseMarkdown)(markdownContent, {
                notesRoot: notesDirPath,
                currentFileRelativePath: relativePathFromNotes
            });
            const title = path.basename(filePath, '.md');
            const currentPathForHtml = '/' + relativePathFromNotes.replace(/\.md$/, ''); // Path for HTML header/breadcrumbs (e.g., '/2025/07/first-post')
            const finalHtml = (0, toggleGenerator_1.addToggleFunctionality)((0, htmlGenerator_1.generateHtmlPage)(title, htmlContent, currentPathForHtml));
            fs.writeFileSync(outputFilePath, finalHtml);
            console.log(`Generated: ${outputFilePath}`);
            // Populate directoryStructure for index.html generation
            let currentRelativeOutputDir = path.dirname(relativePathFromNotes); // e.g., '2025/07'
            if (currentRelativeOutputDir === '.')
                currentRelativeOutputDir = ''; // Handle root directory
            // Add the file to its parent directory's listing
            if (!directoryStructure.has(currentRelativeOutputDir)) {
                directoryStructure.set(currentRelativeOutputDir, []);
            }
            (_a = directoryStructure.get(currentRelativeOutputDir)) === null || _a === void 0 ? void 0 : _a.push({
                name: path.basename(outputFileName),
                type: 'file',
                link: path.basename(outputFileName) // Link is just the filename for files in the same directory
            });
            // Add parent directories to their parent's listing
            let tempRelativeDir = currentRelativeOutputDir;
            while (tempRelativeDir !== '') {
                const parentDir = path.dirname(tempRelativeDir); // e.g., '2025' from '2025/07'
                const dirName = path.basename(tempRelativeDir); // e.g., '07' from '2025/07'
                if (!directoryStructure.has(parentDir)) {
                    directoryStructure.set(parentDir, []);
                }
                const existingDirEntry = (_b = directoryStructure.get(parentDir)) === null || _b === void 0 ? void 0 : _b.find(item => item.name === dirName && item.type === 'directory');
                if (!existingDirEntry) {
                    (_c = directoryStructure.get(parentDir)) === null || _c === void 0 ? void 0 : _c.push({
                        name: dirName,
                        type: 'directory',
                        link: dirName + '/index.html' // Link to the index.html of the subdirectory
                    });
                }
                tempRelativeDir = parentDir;
                if (tempRelativeDir === '.')
                    tempRelativeDir = ''; // Stop at root
            }
        }
        else {
            // Throw an error if a non-markdown file is found in the notes directory
            throw new Error(`Non-markdown file found in notes directory: ${filePath}. Only .md files are allowed.`);
        }
    });
    // 3. Generate index.html for directories
    directoryStructure.forEach((items, relativeOutputDir) => {
        const fullOutputDirPath = path.join(outputDirPath, relativeOutputDir);
        fs.mkdirSync(fullOutputDirPath, { recursive: true }); // Ensure directory exists
        const currentPathForHtml = '/' + relativeOutputDir; // Path for HTML header/breadcrumbs
        const indexHtmlContent = (0, htmlGenerator_1.generateDirectoryPageHtml)(currentPathForHtml, items, directoryStructure);
        fs.writeFileSync(path.join(fullOutputDirPath, 'index.html'), indexHtmlContent);
        console.log(`Generated directory index: ${path.join(fullOutputDirPath, 'index.html')}`);
    });
    console.log("Static blog generation complete.");
}
// Example usage (for testing purposes)
// generateStaticBlog(process.cwd());
