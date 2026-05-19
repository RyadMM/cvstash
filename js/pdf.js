// PDF generation

import { t } from './i18n.js';
import { generatePDFFilename } from './storage.js';
import { autoFitContent } from './preview.js';

const LETTER_HEIGHT_PX = 11 * 96; // letter page height in CSS pixels

const PDF_CONFIG_BASE = {
    margin: 0,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        ignoreElements: (element) => {
            return element.id === 'loading' || element.id === 'progress-overlay';
        }
    },
    jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait'
    }
};

function preparePreviewForPDF(preview) {
    const saved = {
        transform: preview.style.transform,
        transformOrigin: preview.style.transformOrigin,
        width: preview.style.width,
        maxHeight: preview.style.maxHeight,
        overflow: preview.style.overflow,
        marginBottom: preview.style.marginBottom,
        zoom: preview.style.zoom,
    };

    // Reset all visual transforms for clean PDF capture
    preview.style.transform = 'none';
    preview.style.transformOrigin = '';
    preview.style.width = '8.5in';
    preview.style.zoom = '1';
    preview.style.marginBottom = '';

    return saved;
}

function restorePreview(preview, saved) {
    preview.style.transform = saved.transform;
    preview.style.transformOrigin = saved.transformOrigin;
    preview.style.width = saved.width;
    preview.style.maxHeight = saved.maxHeight;
    preview.style.overflow = saved.overflow;
    preview.style.marginBottom = saved.marginBottom;
    preview.style.zoom = saved.zoom;
}

export function downloadPDF(cv) {
    const filename = generatePDFFilename(cv.name);
    const preview = document.getElementById('preview');
    const loading = document.getElementById('loading');
    const btn = document.getElementById('download-btn');

    const saved = preparePreviewForPDF(preview);

    requestAnimationFrame(() => {
        loading.classList.add('show');
        if (btn) btn.classList.add('loading');

        setTimeout(() => {
            html2pdf()
                .set({ ...PDF_CONFIG_BASE, filename })
                .from(preview)
                .save()
                .then(() => {
                    loading.classList.remove('show');
                })
                .catch(err => {
                    console.error('PDF generation error:', err);
                    loading.classList.remove('show');
                    alert(t('loading') + ' Error: ' + err.message);
                })
                .finally(() => {
                    if (btn) btn.classList.remove('loading');
                    restorePreview(preview, saved);
                });
        }, 50);
    });
}

export async function generatePDFForCV(cv) {
    return new Promise((resolve, reject) => {
        const preview = document.getElementById('preview');
        const previewPanel = document.getElementById('preview-panel');
        const filename = generatePDFFilename(cv.name);

        const savedHTML = preview.innerHTML;
        const panelWasHidden = !previewPanel.classList.contains('active');

        if (panelWasHidden) {
            previewPanel.style.display = 'flex';
        }

        preview.innerHTML = marked.parse(cv.content);
        autoFitContent();
        const saved = preparePreviewForPDF(preview);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                html2pdf()
                    .set({ ...PDF_CONFIG_BASE, filename })
                    .from(preview)
                    .save()
                    .then(() => {
                        cleanup();
                        resolve();
                    })
                    .catch(err => {
                        cleanup();
                        reject(err);
                    });
            });
        });

        function cleanup() {
            restorePreview(preview, saved);
            preview.innerHTML = savedHTML;
            if (panelWasHidden) {
                previewPanel.style.display = '';
            }
        }
    });
}
