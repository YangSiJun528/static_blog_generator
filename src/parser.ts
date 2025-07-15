import MarkdownIt from 'markdown-it';

interface MarkdownParseOptions {
    notesRoot: string;
    currentFileRelativePath: string;
}

export function parseMarkdown(markdownContent: string, options: MarkdownParseOptions): string {
    const md = new MarkdownIt({
        html: true, // Enable HTML tags in source
        linkify: true, // Autoconvert URL-like texts to links
        typographer: true, // Enable some smart quotes and dashes
    });
    return md.render(markdownContent);
}
