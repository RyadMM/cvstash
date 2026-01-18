// Sidebar, CV list, and navigation

import { escapeHtml } from './ui.js';
import { t, getLang } from './i18n.js';

let currentCVId = null;
let cvs = {};

function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return t('minutesAgo', { count: minutes });
    if (hours < 24) return t('hoursAgo', { count: hours });
    if (days < 7) return t('daysAgo', { count: days });

    const date = new Date(timestamp);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString(getLang() === 'fr' ? 'fr-FR' : 'en-US', options);
}

export function initSidebar(initialCVs) {
    cvs = initialCVs;
    currentCVId = getCurrentCVId();
    renderCVList();
}

export function getCurrentCVId() {
    const savedCurrentId = localStorage.getItem('currentCVId');
    if (savedCurrentId && cvs[savedCurrentId]) {
        return savedCurrentId;
    } else if (Object.keys(cvs).length > 0) {
        return Object.keys(cvs)[0];
    }
    return null;
}

export function renderCVList() {
    const container = document.getElementById('cv-list');
    container.innerHTML = '';

    const sortedIds = Object.keys(cvs).sort((a, b) => cvs[b].lastModified - cvs[a].lastModified);

    sortedIds.forEach(id => {
        const cv = cvs[id];
        const isActive = id === currentCVId;

        const item = document.createElement('div');
        item.className = `cv-item ${isActive ? 'active' : ''}`;
        item.dataset.id = id;

        const checkboxHtml = `
            <div class="cv-checkbox" data-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
        `;

        const contentHtml = `
            <div class="cv-item-content">
                <div class="cv-item-main">
                    ${checkboxHtml}
                    <span class="cv-name">${escapeHtml(cv.name)}</span>
                </div>
                <span class="cv-last-modified">${formatRelativeTime(cv.lastModified)}</span>
            </div>
            <div class="cv-actions">
                <button class="cv-action-btn" title="${t('rename')}" data-action="rename" data-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button class="cv-action-btn delete" title="${t('delete')}" data-action="delete" data-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        item.innerHTML = contentHtml;
        container.appendChild(item);
    });
}

export function selectCV(id) {
    if (!cvs[id]) return;
    currentCVId = id;
    renderCVList();
    return cvs[id];
}

export function getCurrentCV() {
    return cvs[currentCVId] || null;
}

export function updateCV(id, updates) {
    if (!cvs[id]) return;
    cvs[id] = { ...cvs[id], ...updates, lastModified: Date.now() };
}

export function createCV(name, content) {
    const id = 'cv-' + Date.now();
    cvs[id] = {
        name: name,
        content: content,
        lastModified: Date.now()
    };
    currentCVId = id;
    renderCVList();
    return cvs[id];
}

export function deleteCV(id) {
    if (!cvs[id]) return;

    if (Object.keys(cvs).length <= 1) {
        alert(t('cannotDeleteLast'));
        return false;
    }

    if (!confirm(t('deleteConfirm').replace('{name}', cvs[id].name))) return false;

    delete cvs[id];

    if (id === currentCVId) {
        currentCVId = Object.keys(cvs).length > 0 ? Object.keys(cvs)[0] : null;
    }

    renderCVList();
    return true;
}

export function renameCV(id, newName) {
    if (!cvs[id] || !newName) return false;

    cvs[id].name = newName;
    cvs[id].lastModified = Date.now();
    renderCVList();
    return true;
}

export function getCVs() {
    return cvs;
}

export function setCVs(newCVs) {
    cvs = newCVs;
}

export function updateActiveCV(id) {
    currentCVId = id;
    renderCVList();
}
