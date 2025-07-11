"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToggleFunctionality = addToggleFunctionality;
function addToggleFunctionality(htmlContent) {
    const script = `
<script>
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.addEventListener('click', async () => {
                const content = icon.parentElement.querySelector('.toggle-content');
                if (content && content.classList.contains('toggle-content')) {
                    const src = content.dataset.src;
                    if (src && !content.dataset.loaded) {
                        try {
                            const response = await fetch(src);
                            if (!response.ok) {
                                throw new Error('HTTP error! status: ' + response.status);
                            }
                            const html = await response.text();
                            content.innerHTML = html;
                            content.dataset.loaded = 'true'; // Mark as loaded
                        } catch (e) {
                            console.error('Failed to load content:', e);
                            content.innerHTML = '<p>Error loading content.</p>';
                        }
                    }

                    if (content.style.display === 'none' || content.style.display === '') {
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
