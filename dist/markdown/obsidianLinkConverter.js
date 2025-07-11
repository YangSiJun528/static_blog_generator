"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyObsidianLinksPlugin = applyObsidianLinksPlugin;
const obsidianPlugin = require('./markdown-it-obsidian');
// This function should apply the obsidian plugin to the provided MarkdownIt instance
function applyObsidianLinksPlugin(md, options) {
    md.use(obsidianPlugin, options);
}
