import {getToggleScript} from "./client/toggle";

export function addToggleFunctionality(htmlContent: string): string {
    const script = getToggleScript();
    // Inject the script before the closing </body> tag
    return htmlContent.replace('</body>', `${script}</body>`);
}
