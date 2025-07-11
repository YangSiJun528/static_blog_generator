"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = require("./generator");
// Run the generator with the current working directory as the project root
(0, generator_1.generateStaticBlog)(process.cwd());
