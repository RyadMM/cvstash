import { t } from './i18n.js';
import { refreshIcons } from './icons.js';

const TOTAL_STEPS = 4;
const STORAGE_KEY = 'cv-onboarding-complete';

const STEP_ICONS = ['file-text', 'edit-3', 'download', 'palette'];

let currentStep = 1;

export function initOnboarding() {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
        showWizard();
    }

    setupWizardNav();
    setupHelpModal();
}

export function showWizard() {
    currentStep = 1;
    renderStep();
    document.getElementById('onboarding-overlay').classList.add('show');
}

function closeWizard() {
    localStorage.setItem(STORAGE_KEY, 'true');
    document.getElementById('onboarding-overlay').classList.remove('show');
}

function buildStepHTML(step) {
    const items = [];
    let i = 1;
    while (true) {
        const key = `ob${step}L${i}`;
        const val = t(key);
        if (val === key) break;
        items.push(`<li>${val}</li>`);
        i++;
    }

    let html = `
        <div class="onboarding-icon"><i data-lucide="${STEP_ICONS[step - 1]}"></i></div>
        <h2 class="onboarding-title">${t(`ob${step}Title`)}</h2>
        <p class="onboarding-text">${t(`ob${step}Text`)}</p>
        <ul class="onboarding-list">${items.join('')}</ul>`;

    if (step === 2) {
        html += buildMarkdownTable();
    }

    return html;
}

function buildMarkdownTable() {
    const rows = [
        ['# Heading', t('mdHeading')],
        ['## Section', t('mdSection')],
        ['**bold**', t('mdBold')],
        ['*italic*', t('mdItalic')],
        ['- item', t('mdBullet')],
        ['[link](url)', t('mdLink')],
    ];
    return `<table class="markdown-ref-table">
        ${rows.map(([syntax, desc]) => `<tr><td><code>${syntax}</code></td><td>${desc}</td></tr>`).join('\n')}
    </table>`;
}

function renderStep() {
    const steps = document.querySelectorAll('.onboarding-step');
    steps.forEach(step => {
        const num = parseInt(step.dataset.step);
        step.classList.toggle('active', num === currentStep);
        if (num === currentStep) {
            step.innerHTML = buildStepHTML(num);
        }
    });

    // Progress dots
    const progress = document.getElementById('onboarding-progress');
    progress.innerHTML = '';
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        const dot = document.createElement('div');
        dot.className = 'onboarding-dot' + (i === currentStep ? ' active' : '');
        progress.appendChild(dot);
    }

    // Nav buttons
    document.getElementById('onboarding-prev').style.display = currentStep > 1 ? '' : 'none';
    document.getElementById('onboarding-skip').style.display = currentStep < TOTAL_STEPS ? '' : 'none';
    document.getElementById('onboarding-next').style.display = currentStep < TOTAL_STEPS ? '' : 'none';
    document.getElementById('onboarding-done').style.display = currentStep === TOTAL_STEPS ? '' : 'none';

    document.getElementById('onboarding-prev').textContent = t('obPrev');
    document.getElementById('onboarding-skip').textContent = t('obSkip');
    document.getElementById('onboarding-next').textContent = t('obNext');
    document.getElementById('onboarding-done').textContent = t('obDone');

    // Re-create Lucide icons in the active step
    refreshIcons();
}

function setupWizardNav() {
    document.getElementById('onboarding-next').addEventListener('click', () => {
        if (currentStep < TOTAL_STEPS) {
            currentStep++;
            renderStep();
        }
    });

    document.getElementById('onboarding-prev').addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            renderStep();
        }
    });

    document.getElementById('onboarding-skip').addEventListener('click', closeWizard);
    document.getElementById('onboarding-done').addEventListener('click', closeWizard);
}

function buildHelpHTML() {
    const mdRows = [
        ['<code># Heading</code>', t('mdHeading')],
        ['<code>## Section</code>', t('mdSection')],
        ['<code>### Subsection</code>', ''],
        ['<code>**bold text**</code>', t('mdBold')],
        ['<code>*italic text*</code>', t('mdItalic')],
        ['<code>- list item</code>', t('mdBullet')],
        ['<code>1. list item</code>', ''],
        ['<code>[text](url)</code>', t('mdLink')],
        ['<code>---</code>', ''],
    ];

    const uiItems = [
        ['helpUISidebar', 'helpUISidebarDesc'],
        ['helpUIEditor', 'helpUIEditorDesc'],
        ['helpUIPreview', 'helpUIPreviewDesc'],
        ['helpUIScale', 'helpUIScaleDesc'],
        ['helpUIZoom', 'helpUIZoomDesc'],
        ['helpUIImport', 'helpUIImportDesc'],
        ['helpUIExport', 'helpUIExportDesc'],
        ['helpUIDownload', 'helpUIDownloadDesc'],
        ['helpUIColor', 'helpUIColorDesc'],
    ];

    const tips = [];
    let ti = 1;
    while (true) {
        const key = `helpTipsL${ti}`;
        const val = t(key);
        if (val === key) break;
        tips.push(`<li>${val}</li>`);
        ti++;
    }

    return `
        <div class="help-section">
            <h3>${t('helpOverviewTitle')}</h3>
            <p>${t('helpOverviewText')}</p>
            <ul>
                <li>${t('helpOverviewL1')}</li>
                <li>${t('helpOverviewL2')}</li>
                <li>${t('helpOverviewL3')}</li>
                <li>${t('helpOverviewL4')}</li>
            </ul>
        </div>

        <div class="help-section">
            <h3>${t('helpUITitle')}</h3>
            ${uiItems.map(([nameKey, descKey]) => `
                <div class="help-ui-item">
                    <strong>${t(nameKey)}</strong>
                    <p>${t(descKey)}</p>
                </div>
            `).join('')}
        </div>

        <div class="help-section">
            <h3>${t('helpMDTitle')}</h3>
            <table class="markdown-ref-table">
                <thead><tr><th>${t('mdSyntax')}</th><th>${t('mdResult')}</th></tr></thead>
                <tbody>${mdRows.map(([syntax, result]) =>
                    `<tr><td>${syntax}</td><td>${result}</td></tr>`
                ).join('')}</tbody>
            </table>
        </div>

        <div class="help-section">
            <h3>${t('helpTipsTitle')}</h3>
            <ul>${tips.join('')}</ul>
        </div>`;
}

export function showHelpModal() {
    document.getElementById('help-modal-title').textContent = t('helpTitle');
    document.getElementById('help-modal-body').innerHTML = buildHelpHTML();
    document.getElementById('help-replay-onboarding').textContent = t('helpReplay');
    document.getElementById('help-modal').classList.add('show');
}

function closeHelpModal() {
    document.getElementById('help-modal').classList.remove('show');
}

function setupHelpModal() {
    document.getElementById('help-modal-close').addEventListener('click', closeHelpModal);

    document.getElementById('help-modal').addEventListener('click', (e) => {
        if (e.target.id === 'help-modal') closeHelpModal();
    });

    document.getElementById('help-replay-onboarding').addEventListener('click', () => {
        closeHelpModal();
        showWizard();
    });
}
