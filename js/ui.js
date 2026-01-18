// UI utilities (modals, mobile menu, loading overlay)

import { t } from './i18n.js';
import * as storage from './storage.js';

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function showLoading() {
    document.getElementById('loading').classList.add('show');
}

export function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

export function showRenameModal(name, onSave, onCancel) {
    const modal = document.getElementById('rename-modal');
    const input = document.getElementById('rename-input');
    input.value = name;
    modal.classList.add('show');
    input.focus();
    input.select();

    const saveHandler = () => {
        const newName = input.value.trim();
        if (!newName) {
            alert(t('cancel') === 'Cancel' ? 'Name cannot be empty' : 'Le nom ne peut pas être vide');
            return;
        }
        onSave(newName);
        closeRenameModal();
    };

    document.getElementById('rename-save').onclick = saveHandler;
    document.getElementById('rename-cancel').onclick = closeRenameModal;

    input.onkeydown = (e) => {
        if (e.key === 'Enter') saveHandler();
        if (e.key === 'Escape') closeRenameModal();
    };
}

function closeRenameModal() {
    document.getElementById('rename-modal').classList.remove('show');
}

export function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('show');
}

export function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
}

export function showProgressOverlay(total) {
    const overlay = document.getElementById('progress-overlay');
    const title = document.getElementById('progress-title');
    const status = document.getElementById('progress-status');
    const bar = document.getElementById('progress-bar');

    title.textContent = t('generatingPDFs') || 'Generating PDFs';
    status.textContent = `Processing 1 of ${total}...`;
    bar.style.width = '0%';

    overlay.classList.add('show');
}

export function updateProgress(current, total, name) {
    const status = document.getElementById('progress-status');
    const bar = document.getElementById('progress-bar');

    status.textContent = `${current}/${total}: ${escapeHtml(name)}`;
    const percentage = (current / total) * 100;
    bar.style.width = `${percentage}%`;
}

export function hideProgressOverlay() {
    document.getElementById('progress-overlay').classList.remove('show');
}

export function showBatchDeleteModal(cvs, selectedIds, onConfirm, onCancel) {
    const modal = document.getElementById('batch-delete-modal');
    const title = document.getElementById('batch-delete-title');
    const list = document.getElementById('batch-delete-list');
    const count = document.getElementById('batch-delete-count');

    title.textContent = `Delete ${selectedIds.length} CV${selectedIds.length > 1 ? 's' : ''}?`;
    count.textContent = `These CV${selectedIds.length > 1 ? 's' : ''} will be permanently deleted:`;

    list.innerHTML = selectedIds.map(id => {
        const cv = cvs[id];
        if (!cv) return '';
        return `<div class="batch-delete-item">${escapeHtml(cv.name)}</div>`;
    }).join('');

    modal.classList.add('show');

    document.getElementById('batch-delete-confirm').onclick = () => {
        onConfirm();
        modal.classList.remove('show');
    };

    document.getElementById('batch-delete-cancel').onclick = () => {
        onCancel();
        modal.classList.remove('show');
    };
}

export function hideBatchDeleteModal() {
    document.getElementById('batch-delete-modal').classList.remove('show');
}

export function toggleSidebar() {
    if (window.innerWidth <= 768) {
        toggleMobileMenu();
        return;
    }

    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    const collapsed = sidebar.classList.contains('collapsed');

    storage.saveSidebarCollapsed(collapsed);

    return collapsed;
}

export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (storage.loadSidebarCollapsed()) {
        sidebar.classList.add('collapsed');
    }
}
