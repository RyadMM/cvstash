// Main app initialization and orchestration

import * as storage from './storage.js';
import { loadI18n, setLang, updateLanguageUI, updateLanguageButtons, t, getLang } from './i18n.js';
import { initEditor, loadContent, getContent } from './editor.js';
import { updatePreview, checkContentLength, setScaleMode } from './preview.js';
import { downloadPDF } from './pdf.js';
import { initOnboarding, showHelpModal, showWizard } from './onboarding.js';
import { escapeHtml, showRenameModal, closeMobileMenu, toggleMobileMenu, toggleSidebar as uiToggleSidebar, initSidebar as uiInitSidebar, showBatchDeleteModal, hideBatchDeleteModal, showProgressOverlay, hideProgressOverlay, updateProgress, getDeleteCallback } from './ui.js';
import * as sidebar from './sidebar.js';
import { toggleSelectionMode, toggleCVSelection, selectAll, batchDownloadMD, batchDownloadPDF, batchDelete, clearSelection, getSelectedCVs } from './selection.js';
import { initSwipeGesture, destroySwipeGesture, initPanelSwipe } from './swipe.js';
import { initTheme, setTheme, applyCVColor } from './theme.js';
import { executeCommand, undo, redo } from './history.js';
import { RenameCommand, EditCommand } from './commands.js';
import { showToast } from './toast.js';
import { BREAKPOINT_MOBILE, CHAR_LIMIT, EDIT_TRACK_DEBOUNCE_MS, LETTER_WIDTH_PX } from './constants.js';
import { getNextSampleCV, getBlankCV, getPlaceholderCV, showTemplatePicker, hideTemplatePicker } from './templates.js';

let renamingCVId = null;
let zoomLevel = 1.0;

// Edit tracking for undo
let editTimeout = null;
let lastEditContent = '';
let lastEditCVId = null;

async function init() {
    console.log('CV Stash init() starting...');

    const lang = storage.loadLanguage();
    setLang(lang);
    await loadI18n();
    updateLanguageUI();
    updateLanguageButtons();

    uiInitSidebar();

    const cvs = storage.loadCVs();
    sidebar.initSidebar(cvs);
    sidebar.setAfterDeleteCallback(() => updateViewState());

    initEditor(handleEditorInput);
    initSwipeGesture();
    initPanelSwipe(switchTab);

    setupEventListeners();
    updateViewState();
    initTabs();

    initTheme();

    // Apply current CV's color to the theme
    const currentCV = sidebar.getCurrentCV();
    if (currentCV) {
        applyCVColor(currentCV);
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }

    initOnboarding();
    requestInitialZoom();

    console.log('CV Stash initialized successfully');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    document.getElementById('lang-en').addEventListener('click', () => handleLanguageChange('en'));
    document.getElementById('lang-fr').addEventListener('click', () => handleLanguageChange('fr'));

    document.getElementById('download-btn').addEventListener('click', handleDownloadPDF);
    document.getElementById('import-btn').addEventListener('click', handleImport);
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('editor-copy-btn').addEventListener('click', handleCopyToClipboard);
    document.getElementById('file-input').addEventListener('change', handleFileImport);
    document.getElementById('zoom-out-btn').addEventListener('click', handleZoomOut);
    document.getElementById('zoom-in-btn').addEventListener('click', handleZoomIn);
    document.getElementById('scale-select').addEventListener('change', (e) => {
        setScaleMode(e.target.value);
    });

    document.getElementById('help-btn').addEventListener('click', showHelpModal);
    document.getElementById('empty-state-tour').addEventListener('click', showWizard);

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        uiToggleSidebar();
        clearSelection();
    });

    document.getElementById('selection-mode-btn').addEventListener('click', () => {
        toggleSelectionMode();
    });

    document.getElementById('new-cv-btn').addEventListener('click', handleCreateNewCV);
    document.getElementById('new-cv-btn-collapsed').addEventListener('click', handleCreateNewCV);

    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobile-overlay').addEventListener('click', closeMobileMenu);

    // Tab switching
    document.getElementById('editor-tab').addEventListener('click', () => switchTab('editor'));
    document.getElementById('preview-tab').addEventListener('click', () => switchTab('preview'));

    document.getElementById('empty-state-new-cv').addEventListener('click', handleCreateNewCV);

    document.getElementById('select-all-btn').addEventListener('click', handleSelectAll);
    document.getElementById('batch-download-md-btn').addEventListener('click', handleBatchDownloadMD);
    document.getElementById('batch-download-pdf-btn').addEventListener('click', handleBatchDownloadPDF);
    document.getElementById('batch-delete-btn').addEventListener('click', handleShowBatchDeleteModal);
    document.getElementById('progress-cancel').addEventListener('click', handleCancelBatchOperation);

    // Template picker
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            createCVFromTemplate(card.dataset.template);
        });
    });
    document.getElementById('template-picker-modal').addEventListener('click', (e) => {
        if (e.target.id === 'template-picker-modal') hideTemplatePicker();
    });

    document.getElementById('delete-confirm').addEventListener('click', () => {
        const checkbox = document.getElementById('delete-dont-show');
        if (checkbox && checkbox.checked) {
            storage.saveSkipDeleteConfirm();
        }
        const callback = getDeleteCallback();
        if (callback) callback.onConfirm();
    });

    document.getElementById('delete-cancel').addEventListener('click', () => {
        const callback = getDeleteCallback();
        if (callback) callback.onCancel();
    });

    window.addEventListener('resize', () => {
        applyFitToView();
        handleWindowResize();
    });

    // Keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => {
        if (!(e.ctrlKey || e.metaKey)) return;

        const isUndo = e.key === 'z' && !e.shiftKey;
        const isRedo = (e.key === 'z' && e.shiftKey) || e.key === 'y';
        if (!isUndo && !isRedo) return;

        e.preventDefault();
        const success = isUndo ? undo() : redo();
        if (success) {
            sidebar.initSidebar(sidebar.getCVs());
            const currentCV = sidebar.getCurrentCV();
            if (currentCV) {
                loadContent(currentCV.content);
                updatePreview(currentCV.content);
                applyCVColor(currentCV);
            }
        }
    });

    setupCVListListeners();
}

