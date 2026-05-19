// Sidebar, CV list, and navigation

import { escapeHtml, showDeleteModal, shouldSkipDeleteConfirm, hideDeleteModal } from './ui.js';
import { t, getLang } from './i18n.js';
import { refreshIcons } from './icons.js';
import { executeCommand, undo } from './history.js';
import { DeleteCommand } from './commands.js';
import { showToast } from './toast.js';
import { applyCVColor, getGlobalAccentColor, setCVColor } from './theme.js';
import { saveCVs } from './storage.js';

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

    // Listen for color picker changes and save to current CV
    window.addEventListener('cvColorChange', (e) => {
        if (currentCVId) {
            setCVColor(currentCVId, e.detail.color, cvs);
            saveCVs(cvs, currentCVId);
        }
    });
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
                <i data-lucide="check" style="width: 12px; height: 12px;"></i>
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
                    <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                </button>
                <button class="cv-action-btn" title="${t('duplicate')}" data-action="duplicate" data-id="${id}">
                    <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                </button>
                <button class="cv-action-btn delete" title="${t('delete')}" data-action="delete" data-id="${id}">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
            </div>
        `;

        item.innerHTML = contentHtml;
        container.appendChild(item);
    });

    refreshIcons();
}

export function selectCV(id) {
    if (!cvs[id]) return;
    currentCVId = id;
    renderCVList();
    // Apply the CV's color to the theme
    applyCVColor(cvs[id]);
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
        color: getGlobalAccentColor(),  // Inherit current global color
        lastModified: Date.now()
    };
    currentCVId = id;
    renderCVList();
    return cvs[id];
}

export function duplicateCV(id) {
    if (!cvs[id]) return;

    const original = cvs[id];
    const baseName = original.name;
    const existingNames = Object.values(cvs).map(cv => cv.name);

    let newName = `${baseName} (2)`;
    let counter = 2;
    while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseName} (${counter})`;
    }

    const newId = 'cv-' + Date.now();
    cvs[newId] = {
        name: newName,
        content: original.content,
        color: original.color || getGlobalAccentColor(),
        lastModified: Date.now()
    };

    currentCVId = newId;
    renderCVList();
    return cvs[newId];
}

export function deleteCV(id) {
    if (!cvs[id]) return;

    if (Object.keys(cvs).length <= 1) {
        alert(t('cannotDeleteLast'));
        return false;
    }

    // Skip confirmation if user chose "don't show again"
    if (shouldSkipDeleteConfirm()) {
        return performDeleteWithUndo(id);
    }

    // Show custom modal
    showDeleteModal(cvs[id].name,
        () => { // onConfirm
            performDeleteWithUndo(id);
            hideDeleteModal();
        },
        () => { // onCancel
            hideDeleteModal();
        }
    );

    return false; // Defer actual deletion until confirmed
}

function performDeleteWithUndo(id) {
    const command = new DeleteCommand(id, cvs, currentCVId);
    command.execute();
    executeCommand(command);
    renderCVList();

    // Show toast with undo option
    showToast(
        command.getDescription(),
        () => {
            undo();
            renderCVList();
            // Reload current CV if it was restored
            const restoredCV = cvs[id];
            if (restoredCV) {
                currentCVId = id;
                renderCVList();
                applyCVColor(restoredCV);
            }
        }
    );

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
