document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            toggleSwitch.checked = true;
        }
    }

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });
});

// Force remove any cached View Transitions to prevent flashing ghosts
const metaTransition = document.querySelector('meta[name="view-transition"]');
if (metaTransition) {
    metaTransition.remove();
}
