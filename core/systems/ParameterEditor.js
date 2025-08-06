/**
 * 📝 PARAMETER EDITOR SYSTEM
 * Modular system for editing node parameters
 * Handles different parameter types and UI overlays
 */

class ParameterEditor {
    constructor() {
        this.activeEditor = null;
        this.nodeSystem = null;
        this.editableTypes = ['Constant', 'Random', 'Time', 'Hash'];
        
        console.log('📝 Parameter Editor System initialized');
    }

    // INITIALIZE with node system reference
    initialize(nodeSystem) {
        this.nodeSystem = nodeSystem;
        console.log('🔗 Parameter Editor linked to node system');
    }

    // CHECK if a node parameter is editable
    isParameterEditable(nodeTitle, paramLabel) {
        // TEMPORARY: Allow all Constant node Value parameters for debugging
        if (nodeTitle === 'Constant' && paramLabel === 'Value') {
            console.log(`✅ FORCED editable: ${nodeTitle}.${paramLabel}`);
            return true;
        }
        
        const titleMatch = this.editableTypes.includes(nodeTitle);
        const labelMatch = (paramLabel === 'Value' || paramLabel === 'Seed' || paramLabel === 'Speed');
        
        console.log(`🔍 Editable check: "${nodeTitle}" in [${this.editableTypes.join(', ')}] = ${titleMatch}, "${paramLabel}" is valid = ${labelMatch}`);
        
        return titleMatch && labelMatch;
    }

    // SETUP parameter interactivity for a node
    setupParameterInteractivity(node, inputBg, valueText, param, paramIndex) {
        console.log(`🔍 Checking parameter editability: ${node.definition.title}.${param.label}`);
        
        if (!this.isParameterEditable(node.definition.title, param.label)) {
            console.log(`❌ Parameter not editable: ${node.definition.title}.${param.label}`);
            return; // Not editable
        }
        
        console.log(`✅ Setting up parameter interactivity for: ${node.definition.title}.${param.label}`);

        // Store references for updates
        node.parameterValue = valueText;
        node.parameterData = param;
        
        // Make input background interactive
        inputBg.interactive = true;
        inputBg.buttonMode = true;
        inputBg.zIndex = 2001; // HIGH Z-INDEX to capture clicks
        
        // Click handler to show editor
        inputBg.on('pointerdown', (e) => {
            console.log(`🖱️ Parameter field clicked: ${param.label} = ${param.value}`);
            e.stopPropagation(); // Prevent node dragging
            this.showEditor(node, param, paramIndex, e);
        });
        
        // Hover effects
        inputBg.on('pointerover', () => {
            inputBg.alpha = 1.2;
            inputBg.cursor = 'text';
        });
        
        inputBg.on('pointerout', () => {
            inputBg.alpha = 1.0;
        });

        console.log(`✅ Parameter ${param.label} set up for editing`);
    }

    // SHOW EDITOR overlay
    showEditor(node, param, paramIndex, event) {
        // Remove any existing editor
        this.hideEditor();
        
        // Get parameter type and create appropriate editor
        const editorType = this.getParameterEditorType(node.definition.title, param.label);
        
        switch (editorType) {
            case 'number':
                this.createNumberEditor(node, param, event);
                break;
            case 'text':
                this.createTextEditor(node, param, event);
                break;
            case 'slider':
                this.createSliderEditor(node, param, event);
                break;
            default:
                this.createNumberEditor(node, param, event);
        }
    }

    // GET PARAMETER EDITOR TYPE
    getParameterEditorType(nodeTitle, paramLabel) {
        const editorTypes = {
            'Constant': { 'Value': 'number' },
            'Random': { 'Seed': 'number', 'Range': 'slider' },
            'Time': { 'Speed': 'slider' },
            'Hash': { 'Seed': 'number' }
        };

        return editorTypes[nodeTitle]?.[paramLabel] || 'number';
    }

    // CREATE NUMBER EDITOR
    createNumberEditor(node, param, event) {
        const position = this.getEditorPosition(event);
        
        const editor = document.createElement('input');
        editor.type = 'text'; // Use text for better number control
        editor.value = param.value.toString();
        editor.id = 'parameter-editor-overlay';
        editor.placeholder = 'Enter number...';
        
        this.applyEditorStyles(editor, position, {
            width: '80px',
            height: '24px',
            fontSize: '14px',
            textAlign: 'center'
        });
        
        this.setupEditorEvents(editor, node, param, (newValue) => {
            return parseFloat(newValue) || 0;
        });
        
        document.body.appendChild(editor);
        this.focusEditor(editor);
        this.activeEditor = editor;
        
        console.log(`📝 Number editor created for ${param.label}`);
    }

