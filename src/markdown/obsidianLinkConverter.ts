import MarkdownIt from 'markdown-it';
const obsidianPlugin = require('./markdown-it-obsidian');

interface ObsidianPluginOptions {
    notesRoot: string;
    currentFileRelativePath: string;
}

// This function should apply the obsidian plugin to the provided MarkdownIt instance
export function applyObsidianLinksPlugin(md: MarkdownIt, options: ObsidianPluginOptions): void {
    md.use(obsidianPlugin, options);
}