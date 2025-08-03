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
    toggleBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';

    const containers = doc.querySelectorAll ? doc.querySelectorAll('.viewer-container') : [];
    containers.forEach(vc => {
        const viewer = vc.viewer;
        if (viewer && typeof viewer.setBackgroundColor === 'function') {
            viewer.setBackgroundColor(isDark ? '#1e1e1e' : 'white');
            if (typeof viewer.render === 'function') viewer.render();
        }
    });
}

export default function initThemeToggle(doc = document) {
    const toggleBtn = doc.getElementById('theme-toggle');
    if (!toggleBtn) return;
    toggleBtn.addEventListener('click', () => toggleDarkMode(doc));
}
