export function getToggleScript() {
    return `<script>
    function setToggleDisplay(contentElement, triangleElement, show) {
        if (show) {
            contentElement.style.display = 'block';
            triangleElement?.classList.add('toggled');
        } else {
            contentElement.style.display = 'none';
            triangleElement?.classList.remove('toggled');
        }
    }

    async function ensureContentLoadedAndDisplay(iconElement, forceExpand = false) {
        const liElement = iconElement.closest('.has-toggle');
        if (!liElement) {
            return;
        }
        const content = liElement.querySelector('.toggle-content');
        const triangle = liElement.querySelector('.triangle-toggle');

        if (!content || !triangle) {
            return;
        }

        const isCurrentlyHidden = content.style.display === 'none' || content.style.display === '';

        if (isCurrentlyHidden || forceExpand) {
            const src = content.dataset.src;
            if (src && !content.dataset.loaded) {
                try {
                    const response = await fetch(src);
                    if (!response.ok) {
                        throw new Error('HTTP error! status: ' + response.status);
                    }
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const mainContent = doc.querySelector('main');

                    if (mainContent) {
                        const loadedContentBaseUrl = new URL(src, window.location.href);
                        mainContent.querySelectorAll('a').forEach(a => {
                            const href = a.getAttribute('href');
                            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/')) {
                                const absoluteUrl = new URL(href, loadedContentBaseUrl);
                                a.href = absoluteUrl.href;
                            }
                        });

                        content.innerHTML = mainContent.innerHTML;
                        attachToggleListeners(content);
                    } else {
                        content.innerHTML = '<p>Error: Content could not be loaded.</p>';
                    }
                    content.dataset.loaded = 'true'; // Mark as loaded
                } catch (e) {
                    console.error('Failed to load content:', e);
                    content.innerHTML = '<p>Error loading content.</p>';
                }
            }
            setToggleDisplay(content, triangle, true);
        } else {
            setToggleDisplay(content, triangle, false);
        }
    }

    function handleToggleClick(event) {
        event.preventDefault();
        ensureContentLoadedAndDisplay(event.currentTarget);
    }

    function attachToggleListeners(rootElement = document) {
        rootElement.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.removeEventListener('click', handleToggleClick); // Prevent duplicate listeners
            icon.addEventListener('click', handleToggleClick);
        });
    }

    window.expandImmediateChildrenToggles = function() {
        document.querySelectorAll('main > ul > li.has-toggle').forEach(li => {
            const icon = li.querySelector('.toggle-icon');
            if (icon) {
                ensureContentLoadedAndDisplay(icon, true); // Force expand and load
            }
        });
    };

    window.collapseImmediateChildrenToggles = function() {
        document.querySelectorAll('main > ul > li.has-toggle').forEach(li => {
            const content = li.querySelector('.toggle-content');
            const triangle = li.querySelector('.triangle-toggle');
            if (content && triangle) {
                setToggleDisplay(content, triangle, false);
            }
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        attachToggleListeners();
    });
</script>
`;
}
