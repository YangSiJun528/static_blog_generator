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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarkdown = parseMarkdown;
const markdown_it_1 = __importDefault(require("markdown-it"));
const path = __importStar(require("path"));
function parseMarkdown(markdownContent, options) {
    const md = new markdown_it_1.default({
        html: true, // Enable HTML tags in source
        linkify: true, // Autoconvert URL-like texts to links
        typographer: true, // Enable some smart quotes and dashes
    });
    // Custom plugin to handle .md links
    md.use(function (md) {
        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const hrefIndex = token.attrIndex('href');
            if (hrefIndex >= 0 && token.attrs) {
                const href = token.attrs[hrefIndex][1];
                if (typeof href !== 'string') {
                    console.warn(`Href is not a string: ${href}. Skipping conversion.`);
                    return self.renderToken(tokens, idx, options);
                }
                const parseOptions = env; // Cast env to our custom options interface
                // Check if it's an internal .md link
                if (href.endsWith('.md')) {
                    let sourceLinkedMdPath;
                    // Determine the base directory for resolving the link
                    console.log(`DEBUG: currentFileAbsPath args: notesRoot=${parseOptions.notesRoot}, currentFileRelativePath=${parseOptions.currentFileRelativePath}`);
                    const currentFileAbsPath = path.join(parseOptions.notesRoot, parseOptions.currentFileRelativePath);
                    const currentFileDir = path.dirname(currentFileAbsPath);
                    if (href.startsWith('./') || href.startsWith('../')) {
                        // Link is relative to the current file's directory
                        console.log(`DEBUG: path.resolve args: currentFileDir=${currentFileDir}, href=${href}`);
                        sourceLinkedMdPath = path.resolve(currentFileDir, href);
                    }
                    else {
                        // Assume link is relative to the notesRoot (Obsidian-like vault root linking)
                        console.log(`DEBUG: path.join args: notesRoot=${parseOptions.notesRoot}, href=${href}`);
                        sourceLinkedMdPath = path.join(parseOptions.notesRoot, href);
                    }
                    if (typeof sourceLinkedMdPath !== 'string') {
                        console.warn(`sourceLinkedMdPath is not a string: ${sourceLinkedMdPath}. Skipping conversion.`);
                        return self.renderToken(tokens, idx, options);
                    }
                    // Ensure the resolved path is still within the notes directory
                    // This prevents links from escaping the notes directory and causing unexpected behavior
                    if (!sourceLinkedMdPath.startsWith(parseOptions.notesRoot)) {
                        console.warn(`Link ${href} resolves outside notes directory: ${sourceLinkedMdPath}. Skipping conversion.`);
                        return self.renderToken(tokens, idx, options);
                    }
                    // Get the relative path from notesRoot to the linked MD file
                    console.log(`DEBUG: path.relative args: notesRoot=${parseOptions.notesRoot}, sourceLinkedMdPath=${sourceLinkedMdPath}`);
                    const relativeLinkedMdPathFromNotes = path.relative(parseOptions.notesRoot, sourceLinkedMdPath);
                    if (typeof relativeLinkedMdPathFromNotes !== 'string') {
                        console.warn(`relativeLinkedMdPathFromNotes is not a string: ${relativeLinkedMdPathFromNotes}. Skipping conversion.`);
                        return self.renderToken(tokens, idx, options);
                    }
                    // Convert to the corresponding output HTML path (relative to output directory)
                    const relativeLinkedHtmlPathFromOutput = relativeLinkedMdPathFromNotes.replace(/\.md$/, '.html');
                    if (typeof relativeLinkedHtmlPathFromOutput !== 'string') {
                        console.warn(`relativeLinkedHtmlPathFromOutput is not a string: ${relativeLinkedHtmlPathFromOutput}. Skipping conversion.`);
                        return self.renderToken(tokens, idx, options);
                    }
                    // Determine the relative path from the current generated HTML file to the target HTML output file
                    const currentHtmlRelativePathFromOutput = parseOptions.currentFileRelativePath.replace(/\.md$/, '.html');
                    const currentHtmlDirFromOutput = path.dirname(currentHtmlRelativePathFromOutput);
                    if (typeof currentHtmlDirFromOutput !== 'string') {
                        console.warn(`currentHtmlDirFromOutput is not a string: ${currentHtmlDirFromOutput}. Skipping conversion.`);
                        return self.renderToken(tokens, idx, options);
                    }
                    const finalHref = path.relative(currentHtmlDirFromOutput, relativeLinkedHtmlPathFromOutput);
                    // Update the href attribute
                    token.attrs[hrefIndex][1] = finalHref;
                }
            }
            // Pass through to default renderer for other links
            return self.renderToken(tokens, idx, options);
        };
    });
    return md.render(markdownContent, options);
}
