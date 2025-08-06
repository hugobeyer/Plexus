/**
 * 🎨 TAB RENDERER
 * Visual tab interface with PIXI.js integration
 */

window.PixiTabRenderer = {
    
    // INITIALIZE tab UI
    initializeTabUI(nodeSystem, tabSystem) {
        console.log('🔧 Initializing Tab UI...');
        
        this.nodeSystem = nodeSystem;
        this.tabSystem = tabSystem;
        this.tabContainer = null;
        this.settingsPopup = null;
        
        this.createTabContainer();
        this.setupEventListeners();
        
        // Create initial tab if none exist
        if (tabSystem.getTabCount() === 0) {
            console.log('🔧 Creating initial Nested Graph tab...');
            const initialTab = tabSystem.createTab('Nested Graph');
            tabSystem.setActiveTab(initialTab.id);
        }
        
        this.renderTabs();
        
        console.log('✅ Tab UI initialized with', tabSystem.getTabCount(), 'tabs');
    },

    // CREATE tab container
    createTabContainer() {
        // Create HTML tab bar
        const tabBar = document.createElement('div');
        tabBar.className = 'tab-bar';
        tabBar.innerHTML = `
            <div class="tab-list" id="tab-list"></div>
            <div class="tab-controls">
                <button class="new-tab-btn" id="new-tab-btn" title="New Tab">+</button>
                <button class="reset-btn" id="reset-tab-btn" title="Reset Cache & Reload">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                    </svg>
                </button>
                <button class="about-btn" id="about-btn" title="About Plexus">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                </button>
            </div>
        `;
        
        // Insert at top of body
        document.body.insertBefore(tabBar, document.body.firstChild);
        
        // Apply styles
        this.injectTabStyles();
    },

    // INJECT tab styles - NOW USES UI STYLES
    injectTabStyles() {
        // Tab styles are now handled by pixi-ui-styles.js
        // This method kept for compatibility but styles come from UI system
        console.log('🎨 Tab styles loaded from UI system');
        
        // Remove any broken CSS remnants
        const brokenStyles = document.querySelectorAll('style[data-broken]');
        brokenStyles.forEach(style => style.remove());
    },

    // RENDER all tabs
    renderTabs() {
        const tabList = document.getElementById('tab-list');
        if (!tabList) return;
        
        tabList.innerHTML = '';
        
        this.tabSystem.getAllTabs().forEach(tab => {
            const tabElement = this.createTabElement(tab);
            tabList.appendChild(tabElement);
        });
    },

    // CREATE single tab element
    createTabElement(tab) {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${tab.id === this.tabSystem.activeTabId ? 'active' : ''} ${tab.hasUnsavedChanges ? 'unsaved' : ''}`;
        tabEl.dataset.tabId = tab.id;
        
        tabEl.innerHTML = `
            <div class="tab-name" data-original="${tab.name}">${tab.name}</div>
            <button class="tab-close" title="Close Tab">×</button>
        `;
        
        // TAB CLICK - activate
        tabEl.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.tabSystem.setActiveTab(tab.id);
                this.renderTabs();
            }
        });
        
        // TAB NAME - double click to edit
        const nameEl = tabEl.querySelector('.tab-name');
        nameEl.addEventListener('dblclick', () => {
            this.startEditingTabName(tab.id, nameEl);
        });
        
        // CLOSE button
        const closeBtn = tabEl.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.tabSystem.closeTab(tab.id);
            this.renderTabs();
        });
        
        return tabEl;
    },

    // EDIT tab name
    startEditingTabName(tabId, nameElement) {
        const tab = this.tabSystem.getTab(tabId);
        if (!tab) return;
        
        nameElement.contentEditable = true;
        nameElement.classList.add('editing');
        nameElement.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(nameElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        const finishEditing = () => {
            nameElement.contentEditable = false;
            nameElement.classList.remove('editing');
            
            const newName = nameElement.textContent.trim();
            if (newName && newName !== tab.name) {
                this.tabSystem.renameTab(tabId, newName);
                this.tabSystem.markUnsaved(tabId);
            } else {
                nameElement.textContent = tab.name; // Revert
            }
            this.renderTabs();
        };
        
        nameElement.addEventListener('blur', finishEditing, { once: true });
        nameElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nameElement.blur();
            } else if (e.key === 'Escape') {
                nameElement.textContent = nameElement.dataset.original;
                nameElement.blur();
            }
        }, { once: true });
    },

    // SETTINGS popup
    showSettingsPopup(tabId) {
        const tab = this.tabSystem.getTab(tabId);
        if (!tab) return;
        
        this.hideSettingsPopup(); // Close any existing popup
        
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        
        const popup = document.createElement('div');
        popup.className = 'settings-popup';
        popup.innerHTML = `
            <div class="settings-header">
                <div class="settings-title">⚙️ GRAPH SETTINGS - ${tab.name}</div>
                <button class="settings-close">×</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <label class="setting-label">Tab Name</label>
                    <input type="text" class="setting-input" id="setting-name" value="${tab.name}">
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">
                        <input type="checkbox" class="setting-checkbox" id="setting-grid" ${tab.settings.showGrid ? 'checked' : ''}>
                        Show Grid
                    </label>
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">Theme</label>
                    <select class="setting-input" id="setting-theme">
                        <option value="dark" ${tab.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="darker" ${tab.settings.theme === 'darker' ? 'selected' : ''}>Darker</option>
                        <option value="matrix" ${tab.settings.theme === 'matrix' ? 'selected' : ''}>Matrix</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">
                        <input type="checkbox" class="setting-checkbox" id="setting-snap" ${tab.settings.snapToGrid ? 'checked' : ''}>
                        Snap to Grid
                    </label>
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">
                        <input type="checkbox" class="setting-checkbox" id="setting-autosave" ${tab.settings.autoSave ? 'checked' : ''}>
                        Auto Save
                    </label>
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">Graph Statistics</label>
                    <div style="font-size: 11px; color: #666; margin-top: 4px;">
                        Created: ${new Date(tab.created).toLocaleString()}<br>
                        Modified: ${new Date(tab.lastModified).toLocaleString()}<br>
                        Nodes: 0 • Connections: 0
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
        
        this.settingsPopup = { overlay, popup };
        
        // CLOSE handlers
        const closeBtn = popup.querySelector('.settings-close');
        const closePopup = () => this.hideSettingsPopup();
        
        closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
        
        // SAVE settings on change
        const saveSettings = () => {
            const newSettings = {
                showGrid: document.getElementById('setting-grid').checked,
                theme: document.getElementById('setting-theme').value,
                snapToGrid: document.getElementById('setting-snap').checked,
                autoSave: document.getElementById('setting-autosave').checked
            };
            
            this.tabSystem.updateTabSettings(tabId, newSettings);
            
            // Update tab name if changed
            const newName = document.getElementById('setting-name').value.trim();
            if (newName && newName !== tab.name) {
                this.tabSystem.renameTab(tabId, newName);
                this.renderTabs();
            }
        };
        
        // Auto-save on input changes
        popup.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', saveSettings);
        });
        
        // Focus name input
        document.getElementById('setting-name').focus();
    },

    hideSettingsPopup() {
        if (this.settingsPopup) {
            document.body.removeChild(this.settingsPopup.overlay);
            document.body.removeChild(this.settingsPopup.popup);
            this.settingsPopup = null;
        }
    },

    // EVENT listeners
    setupEventListeners() {
        // NEW TAB button
        document.getElementById('new-tab-btn').addEventListener('click', () => {
            const newTab = this.tabSystem.createTab();
            this.tabSystem.setActiveTab(newTab.id);
            this.renderTabs();
        });
        
        // RESET button - clear caches and reload
        document.getElementById('reset-tab-btn').addEventListener('click', () => {
            if (typeof clearAllCaches === 'function') {
                clearAllCaches();
            } else {
                console.warn('⚠️ clearAllCaches function not found, performing manual cache clear...');
                // Manual cache clear as fallback
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                }
                location.reload(true);
            }
        });
        
        // ABOUT button - show credits popup
        document.getElementById('about-btn').addEventListener('click', () => {
            if (window.PixiCreditsPopup) {
                window.PixiCreditsPopup.toggle();
            } else {
                console.warn('⚠️ Credits popup system not loaded');
            }
        });
        
        // Tab system events
        this.tabSystem.events.on('tab:created', () => this.renderTabs());
        this.tabSystem.events.on('tab:activated', () => this.renderTabs());
        this.tabSystem.events.on('tab:renamed', () => this.renderTabs());
        this.tabSystem.events.on('tab:modified', () => this.renderTabs());
        this.tabSystem.events.on('tab:saved', () => this.renderTabs());
        
        // Close popup on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsPopup) {
                this.hideSettingsPopup();
            }
        });
    },

    // UPDATE tab state
    markTabUnsaved(tabId) {
        this.tabSystem.markUnsaved(tabId);
        this.renderTabs();
    },

    markTabSaved(tabId) {
        this.tabSystem.markSaved(tabId);
        this.renderTabs();
    }
};