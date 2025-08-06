/**
 * 💾 AUTOSAVE SYSTEM
 * Robust autosave for nested tab structure with conflict resolution
 * Handles multiple tabs, node graphs, and user preferences
 */

class AutoSave {
    constructor() {
        this.saveInterval = 30000; // 30 seconds default
        this.maxBackups = 10; // Keep 10 backup versions
        this.debounceTime = 2000; // 2 seconds debounce
        this.compressionEnabled = true;
        
        this.saveTimer = null;
        this.debounceTimer = null;
        this.nodeSystem = null;
        this.isEnabled = true;
        this.lastSaveHash = null;
        
        // Track changes
        this.changeLog = [];
        this.lastChangeTime = 0;
        
        // TAB SYSTEM INTEGRATION
        this.tabData = new Map(); // Store save data per tab
        this.tabHashes = new Map(); // Store last save hash per tab
        this.currentTabId = null;
        
        console.log('💾 AutoSave System initialized');
    }

    // INITIALIZE with node system and settings
    initialize(nodeSystem, settings = {}) {
        this.nodeSystem = nodeSystem;
        
        // Apply user settings
        this.saveInterval = settings.saveInterval || 30000;
        this.maxBackups = settings.maxBackups || 10;
        this.debounceTime = settings.debounceTime || 2000;
        this.isEnabled = settings.enabled !== false;
        this.compressionEnabled = settings.compression !== false;
        
        // Load user preferences
        this.loadPreferences();
        
        // Setup change listeners
        this.setupChangeListeners();
        
        // Start autosave timer
        if (this.isEnabled) {
            this.startAutoSave();
        }
        
        // Load last session if available
        this.attemptSessionRestore();
        
        console.log(`💾 AutoSave initialized - Interval: ${this.saveInterval}ms, Backups: ${this.maxBackups}`);
    }

    // SETUP CHANGE LISTENERS
    setupChangeListeners() {
        if (!this.nodeSystem) return;
        
        // Listen for node changes
        const originalAddNode = this.nodeSystem.addNode?.bind(this.nodeSystem);
        if (originalAddNode) {
            this.nodeSystem.addNode = (...args) => {
                const result = originalAddNode(...args);
                this.recordChange('node_added', args[0]);
                return result;
            };
        }
        
        // Listen for node additions via selectNodeFromMenu (context menu)
        const originalSelectNodeFromMenu = this.nodeSystem.selectNodeFromMenu?.bind(this.nodeSystem);
        if (originalSelectNodeFromMenu) {
            this.nodeSystem.selectNodeFromMenu = (nodeDefinition) => {
                this.recordChange('node_added', nodeDefinition);
                return originalSelectNodeFromMenu(nodeDefinition);
            };
        }
        
        // Listen for node deletions
        const originalDeleteNode = this.nodeSystem.deleteSelectedNodes?.bind(this.nodeSystem);
        if (originalDeleteNode) {
            this.nodeSystem.deleteSelectedNodes = (...args) => {
                this.recordChange('nodes_deleted', Array.from(this.nodeSystem.selectedNodes));
                return originalDeleteNode(...args);
            };
        }
        
        // Listen for connections
        const originalCreateConnection = this.nodeSystem.createConnection?.bind(this.nodeSystem);
        if (originalCreateConnection) {
            this.nodeSystem.createConnection = (...args) => {
                const result = originalCreateConnection(...args);
                this.recordChange('connection_created', result);
                return result;
            };
        }
        
        // Listen for connection removal
        const originalRemoveConnection = this.nodeSystem.removeConnection?.bind(this.nodeSystem);
        if (originalRemoveConnection) {
            this.nodeSystem.removeConnection = (connection) => {
                this.recordChange('connection_removed', connection);
                return originalRemoveConnection(connection);
            };
        }
        
        // Listen for parameter changes (via parameter editor)
        if (this.nodeSystem.parameterEditor) {
            const originalTriggerPreviewUpdate = this.nodeSystem.parameterEditor.triggerPreviewUpdate;
            this.nodeSystem.parameterEditor.triggerPreviewUpdate = (node) => {
                this.recordChange('parameter_changed', {
                    nodeId: node.id,
                    params: node.definition.params
                });
                if (originalTriggerPreviewUpdate) {
                    originalTriggerPreviewUpdate.call(this.nodeSystem.parameterEditor, node);
                }
            };
        }
        
        // Listen for tab changes
        if (this.nodeSystem.tabSystem) {
            this.nodeSystem.tabSystem.onTabChange = (oldTab, newTab) => {
                if (oldTab) {
                    this.saveTab(oldTab);
                }
                this.recordChange('tab_changed', { from: oldTab?.id, to: newTab?.id });
            };
        }
        
        console.log('🔗 Change listeners attached');
    }

