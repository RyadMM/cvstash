# AGENTS.md - CV Generator (Refactored)

## Project Structure

```
cv/
├── index.html          # Minimal entry point (230 lines)
├── css/
│   ├── main.css        # UI styling (buttons, headers, sidebar, modals)
│   ├── template.css    # CV template styling (print styles)
│   └── mobile.css      # Mobile responsive overrides
├── js/
│   ├── app.js          # Main app initialization and orchestration
│   ├── storage.js      # LocalStorage operations
│   ├── i18n.js         # Internationalization (EN/FR)
│   ├── editor.js       # Editor functionality
│   ├── preview.js      # Markdown preview rendering
│   ├── pdf.js          # PDF generation
│   ├── sidebar.js      # CV list and navigation
│   ├── selection.js    # Multi-select functionality
│   └── ui.js          # UI utilities (modals, mobile menu)
├── locales/
│   ├── en.json         # English translations
│   └── fr.json         # French translations
├── index.html.backup   # Original monolithic file (backup)
└── test.html           # PDF generation testing
```

## Modular Architecture

### CSS Modules

**css/main.css** (~700 lines)
- Global styles (body, reset)
- Editor styling
- Preview container
- Loading overlay
- Button components (`.btn-action`, `.btn-primary`, `.btn-danger`)
- Language switcher
- Panel headers
- Main header
- Sidebar styling
- CV list items
- Empty state
- Rename modal
- Page break toggle
- Multi-select styles
- Progress overlay
- Batch delete modal
- Mobile responsive base

**css/template.css** (~100 lines)
- `.cv-template` - Main CV container (US Letter: 8.5" × 11")
- Typography (h1, h2, h3, p, ul, ol, li, strong, em, a)
- Page break rules (avoid splitting sections)
- Preview scaling for mobile (scale transforms)

**css/mobile.css** (~300 lines)
- Sidebar mobile overlay
- Mobile menu toggles
- Responsive breakpoints (@media max-width: 768px)
- Touch-friendly button sizes

### JavaScript Modules

**js/storage.js** (~100 lines)
- `loadCVs()` - Load CVs from localStorage
- `saveCVs(cvs, currentCVId)` - Save CVs to localStorage
- `loadCurrentCVId()` - Get current CV ID
- `loadLanguage()` - Detect/set language preference
- `saveLanguage(lang)` - Persist language
- `loadSidebarCollapsed()` - Check sidebar state
- `saveSidebarCollapsed(collapsed)` - Persist sidebar state
- `loadPageBreakMode()` - Get page break mode
- `savePageBreakMode(mode)` - Persist page break mode
- `extractName(content)` - Extract CV name from markdown heading
- `sanitizeName(name)` - Clean name for filenames
- `generateMarkdownFilename(name)` - Create .md filename
- `generatePDFFilename(name)` - Create .pdf filename

**js/i18n.js** (~80 lines)
- `loadI18n()` - Load translation JSON
- `setLang(lang)` - Set current language
- `getLang()` - Get current language
- `t(key)` - Get translated string
- `updateLanguageUI()` - Update all DOM text
- `updateLanguageButtons()` - Update active state

**js/editor.js** (~60 lines)
- `initEditor(onInput)` - Setup editor with callback
- `loadContent(content)` - Set editor value
- `getContent()` - Get editor value
- `focus()` - Focus editor

**js/preview.js** (~40 lines)
- `updatePreview(content)` - Render markdown to preview
- `checkContentLength()` - Check if content fits on 1 page
- `showWarning()` / `hideWarning()` - Page break warning

**js/pdf.js** (~80 lines)
- `downloadPDF(cv, pageBreakMode)` - Download single CV as PDF
- `generatePDFForCV(cv)` - Promise-based PDF generation

**js/sidebar.js** (~200 lines)
- `initSidebar(initialCVs)` - Initialize sidebar
- `getCurrentCVId()` - Get active CV ID
- `renderCVList(selectedCVs)` - Render CV list with selection
- `selectCV(id)` - Select CV and load it
- `getCurrentCV()` - Get active CV object
- `updateCV(id, updates)` - Update CV properties
- `createCV(name, content)` - Create new CV
- `deleteCV(id)` - Delete CV with confirmation
- `renameCV(id, newName)` - Rename CV
- `getCVs()` - Get all CVs
- `setCVs(newCVs)` - Set all CVs
- `updateActiveCV(id)` - Update active state

