// Command classes for undo/redo functionality

import { t } from './i18n.js';
import { saveCVs } from './storage.js';

// Base Command interface (for reference)
// interface Command {
//     execute(): void
//     undo(): void
//     getDescription(): string
//     canUndo: boolean
// }

export class DeleteCommand {
    constructor(cvId, cvs, currentCVId) {
        this.cvId = cvId;
        this.deletedCV = JSON.parse(JSON.stringify(cvs[cvId])); // Deep copy
        this.cvs = cvs;
        this.currentCVId = currentCVId;
        this.canUndo = true;
    }

    execute() {
        const deletedLastModified = this.cvs[this.cvId].lastModified;
        delete this.cvs[this.cvId];

        const remaining = Object.keys(this.cvs);
        if (remaining.length === 0) {
            this.newCurrentCVId = null;
        } else if (this.cvId === this.currentCVId) {
            // Sort by lastModified descending (sidebar display order)
            remaining.sort((a, b) => this.cvs[b].lastModified - this.cvs[a].lastModified);
            // Pick next CV below the deleted one, or the previous one if last
            const nextIndex = remaining.findIndex(id => this.cvs[id].lastModified <= deletedLastModified);
            this.newCurrentCVId = remaining[nextIndex !== -1 ? nextIndex : remaining.length - 1];
        } else {
            this.newCurrentCVId = null;
        }
    }

    undo() {
        // Restore the CV
        this.cvs[this.cvId] = this.deletedCV;

        // Restore currentCVId if it was changed
        if (this.newCurrentCVId) {
            saveCVs(this.cvs, this.cvId);
        }
    }

    getDescription() {
        return t('cvDeleted');
    }
}

export class BatchDeleteCommand {
    constructor(ids, cvs, currentCVId) {
        this.deletedCVs = ids.map(id => ({
            id,
            cv: JSON.parse(JSON.stringify(cvs[id]))
        }));
        this.cvs = cvs;
        this.currentCVId = currentCVId;
        this.canUndo = true;
    }

    execute() {
        this.deletedCVs.forEach(({ id }) => {
            delete this.cvs[id];
        });

        // Update currentCVId if needed
        if (this.deletedCVs.some(({ id }) => id === this.currentCVId)) {
            const remaining = Object.keys(this.cvs);
            if (remaining.length > 0) {
                // Sort by lastModified descending (sidebar display order), pick first
                remaining.sort((a, b) => this.cvs[b].lastModified - this.cvs[a].lastModified);
                this.newCurrentCVId = remaining[0];
            } else {
                this.newCurrentCVId = null;
            }
        } else {
            this.newCurrentCVId = null;
        }
    }

    undo() {
        // Restore all CVs
        this.deletedCVs.forEach(({ id, cv }) => {
            this.cvs[id] = cv;
        });

        // Restore currentCVId if it was changed
        if (this.newCurrentCVId) {
            saveCVs(this.cvs, this.currentCVId);
        }
    }

    getDescription() {
        return t('cvsDeleted', { count: this.deletedCVs.length });
    }
}

export class RenameCommand {
    constructor(cvId, oldName, newName, cvs) {
        this.cvId = cvId;
        this.oldName = oldName;
        this.newName = newName;
        this.cvs = cvs;
        this.canUndo = true;
    }

    execute() {
        if (this.cvs[this.cvId]) {
            this.cvs[this.cvId].name = this.newName;
            this.cvs[this.cvId].lastModified = Date.now();
        }
    }

    undo() {
        if (this.cvs[this.cvId]) {
            this.cvs[this.cvId].name = this.oldName;
            this.cvs[this.cvId].lastModified = Date.now();
        }
    }

    getDescription() {
        return t('cvRenamed', { name: this.newName });
    }
}

export class EditCommand {
    constructor(cvId, oldContent, newContent, cvs) {
        this.cvId = cvId;
        this.oldContent = oldContent;
        this.newContent = newContent;
        this.cvs = cvs;
        this.canUndo = true;
    }

    execute() {
        if (this.cvs[this.cvId]) {
            this.cvs[this.cvId].content = this.newContent;
            this.cvs[this.cvId].lastModified = Date.now();
        }
    }

    undo() {
        if (this.cvs[this.cvId]) {
            this.cvs[this.cvId].content = this.oldContent;
            this.cvs[this.cvId].lastModified = Date.now();
        }
    }

    getDescription() {
        return t('cvEdited');
    }
}
