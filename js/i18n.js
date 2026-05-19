// Internationalization (i18n) module

import { refreshIcons } from './icons.js';
import { CHAR_LIMIT } from './constants.js';

let i18nData = {};
let currentLang = 'en';

export async function loadI18n() {
    try {
        const response = await fetch('locales/' + currentLang + '.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        i18nData = await response.json();
    } catch (e) {
        console.error('Failed to load locale, using keys as fallback:', e);
        i18nData = {};
    }
    return i18nData;
}

export function setLang(lang) {
    currentLang = lang;
}

export function getLang() {
    return currentLang;
}

export function t(key, params = {}) {
    let text = i18nData[key] || key;
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    return text;
}

export function updateLanguageUI() {
    const t = i18nData;

    const appTitle = document.getElementById('app-title');
    if (appTitle) appTitle.textContent = t.title;

    const appSubtitle = document.getElementById('app-subtitle');
    if (appSubtitle) appSubtitle.textContent = t.subtitle;

    const headerPrivacy = document.getElementById('header-privacy');
    if (headerPrivacy) headerPrivacy.textContent = t.privacy;
    
    const editorLabel = document.getElementById('editor-label');
    if (editorLabel) editorLabel.textContent = t.editor;
    
    const previewLabel = document.getElementById('preview-label');
    if (previewLabel) previewLabel.textContent = t.preview;
    
    const downloadBtnText = document.getElementById('download-btn-text');
    if (downloadBtnText) downloadBtnText.textContent = t.download;
    
    const importBtnText = document.getElementById('import-btn-text');
    if (importBtnText) importBtnText.textContent = t.import;
    
    const exportBtnText = document.getElementById('export-btn-text');
    if (exportBtnText) exportBtnText.textContent = t.export;

    const copyBtnText = document.getElementById('copy-btn-text');
    if (copyBtnText) copyBtnText.textContent = t.copy;

    const editorCopyBtnText = document.getElementById('editor-copy-btn-text');
    if (editorCopyBtnText) editorCopyBtnText.textContent = t.copyEditor;
    
    const editor = document.getElementById('editor');
    if (editor) editor.placeholder = t.placeholder;
    
    const sidebarTitle = document.getElementById('sidebar-title');
    if (sidebarTitle) sidebarTitle.textContent = t.myCVs;
    
    document.getElementById('new-cv-btn').innerHTML = `
        <i data-lucide="plus"></i>
        <span id="new-cv-btn-text">${t.newCV}</span>
    `;
    refreshIcons();
    
    document.getElementById('rename-modal-title').textContent = t.renameCV;
    document.getElementById('rename-cancel').textContent = t.cancel;
    document.getElementById('rename-save').textContent = t.save;
    document.getElementById('empty-state-title').textContent = t.noCVs;
    document.getElementById('empty-state-description').textContent = t.noCVsDescription;
    document.getElementById('empty-state-new-cv-text').textContent = t.createFirstCV;
    document.getElementById('batch-delete-cancel').textContent = t.cancel;
    document.getElementById('batch-delete-confirm').textContent = t.delete;
    document.getElementById('progress-cancel').textContent = t.cancel;

    // Delete modal
    document.getElementById('delete-modal-title').textContent = t.deleteCVTitle;
    document.getElementById('delete-cancel').textContent = t.cancel;
    document.getElementById('delete-confirm').textContent = t.delete;
    document.getElementById('delete-dont-show').nextElementSibling.textContent = t.deleteDontShow;

    // Rename input placeholder
    document.getElementById('rename-input').placeholder = t.renamePlaceholder;

    // Empty state tour button
    const tourBtn = document.getElementById('empty-state-tour');
    if (tourBtn) tourBtn.querySelector('span').textContent = t.showMeAround;

    // Template picker modal
    document.getElementById('template-picker-title').textContent = t.chooseTemplate;
    document.getElementById('template-blank-label').textContent = t.blankLabel;
    document.getElementById('template-blank-desc').textContent = t.blankDesc;
    document.getElementById('template-placeholder-label').textContent = t.placeholderLabel;
    document.getElementById('template-placeholder-desc').textContent = t.placeholderDesc;
    document.getElementById('template-example-label').textContent = t.exampleLabel;
    document.getElementById('template-example-desc').textContent = t.exampleDesc;

    const charLimit = document.getElementById('char-limit');
    if (charLimit) {
        charLimit.textContent = CHAR_LIMIT.toString();
    }
}

export function updateLanguageButtons() {
    const enBtn = document.getElementById('lang-en');
    const frBtn = document.getElementById('lang-fr');

    enBtn.classList.remove('active');
    frBtn.classList.remove('active');

    if (currentLang === 'en') {
        enBtn.classList.add('active');
    } else {
        frBtn.classList.add('active');
    }
}
