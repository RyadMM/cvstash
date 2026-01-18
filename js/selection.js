// Multi-select functionality

import * as storage from './storage.js';
import { t } from './i18n.js';
import { showProgressOverlay, updateProgress, hideProgressOverlay } from './ui.js';

let selectedCVs = new Set();

export function getSelectedCVs() {
    return selectedCVs;
}

export function toggleCVSelection(id) {
    if (selectedCVs.has(id)) {
        selectedCVs.delete(id);
    } else {
        selectedCVs.add(id);
    }
    updateSelectionUI();
}

export function selectAll(allCVIds) {
    const allSelected = allCVIds.length > 0 && selectedCVs.size === allCVIds.length;

    if (allSelected) {
        selectedCVs.clear();
    } else {
        allCVIds.forEach(id => selectedCVs.add(id));
    }

    updateSelectionUI();
}

export function clearSelection() {
    selectedCVs.clear();
    updateSelectionUI();
}

export function updateSelectionUI() {
    const count = selectedCVs.size;
    const counter = document.getElementById('selection-counter');
    const actionBar = document.getElementById('selection-action-bar');
    const selectAllBtn = document.getElementById('select-all-btn');

    if (counter) {
        counter.textContent = `${count} ${count === 1 ? 'CV' : 'CVs'} selected`;
    }

    if (actionBar) {
        actionBar.classList.toggle('show', count > 0);
        document.body.classList.toggle('selection-active', count > 0);
    }

    if (selectAllBtn) {
        const allIds = Array.from(document.querySelectorAll('.cv-item'))
            .map(el => el.dataset.id)
            .filter(id => id);
        const allSelected = allIds.length > 0 && selectedCVs.size === allIds.length;
        selectAllBtn.querySelector('span').textContent = allSelected ? 'Deselect All' : 'Select All';
    }

    updateCheckboxes();
}

function updateCheckboxes() {
    const checkboxes = document.querySelectorAll('.cv-checkbox');
    checkboxes.forEach(checkbox => {
        const id = checkbox.dataset.id;
        if (!id) return;
        const wasChecked = checkbox.classList.contains('checked');
        const isChecked = selectedCVs.has(id);

        if (wasChecked !== isChecked) {
            checkbox.classList.toggle('checked', isChecked);
        }
    });

    const items = document.querySelectorAll('.cv-item');
    items.forEach(item => {
        const id = item.dataset.id;
        if (!id) return;
        item.classList.toggle('selected', selectedCVs.has(id));
    });
}

export function batchDownloadMD(cvs) {
    selectedCVs.forEach(id => {
        const cv = cvs[id];
        if (!cv) return;

        const blob = new Blob([cv.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = storage.generateMarkdownFilename(cv.name);
        a.click();
        URL.revokeObjectURL(url);
    });

    clearSelection();
}

export async function batchDownloadPDF(cvs) {
    const { generatePDFForCV } = await import('./pdf.js');
    const ids = Array.from(selectedCVs);

    showProgressOverlay(ids.length);

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const cv = cvs[id];
        if (!cv) continue;

        updateProgress(i + 1, ids.length, cv.name);

        try {
            await generatePDFForCV(cv);
        } catch (error) {
            console.error('PDF generation error for', cv.name, error);
        }
    }

    hideProgressOverlay();
    clearSelection();
}

export function batchDelete(cvs) {
    const selectedIds = Array.from(selectedCVs);

    if (selectedIds.length >= Object.keys(cvs).length) {
        alert(t('cannotDeleteAll') || 'Cannot delete all CVs. Keep at least one.');
        return false;
    }

    selectedIds.forEach(id => {
        delete cvs[id];
    });

    const currentCVId = localStorage.getItem('currentCVId');
    if (!cvs[currentCVId] && Object.keys(cvs).length > 0) {
        localStorage.setItem('currentCVId', Object.keys(cvs)[0]);
    } else if (Object.keys(cvs).length === 0) {
        localStorage.removeItem('currentCVId');
    }

    return true;
}
