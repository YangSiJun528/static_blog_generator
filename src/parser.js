"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarkdown = parseMarkdown;
// src/parser.ts
const markdown_it_1 = __importDefault(require("markdown-it"));
const obsidianLinkConverter_1 = require("./markdown/obsidianLinkConverter");
function parseMarkdown(markdownContent) {
    // TODO: Implement markdown parsing and HTML conversion
    const md = new markdown_it_1.default();
    const processedMarkdown = (0, obsidianLinkConverter_1.convertObsidianLinks)(markdownContent);
    return md.render(processedMarkdown);
}
