"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarkdown = parseMarkdown;
const markdown_it_1 = __importDefault(require("markdown-it"));
function parseMarkdown(markdownContent, options) {
    const md = new markdown_it_1.default({
        html: true, // Enable HTML tags in source
        linkify: true, // Autoconvert URL-like texts to links
        typographer: true, // Enable some smart quotes and dashes
    });
    return md.render(markdownContent);
}
