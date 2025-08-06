/**
 * 📚 HISTORY SYSTEM
 * Clean undo/redo and state management
 */

class HistorySystem {
    constructor(eventSystem) {
        this.events = eventSystem;
        
        // History stacks
        this.undoStack = [];
        this.redoStack = [];
        this.maxSize = 100;
        
        // Batching
        this.batchTimeout = null;
        this.currentBatch = null;
        this.batchDelay = 1000;
        
        // Auto-save
        this.autoSaveInterval = 30000;
        this.lastSave = Date.now();
        this.isSaving = false;
        
        this.setupEvents();
    }

    // Event setup
    setupEvents() {
        this.events.on('node:created', (data) => this.recordAction('create_node', data));
        this.events.on('node:deleted', (data) => this.recordAction('delete_node', data));
        this.events.on('connection:created', (data) => this.recordAction('create_connection', data));
        this.events.on('connection:deleted', (data) => this.recordAction('delete_connection', data));
    }

    // Action recording with batching
    recordAction(type, data) {
        const action = { type, data, timestamp: Date.now() };

        if (!this.currentBatch || !this.canBatch(action)) {
            this.commitBatch();
            this.startBatch(action);
        } else {
            this.currentBatch.actions.push(action);
        }

        this.redoStack = []; // Clear redo on new action
        this.scheduleAutoSave();
    }

    startBatch(action) {
        this.currentBatch = {
            type: action.type,
            actions: [action],
            timestamp: action.timestamp
        };

        this.batchTimeout = setTimeout(() => {
            this.commitBatch();
        }, this.batchDelay);
    }

    canBatch(action) {
        return this.currentBatch &&
               this.currentBatch.type === action.type &&
               (action.timestamp - this.currentBatch.timestamp) < this.batchDelay;
    }

    commitBatch() {
        if (!this.currentBatch) return;

        const batch = {
            type: this.currentBatch.type,
            actions: this.currentBatch.actions,
            undo: () => this.undoBatch(batch),
            redo: () => this.redoBatch(batch)
        };

        this.undoStack.push(batch);
        
        // Limit stack size
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }

        this.currentBatch = null;
        clearTimeout(this.batchTimeout);
    }

    // Undo/Redo
    undo() {
        this.commitBatch();
        
        const batch = this.undoStack.pop();
        if (batch) {
            batch.undo();
            this.redoStack.push(batch);
            this.events.emit('history:undo', batch);
        }
    }

    redo() {
        const batch = this.redoStack.pop();
        if (batch) {
            batch.redo();
            this.undoStack.push(batch);
            this.events.emit('history:redo', batch);
        }
    }

    undoBatch(batch) {
        // Undo actions in reverse order
        for (let i = batch.actions.length - 1; i >= 0; i--) {
            const action = batch.actions[i];
            this.undoAction(action);
        }
    }

    redoBatch(batch) {
        // Redo actions in order
        batch.actions.forEach(action => {
            this.redoAction(action);
        });
    }

    undoAction(action) {
        switch (action.type) {
            case 'create_node':
                this.events.emit('node:delete', action.data.id);
                break;
            case 'delete_node':
                this.events.emit('node:restore', action.data);
                break;
            case 'create_connection':
                this.events.emit('connection:delete', action.data.id);
                break;
            case 'delete_connection':
                this.events.emit('connection:restore', action.data);
                break;
        }
    }

    redoAction(action) {
        switch (action.type) {
            case 'create_node':
                this.events.emit('node:restore', action.data);
                break;
            case 'delete_node':
                this.events.emit('node:delete', action.data.id);
                break;
            case 'create_connection':
                this.events.emit('connection:restore', action.data);
                break;
            case 'delete_connection':
                this.events.emit('connection:delete', action.data.id);
                break;
        }
    }

    // State management
    getCurrentState() {
        const state = {};
        this.events.emit('state:gather', state);
        return {
            ...state,
            timestamp: Date.now()
        };
    }

    // Auto-save
    scheduleAutoSave() {
        if (Date.now() - this.lastSave > this.autoSaveInterval) {
            this.saveState();
        }
    }

    async saveState() {
        if (this.isSaving) return;
        
        this.isSaving = true;
        try {
            const state = this.getCurrentState();
            localStorage.setItem('plexus:autosave', JSON.stringify(state));
            this.lastSave = Date.now();
            this.events.emit('state:saved');
        } catch (error) {
            this.events.emit('system:error', error);
        } finally {
            this.isSaving = false;
        }
    }

    async loadState() {
        try {
            const saved = localStorage.getItem('plexus:autosave');
            if (saved) {
                const state = JSON.parse(saved);
                this.events.emit('state:load', state);
                return true;
            }
        } catch (error) {
            this.events.emit('system:error', error);
        }
        return false;
    }

    // Utilities
    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.commitBatch();
    }
}

export default HistorySystem;