**js/selection.js** (~150 lines)
- `isSelectionMode()` - Check if in selection mode
- `getSelectedCVs()` - Get selected CV IDs
- `toggleSelectionMode()` - Toggle selection mode
- `exitSelectionMode()` - Exit selection mode
- `toggleCVSelection(id)` - Toggle single CV selection
- `selectAll(allCVIds)` - Select/deselect all CVs
- `updateSelectionCount()` - Update count UI
- `batchDownloadMD(cvs)` - Download multiple MD files
- `batchDownloadPDF(cvs)` - Download multiple PDFs with progress
- `batchDelete(cvs)` - Batch delete CVs
- `clearSelection()` - Clear all selections

**js/ui.js** (~150 lines)
- `escapeHtml(text)` - HTML escape utility
- `showLoading()` / `hideLoading()` - Loading overlay
- `showRenameModal(name, onSave, onCancel)` - Rename modal
- `toggleMobileMenu()` / `closeMobileMenu()` - Mobile menu
- `showProgressOverlay(total)` / `updateProgress(current, total, name)` / `hideProgressOverlay()` - Progress overlay
- `showBatchDeleteModal(cvs, selectedIds, onConfirm, onCancel)` - Batch delete modal
- `hideBatchDeleteModal()` - Hide modal
- `toggleSidebar()` / `initSidebar()` - Sidebar controls

**js/app.js** (~350 lines)
- `init()` - Main entry point
- `setupEventListeners()` - Wire up all event handlers
- `setupCVListListeners()` - CV list click handling
- `handleEditorInput(content)` - Editor input handler
- `handleLanguageChange(lang)` - Language change
- `handleDownloadPDF()` - PDF download
- `handleImport()` / `handleExport()` - Import/Export
- `handleFileImport(event)` - File import handler
- `handlePageBreakToggle(e)` - Page break toggle
- `handleCreateNewCV()` - Create new CV
- `handleCVClick(id)` - CV selection
- `handleRename(id)` - Rename CV
- `handleDelete(id)` - Delete CV
- `handleToggleSelectionMode()` - Toggle selection mode
- `handleSelectAll()` - Select all
- `handleBatchDownloadMD()` / `handleBatchDownloadPDF()` - Batch operations
- `handleShowBatchDeleteModal()` - Batch delete modal
- `handleCancelBatchOperation()` - Cancel batch operation
- `handleSidebarCollapse()` - Sidebar collapse
- `initPageBreakToggle()` - Initialize toggle
- `loadCurrentCV()` - Load active CV into editor
- `updateActiveCVHighlight()` - Update active UI
- `updateViewState()` - Show/hide empty state

## AI-Friendly Workflow

### Working with Features

**1. Feature Location**
- Need to modify CV styling? → `css/template.css`
- Need to change button styles? → `css/main.css`
- Need to add new translation? → `locales/en.json` and `locales/fr.json`
- Need to modify editor behavior? → `js/editor.js`
- Need to change PDF generation? → `js/pdf.js`
- Need to add new UI component? → `css/main.css` + `js/ui.js`
- Need to modify sidebar/CV list? → `js/sidebar.js`
- Need to add batch operation? → `js/selection.js`
- Need to wire up new feature? → `js/app.js`

**2. Module Dependencies**
```
app.js (main orchestration)
├── storage.js (localStorage)
├── i18n.js (translations)
├── editor.js (text editor)
├── preview.js (markdown render)
├── pdf.js (PDF generation)
├── sidebar.js (CV list)
├── selection.js (multi-select)
└── ui.js (modals, overlays)
```

**3. Adding New Features**

**Example: Add new export format (DOCX)**

1. Create function in `js/pdf.js` or new `js/export.js`:
```javascript
export function exportToDOCX(cv) {
    // Implementation
}
```

2. Add button to `index.html` in preview panel:
```html
<button id="download-docx-btn" class="btn-action">
    Download DOCX
</button>
```

3. Wire up in `js/app.js`:
```javascript
document.getElementById('download-docx-btn').addEventListener('click', () => {
    const cv = sidebar.getCurrentCV();
    if (cv) exportToDOCX(cv);
});
```

4. Add translations to `locales/en.json` and `locales/fr.json`:
```json
{
    "downloadDOCX": "Download DOCX"
}
```

**Example: Add new CV template**

1. Add CSS classes to `css/template.css`:
```css
.cv-template-modern {
    /* Modern styles */
}
```

2. Add template selector UI to `index.html`

3. Add state management to `js/storage.js`:
```javascript
export function loadTemplate() {
    return localStorage.getItem('cv-template') || 'classic';
}

export function saveTemplate(template) {
    localStorage.setItem('cv-template', template);
}
```