    // CREATE TEXT EDITOR  
    createTextEditor(node, param, event) {
        const position = this.getEditorPosition(event);
        
        const editor = document.createElement('input');
        editor.type = 'text';
        editor.value = param.value.toString();
        editor.id = 'parameter-editor-overlay';
        editor.placeholder = 'Enter text...';
        
        this.applyEditorStyles(editor, position, {
            width: '120px',
            height: '24px',
            fontSize: '14px',
            textAlign: 'left'
        });
        
        this.setupEditorEvents(editor, node, param, (newValue) => {
            return newValue; // Return as string
        });
        
        document.body.appendChild(editor);
        this.focusEditor(editor);
        this.activeEditor = editor;
        
        console.log(`📝 Text editor created for ${param.label}`);
    }

    // CREATE SLIDER EDITOR
    createSliderEditor(node, param, event) {
        const position = this.getEditorPosition(event);
        
        const container = document.createElement('div');
        container.id = 'parameter-editor-overlay';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '10';
        slider.step = '0.1';
        slider.value = param.value.toString();
        
        const display = document.createElement('span');
        display.textContent = param.value.toString();
        display.style.cssText = `
            color: #ffffff;
            font-family: monospace;
            font-size: 12px;
            margin-left: 8px;
            min-width: 40px;
            display: inline-block;
        `;
        
        container.appendChild(slider);
        container.appendChild(display);
        
        this.applyEditorStyles(container, position, {
            width: '150px',
            height: '24px',
            display: 'flex',
            alignItems: 'center'
        });
        
        // Slider-specific event handling
        slider.oninput = () => {
            const newValue = parseFloat(slider.value);
            display.textContent = newValue.toFixed(1);
            param.value = newValue;
            
            // Update PIXI text display AND reposition properly
            if (node.parameterValue) {
                console.log(`🔍 SLIDER BEFORE update: text="${node.parameterValue.text}", x=${node.parameterValue.x}, y=${node.parameterValue.y}, visible=${node.parameterValue.visible}`);
                
                node.parameterValue.text = newValue.toString();
                
                // ENSURE text is visible and properly anchored
                node.parameterValue.visible = true;
                node.parameterValue.alpha = 1.0;
                node.parameterValue.anchor.set(0, 0.5); // Reset anchor
                
                // FORCE text repositioning - DON'T change Y, only fix X if needed
                if (node.parameterInputData) {
                    const { inputX, inputY, inputHeight } = node.parameterInputData;
                    const padding = 4; // Same as spacing.parameter.inputPadding
                    
                    // Only reposition X if it's wrong, keep original Y
                    const expectedX = inputX + padding;
                    if (Math.abs(node.parameterValue.x - expectedX) > 1) {
                        node.parameterValue.x = expectedX;
                        console.log(`📍 Slider X repositioned to: ${node.parameterValue.x}`);
                    }
                    
                    console.log(`📍 SLIDER AFTER update: text="${node.parameterValue.text}", x=${node.parameterValue.x}, y=${node.parameterValue.y}, visible=${node.parameterValue.visible}`);
                } else {
                    console.warn(`⚠️ No parameterInputData found for slider repositioning`);
                }
            }
            
            // Trigger preview update
            this.triggerPreviewUpdate(node);
        };
        
        this.setupContainerEvents(container, node, param);
        
        document.body.appendChild(container);
        this.activeEditor = container;
        
        console.log(`📝 Slider editor created for ${param.label}`);
    }

    // GET EDITOR POSITION from event
    getEditorPosition(event) {
        const canvasRect = this.nodeSystem.app.view.getBoundingClientRect();
        const mouseX = event.data.global.x;
        const mouseY = event.data.global.y;
        
        return {
            x: canvasRect.left + mouseX,
            y: canvasRect.top + mouseY - 10
        };
    }

