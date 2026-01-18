import { t } from './i18n.js';

const CHAR_LIMIT = 2500;
const SPACING_LEVELS = {
    COMPACT: 'spacing-compact',
    MEDIUM: 'spacing-medium',
    FULL: 'spacing-full'
};

export function updatePreview(content) {
    const preview = document.getElementById('preview');
    preview.innerHTML = marked.parse(content);
    applySpacingLevel(content);
    updateCharacterCounter(content);
}

function applySpacingLevel(content) {
    const charCount = content.length;
    const preview = document.getElementById('preview');

    preview.classList.remove(...Object.values(SPACING_LEVELS));

    let spacingLevel;
    if (charCount >= 2500) {
        spacingLevel = SPACING_LEVELS.COMPACT;
    } else if (charCount >= 1750) {
        spacingLevel = SPACING_LEVELS.MEDIUM;
    } else {
        spacingLevel = SPACING_LEVELS.FULL;
    }

    preview.classList.add(spacingLevel);
}

function updateCharacterCounter(content) {
    const currentCount = content.length;
    const counter = document.getElementById('char-counter');
    const currentEl = document.getElementById('char-current');

    currentEl.textContent = currentCount;

    if (currentCount > CHAR_LIMIT) {
        counter.classList.add('limit-exceeded');
    } else {
        counter.classList.remove('limit-exceeded');
    }
}

export function checkContentLength() {
    const editorContent = document.getElementById('editor').value;
    const currentCount = editorContent.length;

    const downloadBtn = document.getElementById('download-btn');
    if (currentCount > CHAR_LIMIT) {
        downloadBtn.disabled = true;
        downloadBtn.classList.add('disabled');
    } else {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('disabled');
    }

    updateCharacterCounter(editorContent);
}
