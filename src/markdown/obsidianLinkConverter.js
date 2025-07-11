"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertObsidianLinks = convertObsidianLinks;
const markdown_it_1 = __importDefault(require("markdown-it"));
const obsidianPlugin = require('./markdown-it-obsidian');
function convertObsidianLinks(markdown) {
    const md = new markdown_it_1.default();
    md.use(obsidianPlugin);
    return md.render(markdown);
}
