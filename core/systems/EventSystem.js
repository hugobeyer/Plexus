sn/**
 * 📡 EVENT SYSTEM
 * Clean event management
 */

class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.isProcessing = false;
        this.eventQueue = [];
    }

    // Core event methods
    on(event, callback, priority = 0) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event).push({ callback, priority });
        this.listeners.get(event).sort((a, b) => b.priority - a.priority);

        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const listeners = this.listeners.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        if (index !== -1) listeners.splice(index, 1);
    }

    emit(event, data) {
        if (this.isProcessing) {
            this.eventQueue.push({ event, data });
            return;
        }

        this.isProcessing = true;
        
        try {
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(({ callback }) => {
                    callback(data);
                });
            }

            // Process queued events
            while (this.eventQueue.length > 0) {
                const queued = this.eventQueue.shift();
                this.emit(queued.event, queued.data);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // Event definitions
    static get EVENTS() {
        return {
            NODE: {
                CREATED: 'node:created',
                DELETED: 'node:deleted',
                PROCESSED: 'node:processed',
                ERROR: 'node:error'
            },
            CONNECTION: {
                CREATED: 'connection:created',
                DELETED: 'connection:deleted',
                TRANSFER: 'connection:transfer'
            },
            SYSTEM: {
                READY: 'system:ready',
                ERROR: 'system:error'
            }
        };
    }
}

export default EventSystem;