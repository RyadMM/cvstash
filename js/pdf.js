// PDF generation

import { t } from './i18n.js';
import { generatePDFFilename } from './storage.js';

function createPDFElement(content) {
    const element = document.createElement('div');
    element.className = 'cv-template';
    element.style.position = 'fixed';
    element.style.left = '-9999px';
    element.style.top = '0';
    element.style.width = '8.5in';
    element.style.minHeight = 'auto';
    element.style.transform = 'none';
    element.style.padding = '0.4in';
    element.style.paddingBottom = '0.3in';
    element.innerHTML = marked.parse(content);
    return element;
}

export function downloadPDF(cv) {
    const filename = generatePDFFilename(cv.name);
    const loading = document.getElementById('loading');
    loading.classList.add('show');

    const pdfElement = createPDFElement(cv.content);
    document.body.appendChild(pdfElement);

    const config = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    };

    html2pdf()
        .set(config)
        .from(pdfElement)
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
            if (document.body.contains(pdfElement)) {
                document.body.removeChild(pdfElement);
            }
        });
}

export async function generatePDFForCV(cv) {
    return new Promise((resolve, reject) => {
        const pdfElement = createPDFElement(cv.content);
        document.body.appendChild(pdfElement);

        const filename = generatePDFFilename(cv.name);

        html2pdf().set({
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: {
                unit: 'in',
                format: 'letter',
                orientation: 'portrait'
            }
        }).from(pdfElement).save().then(() => {
            document.body.removeChild(pdfElement);
            resolve();
        }).catch(err => {
            document.body.removeChild(pdfElement);
            reject(err);
        });
    });
}
