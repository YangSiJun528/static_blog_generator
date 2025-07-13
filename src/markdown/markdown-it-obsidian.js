// MIT License
//
// Copyright (c) 2021 Alex J Vazhatharayil
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict'

const extend = require('extend')
const sanitize = require('sanitize-filename')
const path = require('path')
const fs = require('fs')

module.exports = (md, options) => {

    const defaults = {
        baseURL: '/',
        relativeBaseURL: './',
        makeAllLinksAbsolute: false,
        uriSuffix: '',
        htmlAttributes: {
        },
        generatePageNameFromLabel: (label) => {
            return label
        },
        postProcessPageName: (pageName) => {
            pageName = pageName.trim()
            pageName = pageName.split('/').map(sanitize).join('/')
            pageName = pageName.replace(/\s+/, '_')
            return pageName
        },
        postProcessLabel: (label) => {
            label = label.trim()
            return label
        },
        notesRoot: '',
        currentFileRelativePath: '',
    }

    options = extend(true, defaults, options)

    function isAbsolute(pageName) {
        return true
    }

    function removeInitialSlashes(str) {
        return str.replace(/^\/+/g, '')
    }

    const wikiLinkRegexp = /!?\[\[(([^\]#\|]*)(#[^\|\]]+)*(\|[^\|\]]*)*)\]\]/;

    function wikiLinkTokenizer(state, silent) {
        const max = state.posMax;
        const start = state.pos;

        if (start + 2 >= max) { return false; }
        if (state.src.charCodeAt(start) !== 0x21 /* ! */ && state.src.charCodeAt(start) !== 0x5B /* [ */) { return false; }
        if (state.src.charCodeAt(start + 1) !== 0x5B /* [ */) { return false; }

        const match = state.src.slice(start).match(wikiLinkRegexp);
        if (!match) { return false; }

        if (silent) { return true; }

        const fullMatch = match[0];
        const isImage = fullMatch.startsWith('!');
        const content = match[1];
        const isSplit = !!match[4]; // Check if there's a pipe for alias

        let label = '';
        let pageName = '';

        if (isSplit) {
            const parts = content.split('|');
            pageName = parts[0];
            label = parts[1];
        } else {
            label = content;
            pageName = options.generatePageNameFromLabel(label);
        }

        label = options.postProcessLabel(label);
        pageName = options.postProcessPageName(pageName);

        if (!label || !pageName) { return false; }

        let targetHtmlPath = '';

        // Custom logic to find the actual file path (similar to original markdown-it-obsidian.js)
        const avoid = ['.git', '_site', 'node_modules', '.obsidian'];

        const getAllFiles = function(dirPath, arrayOfFiles) {
            let files = fs.readdirSync(dirPath);
            arrayOfFiles = arrayOfFiles || [];

            files.forEach(function(file) {
                let skip = false;
                avoid.forEach(function(f) {
                    if (f === file) { skip = true; }
                });
                if (!skip) {
                    const fullPath = path.join(dirPath, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                    } else {
                        arrayOfFiles.push(fullPath);
                    }
                }
            });
            return arrayOfFiles;
        };

        const all_files = getAllFiles(options.notesRoot);
        let shortlists = [];

        all_files.forEach(function(file) {
            const relativeToNotes = path.relative(options.notesRoot, file);
            if (relativeToNotes.includes('/assets/')) { return; }

            // Check if the pageName matches the file name (without extension) or the full relative path
            if (path.basename(relativeToNotes, '.md') === pageName || relativeToNotes.replace(/\.md$/, '') === pageName) {
                if (relativeToNotes.endsWith('.md')) {
                    shortlists.push(relativeToNotes);
                }
            }
        });

        let foundMarkdownFile = '';
        if (shortlists.length === 1) {
            foundMarkdownFile = shortlists[0];
        } else if (shortlists.length > 1) {
            // Prioritize exact match for pageName
            shortlists.forEach(function(file) {
                if (path.basename(file, '.md') === pageName) {
                    foundMarkdownFile = file;
                }
            });
            if (!foundMarkdownFile) {
                // If no exact match, take the first one
                foundMarkdownFile = shortlists[0];
            }
        }

        if (foundMarkdownFile) {
            targetHtmlPath = foundMarkdownFile.replace(/\.md$/, '.html');
        } else {
            // If no specific markdown file was found, assume it's a new file and append .html
            targetHtmlPath = pageName + '.html';
        }

        // Make the href relative to the current output file's directory
        const currentFileOutputDir = path.dirname(options.currentFileRelativePath);
        let href = path.relative(currentFileOutputDir, targetHtmlPath);
        if (!href.startsWith('.') && !href.startsWith('/')) {
            href = './' + href;
        }

        // No need to escape href here, markdown-it will do it when rendering the attribute

        let token;
        if (isImage) {
            token = state.push('image', 'img', 0);
            token.attrs = [['src', href]];
            token.children = [];
        } else {
            token = state.push('link_open', 'a', 1);
            token.attrs = [['href', href]];
            for (let attrName in options.htmlAttributes) {
                token.attrs.push([attrName, options.htmlAttributes[attrName]]);
            }
            token = state.push('text', '', 0);
            token.content = label;
            token = state.push('link_close', 'a', -1);
        }

        state.pos += fullMatch.length;
        return true;
    }

    md.inline.ruler.after('emphasis', 'wiki_link', wikiLinkTokenizer);
};
