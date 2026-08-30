document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    // Default to dark mode if no theme is set
    let currentTheme = localStorage.getItem('theme');
    
    if (!currentTheme) {
        currentTheme = 'dark-mode';
        localStorage.setItem('theme', 'dark-mode');
    }

    if (currentTheme === 'dark-mode') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
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






// --- VERCEL STYLE REACTIVE LOGIC ---
function initProReactive() {
    let bg = document.getElementById("pro-reactive-bg");
    if (!bg) {
        bg = document.createElement("div");
        bg.id = "pro-reactive-bg";
        document.body.prepend(bg);
    }
    
    document.addEventListener("mousemove", (e) => {
        requestAnimationFrame(() => {
            document.body.classList.add("mouse-active");
            bg.style.setProperty("--mouse-x", `${e.clientX}px`);
            bg.style.setProperty("--mouse-y", `${e.clientY}px`);
        });
    });
    
    document.addEventListener("mouseleave", () => {
        document.body.classList.remove("mouse-active");
    });
}
initProReactive();
// -----------------------------------

// --- MOBILE TABLE LABEL INJECTOR ---
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
        if (headers.length === 0) return;
        table.querySelectorAll('tbody tr').forEach(tr => {
            Array.from(tr.querySelectorAll('td')).forEach((td, i) => {
                if (headers[i] && !td.hasAttribute('data-label')) {
                    td.setAttribute('data-label', headers[i]);
                }
            });
        });
    });
});
// -----------------------------------



