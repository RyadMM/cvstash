// Command classes for undo/redo functionality

import { t } from './i18n.js';

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
        delete this.cvs[this.cvId];

        // Update currentCVId if needed
        if (this.cvId === this.currentCVId && Object.keys(this.cvs).length > 0) {
            this.newCurrentCVId = Object.keys(this.cvs)[0];
        } else {
            this.newCurrentCVId = null;
        }
    }

    undo() {
        // Restore the CV
        this.cvs[this.cvId] = this.deletedCV;

        // Restore currentCVId if it was changed
        if (this.newCurrentCVId) {
            localStorage.setItem('currentCVId', this.cvId);
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
            if (Object.keys(this.cvs).length > 0) {
                this.newCurrentCVId = Object.keys(this.cvs)[0];
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
            localStorage.setItem('currentCVId', this.currentCVId);
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