    // APPLY EDITOR STYLES
    applyEditorStyles(element, position, customStyles = {}) {
        const defaultStyles = {
            position: 'fixed',
            left: `${position.x - 40}px`,
            top: `${position.y}px`,
            backgroundColor: '#222222',
            border: '2px solid #00ff00', // Debug border
            borderRadius: '4px',
            color: '#ffffff',
            zIndex: '99999',
            outline: 'none',
            fontFamily: 'monospace',
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            pointerEvents: 'auto'
        };
        
        Object.assign(element.style, defaultStyles, customStyles);
    }

    // SETUP EDITOR EVENTS
    setupEditorEvents(editor, node, param, valueProcessor) {
        const updateValue = () => {
            const newValue = valueProcessor(editor.value);
            console.log(`💾 Updating ${param.label} from ${param.value} to ${newValue}`);
            
            param.value = newValue;
            
            // Update PIXI text display AND reposition properly
            if (node.parameterValue) {
                console.log(`🔍 BEFORE update: text="${node.parameterValue.text}", x=${node.parameterValue.x}, y=${node.parameterValue.y}, visible=${node.parameterValue.visible}`);
                
                node.parameterValue.text = newValue.toString();
                
                // ENSURE text is visible and properly anchored
                node.parameterValue.visible = true;
                node.parameterValue.alpha = 1.0;
                node.parameterValue.anchor.set(0, 0.5); // Reset anchor
                
                // FORCE text repositioning - DON'T change Y, only fix X if needed
                if (node.parameterInputData) {
                    const { inputX, inputY, inputHeight } = node.parameterInputData;
                    const padding = 4; // Same as spacing.parameter.inputPadding
                    
                    // Only reposition X if it's wrong, keep original Y
                    const expectedX = inputX + padding;
                    if (Math.abs(node.parameterValue.x - expectedX) > 1) {
                        node.parameterValue.x = expectedX;
                        console.log(`📍 X repositioned to: ${node.parameterValue.x}`);
                    }
                    
                    console.log(`📍 AFTER update: text="${node.parameterValue.text}", x=${node.parameterValue.x}, y=${node.parameterValue.y}, visible=${node.parameterValue.visible}`);
                } else {
                    console.warn(`⚠️ No parameterInputData found for repositioning`);
                }
            }
            
            // Trigger preview update
            this.triggerPreviewUpdate(node);
            
            this.hideEditor();
        };
        
        // Event handlers
        editor.addEventListener('blur', updateValue);
        editor.addEventListener('keydown', (e) => {
            console.log(`⌨️ Key pressed: ${e.key}`);
            if (e.key === 'Enter') {
                e.preventDefault();
                updateValue();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.hideEditor();
            }
            e.stopPropagation();
        });
        
        // Prevent canvas events
        editor.addEventListener('pointerdown', (e) => e.stopPropagation());
        editor.addEventListener('click', (e) => e.stopPropagation());
    }

    // SETUP CONTAINER EVENTS for complex editors
    setupContainerEvents(container, node, param) {
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeEditor === container) {
                this.hideEditor();
            }
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.activeEditor === container && !container.contains(e.target)) {
                this.hideEditor();
            }
        });
        
        // Prevent canvas events
        container.addEventListener('pointerdown', (e) => e.stopPropagation());
        container.addEventListener('click', (e) => e.stopPropagation());
    }

    // FOCUS EDITOR
    focusEditor(editor) {
        setTimeout(() => {
            editor.focus();
            if (editor.select) {
                editor.select();
            }
            console.log(`✅ Editor focused and selected`);
        }, 10);
    }

    // TRIGGER PREVIEW UPDATE
    triggerPreviewUpdate(node) {
        if (this.nodeSystem?.previewRenderer && this.nodeSystem.selectedNodes.has(node)) {
            this.nodeSystem.previewRenderer.onNodeSelected(node.definition);
        }
    }

    // HIDE EDITOR
    hideEditor() {
        if (this.activeEditor) {
            this.activeEditor.remove();
            this.activeEditor = null;
            console.log('🗑️ Parameter editor hidden');
        }
    }

    // CLEANUP on destroy
    destroy() {
        this.hideEditor();
        this.nodeSystem = null;
        console.log('🗑️ Parameter Editor System destroyed');
    }
}

// Export for use in main system
window.ParameterEditor = ParameterEditor;

console.log('📝 Parameter Editor System loaded');
