export const MOON_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
export const SUN_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-16h1v3h-1V2zm0 17h1v3h-1v-3zm10-7v1h-3v-1h3zM5 12v1H2v-1h3zm12.364-6.364.707.707-2.122 2.121-.707-.707 2.122-2.121zM8.758 15.243l.707.707-2.121 2.122-.707-.707 2.121-2.122zM17.071 15.243l2.122 2.122-.707.707-2.122-2.122.707-.707zM6.343 5.636l2.122 2.122-.707.707L5.636 6.343l.707-.707z"/></svg>';

export function toggleDarkMode(doc = document) {
    const body = doc.body;
    const toggleBtn = doc.getElementById('theme-toggle');
    if (!body || !toggleBtn) return;
    let isDark;
    if (body.classList && typeof body.classList.toggle === 'function') {
        isDark = body.classList.toggle('dark-mode');
    } else {
        const classes = body.className.split(' ').filter(Boolean);
        const idx = classes.indexOf('dark-mode');
        if (idx >= 0) {
            classes.splice(idx, 1);
            isDark = false;
        } else {
            classes.push('dark-mode');
            isDark = true;
        }
        body.className = classes.join(' ');
    }
    toggleBtn.innerHTML = isDark ? SUN_ICON : MOON_ICON;

    const containers = doc.querySelectorAll
        ? [...doc.querySelectorAll('.viewer-container'), ...doc.querySelectorAll('.details-viewer')]
        : [];
    containers.forEach(vc => {
        const viewer = vc.viewer;
        if (viewer && typeof viewer.setBackgroundColor === 'function') {
            viewer.setBackgroundColor(isDark ? '#bbbbbb' : 'white');
            if (typeof viewer.render === 'function') viewer.render();
        }
    });
}

export default function initThemeToggle(doc = document) {
    const toggleBtn = doc.getElementById('theme-toggle');
    if (!toggleBtn) return;
    toggleBtn.addEventListener('click', () => toggleDarkMode(doc));
}