// Tab switching
function switchTab(tab) {
    const editorTab = document.getElementById('editor-tab');
    const previewTab = document.getElementById('preview-tab');
    const editorPanel = document.getElementById('editor-panel');
    const previewPanel = document.getElementById('preview-panel');
    const editorActions = document.getElementById('editor-actions');
    const previewActions = document.getElementById('preview-actions');
    const editor = document.getElementById('editor');

    if (tab === 'editor') {
        editorTab.classList.add('active');
        previewTab.classList.remove('active');
        editorPanel.classList.add('active');
        previewPanel.classList.remove('active');
        editorActions.style.display = 'flex';
        previewActions.style.display = 'none';
        editor.focus();
    } else {
        previewTab.classList.add('active');
        editorTab.classList.remove('active');
        previewPanel.classList.add('active');
        editorPanel.classList.remove('active');
        editorActions.style.display = 'none';
        previewActions.style.display = 'flex';

        // Update preview with current content
        const currentContent = getContent();
        if (currentContent) {
            updatePreview(currentContent);
        }

        // On mobile, apply letter-fit scaling after preview renders
        if (window.innerWidth <= BREAKPOINT_MOBILE) {
            requestAnimationFrame(() => applyFitToView());
        }
    }
}

// Initialize tabs
function initTabs() {
    switchTab('editor');
}

function requestInitialZoom() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    // Set 100% immediately on load
    requestAnimationFrame(() => {
        applyFitToView();
    });
}

function setupCVListListeners() {
    const cvList = document.getElementById('cv-list');

    cvList.addEventListener('click', (e) => {
        const item = e.target.closest('.cv-item');
        if (!item) return;
        const id = item.dataset.id;

        if (e.target.closest('.cv-checkbox')) {
            e.stopPropagation();
            e.preventDefault();
            toggleCVSelection(id);
            return;
        }

        if (e.target.closest('.cv-action-btn')) {
            e.stopPropagation();
            e.preventDefault();
            const action = e.target.closest('.cv-action-btn').dataset.action;
            if (action === 'rename') {
                handleRename(id);
            } else if (action === 'duplicate') {
                handleDuplicate(id);
            } else if (action === 'delete') {
                handleDelete(id);
            }
            return;
        }

        // In selection mode, clicking anywhere on the item toggles selection
        if (document.body.classList.contains('selection-mode')) {
            e.stopPropagation();
            toggleCVSelection(id);
            return;
        }

        e.stopPropagation();
        handleCVClick(id);
    });
}

