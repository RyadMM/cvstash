import { t } from './i18n.js';
import { CHAR_LIMIT } from './constants.js';
import { sanitizeHtml } from './sanitize.js';

const MIN_SCALE = 0.75;
const MAX_SCALE = 1.3;

let scaleMode = 'auto';

export function updatePreview(content) {
    const preview = document.getElementById('preview');
    preview.innerHTML = sanitizeHtml(marked.parse(content));
    autoFitContent();
    updateCharacterCounter(content);
}

export function setScaleMode(mode) {
    scaleMode = mode;

    const template = document.getElementById('preview');
    if (!template) return;

    if (mode === 'auto') {
        autoFitContent();
    } else {
        template.style.setProperty('--s', mode);
    }
}

export function autoFitContent() {
    const template = document.getElementById('preview');
    if (!template) return;

    if (scaleMode !== 'auto') {
        template.style.setProperty('--s', scaleMode);
        return;
    }

    const style = getComputedStyle(template);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    const availableHeight = template.clientHeight - paddingTop - paddingBottom;

    // Reset scale to measure natural content size
    template.style.setProperty('--s', '1');

    // Temporarily remove height constraint for measurement
    const savedHeight = template.style.height;
    const savedOverflow = template.style.overflow;
    template.style.height = 'auto';
    template.style.overflow = 'visible';

    // scrollHeight includes padding, so subtract to get content-only height
    const naturalContentHeight = template.scrollHeight - paddingTop - paddingBottom;

    // Restore height constraints
    template.style.height = savedHeight;
    template.style.overflow = savedOverflow;

    if (naturalContentHeight < 1) return;

    const ratio = (availableHeight * 0.95) / naturalContentHeight;
    const scale = Math.min(Math.max(ratio, MIN_SCALE), MAX_SCALE);

    template.style.setProperty('--s', scale.toString());
}

function updateCharacterCounter(content) {
    const currentCount = content.length;
    const counter = document.getElementById('char-counter');
    const currentEl = document.getElementById('char-current');

    if (!counter || !currentEl) return;

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
