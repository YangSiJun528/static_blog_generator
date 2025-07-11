"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToggleFunctionality = addToggleFunctionality;
function addToggleFunctionality(htmlContent) {
    const script = `
<script>
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const content = icon.nextElementSibling;
                if (content && content.classList.contains('toggle-content')) {
                    if (content.style.display === 'none') {
                        content.style.display = 'block';
                        icon.textContent = '▼';
                    } else {
                        content.style.display = 'none';
                        icon.textContent = '▶';
                    }
                }
            });
        });
    });
</script>
`;
    // Inject the script before the closing </body> tag
    return htmlContent.replace('</body>', `${script}</body>`);
}