4. Add toggle function to `js/preview.js`:
```javascript
export function setTemplate(templateName) {
    const preview = document.getElementById('preview');
    preview.className = `cv-template-${templateName}`;
}
```

5. Wire up in `js/app.js`

### Testing Changes

**1. Local Testing**
```bash
cd /Users/ryad/projects/ryad.app
python3 -m http.server 8081
# Open http://localhost:8081/cv/
```

**2. Check Browser Console**
- Look for errors in module imports
- Check localStorage values
- Test PDF generation quality

**3. Test Responsive**
- DevTools → Device Toolbar
- Test mobile layout
- Test tablet layout
- Test desktop layout

## Key Technical Decisions

### ES6 Modules
- All JS files use ES6 `import`/`export`
- No build tools required
- Browser-native module support
- Clean dependency graph

### Single Responsibility
- Each file has one clear purpose
- Functions are focused and testable
- Easy to locate specific functionality

### LocalStorage-First
- No backend required
- All state persisted in browser
- Easy to test and debug
- Privacy-friendly (no server)

### CDN Libraries
- **Tailwind CSS** - Utility classes (cdn.tailwindcss.com)
- **Marked.js** - Markdown parsing (cdnjs.cloudflare.com)
- **html2pdf.js** - PDF generation (cdnjs.cloudflare.com)

### No Build Tools
- Pure client-side
- No Webpack, Vite, Rollup
- No npm/yarn required
- Easy deployment

## Common Tasks

### Add New Translation Key

1. Edit `locales/en.json`:
```json
{
    "newKey": "English text"
}
```

2. Edit `locales/fr.json`:
```json
{
    "newKey": "French text"
}
```

3. Use in JS:
```javascript
import { t } from './i18n.js';
console.log(t('newKey'));
```

4. Update UI in `js/i18n.js`:
```javascript
export function updateLanguageUI() {
    const t = i18nData;
    document.getElementById('some-element').textContent = t('newKey');
    // ...
}
```

### Modify CV Styling

Edit `css/template.css` - `.cv-template` and related classes.

### Change Button Styles

Edit `css/main.css` - `.btn-action`, `.btn-primary`, `.btn-danger`.

### Add New Button to Preview Panel

1. Add HTML to `index.html` in preview panel actions
2. Add CSS class to `css/main.css` if needed
3. Add event listener in `js/app.js` → `setupEventListeners()`
4. Add translations to `locales/*.json`
5. Add translation update to `js/i18n.js` → `updateLanguageUI()`

### Modify Batch Operations

Edit `js/selection.js`:
- `batchDownloadMD()` - MD downloads
- `batchDownloadPDF()` - PDF downloads
- `batchDelete()` - Delete operation

### Change PDF Generation Settings

Edit `js/pdf.js`:
- `downloadPDF()` - Single CV
- `generatePDFForCV()` - Batch operations

## Deployment

**Vercel automatically deploys** - push to git and done!

No build process:
1. Make changes
2. Test locally: `python3 -m http.server 8081`
3. Commit: `git add . && git commit -m "message"`
4. Push: `git push`
5. Vercel auto-deploys in 30-60 seconds

## Troubleshooting

**Module import errors in browser:**
- Check file paths in `<script type="module">`
- Ensure files exist at correct paths
- Check browser console for CORS errors

**Translations not updating:**
- Clear localStorage for `cv-lang`
- Check `locales/en.json` and `locales/fr.json` syntax
- Ensure `updateLanguageUI()` is called after language change

**CVs not persisting:**
- Check `js/storage.js` functions
- Verify localStorage is enabled in browser
- Check for quota exceeded errors

**PDF generation failing:**
- Check `js/pdf.js` configuration
- Verify html2pdf.js CDN is loaded
- Test with `cv/test.html`
- May need to reduce content if too large

## Benefits of This Structure

### For AI Agents
- **Single files** = smaller context windows
- **Clear naming** = easy to locate code
- **Module boundaries** = isolated changes
- **No build tools** = simple workflow
- **ES6 modules** = modern, standard patterns

### For Developers
- **Easy to understand** - one file, one concern
- **Easy to test** - focused modules
- **Easy to extend** - add new files for new features
- **Easy to debug** - clear call stack

### For Users
- **Fast loading** - cached CDN libraries
- **No setup** - just open HTML file
- **Privacy** - no backend, all local
- **Works offline** - after initial load

## Migration from Original

If you need to revert to original monolithic file:
```bash
cd /Users/ryad/projects/ryad.app/cv
cp index.html.backup index.html
```

But the modular structure is **recommended** for all future work!
