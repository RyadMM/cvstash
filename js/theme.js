// Theme management - native color picker with palette icon

let currentColor = null;

export function initTheme() {
    const colorBtn = document.getElementById('accent-color-btn');
    const colorInput = document.getElementById('accent-color-input');
    if (!colorBtn || !colorInput) return;

    const savedColor = localStorage.getItem('accentColor') || '#f97316';
    colorInput.value = savedColor;
    applyTheme(savedColor);

    // Set initial icon color
    const icon = colorBtn.querySelector('.theme-icon');
    if (icon) {
        icon.style.color = savedColor;
    }

    // Update icon color when theme changes
    colorInput.addEventListener('input', (e) => {
        setTheme(e.target.value);
        if (icon) {
            icon.style.color = e.target.value;
        }
    });
}

export function setTheme(hexColor) {
    localStorage.setItem('accentColor', hexColor);
    applyTheme(hexColor);
}

function applyTheme(hexColor) {
    document.documentElement.style.setProperty('--accent-color', hexColor);
}

export function getCurrentTheme() {
    return document.documentElement.style.getPropertyValue('--accent-color') || '#f97316';
}
