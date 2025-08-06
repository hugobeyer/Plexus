/**
 * 🎨 COLOR MODE SYSTEM
 * SHIFT+C to toggle color editing mode with element outlining and live editing
 * Highlights ALL INSTANCES of similar elements when hovering
 * Changes ALL INSTANCES when editing colors
 */

class ColorModeSystem {
    constructor() {
        this.isActive = false;
        this.overlayContainer = null;
        this.colorTooltip = null;
        this.currentSelectedElement = null;
        this.currentInstanceGroup = [];
        this.originalStyles = new Map();
        this.autoSave = null;
        
        // COLOR DETECTION CACHE
        this.colorCache = new Map();
        this.instanceGroups = new Map();
        
        // COLOR COPYING & GROUPING
        this.copiedColors = null;
        this.manualGroups = new Map(); // Custom user-defined groups
        this.selectedForGrouping = new Set(); // Elements selected for manual grouping
        this.groupCounter = 0;
        
        // EVENT HANDLERS
        this.boundKeyHandler = this.handleKeyPress.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundClick = this.handleClick.bind(this);
        this.boundResize = this.handleResize.bind(this);
        
        console.log('🎨 ColorModeSystem initialized');
    }
    
    // INITIALIZE with AutoSave system
    initialize(autoSave) {
        this.autoSave = autoSave;
        this.setupEventListeners();
        console.log('🎨 ColorModeSystem ready - Press SHIFT+C to activate');
    }
    
    // SETUP EVENT LISTENERS
    setupEventListeners() {
        document.addEventListener('keydown', this.boundKeyHandler);
        window.addEventListener('resize', this.boundResize);
    }
    
    // HANDLE KEY PRESS (SHIFT+C, CTRL+C, CTRL+V, etc.)
    handleKeyPress(event) {
        // SHIFT+C: Toggle color mode
        if (event.shiftKey && event.key.toLowerCase() === 'c') {
            event.preventDefault();
            this.toggle();
            return;
        }
        
        // Only handle other keys when color mode is active
        if (!this.isActive) return;
        
        // ESC: Cancel color mode
        if (event.key === 'Escape') {
            this.deactivate();
            return;
        }
        
        // CTRL+C: Copy colors from hovered element
        if (event.ctrlKey && event.key.toLowerCase() === 'c') {
            event.preventDefault();
            this.copyColorsFromHoveredElement();
            return;
        }
        
        // CTRL+V: Paste colors to hovered element group
        if (event.ctrlKey && event.key.toLowerCase() === 'v') {
            event.preventDefault();
            this.pasteColorsToHoveredGroup();
            return;
        }
        
        // CTRL+G: Create manual group from selected elements
        if (event.ctrlKey && event.key.toLowerCase() === 'g') {
            event.preventDefault();
            this.createManualGroup();
            return;
        }
        
        // DELETE: Remove element from manual groups
        if (event.key === 'Delete') {
            event.preventDefault();
            this.removeFromManualGroups();
            return;
        }
    }
    
