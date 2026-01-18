// Internationalization (i18n) module

let i18nData = {};
let currentLang = 'en';

export async function loadI18n() {
    const response = await fetch('locales/' + currentLang + '.json');
    i18nData = await response.json();
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
    
    const editor = document.getElementById('editor');
    if (editor) editor.placeholder = t.placeholder;
    
    const sidebarTitle = document.getElementById('sidebar-title');
    if (sidebarTitle) sidebarTitle.textContent = t.myCVs;
    
    document.getElementById('new-cv-btn').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span id="new-cv-btn-text">${t.newCV}</span>
    `;
    
    document.getElementById('rename-modal-title').textContent = t.renameCV;
    document.getElementById('rename-cancel').textContent = t.cancel;
    document.getElementById('rename-save').textContent = t.save;
    document.getElementById('empty-state-title').textContent = t.noCVs;
    document.getElementById('empty-state-description').textContent = t.noCVsDescription;
    document.getElementById('empty-state-new-cv-text').textContent = t.createFirstCV;
    document.getElementById('batch-delete-cancel').textContent = t.cancel;
    document.getElementById('batch-delete-confirm').textContent = t.delete;
    document.getElementById('progress-cancel').textContent = t.cancel;

    const charLimit = document.getElementById('char-limit');
    if (charLimit) {
        charLimit.textContent = '2500';
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
