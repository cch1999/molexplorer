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
}

export default function initThemeToggle(doc = document) {
    const toggleBtn = doc.getElementById('theme-toggle');
    if (!toggleBtn) return;
    toggleBtn.addEventListener('click', () => toggleDarkMode(doc));
}
