// UI OVERLAY STYLES - NOW USES COLOR PALETTE
// Auto-loads colors from localStorage if available

function loadSavedColors() {
    try {
        const saved = localStorage.getItem('plexusColors');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load saved UI colors');
    }
    return null;
}

const uiStylesSavedColors = loadSavedColors();

window.PixiUIStyles = {
    // Base styling - AUTO-LOADED FROM COLOR PALETTE
    base: {
        bodyBackground: uiStylesSavedColors?.uiElements?.bodyBackground || '#1a1a1a',
        textColor: uiStylesSavedColors?.text?.primary || '#fff',
        fontFamily: "'Courier New', monospace"
    },
    
    // UI Component styles - AUTO-LOADED FROM COLOR PALETTE
    components: {
        themeSelector: {
            background: uiStylesSavedColors?.uiElements?.panelBackground || '#2a2a2a',
            border: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
            padding: '8px',
            borderRadius: '8px',
            position: { bottom: '20px', left: '20px' },
            label: {
                color: uiStylesSavedColors?.uiElements?.labelColor || '#aaa',
                fontSize: '11px',
                marginRight: '8px'
            },
            select: {
                background: uiStylesSavedColors?.uiElements?.inputBackground || '#333',
                border: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
                color: uiStylesSavedColors?.text?.primary || '#fff',
                padding: '4px',
                borderRadius: '4px'
            }
        },
        
        status: {
            background: uiStylesSavedColors?.uiElements?.panelBackground || '#2a2a2a',
            border: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            color: uiStylesSavedColors?.uiElements?.statusColor || '#ddd',
            position: { bottom: '20px', left: '20px' }
        },
        
        nodeCount: {
            background: uiStylesSavedColors?.uiElements?.panelBackground || '#2a2a2a',
            border: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: uiStylesSavedColors?.ui?.accent || '#4CAF50',
            position: { bottom: '20px', right: '20px' }
        },
        
        loadingIndicator: {
            background: uiStylesSavedColors?.uiElements?.panelBackground || '#2a2a2a',
            border: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
            padding: '20px',
            borderRadius: '8px',
            color: uiStylesSavedColors?.text?.primary || '#fff',
            zIndex: 5000,
            progress: {
                width: '200px',
                height: '4px',
                background: uiStylesSavedColors?.uiElements?.progressBackground || '#333',
                borderRadius: '2px',
                marginTop: '10px',
                bar: {
                    height: '100%',
                    background: uiStylesSavedColors?.uiElements?.progressBar || '#4CAF50',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                }
            }
        },
        
        // TAB SYSTEM - Diagonal Folder Style
        tabSystem: {
            height: '36px',
            topMargin: '8px',
            background: uiStylesSavedColors?.uiElements?.panelBackground || '#2a2a2a',
            borderBottom: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
            fontFamily: "'Consolas', 'Monaco', monospace",
            fontSize: '11px',
            zIndex: 1000,
            
            tab: {
                background: uiStylesSavedColors?.uiElements?.inputBackground || '#333',
                backgroundHover: uiStylesSavedColors?.uiElements?.panelBackground || '#2a2a2a',
                backgroundActive: uiStylesSavedColors?.uiElements?.panelBorder || '#555',
                border: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
                borderActive: `1px solid ${uiStylesSavedColors?.ui?.accent || '#4CAF50'}`,
                color: uiStylesSavedColors?.text?.secondary || '#ccc',
                colorActive: uiStylesSavedColors?.text?.primary || '#fff',
                padding: '0 16px 0 20px',
                minWidth: '120px',
                maxWidth: '180px',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.15s ease',
                marginRight: '-8px',
                position: 'relative'
            },
            
            newTabButton: {
                width: '32px',
                background: uiStylesSavedColors?.uiElements?.inputBackground || '#333',
                backgroundHover: uiStylesSavedColors?.ui?.accent || '#4CAF50',
                border: `1px solid ${uiStylesSavedColors?.uiElements?.panelBorder || '#555'}`,
                color: uiStylesSavedColors?.text?.secondary || '#ccc',
                colorHover: uiStylesSavedColors?.text?.primary || '#fff',
                fontSize: '14px',
                borderRadius: '0'
            },
            
            closeButton: {
                background: 'transparent',
                backgroundHover: uiStylesSavedColors?.ui?.error || '#ff4444',
                border: 'none',
                color: uiStylesSavedColors?.text?.secondary || '#888',
                colorHover: uiStylesSavedColors?.text?.primary || '#fff',
                fontSize: '12px',
                padding: '2px 4px',
                borderRadius: '2px',
                marginLeft: '8px'
            }
        },
        
        // WELCOME POPUP - Banner style
        welcomePopup: {
            overlay: {
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 10000
            },
            popup: {
                maxWidth: '800px',
                height: '320px',
                background: `linear-gradient(135deg, ${uiStylesSavedColors?.uiElements?.bodyBackground || '#1a1a2e'} 0%, ${uiStylesSavedColors?.themes?.darkBackground || '#16213e'} 50%, ${uiStylesSavedColors?.themes?.darkerBackground || '#0f3460'} 100%)`,
                border: `2px solid ${uiStylesSavedColors?.ui?.accent || '#4CAF50'}`,
                borderRadius: '12px',
                fontFamily: uiStylesSavedColors?.text?.fontFamily || "'Courier New', monospace"
            },
            header: {
                background: `linear-gradient(90deg, ${uiStylesSavedColors?.ui?.accent || '#4CAF50'}, ${uiStylesSavedColors?.ui?.accentDark || '#45a049'})`,
                padding: '20px'
            },
            title: {
                fontSize: '28px',
                fontWeight: 'bold',
                color: uiStylesSavedColors?.text?.primary || '#ffffff',
                letterSpacing: '2px'
            },
            content: {
                padding: '30px',
                color: uiStylesSavedColors?.text?.primary || '#ffffff',
                accent: uiStylesSavedColors?.ui?.accent || '#4CAF50'
            }
        }
    },
    
    // Generate CSS string from config
    generateCSS() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                margin: 0; padding: 0; overflow: hidden; user-select: none;
                background: ${this.base.bodyBackground}; 
                color: ${this.base.textColor}; 
                font-family: ${this.base.fontFamily};
            }
            
            .ui-overlay {
                position: fixed; z-index: 1000; pointer-events: none;
            }
            
            .ui-overlay > * {
                pointer-events: auto;
            }
            
            .theme-selector-bottom {
                position: fixed; 
                bottom: ${this.components.themeSelector.position.bottom}; 
                left: ${this.components.themeSelector.position.left};
                background: ${this.components.themeSelector.background}; 
                border: ${this.components.themeSelector.border}; 
                padding: ${this.components.themeSelector.padding}; 
                border-radius: ${this.components.themeSelector.borderRadius};
                z-index: 1000;
            }
            
            .theme-selector-bottom label {
                color: ${this.components.themeSelector.label.color}; 
                font-size: ${this.components.themeSelector.label.fontSize}; 
                margin-right: ${this.components.themeSelector.label.marginRight};
            }
            
            .theme-selector-bottom select {
                background: ${this.components.themeSelector.select.background}; 
                border: ${this.components.themeSelector.select.border}; 
                color: ${this.components.themeSelector.select.color};
                padding: ${this.components.themeSelector.select.padding}; 
                border-radius: ${this.components.themeSelector.select.borderRadius}; 
                font-family: inherit;
            }
            
            .status {
                position: fixed; 
                bottom: ${this.components.status.position.bottom}; 
                left: ${this.components.status.position.left};
                background: ${this.components.status.background}; 
                border: ${this.components.status.border};
                padding: ${this.components.status.padding}; 
                border-radius: ${this.components.status.borderRadius}; 
                font-size: ${this.components.status.fontSize};
                color: ${this.components.status.color};
            }
            
            .node-count {
                position: fixed; 
                bottom: ${this.components.nodeCount.position.bottom}; 
                right: ${this.components.nodeCount.position.right}; 
                background: ${this.components.nodeCount.background}; 
                border: ${this.components.nodeCount.border}; 
                padding: ${this.components.nodeCount.padding}; 
                border-radius: ${this.components.nodeCount.borderRadius}; 
                font-size: ${this.components.nodeCount.fontSize}; 
                font-weight: ${this.components.nodeCount.fontWeight}; 
                color: ${this.components.nodeCount.color};
            }

            .loading-indicator {
                position: fixed; top: 50%; left: 50%; 
                transform: translate(-50%, -50%);
                background: ${this.components.loadingIndicator.background}; 
                border: ${this.components.loadingIndicator.border};
                padding: ${this.components.loadingIndicator.padding}; 
                border-radius: ${this.components.loadingIndicator.borderRadius};
                color: ${this.components.loadingIndicator.color}; 
                z-index: ${this.components.loadingIndicator.zIndex};
            }

            .loading-progress {
                width: ${this.components.loadingIndicator.progress.width}; 
                height: ${this.components.loadingIndicator.progress.height}; 
                background: ${this.components.loadingIndicator.progress.background}; 
                border-radius: ${this.components.loadingIndicator.progress.borderRadius}; 
                margin-top: ${this.components.loadingIndicator.progress.marginTop};
            }

            .loading-bar {
                height: ${this.components.loadingIndicator.progress.bar.height}; 
                background: ${this.components.loadingIndicator.progress.bar.background}; 
                border-radius: ${this.components.loadingIndicator.progress.bar.borderRadius}; 
                width: 0%; 
                transition: ${this.components.loadingIndicator.progress.bar.transition};
            }
            
            /* TAB SYSTEM - Diagonal Folder Style */
            .tab-bar {
                position: fixed;
                top: ${this.components.tabSystem.topMargin};
                left: 0;
                right: 0;
                height: ${this.components.tabSystem.height};
                background: ${this.components.tabSystem.background};
                border-bottom: ${this.components.tabSystem.borderBottom};
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                z-index: ${this.components.tabSystem.zIndex};
                font-family: ${this.components.tabSystem.fontFamily};
                font-size: ${this.components.tabSystem.fontSize};
                padding: 0 8px 0 8px;
            }
            
            .tab-list {
                display: flex;
                height: 100%;
                flex: 1;
                overflow-x: auto;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE/Edge */
            }
            
            .tab-list::-webkit-scrollbar {
                display: none; /* Chrome/Safari */
            }
            
            .tab-controls {
                display: flex;
                align-items: flex-end;
                gap: 4px;
                height: 100%;
            }
            
            .tab {
                background: ${this.components.tabSystem.tab.background};
                border: ${this.components.tabSystem.tab.border};
                border-bottom: none;
                color: ${this.components.tabSystem.tab.color};
                padding: ${this.components.tabSystem.tab.padding};
                min-width: ${this.components.tabSystem.tab.minWidth};
                max-width: ${this.components.tabSystem.tab.maxWidth};
                height: 28px;
                display: flex;
                align-items: center;
                cursor: pointer;
                border-radius: ${this.components.tabSystem.tab.borderRadius};
                transition: ${this.components.tabSystem.tab.transition};
                user-select: none;
                white-space: nowrap;
                overflow: hidden;
                margin-right: ${this.components.tabSystem.tab.marginRight};
                position: ${this.components.tabSystem.tab.position};
                z-index: 1;
            }
            
            .tab::before {
                content: '';
                position: absolute;
                left: -8px;
                top: 0;
                bottom: 0;
                width: 12px;
                background: ${this.components.tabSystem.tab.background};
                border: ${this.components.tabSystem.tab.border};
                border-right: none;
                border-bottom: none;
                transform: skewX(-20deg);
                border-radius: 8px 0 0 0;
            }
            
            .tab::after {
                content: '';
                position: absolute;
                right: -8px;
                top: 0;
                bottom: 0;
                width: 12px;
                background: ${this.components.tabSystem.tab.background};
                border: ${this.components.tabSystem.tab.border};
                border-left: none;
                border-bottom: none;
                transform: skewX(20deg);
                border-radius: 0 8px 0 0;
            }
            
            .tab:hover {
                background: ${this.components.tabSystem.tab.backgroundHover};
            }
            
            .tab.active {
                background: ${this.components.tabSystem.tab.backgroundActive};
                color: ${this.components.tabSystem.tab.colorActive};
                z-index: 3;
                height: 30px;
                margin-bottom: -1px;
            }
            
            .tab.active::before {
                background: ${this.components.tabSystem.tab.backgroundActive};
            }
            
            .tab.active::after {
                background: ${this.components.tabSystem.tab.backgroundActive};
            }
            
            .tab.unsaved {
                border-left: 2px solid ${this.components.tabSystem.tab.borderActive.split(' ')[2]};
            }
            
            .tab-name {
                flex: 1;
                font-size: inherit;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 2px 4px;
                border: 1px solid transparent;
                border-radius: 2px;
                min-width: 0;
            }
            
            .tab-name.editing {
                background: ${this.components.tabSystem.tab.backgroundActive};
                border-color: ${this.components.tabSystem.tab.borderActive.split(' ')[2]};
                color: ${this.components.tabSystem.tab.colorActive};
                outline: none;
            }
            
            .tab-name.unsaved::after {
                content: " ●";
                color: ${this.components.tabSystem.tab.borderActive.split(' ')[2]};
            }
            
            .tab-close {
                background: ${this.components.tabSystem.closeButton.background};
                border: ${this.components.tabSystem.closeButton.border};
                color: ${this.components.tabSystem.closeButton.color};
                font-size: ${this.components.tabSystem.closeButton.fontSize};
                padding: ${this.components.tabSystem.closeButton.padding};
                border-radius: ${this.components.tabSystem.closeButton.borderRadius};
                margin-left: ${this.components.tabSystem.closeButton.marginLeft};
                cursor: pointer;
                transition: all 0.15s ease;
                line-height: 1;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .tab-close:hover {
                background: ${this.components.tabSystem.closeButton.backgroundHover};
                color: ${this.components.tabSystem.closeButton.colorHover};
            }
            
            .new-tab-btn, .about-btn, .reset-btn {
                width: ${this.components.tabSystem.newTabButton.width};
                height: 28px;
                background: ${this.components.tabSystem.newTabButton.background};
                border: ${this.components.tabSystem.newTabButton.border};
                border-bottom: none;
                color: ${this.components.tabSystem.newTabButton.color};
                font-size: ${this.components.tabSystem.newTabButton.fontSize};
                border-radius: 8px 8px 0 0;
                cursor: pointer;
                transition: all 0.15s ease;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                align-self: flex-end;
            }
            
            .about-btn {
                font-size: 12px;
            }
            
            .about-btn svg, .reset-btn svg {
                width: 14px;
                height: 14px;
                stroke-width: 2;
            }
            
            .new-tab-btn:hover, .about-btn:hover, .reset-btn:hover {
                background: ${this.components.tabSystem.newTabButton.backgroundHover};
                color: ${this.components.tabSystem.newTabButton.colorHover};
            }
            
            /* Adjust body padding for folder tabs with top margin */
            body {
                padding-top: calc(${this.components.tabSystem.height} + ${this.components.tabSystem.topMargin}) !important;
            }
        `;
    }
};