function handleEditorInput(content) {
    const currentCV = sidebar.getCurrentCV();
    if (!currentCV) {
        updatePreview(content);
        checkContentLength();
        return;
    }

    const currentCVId = sidebar.getCurrentCVId();

    // Clear existing timeout
    clearTimeout(editTimeout);

    // Immediate save (existing behavior)
    sidebar.updateCV(currentCVId, { content });

    const newName = storage.extractName(content);
    if (currentCV.name !== newName) {
        sidebar.updateCV(currentCVId, { name: newName });
        sidebar.renderCVList();
    }

    const cvs = sidebar.getCVs();

    updatePreview(content);
    checkContentLength();

    // Debounced edit command for undo (2 second delay)
    editTimeout = setTimeout(() => {
        // Only create edit command if:
        // 1. Content has changed from last saved state
        // 2. We're tracking edits for this CV
        if (lastEditCVId === currentCVId && lastEditContent !== content && lastEditContent !== '') {
            const command = new EditCommand(currentCVId, lastEditContent, content, cvs);
            executeCommand(command); // No toast for edits
        }

        // Update tracking state
        lastEditCVId = currentCVId;
        lastEditContent = content;
    }, EDIT_TRACK_DEBOUNCE_MS);
}

async function handleLanguageChange(lang) {
    if (lang === storage.loadLanguage()) return;

    storage.saveLanguage(lang);
    setLang(lang);
    await loadI18n();
    updateLanguageUI();
    updateLanguageButtons();
    sidebar.renderCVList();
}

function handleDownloadPDF() {
    const cv = sidebar.getCurrentCV();
    if (!cv) return;

    if (cv.content.length > CHAR_LIMIT) {
        alert(t('charLimitExceeded'));
        return;
    }

    downloadPDF(cv);
}

function handleZoomOut() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    const currentScale = getCurrentZoomScale();
    const newScale = Math.max(0.3, currentScale - 0.1);
    setZoomScale(newScale);
}

function handleZoomIn() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    const currentScale = getCurrentZoomScale();
    const newScale = Math.min(1.5, currentScale + 0.1);
    setZoomScale(newScale);
}

function getCurrentZoomScale() {
    const preview = document.getElementById('preview');
    if (!preview) return 1.0;

    // On mobile, zoom is handled via CSS zoom property
    if (window.innerWidth <= BREAKPOINT_MOBILE) {
        return parseFloat(preview.style.zoom) || 1.0;
    }

    const transform = preview.style.transform;
    const match = transform.match(/scale\(([\d.]+)\)/);
    return match ? parseFloat(match[1]) : 1.0;
}

function setZoomScale(scale) {
    const preview = document.getElementById('preview');
    if (!preview) return;

    zoomLevel = scale;

    const percentage = Math.round(scale * 100);
    const zoomLevelEl = document.getElementById('zoom-level');
    if (zoomLevelEl) {
        zoomLevelEl.textContent = `${percentage}%`;
    }

    scale = Math.floor(scale * 100) / 100;

    if (window.innerWidth <= BREAKPOINT_MOBILE) {
        preview.style.zoom = scale;
    } else {
        preview.style.transform = `scale(${scale})`;
    }
}

function applyFitToView() {
    const preview = document.getElementById('preview');

    if (!preview) return;

    if (window.innerWidth <= BREAKPOINT_MOBILE) {
        // On mobile, use CSS zoom to fit letter page to viewport width
        const templateWidthPx = LETTER_WIDTH_PX;
        const scale = Math.floor((window.innerWidth / templateWidthPx) * 100) / 100;
        preview.style.zoom = scale;
        preview.style.transform = '';
        preview.style.transformOrigin = '';
        preview.style.marginBottom = '';
        zoomLevel = scale;

        const zoomLevelEl = document.getElementById('zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
        }
    } else {
        preview.style.zoom = '';
        preview.style.transform = 'scale(1)';
        preview.style.transformOrigin = '';
        preview.style.marginBottom = '';
        zoomLevel = 1.0;

        const zoomLevelEl = document.getElementById('zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = '100%';
        }
    }
}

function handleImport() {
    document.getElementById('file-input').click();
}

