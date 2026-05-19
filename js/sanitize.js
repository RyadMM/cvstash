// Sanitize HTML to prevent XSS from markdown content
// Uses browser DOMParser — no external dependencies

const DANGEROUS_TAGS = 'script, iframe, object, embed, form, base, meta, link';

export function sanitizeHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll(DANGEROUS_TAGS).forEach(el => el.remove());
    doc.querySelectorAll('*').forEach(el => {
        for (const attr of [...el.attributes]) {
            if (attr.name.startsWith('on') || attr.value.trim().toLowerCase().startsWith('javascript:')) {
                el.removeAttribute(attr.name);
            }
        }
    });
    return doc.body.innerHTML;
}
