// Toast Notification System

import { t } from './i18n.js';

let toastIdCounter = 0;
const activeToasts = new Map();

export function showToast(message, onUndo, duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }

    const toastId = ++toastIdCounter;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = `toast-${toastId}`;

    // Create toast content
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;

    const actionsEl = document.createElement('div');
    actionsEl.className = 'toast-actions';

    // Add undo button if callback provided
    if (onUndo) {
        const undoBtn = document.createElement('button');
        undoBtn.className = 'toast-undo-btn';
        undoBtn.textContent = t('undo');
        undoBtn.addEventListener('click', () => {
            onUndo();
            dismissToast(toastId);
        });
        actionsEl.appendChild(undoBtn);
    }

    // Add dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'toast-dismiss-btn';
    dismissBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    dismissBtn.addEventListener('click', () => dismissToast(toastId));
    actionsEl.appendChild(dismissBtn);

    toast.appendChild(messageEl);
    toast.appendChild(actionsEl);
    container.appendChild(toast);

    // Store reference
    activeToasts.set(toastId, { element: toast, timeoutId: null });

    // Auto-dismiss after duration
    if (duration > 0) {
        const timeoutId = setTimeout(() => {
            dismissToast(toastId);
        }, duration);
        activeToasts.get(toastId).timeoutId = timeoutId;
    }

    return toastId;
}

export function dismissToast(toastId) {
    const toastData = activeToasts.get(toastId);
    if (!toastData) return;

    const toast = toastData.element;

    // Clear timeout if exists
    if (toastData.timeoutId) {
        clearTimeout(toastData.timeoutId);
    }

    // Animate out
    toast.classList.add('toast-exit');

    // Remove from DOM after animation
    toast.addEventListener('animationend', () => {
        toast.remove();
        activeToasts.delete(toastId);
    });
}

export function clearAllToasts() {
    // Copy keys to avoid iteration issues while deleting
    const toastIds = Array.from(activeToasts.keys());
    toastIds.forEach(id => dismissToast(id));
}
