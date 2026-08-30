document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.body.classList.add(currentTheme);
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light-mode');
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            }
        });
    }
});

// Force remove any cached View Transitions to prevent flashing ghosts
const metaTransition = document.querySelector('meta[name="view-transition"]');
if (metaTransition) {
    metaTransition.remove();
}
