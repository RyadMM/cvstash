// Theme management - native color picker with palette icon

import { DEFAULT_ACCENT } from './constants.js';

// Get color for a specific CV (fallback to global theme)
export function getCVColor(cv) {
    if (cv && cv.color) {
        return cv.color;
    }
    return localStorage.getItem('accentColor') || DEFAULT_ACCENT;
}

// Apply a CV's color to the theme
export function applyCVColor(cv) {
    const color = getCVColor(cv);
    applyTheme(color);
    updateColorPickerUI(color);
}

// Set color for a specific CV
export function setCVColor(cvId, hexColor, cvs) {
    if (cvs[cvId]) {
        cvs[cvId].color = hexColor;
        return true;
    }
    return false;
}

// Get current global accent color
export function getGlobalAccentColor() {
    return localStorage.getItem('accentColor') || DEFAULT_ACCENT;
}

export function initTheme() {
    const colorBtn = document.getElementById('accent-color-btn');
    const colorInput = document.getElementById('accent-color-input');
    if (!colorBtn || !colorInput) return;

    const savedColor = localStorage.getItem('accentColor') || DEFAULT_ACCENT;
    colorInput.value = savedColor;
    applyTheme(savedColor);

    colorInput.addEventListener('input', (e) => {
        const newColor = e.target.value;
        applyTheme(newColor);
        window.dispatchEvent(new CustomEvent('cvColorChange', { detail: { color: newColor } }));
    });
}

export function setTheme(hexColor) {
    localStorage.setItem('accentColor', hexColor);
    applyTheme(hexColor);
}

function applyTheme(hexColor) {
    document.documentElement.style.setProperty('--accent-color', hexColor);
}

// Update color picker input and icon to match a color
function updateColorPickerUI(color) {
    const colorInput = document.getElementById('accent-color-input');
    if (colorInput) colorInput.value = color;
}

export function getCurrentTheme() {
    return document.documentElement.style.getPropertyValue('--accent-color') || DEFAULT_ACCENT;
}
