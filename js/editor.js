// Editor functionality

import { t } from './i18n.js';

let debounceTimer = null;

export function initEditor(onInput) {
    const editor = document.getElementById('editor');
    editor.addEventListener('input', handleInput.bind(null, onInput));
    return editor;
}

function handleInput(onInput) {
    const editor = document.getElementById('editor');
    const content = editor.value;

    document.getElementById('app-subtitle').textContent = t('saving');

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        onInput(content);
        document.getElementById('app-subtitle').textContent = t('saved');
    }, 300);
}

export function loadContent(content) {
    const editor = document.getElementById('editor');
    editor.value = content;
    editor.placeholder = t('placeholder');
}

export function getContent() {
    return document.getElementById('editor').value;
}

export function focus() {
    document.getElementById('editor').focus();
}
