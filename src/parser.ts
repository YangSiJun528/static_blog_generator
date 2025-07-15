import MarkdownIt from 'markdown-it';
import * as path from 'path';

interface MarkdownParseOptions {
    notesRoot: string;
    currentFileRelativePath: string;
}

export function parseMarkdown(markdownContent: string, options: MarkdownParseOptions): string {
    const md = new MarkdownIt({
        html: true, // Enable HTML tags in a source
        linkify: true, // Auto convert URL-like texts to links
        typographer: true, // Enable some smart quotes and dashes
    });

    // Custom plugin to handle .md links
    md.use(function(md) {
        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const hrefIndex = token.attrIndex('href');
            if (hrefIndex >= 0 && token.attrs) {
                const href = token.attrs[hrefIndex][1];

                const parseOptions = env as MarkdownParseOptions; // Cast env to our custom options interface

                // Check if it's an internal .md link and not an external URL
                // ref: https://regex101.com/r/BGxJ6n/1
                const isExternalUrl = /^[a-z][a-z0-9+\-.]*:/.test(href) || href.startsWith('//')
                if (!isExternalUrl) {
                    let sourceLinkedMdPath: string;

                    // Determine the base directory for resolving the link
                    console.log(`DEBUG: currentFileAbsPath args: notesRoot=${parseOptions.notesRoot}, currentFileRelativePath=${parseOptions.currentFileRelativePath}`);
                    const currentFileAbsPath = path.join(parseOptions.notesRoot, parseOptions.currentFileRelativePath);
                    const currentFileDir = path.dirname(currentFileAbsPath);

                    if (href.startsWith('./') || href.startsWith('../')) {
                        // The Link is relative to the current file's directory
                        console.log(`DEBUG: path.resolve args: currentFileDir=${currentFileDir}, href=${href}`);
                        sourceLinkedMdPath = path.resolve(currentFileDir, href);
                    } else {
                        // Assume a link is relative to the notesRoot (Obsidian-like vault root linking)
                        console.log(`DEBUG: path.join args: notesRoot=${parseOptions.notesRoot}, href=${href}`);
                        sourceLinkedMdPath = path.join(parseOptions.notesRoot, href);
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

                    // Convert to the corresponding output HTML path (relative to output directory)
                    const relativeLinkedHtmlPathFromOutput = relativeLinkedMdPathFromNotes.replace(/\.md$/, '.html');

                    // Determine the relative path from the current generated HTML file to the target HTML output file
                    const currentHtmlRelativePathFromOutput = parseOptions.currentFileRelativePath.replace(/\.md$/, '.html');
                    const currentHtmlDirFromOutput = path.dirname(currentHtmlRelativePathFromOutput);

                    // Update the href attribute
                    token.attrs[hrefIndex][1] = path.relative(currentHtmlDirFromOutput, relativeLinkedHtmlPathFromOutput);
                }
            }
            // Pass through to default renderer for other links
            return self.renderToken(tokens, idx, options);
        };
    });

    return md.render(markdownContent, options);
}
