// LocalStorage operations for CVs and app state

export function loadCVs() {
    const savedCVs = localStorage.getItem('cvs');
    if (!savedCVs) return {};

    try {
        return JSON.parse(savedCVs);
    } catch (e) {
        console.error('Failed to parse saved CVs, resetting:', e);
        return {};
    }
}

export function saveCVs(cvs, currentCVId) {
    localStorage.setItem('cvs', JSON.stringify(cvs));
    if (currentCVId) {
        localStorage.setItem('currentCVId', currentCVId);
    }
}

export function loadCurrentCVId() {
    return localStorage.getItem('currentCVId');
}

export function loadLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const isFrench = browserLang.startsWith('fr');
    const defaultLang = isFrench ? 'fr' : 'en';
    return localStorage.getItem('cv-lang') || defaultLang;
}

export function saveLanguage(lang) {
    localStorage.setItem('cv-lang', lang);
}

export function loadSidebarCollapsed() {
    return localStorage.getItem('cv-sidebar-collapsed') === 'true';
}

export function saveSidebarCollapsed(collapsed) {
    localStorage.setItem('cv-sidebar-collapsed', collapsed);
}

export function loadSkipDeleteConfirm() {
    return localStorage.getItem('skipDeleteConfirm') === 'true';
}

export function saveSkipDeleteConfirm() {
    localStorage.setItem('skipDeleteConfirm', 'true');
}

export function extractName(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim().substring(0, 30) : 'Untitled';
}

export function sanitizeName(name) {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
}

export function generateMarkdownFilename(name) {
    return sanitizeName(name) + '.md';
}

export function generatePDFFilename(name) {
    const date = new Date().toISOString().split('T')[0];
    return sanitizeName(name) + '-' + date + '.pdf';
}