function handleExport() {
    const cv = sidebar.getCurrentCV();
    if (!cv) return;

    const blob = new Blob([cv.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = storage.generateMarkdownFilename(cv.name);
    a.click();
    URL.revokeObjectURL(url);
}

function handleCopyToClipboard() {
    const content = getContent();
    if (!content) return;

    navigator.clipboard.writeText(content).then(() => {
        const btn = document.getElementById('editor-copy-btn');
        const btnText = document.getElementById('editor-copy-btn-text');
        btn.classList.add('copied');
        if (btnText) btnText.textContent = t('copied');

        setTimeout(() => {
            btn.classList.remove('copied');
            if (btnText) btnText.textContent = t('copyEditor');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const name = storage.extractName(content) || 'Imported CV';
        sidebar.createCV(name, content);
        updateViewState();
        event.target.value = '';
        closeMobileMenu();
    };
    reader.readAsText(file);
}

function handleCreateNewCV() {
    showTemplatePicker();
}

function createCVFromTemplate(templateType) {
    let content = '';
    let name = '';
    switch (templateType) {
        case 'blank':
            content = getBlankCV();
            name = t('newBlankCV') || 'New Blank CV';
            break;
        case 'placeholder':
            content = getPlaceholderCV();
            name = t('newPlaceholderCV') || 'New Placeholder CV';
            break;
        case 'example':
            content = getNextSampleCV();
            const match = content.match(/^#\s+(.+)/m);
            name = match ? match[1].trim() : (t('newExampleCV') || 'New Example CV');
            break;
    }

    sidebar.createCV(name, content);
    loadCurrentCV();
    updateViewState();
    clearSelection();
    closeMobileMenu();
    hideTemplatePicker();
}

function handleCVClick(id) {
    sidebar.selectCV(id);
    loadCurrentCV();
    clearSelection();
}

function handleRename(id) {
    const cvs = sidebar.getCVs();
    const cv = cvs[id];
    if (!cv) return;

    const oldName = cv.name;
    renamingCVId = id;
    showRenameModal(oldName, (newName) => {
        const command = new RenameCommand(id, oldName, newName, cvs);
        executeCommand(command);

        sidebar.initSidebar(sidebar.getCVs());
        renamingCVId = null;

        // Show toast with undo option
        showToast(
            command.getDescription(),
            () => {
                undo();
                sidebar.initSidebar(sidebar.getCVs());
                const currentCV = sidebar.getCurrentCV();
                if (currentCV) {
                    applyCVColor(currentCV);
                }
            }
        );
    }, () => {
        renamingCVId = null;
    });
}

function handleDuplicate(id) {
    const newCV = sidebar.duplicateCV(id);
    if (newCV) {
        loadCurrentCV();
    }
}

function handleDelete(id) {
    if (sidebar.deleteCV(id)) {
        updateViewState();
    }
}

function handleSelectAll() {
    selectAll(Object.keys(sidebar.getCVs()));
}

function handleBatchDownloadMD() {
    batchDownloadMD(sidebar.getCVs());
}

function handleBatchDownloadPDF() {
    batchDownloadPDF(sidebar.getCVs());
}

function handleShowBatchDeleteModal() {
    const selectedIds = Array.from(getSelectedCVs());
    const cvs = sidebar.getCVs();

    showBatchDeleteModal(cvs, selectedIds, () => {
        if (batchDelete(cvs)) {
            sidebar.setCVs(cvs);
            sidebar.initSidebar(cvs);
            updateViewState();
            clearSelection();
        }
    }, () => {
        hideBatchDeleteModal();
    });
}

function handleCancelBatchOperation() {
    hideProgressOverlay();
    clearSelection();
}

function handleWindowResize() {
    applyFitToView();
}

function loadCurrentCV() {
    const cv = sidebar.getCurrentCV();
    if (!cv) return;

    loadContent(cv.content);
    updatePreview(cv.content);
    checkContentLength();
    updateActiveCVHighlight();
    applyFitToView();
}

function updateActiveCVHighlight() {
    document.querySelectorAll('.cv-item').forEach(item => {
        item.classList.remove('active');
    });
    sidebar.renderCVList();
}

function updateViewState() {
    const cvs = sidebar.getCVs();
    const hasCVs = Object.keys(cvs).length > 0;
    const emptyState = document.getElementById('empty-state');
    const editorPreviewWrapper = document.getElementById('editor-preview-wrapper');

    if (hasCVs) {
        emptyState.classList.remove('show');
        if (editorPreviewWrapper !== null) {
            editorPreviewWrapper.style.display = 'flex';
        }
        if (sidebar.getCurrentCVId() !== null) {
            loadCurrentCV();
        }
    } else {
        emptyState.classList.add('show');
        if (editorPreviewWrapper !== null) {
            editorPreviewWrapper.style.display = 'none';
        }
    }
}

// Start the app when DOM is ready
// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

