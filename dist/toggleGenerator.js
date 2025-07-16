"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToggleFunctionality = addToggleFunctionality;
const toggle_1 = require("./client/toggle");
function addToggleFunctionality(htmlContent) {
    const script = (0, toggle_1.getToggleScript)();
    // Inject the script before the closing </body> tag
    return htmlContent.replace('</body>', `${script}</body>`);
}