    // TOGGLE COLOR MODE
    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }
    
    // ACTIVATE COLOR MODE
    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('🎨 COLOR MODE ACTIVATED');
        
        // CREATE OVERLAY CONTAINER
        this.createOverlayContainer();
        
        // SCAN AND OUTLINE ALL ELEMENTS
        this.scanAndOutlineElements();
        
        // CREATE COLOR TOOLTIP
        this.createColorTooltip();
        
        // ADD MOUSE LISTENERS
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('click', this.boundClick);
        
        // SHOW ACTIVATION INDICATOR
        this.showActivationIndicator();
    }
    
    // DEACTIVATE COLOR MODE
    deactivate() {
        if (!this.isActive) return;
        
        this.isActive = false;
        console.log('🎨 COLOR MODE DEACTIVATED');
        
        // REMOVE OVERLAY
        if (this.overlayContainer) {
            this.overlayContainer.remove();
            this.overlayContainer = null;
        }
        
        // REMOVE TOOLTIP
        if (this.colorTooltip) {
            this.colorTooltip.remove();
            this.colorTooltip = null;
        }
        
        // RESTORE ORIGINAL STYLES
        this.restoreOriginalStyles();
        
        // REMOVE MOUSE LISTENERS
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('click', this.boundClick);
        
        // CLEAR STATE
        this.currentSelectedElement = null;
        this.currentInstanceGroup = [];
        this.colorCache.clear();
        this.instanceGroups.clear();
        
        console.log('✅ COLOR MODE DEACTIVATED');
    }
    
    // CREATE OVERLAY CONTAINER
    createOverlayContainer() {
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.id = 'color-mode-overlay';
        this.overlayContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 999999;
            background: transparent;
        `;
        document.body.appendChild(this.overlayContainer);
    }
    
    // SCAN AND OUTLINE ALL ELEMENTS
    scanAndOutlineElements() {
        const allElements = document.querySelectorAll('*');
        const processedElements = new Set();
        
        // SORT ELEMENTS BY SIZE (SMALLEST FIRST for priority)
        const elementsWithSize = Array.from(allElements).map(element => {
            const rect = element.getBoundingClientRect();
            return {
                element,
                area: rect.width * rect.height,
                rect
            };
        }).filter(item => !this.shouldSkipElement(item.element) && item.area > 0)
          .sort((a, b) => a.area - b.area); // SMALLEST FIRST
        
        elementsWithSize.forEach(({element, area, rect}) => {
            if (processedElements.has(element)) return;
            
            // SKIP VERY LARGE CONTAINERS (likely backgrounds)
            if (area > window.innerWidth * window.innerHeight * 0.5) return;
            
            // GET ELEMENT SIGNATURE for grouping
            const signature = this.getElementSignature(element);
            
            // FIND ALL INSTANCES of this element type
            const instances = this.findSimilarElements(element, signature);
            
            // CREATE OUTLINE for each instance (prioritize small elements)
            instances.forEach(instance => {
                if (!processedElements.has(instance)) {
                    this.createElementOutline(instance, signature, area);
                    processedElements.add(instance);
                }
            });
            
            // STORE INSTANCE GROUP
            this.instanceGroups.set(signature, instances);
        });
        
        console.log(`🎨 Outlined ${processedElements.size} elements in ${this.instanceGroups.size} groups (prioritized small elements)`);
    }
    
    // SHOULD SKIP ELEMENT
    shouldSkipElement(element) {
        // Skip system elements
        if (element.id === 'color-mode-overlay' || 
            element.id === 'color-tooltip' ||
            element.classList.contains('color-outline') ||
            element.tagName === 'SCRIPT' ||
            element.tagName === 'STYLE' ||
            element.tagName === 'META' ||
            element.tagName === 'TITLE' ||
            element.tagName === 'HEAD' ||
            element.tagName === 'HTML' ||
            element.tagName === 'BODY') {
            return true;
        }
        
        // Skip if no visual presence
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return true;
        
        // PRIORITIZE INTERACTIVE ELEMENTS (nodes, buttons, inputs)
        const isInteractive = (
            element.tagName === 'BUTTON' ||
            element.tagName === 'INPUT' ||
            element.tagName === 'SELECT' ||
            element.classList.contains('node') ||
            element.classList.contains('button') ||
            element.classList.contains('tab') ||
            element.classList.contains('port') ||
            element.classList.contains('parameter') ||
            element.role === 'button' ||
            element.onclick ||
            element.style.cursor === 'pointer'
        );
        
        // Skip very large background containers unless they're interactive
        const area = rect.width * rect.height;
        if (area > window.innerWidth * window.innerHeight * 0.3 && !isInteractive) {
            return true;
        }
        
        return false;
    }
    
    // GET ELEMENT SIGNATURE for grouping similar elements
    getElementSignature(element) {
        const computedStyle = window.getComputedStyle(element);
        
        return {
            tagName: element.tagName,
            className: element.className,
            id: element.id ? `#${element.id}` : '',
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            borderColor: computedStyle.borderColor,
            boxShadow: computedStyle.boxShadow,
            // Add more style properties that affect appearance
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily
        };
    }
    
    // FIND SIMILAR ELEMENTS
    findSimilarElements(targetElement, signature) {
        const allElements = document.querySelectorAll('*');
        const similarElements = [];
        
        allElements.forEach(element => {
            if (this.shouldSkipElement(element)) return;
            
            const elementSignature = this.getElementSignature(element);
            
            // MATCH BY MULTIPLE CRITERIA
            if (this.areElementsSimilar(signature, elementSignature)) {
                similarElements.push(element);
            }
        });
        
        return similarElements;
    }
    
    // ARE ELEMENTS SIMILAR
    areElementsSimilar(sig1, sig2) {
        // EXACT CLASS MATCH
        if (sig1.className && sig2.className && sig1.className === sig2.className) {
            return true;
        }
        
        // SAME TAG + SIMILAR STYLING
        if (sig1.tagName === sig2.tagName) {
            const styleMatches = (
                sig1.backgroundColor === sig2.backgroundColor ||
                sig1.color === sig2.color ||
                sig1.borderColor === sig2.borderColor
            );
            if (styleMatches) return true;
        }
        
        // ID PATTERN MATCH (e.g. button-1, button-2)
        if (sig1.id && sig2.id) {
            const pattern1 = sig1.id.replace(/\d+/g, 'N');
            const pattern2 = sig2.id.replace(/\d+/g, 'N');
            if (pattern1 === pattern2) return true;
        }
        
        return false;
    }
    
    // CREATE ELEMENT OUTLINE
    createElementOutline(element, signature, area) {
        const rect = element.getBoundingClientRect();
        
        // CALCULATE OPACITY based on element size (smaller = more visible)
        let opacity = area < 1000 ? 0.8 : area < 5000 ? 0.4 : 0.15;
        let borderWidth = area < 1000 ? '1px' : area < 5000 ? '1px' : '0.5px';
        
        const outline = document.createElement('div');
        outline.className = 'color-outline';
        outline.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.top}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            border: ${borderWidth} solid rgba(0, 255, 136, ${opacity});
            box-shadow: 0 0 2px rgba(0, 255, 136, ${opacity * 0.3});
            pointer-events: auto;
            z-index: 1000000;
            cursor: crosshair;
            transition: all 0.2s ease;
            background: transparent;
        `;
        
        // STORE REFERENCE to original element
        outline._originalElement = element;
        outline._signature = signature;
        outline._area = area;
        
        // HOVER EFFECTS
        outline.addEventListener('mouseenter', () => {
            this.highlightInstanceGroup(signature);
            this.showColorInfo(element, rect);
        });
        
        outline.addEventListener('mouseleave', () => {
            this.unhighlightInstanceGroup(signature);
            this.hideColorInfo();
        });
        
        this.overlayContainer.appendChild(outline);
    }
    
    // HIGHLIGHT INSTANCE GROUP
    highlightInstanceGroup(signature) {
        const instances = this.instanceGroups.get(signature);
        if (!instances) return;
        
        // HIGHLIGHT ALL OUTLINES of this instance group
        const outlines = this.overlayContainer.querySelectorAll('.color-outline');
        outlines.forEach(outline => {
            if (this.areElementsSimilar(outline._signature, signature)) {
                const area = outline._area || 1000;
                let highlightOpacity = area < 1000 ? 0.9 : area < 5000 ? 0.5 : 0.2;
                let borderWidth = area < 1000 ? '2px' : '1px';
                
                outline.style.border = `${borderWidth} solid rgba(255, 255, 0, ${highlightOpacity})`;
                outline.style.boxShadow = `0 0 4px rgba(255, 255, 0, ${highlightOpacity * 0.4})`;
                outline.style.backgroundColor = `rgba(255, 255, 0, ${highlightOpacity * 0.05})`;
            }
        });
        
        console.log(`🎯 Highlighted ${instances.length} instances`);
    }
    
    // UNHIGHLIGHT INSTANCE GROUP
    unhighlightInstanceGroup(signature) {
        const outlines = this.overlayContainer.querySelectorAll('.color-outline');
        outlines.forEach(outline => {
            if (this.areElementsSimilar(outline._signature, signature)) {
                const area = outline._area || 1000;
                let opacity = area < 1000 ? 0.8 : area < 5000 ? 0.4 : 0.15;
                let borderWidth = area < 1000 ? '1px' : area < 5000 ? '1px' : '0.5px';
                
                outline.style.border = `${borderWidth} solid rgba(0, 255, 136, ${opacity})`;
                outline.style.boxShadow = `0 0 2px rgba(0, 255, 136, ${opacity * 0.3})`;
                outline.style.backgroundColor = 'transparent';
            }
        });
    }
    
    // CREATE COLOR TOOLTIP
    createColorTooltip() {
        this.colorTooltip = document.createElement('div');
        this.colorTooltip.id = 'color-tooltip';
        this.colorTooltip.style.cssText = `
            position: fixed;
            background: rgba(42, 42, 42, 0.9);
            border: 1px solid rgba(85, 85, 85, 0.7);
            border-radius: 8px;
            padding: 12px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            z-index: 1000001;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            min-width: 250px;
            backdrop-filter: blur(4px);
        `;
        document.body.appendChild(this.colorTooltip);
    }
    
    // SHOW COLOR INFO
    showColorInfo(element, rect) {
        if (!this.colorTooltip) return;
        
        const colorInfo = this.extractColorInfo(element);
        const signature = this.getElementSignature(element);
        const instanceCount = this.instanceGroups.get(signature)?.length || 1;
        
        this.colorTooltip.innerHTML = `
            <div style="color: #00ff88; font-weight: bold; margin-bottom: 8px;">
                🎨 COLOR INFO (${instanceCount} instances)
            </div>
            <div style="margin-bottom: 6px;">
                <strong>Element:</strong> ${element.tagName.toLowerCase()}${element.className ? '.' + element.className.split(' ').join('.') : ''}
            </div>
            <div style="margin-bottom: 6px;">
                <strong>Background:</strong> 
                <span style="background: ${colorInfo.backgroundColor}; padding: 2px 6px; border-radius: 3px; margin-left: 4px;">
                    ${colorInfo.backgroundColor}
                </span>
            </div>
            <div style="margin-bottom: 6px;">
                <strong>Text Color:</strong> 
                <span style="color: ${colorInfo.color}; margin-left: 4px;">
                    ${colorInfo.color}
                </span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Border:</strong> ${colorInfo.borderColor}
            </div>
            <div style="font-size: 10px; color: #888; border-top: 1px solid #444; padding-top: 6px;">
                Click to edit colors for ALL INSTANCES
            </div>
        `;
        
        // POSITION TOOLTIP near cursor
        this.colorTooltip.style.left = `${rect.right + 10}px`;
        this.colorTooltip.style.top = `${rect.top}px`;
        this.colorTooltip.style.opacity = '1';
    }
    
    // HIDE COLOR INFO
    hideColorInfo() {
        if (this.colorTooltip) {
            this.colorTooltip.style.opacity = '0';
        }
    }
    
    // EXTRACT COLOR INFO from element
    extractColorInfo(element) {
        const computedStyle = window.getComputedStyle(element);
        
        return {
            backgroundColor: computedStyle.backgroundColor || 'transparent',
            color: computedStyle.color || 'inherit',
            borderColor: computedStyle.borderColor || 'transparent',
            boxShadow: computedStyle.boxShadow || 'none',
            defaultBackground: this.getDefaultStyle(element, 'backgroundColor'),
            defaultColor: this.getDefaultStyle(element, 'color')
        };
    }
    
    // GET DEFAULT STYLE (before any modifications)
    getDefaultStyle(element, property) {
        // Create a temporary element to get default styles
        const temp = document.createElement(element.tagName);
        temp.className = element.className;
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        document.body.appendChild(temp);
        
        const defaultValue = window.getComputedStyle(temp)[property];
        document.body.removeChild(temp);
        
        return defaultValue;
    }
    
    // HANDLE MOUSE MOVE
    handleMouseMove(event) {
        // Update tooltip position if visible
        if (this.colorTooltip && this.colorTooltip.style.opacity === '1') {
            // Keep tooltip near cursor but avoid screen edges
            let x = event.clientX + 15;
            let y = event.clientY - 10;
            
            const tooltipRect = this.colorTooltip.getBoundingClientRect();
            if (x + tooltipRect.width > window.innerWidth) {
                x = event.clientX - tooltipRect.width - 15;
            }
            if (y + tooltipRect.height > window.innerHeight) {
                y = event.clientY - tooltipRect.height - 10;
            }
            
            this.colorTooltip.style.left = `${x}px`;
            this.colorTooltip.style.top = `${y}px`;
        }
    }
    
    // HANDLE CLICK - Open color editor or handle grouping
    handleClick(event) {
        const outline = event.target;
        if (!outline.classList.contains('color-outline')) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const element = outline._originalElement;
        const signature = outline._signature;
        
        // CTRL+CLICK: Add to manual grouping selection
        if (event.ctrlKey) {
            this.toggleElementForGrouping(element, outline);
            return;
        }
        
        // REGULAR CLICK: Open color editor
        this.openColorEditor(element, signature, event);
    }
    
    // OPEN COLOR EDITOR
    openColorEditor(element, signature, event) {
        const instances = this.instanceGroups.get(signature) || [element];
        
        // CREATE COLOR EDITOR POPUP
        const editor = document.createElement('div');
        editor.className = 'color-editor-popup';
        editor.style.cssText = `
            position: fixed;
            left: ${event.clientX + 10}px;
            top: ${event.clientY + 10}px;
            background: #2a2a2a;
            border: 2px solid #00ff88;
            border-radius: 8px;
            padding: 16px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1000002;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
            min-width: 300px;
        `;
        
        const colorInfo = this.extractColorInfo(element);
        
        editor.innerHTML = `
            <div style="color: #00ff88; font-weight: bold; margin-bottom: 12px;">
                🎨 EDIT COLORS (${instances.length} instances)
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px;">Background Color:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="color" id="bg-color-picker" value="${this.rgbToHex(colorInfo.backgroundColor)}" 
                           style="width: 40px; height: 30px; border: none; border-radius: 4px; cursor: pointer;">
                    <input type="text" id="bg-color-text" value="${colorInfo.backgroundColor}" 
                           style="flex: 1; padding: 6px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px;">
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px;">Text Color:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="color" id="text-color-picker" value="${this.rgbToHex(colorInfo.color)}" 
                           style="width: 40px; height: 30px; border: none; border-radius: 4px; cursor: pointer;">
                    <input type="text" id="text-color-text" value="${colorInfo.color}" 
                           style="flex: 1; padding: 6px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px;">
                </div>
            </div>
            
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <button id="apply-colors" style="flex: 1; padding: 8px; background: #00ff88; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    APPLY TO ALL
                </button>
                <button id="reset-colors" style="padding: 8px 12px; background: #ff4444; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
                    RESET
                </button>
                <button id="close-editor" style="padding: 8px 12px; background: #666; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
                    CLOSE
                </button>
            </div>
            
            <div style="font-size: 10px; color: #888; margin-top: 12px; border-top: 1px solid #444; padding-top: 8px;">
                Changes apply to ALL ${instances.length} similar elements and auto-save
            </div>
        `;
        
        document.body.appendChild(editor);
        
        // SETUP EDITOR EVENTS
        this.setupColorEditorEvents(editor, instances, signature);
    }
    
    // SETUP COLOR EDITOR EVENTS
    setupColorEditorEvents(editor, instances, signature) {
        const bgColorPicker = editor.querySelector('#bg-color-picker');
        const bgColorText = editor.querySelector('#bg-color-text');
        const textColorPicker = editor.querySelector('#text-color-picker');
        const textColorText = editor.querySelector('#text-color-text');
        const applyBtn = editor.querySelector('#apply-colors');
        const resetBtn = editor.querySelector('#reset-colors');
        const closeBtn = editor.querySelector('#close-editor');
        
        // SYNC COLOR PICKER WITH TEXT INPUT
        bgColorPicker.addEventListener('input', (e) => {
            bgColorText.value = e.target.value;
            this.previewColorChange(instances, 'backgroundColor', e.target.value);
        });
        
        bgColorText.addEventListener('input', (e) => {
            if (this.isValidColor(e.target.value)) {
                bgColorPicker.value = this.rgbToHex(e.target.value);
                this.previewColorChange(instances, 'backgroundColor', e.target.value);
            }
        });
        
        textColorPicker.addEventListener('input', (e) => {
            textColorText.value = e.target.value;
            this.previewColorChange(instances, 'color', e.target.value);
        });
        
        textColorText.addEventListener('input', (e) => {
            if (this.isValidColor(e.target.value)) {
                textColorPicker.value = this.rgbToHex(e.target.value);
                this.previewColorChange(instances, 'color', e.target.value);
            }
        });
        
        // APPLY BUTTON
        applyBtn.addEventListener('click', () => {
            this.applyColorChanges(instances, {
                backgroundColor: bgColorText.value,
                color: textColorText.value
            });
            this.triggerAutoSave();
            editor.remove();
        });
        
        // RESET BUTTON
        resetBtn.addEventListener('click', () => {
            this.resetElementColors(instances);
            editor.remove();
        });
        
        // CLOSE BUTTON
        closeBtn.addEventListener('click', () => {
            this.restorePreviewChanges(instances);
            editor.remove();
        });
        
        // CLOSE ON ESCAPE
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.restorePreviewChanges(instances);
                editor.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    // PREVIEW COLOR CHANGE (temporary)
    previewColorChange(instances, property, value) {
        instances.forEach(element => {
            if (!this.originalStyles.has(element)) {
                this.originalStyles.set(element, {
                    backgroundColor: element.style.backgroundColor,
                    color: element.style.color
                });
            }
            element.style[property] = value;
        });
    }
    
    // APPLY COLOR CHANGES (permanent)
    applyColorChanges(instances, colors) {
        instances.forEach(element => {
            if (colors.backgroundColor) {
                element.style.backgroundColor = colors.backgroundColor;
            }
            if (colors.color) {
                element.style.color = colors.color;
            }
        });
        
        // CLEAR FROM PREVIEW CACHE
        instances.forEach(element => {
            this.originalStyles.delete(element);
        });
        
        console.log(`✅ Applied colors to ${instances.length} instances`);
    }
    
    // RESTORE PREVIEW CHANGES
    restorePreviewChanges(instances) {
        instances.forEach(element => {
            const original = this.originalStyles.get(element);
            if (original) {
                element.style.backgroundColor = original.backgroundColor;
                element.style.color = original.color;
                this.originalStyles.delete(element);
            }
        });
    }
    
    // RESET ELEMENT COLORS to default
    resetElementColors(instances) {
        instances.forEach(element => {
            element.style.backgroundColor = '';
            element.style.color = '';
            this.originalStyles.delete(element);
        });
        console.log(`🔄 Reset colors for ${instances.length} instances`);
    }
    
    // RESTORE ORIGINAL STYLES
    restoreOriginalStyles() {
        this.originalStyles.forEach((original, element) => {
            element.style.backgroundColor = original.backgroundColor;
            element.style.color = original.color;
        });
        this.originalStyles.clear();
    }
    
    // TRIGGER AUTO SAVE
    triggerAutoSave() {
        if (this.autoSave) {
            this.autoSave.recordChange('color_mode_edit', {
                timestamp: Date.now(),
                elementsModified: this.originalStyles.size
            });
        }
    }
    
    // UTILITY METHODS
    
    // RGB TO HEX conversion
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        if (rgb === 'transparent' || rgb === '') return '#000000';
        
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return '#000000';
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    // IS VALID COLOR
    isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }
    
    // HANDLE RESIZE
    handleResize() {
        if (this.isActive && this.overlayContainer) {
            // REBUILD OUTLINES on resize
            this.overlayContainer.innerHTML = '';
            this.scanAndOutlineElements();
        }
    }
    
    // SHOW ACTIVATION INDICATOR
    showActivationIndicator() {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff88;
            color: #000;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 1000003;
            box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
            animation: colorModeActivated 0.5s ease;
        `;
        
        indicator.innerHTML = `
            🎨 COLOR MODE ACTIVE<br/>
            <small style="font-size: 10px; opacity: 0.9;">
                SHIFT+C: Exit | CTRL+C: Copy | CTRL+V: Paste | CTRL+Click: Group | CTRL+G: Create Group
            </small>
        `;
        
        // ADD ANIMATION
        const style = document.createElement('style');
        style.textContent = `
            @keyframes colorModeActivated {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
        
        // AUTO REMOVE after 3 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
            if (style.parentNode) {
                style.remove();
            }
        }, 3000);
    }
    
    // ========== COLOR COPYING & GROUPING METHODS ==========
    
    // COPY COLORS from currently hovered element
    copyColorsFromHoveredElement() {
        const hoveredOutline = document.querySelector('.color-outline:hover');
        if (!hoveredOutline) {
            this.showNotification('⚠️ No element hovered - hover an element first', 'warning');
            return;
        }
        
        const element = hoveredOutline._originalElement;
        const colorInfo = this.extractColorInfo(element);
        
        this.copiedColors = {
            backgroundColor: colorInfo.backgroundColor,
            color: colorInfo.color,
            borderColor: colorInfo.borderColor,
            sourceElement: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ').join('.') : '')
        };
        
        this.showNotification(`📋 Copied colors from ${this.copiedColors.sourceElement}`, 'success');
        console.log('📋 Copied colors:', this.copiedColors);
    }
    
    // PASTE COLORS to currently hovered element group
    pasteColorsToHoveredGroup() {
        if (!this.copiedColors) {
            this.showNotification('⚠️ No colors copied - use CTRL+C first', 'warning');
            return;
        }
        
        const hoveredOutline = document.querySelector('.color-outline:hover');
        if (!hoveredOutline) {
            this.showNotification('⚠️ No element hovered - hover target element first', 'warning');
            return;
        }
        
        const element = hoveredOutline._originalElement;
        const signature = hoveredOutline._signature;
        const instances = this.instanceGroups.get(signature) || [element];
        
        // Apply copied colors to all instances
        this.applyColorChanges(instances, {
            backgroundColor: this.copiedColors.backgroundColor,
            color: this.copiedColors.color
        });
        
        this.triggerAutoSave();
        this.showNotification(`✅ Pasted colors to ${instances.length} elements`, 'success');
        console.log(`✅ Pasted colors to ${instances.length} instances`);
    }
    
    // TOGGLE ELEMENT FOR GROUPING (CTRL+click)
    toggleElementForGrouping(element, outline) {
        if (this.selectedForGrouping.has(element)) {
            // Remove from selection
            this.selectedForGrouping.delete(element);
            outline.style.borderColor = 'rgba(0, 255, 136, 0.8)';
            outline.style.backgroundColor = 'transparent';
            this.showNotification(`➖ Removed from grouping selection (${this.selectedForGrouping.size} selected)`, 'info');
        } else {
            // Add to selection
            this.selectedForGrouping.add(element);
            outline.style.borderColor = 'rgba(255, 0, 255, 0.9)';
            outline.style.backgroundColor = 'rgba(255, 0, 255, 0.1)';
            this.showNotification(`➕ Added to grouping selection (${this.selectedForGrouping.size} selected)`, 'info');
        }
        
        // Update selection indicator
        this.updateGroupingSelectionDisplay();
    }
    
    // CREATE MANUAL GROUP from selected elements
    createManualGroup() {
        if (this.selectedForGrouping.size < 2) {
            this.showNotification('⚠️ Select at least 2 elements (CTRL+click) to create a group', 'warning');
            return;
        }
        
        const groupId = `manual-group-${++this.groupCounter}`;
        const elements = Array.from(this.selectedForGrouping);
        
        // Create new manual group
        this.manualGroups.set(groupId, elements);
        
        // Update instance groups to include this manual group
        const manualSignature = {
            type: 'manual',
            groupId: groupId,
            tagName: 'MANUAL_GROUP',
            className: 'manual-group',
            backgroundColor: 'manual',
            color: 'manual'
        };
        
        this.instanceGroups.set(manualSignature, elements);
        
        // Update outline signatures
        const outlines = this.overlayContainer.querySelectorAll('.color-outline');
        outlines.forEach(outline => {
            if (elements.includes(outline._originalElement)) {
                outline._signature = manualSignature;
                outline.style.borderColor = 'rgba(255, 165, 0, 0.8)';
                outline.style.boxShadow = '0 0 4px rgba(255, 165, 0, 0.5)';
            }
        });
        
        // Clear selection
        this.selectedForGrouping.clear();
        this.updateGroupingSelectionDisplay();
        
        this.showNotification(`✅ Created manual group with ${elements.length} elements`, 'success');
        console.log(`✅ Created manual group: ${groupId} with ${elements.length} elements`);
    }
    
    // REMOVE FROM MANUAL GROUPS
    removeFromManualGroups() {
        const hoveredOutline = document.querySelector('.color-outline:hover');
        if (!hoveredOutline) {
            this.showNotification('⚠️ No element hovered', 'warning');
            return;
        }
        
        const element = hoveredOutline._originalElement;
        const signature = hoveredOutline._signature;
        
        // Check if element is in a manual group
        if (signature.type !== 'manual') {
            this.showNotification('⚠️ Element is not in a manual group', 'warning');
            return;
        }
        
        // Remove from manual group
        const groupElements = this.manualGroups.get(signature.groupId);
        if (groupElements) {
            const newElements = groupElements.filter(el => el !== element);
            
            if (newElements.length > 1) {
                this.manualGroups.set(signature.groupId, newElements);
                this.instanceGroups.set(signature, newElements);
            } else {
                // Delete group if only one element left
                this.manualGroups.delete(signature.groupId);
                this.instanceGroups.delete(signature);
            }
        }
        
        // Reset element to original signature
        const originalSignature = this.getElementSignature(element);
        hoveredOutline._signature = originalSignature;
        hoveredOutline.style.borderColor = 'rgba(0, 255, 136, 0.8)';
        hoveredOutline.style.boxShadow = '0 0 2px rgba(0, 255, 136, 0.3)';
        
        this.showNotification('✅ Removed element from manual group', 'success');
    }
    
    // UPDATE GROUPING SELECTION DISPLAY
    updateGroupingSelectionDisplay() {
        const indicator = document.getElementById('grouping-indicator');
        if (this.selectedForGrouping.size > 0) {
            if (!indicator) {
                this.createGroupingIndicator();
            } else {
                indicator.textContent = `🔗 Grouping: ${this.selectedForGrouping.size} selected (CTRL+G to group)`;
            }
        } else {
            if (indicator) {
                indicator.remove();
            }
        }
    }
    
    // CREATE GROUPING INDICATOR
    createGroupingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'grouping-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 255, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000003;
            box-shadow: 0 4px 12px rgba(255, 0, 255, 0.3);
            backdrop-filter: blur(4px);
        `;
        indicator.textContent = `🔗 Grouping: ${this.selectedForGrouping.size} selected (CTRL+G to group)`;
        document.body.appendChild(indicator);
    }
    
    // SHOW NOTIFICATION
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'color-mode-notification';
        
        const colors = {
            success: { bg: 'rgba(0, 255, 136, 0.9)', border: '#00ff88' },
            warning: { bg: 'rgba(255, 165, 0, 0.9)', border: '#ffa500' },
            error: { bg: 'rgba(255, 68, 68, 0.9)', border: '#ff4444' },
            info: { bg: 'rgba(74, 158, 255, 0.9)', border: '#4a9eff' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color.bg};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000004;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
            animation: slideInNotification 0.3s ease;
        `;
        
        notification.textContent = message;
        
        // Add animation
        if (!document.querySelector('style[data-color-mode-animations]')) {
            const style = document.createElement('style');
            style.setAttribute('data-color-mode-animations', 'true');
            style.textContent = `
                @keyframes slideInNotification {
                    0% { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    100% { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInNotification 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
    
    // DESTROY
    destroy() {
        this.deactivate();
        document.removeEventListener('keydown', this.boundKeyHandler);
        window.removeEventListener('resize', this.boundResize);
        
        // Clear grouping data
        this.selectedForGrouping.clear();
        this.manualGroups.clear();
        this.copiedColors = null;
        
        // Remove indicators
        const groupingIndicator = document.getElementById('grouping-indicator');
        if (groupingIndicator) groupingIndicator.remove();
        
        console.log('🗑️ ColorModeSystem destroyed');
    }
}

// Export for use in main system
window.ColorModeSystem = ColorModeSystem;

console.log('🎨 ColorModeSystem loaded');