    // RECORD CHANGE for autosave
    recordChange(type, data) {
        const change = {
            type,
            data,
            timestamp: Date.now(),
            tabId: this.getCurrentTabId()
        };
        
        this.changeLog.push(change);
        this.lastChangeTime = Date.now();
        
        // Trim change log
        if (this.changeLog.length > 100) {
            this.changeLog = this.changeLog.slice(-50);
        }
        
        // Trigger debounced save
        this.debouncedSave();
        
        console.log(`📝 Change recorded: ${type}`);
    }

    // DEBOUNCED SAVE
    debouncedSave() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            this.performSave();
        }, this.debounceTime);
    }

    // GET CURRENT TAB ID
    getCurrentTabId() {
        return this.nodeSystem?.tabSystem?.currentTab?.id || 'main';
    }

    // PERFORM SAVE operation
    async performSave() {
        if (!this.isEnabled || !this.nodeSystem) {
            return false;
        }
        
        try {
            this.updateSaveIndicator('saving');
            
            const saveData = this.generateSaveData();
            const saveHash = this.generateHash(saveData);
            
            // Skip if no changes
            if (saveHash === this.lastSaveHash) {
                console.log('💾 No changes detected, skipping save');
                return false;
            }
            
            const success = await this.saveToDisk(saveData);
            
            if (success) {
                this.lastSaveHash = saveHash;
                this.createBackup(saveData);
                this.updateSaveIndicator('saved');
                console.log('💾 AutoSave completed successfully');
                return true;
            }
            
        } catch (error) {
            console.error('❌ AutoSave failed:', error);
            this.updateSaveIndicator('error');
            return false;
        }
    }

    // GENERATE SAVE DATA
    generateSaveData() {
        const currentTab = this.getCurrentTabId();
        
        const saveData = {
            version: '1.0',
            timestamp: Date.now(),
            currentTab,
            tabs: {},
            preferences: this.getPreferences(),
            changeLog: this.changeLog.slice(-20) // Last 20 changes
        };
        
        // Save current tab data
        if (this.nodeSystem.nodes) {
            saveData.tabs[currentTab] = {
                nodes: this.serializeNodes(),
                connections: this.serializeConnections(),
                viewport: this.serializeViewport(),
                ui: this.serializeUIState()
            };
        }
        
        // Save other tabs if tab system exists
        if (this.nodeSystem.tabSystem) {
            this.nodeSystem.tabSystem.tabs.forEach(tab => {
                if (tab.id !== currentTab && tab.data) {
                    saveData.tabs[tab.id] = {
                        nodes: tab.data.nodes || [],
                        connections: tab.data.connections || [],
                        viewport: tab.data.viewport || {},
                        ui: tab.data.ui || {}
                    };
                }
            });
        }
        
        return saveData;
    }

    // SERIALIZE NODES
    serializeNodes() {
        if (!this.nodeSystem.nodes) return [];
        
        return this.nodeSystem.nodes.filter(node => node && node.id).map(node => ({
            id: node.id,
            definition: node.definition ? {
                ...node.definition,
                // Ensure parameters are current
                params: node.definition.params?.map(param => ({
                    ...param,
                    value: param.value // Current value
                }))
            } : null,
            position: {
                x: node.container?.x || 0,
                y: node.container?.y || 0
            },
            selected: this.nodeSystem.selectedNodes?.has(node) || false
        }));
    }

    // SERIALIZE CONNECTIONS
    serializeConnections() {
        if (!this.nodeSystem.connections) return [];
        
        console.log(`💾 Serializing ${this.nodeSystem.connections.length} connections`);
        
        const serializedConnections = this.nodeSystem.connections.map(conn => {
            const serialized = {
                id: conn.id,
                fromNodeId: conn.fromNode?.id,
                fromPort: conn.fromDef?.label,
                toNodeId: conn.toNode?.id,
                toPort: conn.toDef?.label,
                selected: this.nodeSystem.selectedConnections?.has(conn) || false
            };
            
            console.log(`💾 Connection: ${conn.fromNode?.definition?.title || 'Unknown'}[${conn.fromDef?.label}] → ${conn.toNode?.definition?.title || 'Unknown'}[${conn.toDef?.label}]`);
            return serialized;
        });
        
        return serializedConnections;
    }

    // SERIALIZE VIEWPORT
    serializeViewport() {
        return {
            zoom: this.nodeSystem.zoom || 1.0,
            pan: {
                x: this.nodeSystem.pan?.x || 0,
                y: this.nodeSystem.pan?.y || 0
            }
        };
    }

    // SERIALIZE UI STATE
    serializeUIState() {
        return {
            previewWindow: {
                visible: document.getElementById('preview-container')?.style.display !== 'none',
                position: this.getElementPosition('preview-container'),
                size: this.getElementSize('preview-container')
            },
            panels: {
                // Add other UI panel states here
            }
        };
    }

    // SAVE TO DISK
    async saveToDisk(saveData) {
        const key = `plexus_autosave_${Date.now()}`;
        const compressedData = this.compressionEnabled ? 
            this.compressData(saveData) : this.safeStringify(saveData);
        
        try {
            localStorage.setItem(key, compressedData);
            localStorage.setItem('plexus_latest_save', key);
            
            // Store save metadata
            const metadata = {
                key,
                timestamp: saveData.timestamp,
                currentTab: saveData.currentTab,
                nodeCount: Object.values(saveData.tabs).reduce((total, tab) => 
                    total + (tab.nodes?.length || 0), 0),
                compressed: this.compressionEnabled
            };
            
            this.updateSaveHistory(metadata);
            return true;
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldSaves();
                // Retry once
                try {
                    localStorage.setItem(key, compressedData);
                    localStorage.setItem('plexus_latest_save', key);
                    return true;
                } catch (retryError) {
                    console.error('💾 Storage quota exceeded even after cleanup');
                    return false;
                }
            }
            throw error;
        }
    }

    // UPDATE SAVE HISTORY
    updateSaveHistory(metadata) {
        try {
            const historyKey = 'plexus_save_history';
            let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            
            // Add new save to history
            history.unshift(metadata);
            
            // Keep only last 50 saves in history
            if (history.length > 50) {
                history = history.slice(0, 50);
            }
            
            localStorage.setItem(historyKey, JSON.stringify(history));
            console.log('📝 Save history updated');
        } catch (error) {
            console.warn('⚠️ Failed to update save history:', error);
        }
    }

    // CREATE BACKUP
    createBackup(saveData) {
        const backups = this.getBackupList();
        
        // Create new backup
        const backupKey = `plexus_backup_${Date.now()}`;
        const compressedData = this.compressData(saveData);
        
        try {
            localStorage.setItem(backupKey, compressedData);
            backups.push({
                key: backupKey,
                timestamp: saveData.timestamp,
                nodeCount: Object.values(saveData.tabs).reduce((total, tab) => 
                    total + (tab.nodes?.length || 0), 0)
            });
            
            // Trim old backups
            while (backups.length > this.maxBackups) {
                const oldBackup = backups.shift();
                localStorage.removeItem(oldBackup.key);
            }
            
            localStorage.setItem('plexus_backups', JSON.stringify(backups));
            
        } catch (error) {
            console.warn('⚠️ Failed to create backup:', error);
        }
    }

    // RESTORE FROM SAVE
    async restoreFromSave(saveKey) {
        try {
            const savedData = localStorage.getItem(saveKey);
            if (!savedData) {
                throw new Error('Save data not found');
            }
            
            const saveData = this.compressionEnabled ? 
                this.decompressData(savedData) : JSON.parse(savedData);
            
            return await this.applySaveData(saveData);
            
        } catch (error) {
            console.error('❌ Failed to restore save:', error);
            return false;
        }
    }

    // APPLY SAVE DATA
    async applySaveData(saveData) {
        if (!this.nodeSystem || !saveData.tabs) {
            return false;
        }
        
        const currentTab = saveData.currentTab || 'main';
        const tabData = saveData.tabs[currentTab];
        
        if (!tabData) {
            console.warn('⚠️ No data for current tab');
            return false;
        }
        
        // Clear current state
        this.nodeSystem.nodes = [];
        this.nodeSystem.connections = [];
        this.nodeSystem.selectedNodes.clear();
        this.nodeSystem.selectedConnections.clear();
        
        // Restore nodes
        for (const nodeData of tabData.nodes || []) {
            await this.restoreNode(nodeData);
        }
        
        // Restore connections
        console.log(`💾 Restoring ${tabData.connections?.length || 0} connections`);
        for (const connData of tabData.connections || []) {
            console.log(`💾 Restoring connection:`, connData);
            this.restoreConnection(connData);
        }
        
        // Restore viewport
        if (tabData.viewport) {
            this.nodeSystem.zoom = tabData.viewport.zoom || 1.0;
            this.nodeSystem.pan = tabData.viewport.pan || { x: 0, y: 0 };
            this.nodeSystem.updateViewport?.();
        }
        
        // Restore UI state
        if (tabData.ui) {
            this.restoreUIState(tabData.ui);
        }
        
        console.log(`✅ Restored save data - ${tabData.nodes?.length || 0} nodes, ${tabData.connections?.length || 0} connections`);
        return true;
    }

    // RESTORE NODE from save data
    async restoreNode(nodeData) {
        try {
            // Find the node definition by title
            const nodeDefinition = await this.findNodeDefinitionByTitle(nodeData.definition.title);
            if (!nodeDefinition) {
                console.warn(`⚠️ Node definition not found: ${nodeData.definition.title}`);
                return null;
            }

            // Create the node
            const restoredNode = this.nodeSystem.addNode(
                nodeDefinition, 
                nodeData.position.x, 
                nodeData.position.y
            );

            // Restore parameters if they exist
            if (nodeData.definition.params && restoredNode.definition.params) {
                nodeData.definition.params.forEach((savedParam, index) => {
                    if (restoredNode.definition.params[index]) {
                        restoredNode.definition.params[index].value = savedParam.value;
                    }
                });
            }

            // Restore ID for connection matching
            restoredNode.id = nodeData.id;

            return restoredNode;
        } catch (error) {
            console.error('❌ Failed to restore node:', error);
            return null;
        }
    }

    // RESTORE CONNECTION from save data
    restoreConnection(connData) {
        const fromNode = this.nodeSystem.nodes.find(n => n.id === connData.fromNodeId);
        const toNode = this.nodeSystem.nodes.find(n => n.id === connData.toNodeId);

        if (!fromNode || !toNode) {
            console.warn('⚠️ Cannot restore connection - nodes not found', {
                fromNodeId: connData.fromNodeId,
                toNodeId: connData.toNodeId,
                availableNodes: this.nodeSystem.nodes.map(n => n.id)
            });
            return null;
        }

        // Find the ports using correct structure: ports.outputs and ports.inputs
        const fromPort = fromNode.ports?.outputs?.find(p => p.def?.label === connData.fromPort);
        const toPort = toNode.ports?.inputs?.find(p => p.def?.label === connData.toPort);

        if (!fromPort || !toPort) {
            console.warn('⚠️ Cannot restore connection - ports not found', {
                fromPort: connData.fromPort,
                toPort: connData.toPort,
                fromNodePorts: fromNode.ports?.outputs?.map(p => p.def?.label),
                toNodePorts: toNode.ports?.inputs?.map(p => p.def?.label)
            });
            return null;
        }

        // Create the connection using the correct port structure
        const connection = this.nodeSystem.createConnection(
            fromPort.graphics, fromPort.def, fromNode,
            toPort.graphics, toPort.def, toNode
        );

        console.log(`✅ Restored connection: ${fromNode.definition?.title || 'Unknown'}[${connData.fromPort}] → ${toNode.definition?.title || 'Unknown'}[${connData.toPort}]`);
        return connection;
    }

    // FIND NODE DEFINITION by title
    async findNodeDefinitionByTitle(title) {
        // Check if nodeSystem has nodeDefinitions loaded
        if (this.nodeSystem.nodeDefinitions) {
            return Object.values(this.nodeSystem.nodeDefinitions).find(def => def.title === title);
        }

        // If not, try to find it in the global definitions
        if (window.nodeDefinitions) {
            return Object.values(window.nodeDefinitions).find(def => def.title === title);
        }

        console.warn(`⚠️ Cannot find node definition for: ${title}`);
        return null;
    }

    // RESTORE UI STATE
    restoreUIState(uiState) {
        try {
            if (uiState.previewWindow) {
                const previewContainer = document.getElementById('preview-container');
                if (previewContainer && uiState.previewWindow.visible) {
                    previewContainer.style.display = 'block';
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to restore UI state:', error);
        }
    }

    // UTILITY METHODS
    getElementPosition(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        return {
            left: el.offsetLeft,
            top: el.offsetTop
        };
    }

    getElementSize(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        return {
            width: el.offsetWidth,
            height: el.offsetHeight
        };
    }

    generateHash(data) {
        // Safe JSON stringify that handles circular references
        const str = this.safeStringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // SAFE STRINGIFY - avoids circular reference errors
    safeStringify(obj, space = 0) {
        const seen = new WeakSet();
        
        return JSON.stringify(obj, (key, val) => {
            // Skip circular references
            if (val != null && typeof val === 'object') {
                if (seen.has(val)) {
                    return '[Circular]';
                }
                seen.add(val);
            }
            
            // Skip problematic properties that cause circular refs
            if (key === 'container' || key === 'graphics' || key === 'hitGraphics' || 
                key === '_events' || key === 'parent' || key === 'children' ||
                key === 'stage' || key === 'renderer' || key === 'context') {
                return '[Skipped]';
            }
            
            return val;
        }, space);
    }

    compressData(data) {
        // Simple compression - could be enhanced with actual compression library
        return this.safeStringify(data);
    }

    decompressData(compressedData) {
        return JSON.parse(compressedData);
    }

    updateSaveIndicator(status) {
        const indicator = document.getElementById('save-indicator');
        if (!indicator) return;
        
        // Show indicator
        indicator.style.display = 'block';
        
        // Update appearance based on status
        const statusConfig = {
            'saving': {
                text: '💾 Saving...',
                color: '#ffa500',
                border: '#ffa500'
            },
            'saved': {
                text: '✅ Auto-Saved',
                color: '#00ff88',
                border: '#00ff88'
            },
            'error': {
                text: '❌ Save Error',
                color: '#ff4444',
                border: '#ff4444'
            }
        };
        
        const config = statusConfig[status];
        if (config) {
            indicator.textContent = config.text;
            indicator.style.color = config.color;
            indicator.style.borderColor = config.border;
            indicator.style.boxShadow = `0 2px 10px ${config.color}40`;
        }
        
        // Auto-hide after successful save
        if (status === 'saved') {
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 3000);
        } else if (status === 'error') {
            // Keep error visible longer
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 8000);
        }
    }

    // START/STOP AUTOSAVE
    startAutoSave() {
        this.stopAutoSave();
        this.saveTimer = setInterval(() => {
            this.performSave();
        }, this.saveInterval);
        console.log('⏰ AutoSave timer started');
    }

    stopAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        console.log('⏹️ AutoSave timer stopped');
    }

    // PREFERENCE MANAGEMENT
    loadPreferences() {
        try {
            const prefs = localStorage.getItem('plexus_autosave_prefs');
            if (prefs) {
                const parsed = JSON.parse(prefs);
                this.saveInterval = parsed.saveInterval || this.saveInterval;
                this.maxBackups = parsed.maxBackups || this.maxBackups;
                this.isEnabled = parsed.enabled !== false;
                this.compressionEnabled = parsed.compression !== false;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load autosave preferences');
        }
    }

    getPreferences() {
        return {
            saveInterval: this.saveInterval,
            maxBackups: this.maxBackups,
            enabled: this.isEnabled,
            compression: this.compressionEnabled
        };
    }

    // CLEANUP AND MANAGEMENT
    cleanupOldSaves() {
        const keys = Object.keys(localStorage);
        const autoSaveKeys = keys.filter(key => key.startsWith('plexus_autosave_'));
        
        // Sort by timestamp (embedded in key)
        autoSaveKeys.sort();
        
        // Remove oldest saves, keep last 5
        while (autoSaveKeys.length > 5) {
            const oldKey = autoSaveKeys.shift();
            localStorage.removeItem(oldKey);
        }
        
        console.log(`🧹 Cleaned up ${autoSaveKeys.length} old saves`);
    }

    getBackupList() {
        try {
            const backups = localStorage.getItem('plexus_backups');
            return backups ? JSON.parse(backups) : [];
        } catch {
            return [];
        }
    }

    // SESSION RESTORE
    attemptSessionRestore() {
        const latestSave = localStorage.getItem('plexus_latest_save');
        if (latestSave && this.nodeSystem) {
            console.log('💾 Previous session found, attempting restore...');
            this.restoreFromSave(latestSave);
        }
    }

    // TAB SYSTEM METHODS

    // SET current active tab
    setCurrentTab(tabId) {
        this.currentTabId = tabId;
        console.log(`🎯 AutoSave now tracking tab: ${tabId}`);
    }

    // SAVE data for specific tab
    saveTabData(tabId) {
        if (!this.nodeSystem || !tabId) return;

        const saveData = this.generateSaveData();
        if (!saveData) return;

        this.tabData.set(tabId, saveData);
        this.tabHashes.set(tabId, this.generateHash(saveData));
        
        // Also save to localStorage with tab-specific key
        try {
            const compressed = this.compressData(saveData);
            localStorage.setItem(`plexus_autosave_tab_${tabId}`, compressed);
            console.log(`💾 Saved tab data: ${tabId}`);
        } catch (error) {
            console.error('❌ Failed to save tab data to localStorage:', error);
        }
    }

    // LOAD data for specific tab
    loadTabData(tabId) {
        try {
            const compressed = localStorage.getItem(`plexus_autosave_tab_${tabId}`);
            if (!compressed) return null;

            const saveData = this.decompressData(compressed);
            this.tabData.set(tabId, saveData);
            this.tabHashes.set(tabId, this.generateHash(saveData));
            
            console.log(`📂 Loaded tab data: ${tabId}`);
            return saveData;
        } catch (error) {
            console.error('❌ Failed to load tab data:', error);
            return null;
        }
    }

    // MARK tab as modified
    markTabModified(tabId) {
        this.recordChange('tab_modified', { tabId, timestamp: Date.now() });
        
        // Trigger debounced save for this tab
        this.clearDebounce();
        this.debounceTimer = setTimeout(() => {
            this.saveTabData(tabId);
        }, this.debounceTime);
    }

    // CLEANUP data for closed tab
    cleanupTabData(tabId) {
        this.tabData.delete(tabId);
        this.tabHashes.delete(tabId);
        
        try {
            localStorage.removeItem(`plexus_autosave_tab_${tabId}`);
            console.log(`🗑️ Cleaned up tab data: ${tabId}`);
        } catch (error) {
            console.error('❌ Failed to cleanup tab data:', error);
        }
    }

    // DESTROY
    destroy() {
        this.stopAutoSave();
        this.nodeSystem = null;
        this.changeLog = [];
        
        // Clear tab data
        this.tabData.clear();
        this.tabHashes.clear();
        
        console.log('🗑️ AutoSave System destroyed');
    }

    // MANUAL TEST CONNECTIONS (for debugging)
    testConnectionSaving() {
        console.log('🧪 Testing connection saving...');
        console.log('📊 Current connections:', this.nodeSystem.connections?.length || 0);
        if (this.nodeSystem.connections?.length > 0) {
            console.log('📊 Connection details:', this.nodeSystem.connections);
            const serialized = this.serializeConnections();
            console.log('📊 Serialized connections:', serialized);
        }
    }
}

// Export for use in main system
window.AutoSave = AutoSave;

console.log('💾 AutoSave System loaded');
