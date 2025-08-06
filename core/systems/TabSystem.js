/**
 * 📑 TAB SYSTEM
 * Manages multiple graph instances with tabs
 */

class TabSystem {
    constructor(eventSystem) {
        this.events = eventSystem;
        this.tabs = new Map();
        this.activeTabId = null;
        this.nextTabId = 1;
        this.unsavedChanges = new Set();
        
        console.log('🔧 TabSystem initialized');
    }

    // CREATE new tab
    createTab(name = null, graphData = null) {
        const tabId = `tab_${this.nextTabId++}`;
        const tabName = name || `Graph ${this.tabs.size + 1}`;
        
        const tab = {
            id: tabId,
            name: tabName,
            isEditing: false,
            hasUnsavedChanges: false,
            graphInstance: null, // Will hold the node system instance
            settings: {
                showGrid: true,
                theme: 'dark',
                snapToGrid: false,
                autoSave: true
            },
            created: Date.now(),
            lastModified: Date.now()
        };
        
        this.tabs.set(tabId, tab);
        
        // Initialize graph data if provided
        if (graphData) {
            tab.graphInstance = graphData;
        }
        
        console.log(`📑 Created tab: ${tabName} (${tabId})`);
        this.events.emit('tab:created', tab);
        
        return tab;
    }

    // ACTIVATE tab
    setActiveTab(tabId) {
        if (!this.tabs.has(tabId)) {
            console.warn(`❌ Tab not found: ${tabId}`);
            return false;
        }
        
        const previousTab = this.activeTabId;
        this.activeTabId = tabId;
        
        console.log(`🎯 Activated tab: ${tabId}`);
        this.events.emit('tab:activated', { 
            current: this.tabs.get(tabId), 
            previous: previousTab ? this.tabs.get(previousTab) : null 
        });
        
        return true;
    }

    // RENAME tab
    renameTab(tabId, newName) {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;
        
        const oldName = tab.name;
        tab.name = newName.trim() || `Graph ${Array.from(this.tabs.keys()).indexOf(tabId) + 1}`;
        tab.lastModified = Date.now();
        
        console.log(`✏️ Renamed tab: ${oldName} → ${tab.name}`);
        this.events.emit('tab:renamed', { tab, oldName, newName: tab.name });
        
        return true;
    }

    // CLOSE tab with save warning
    closeTab(tabId, force = false) {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;
        
        // CHECK for unsaved changes
        if (!force && this.hasUnsavedChanges(tabId)) {
            const shouldClose = this.showCloseWarning(tab);
            if (!shouldClose) return false;
        }
        
        // Close the tab
        this.tabs.delete(tabId);
        
        // Handle active tab switching
        if (this.activeTabId === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            this.activeTabId = remainingTabs.length > 0 ? remainingTabs[0] : null;
        }
        
        // Clean up unsaved changes tracking
        this.unsavedChanges.delete(tabId);
        
        console.log(`🗑️ Closed tab: ${tab.name}`);
        this.events.emit('tab:closed', { tab, force });
        
        // Create default tab if none remain
        if (this.tabs.size === 0) {
            const defaultTab = this.createTab('Main Graph');
            this.setActiveTab(defaultTab.id);
        }
        
        return true;
    }

    // UNSAVED CHANGES tracking
    markUnsaved(tabId) {
        const tab = this.tabs.get(tabId);
        if (tab) {
            tab.hasUnsavedChanges = true;
            tab.lastModified = Date.now();
            this.unsavedChanges.add(tabId);
            this.events.emit('tab:modified', tab);
        }
    }

    markSaved(tabId) {
        const tab = this.tabs.get(tabId);
        if (tab) {
            tab.hasUnsavedChanges = false;
            this.unsavedChanges.delete(tabId);
            this.events.emit('tab:saved', tab);
        }
    }

    hasUnsavedChanges(tabId) {
        return this.unsavedChanges.has(tabId);
    }

    // SETTINGS management
    updateTabSettings(tabId, settings) {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;
        
        Object.assign(tab.settings, settings);
        tab.lastModified = Date.now();
        
        console.log(`⚙️ Updated settings for: ${tab.name}`);
        this.events.emit('tab:settings:changed', { tab, settings });
        
        return true;
    }

    getTabSettings(tabId) {
        const tab = this.tabs.get(tabId);
        return tab ? { ...tab.settings } : null;
    }

    // CLOSE WARNING dialog
    showCloseWarning(tab) {
        return confirm(
            `⚠️ UNSAVED CHANGES\n\n` +
            `Tab "${tab.name}" has UNSAVED changes.\n\n` +
            `Close anyway? Your changes will be LOST.`
        );
    }

    // GETTERS
    getActiveTab() {
        return this.activeTabId ? this.tabs.get(this.activeTabId) : null;
    }

    getAllTabs() {
        return Array.from(this.tabs.values());
    }

    getTab(tabId) {
        return this.tabs.get(tabId);
    }

    getTabCount() {
        return this.tabs.size;
    }

    // EXPORT/IMPORT tab data
    exportTabData(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return null;
        
        return {
            name: tab.name,
            settings: tab.settings,
            graphData: tab.graphInstance ? this.serializeGraphData(tab.graphInstance) : null,
            created: tab.created,
            lastModified: tab.lastModified
        };
    }

    importTabData(tabData) {
        const tab = this.createTab(tabData.name);
        if (tabData.settings) {
            Object.assign(tab.settings, tabData.settings);
        }
        if (tabData.graphData) {
            // Will be handled by the graph system
            tab.graphInstance = tabData.graphData;
        }
        return tab;
    }

    // SERIALIZE graph data (placeholder)
    serializeGraphData(graphInstance) {
        // This would serialize the node graph state
        return {
            nodes: [], // Array of node data
            connections: [], // Array of connection data
            viewport: { zoom: 1, pan: { x: 0, y: 0 } }
        };
    }

    // CLEANUP
    destroy() {
        this.tabs.clear();
        this.unsavedChanges.clear();
        this.activeTabId = null;
        console.log('🧹 TabSystem destroyed');
    }
}

export default TabSystem;