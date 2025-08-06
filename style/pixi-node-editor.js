/**
 * 🎨 NODE VISUAL EDITOR
 * Professional node design tool with gizmos and effects
 * Create custom node designs with layers, shapes, ports, and fields
 */

class NodeVisualEditor {
    constructor() {
        // Initialize PIXI application with default settings
        this.currentDPI = 2; // Default to 2x (Retina)
        this.currentAntialias = true;
        this.gridSize = 20;
        this.gridSnapEnabled = false;
        
        this.app = new PIXI.Application({
            width: window.innerWidth - 280, // Account for sidebar
            height: window.innerHeight,
            backgroundColor: 0x0f0f0f,
            antialias: this.currentAntialias,
            resolution: this.currentDPI
        });
        
        // Insert canvas BEFORE toolbar so toolbar stays on top
        const container = document.getElementById('canvas-container');
        container.insertBefore(this.app.view, container.firstChild);
        
        // Make sure canvas doesn't block other elements
        this.app.view.style.position = 'absolute';
        this.app.view.style.top = '0';
        this.app.view.style.left = '0';
        this.app.view.style.zIndex = '1';
        
        // Enable PIXI interaction (PIXI v7 syntax)
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        
        // Editor state
        this.currentTool = 'select';
        this.selectedLayer = null;
        this.layers = [];
        this.nextLayerId = 1;
        
        // Create grid background
        this.createGrid();
        
        // Node design container
        this.nodeContainer = new PIXI.Container();
        this.nodeContainer.x = this.app.screen.width / 2;
        this.nodeContainer.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.nodeContainer);
        
        // Gizmo container (always on top)
        this.gizmoContainer = new PIXI.Container();
        this.app.stage.addChild(this.gizmoContainer);
        
        // Initialize base node
        this.initializeBaseNode();
        
        // Setup UI interactions
        this.setupToolbar();
        this.setupPropertyPanels();
        this.setupInteractions();
        
        // Setup auto-save
        this.setupAutoSave();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.app.renderer.resize(
                window.innerWidth - 280,
                window.innerHeight
            );
            this.nodeContainer.x = this.app.screen.width / 2;
            this.nodeContainer.y = this.app.screen.height / 2;
            
            // Recreate grid for new size
            if (this.gridGraphics) {
                this.app.stage.removeChild(this.gridGraphics);
                this.createGrid();
            }
            
            this.updateGizmos();
        });
        
        // Start render loop
        this.app.ticker.add(() => this.update());
    }
    
    initializeBaseNode() {
        // Create base shape layer
        const baseLayer = {
            id: 'base',
            type: 'shape',
            name: 'Base Shape',
            graphics: new PIXI.Graphics(),
            properties: {
                width: 120,
                height: 60,
                fillColor: 0x2a3a4a,
                borderRadius: 8,
                opacity: 1,
                glowStrength: 0,
                shadowStrength: 0.2,
                blurAmount: 0
            },
            visible: true,
            locked: false
        };
        
        // Make base layer interactive (PIXI v7 syntax)
        baseLayer.graphics.eventMode = 'static';
        baseLayer.graphics.cursor = 'pointer';
        
        this.nodeContainer.addChild(baseLayer.graphics);
        this.layers.push(baseLayer);
        this.selectedLayer = baseLayer;
        
        // Draw initial shape
        this.drawLayer(baseLayer);
        
        // Add title text layer
        const titleLayer = {
            id: 'title',
            type: 'text',
            name: 'Title',
            text: new PIXI.Text('Node', {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                fontWeight: 'bold'
            }),
            properties: {
                x: 0,
                y: -20,
                opacity: 1
            },
            visible: true,
            locked: false
        };
        
        titleLayer.text.anchor.set(0.5);
        titleLayer.text.position.set(0, -20);
        titleLayer.text.eventMode = 'static';
        titleLayer.text.cursor = 'pointer';
        
        this.nodeContainer.addChild(titleLayer.text);
        this.layers.push(titleLayer);
        
        // Select base layer and show gizmos
        this.updateGizmos();
    }
    
    createGrid() {
        const gridGraphics = new PIXI.Graphics();
        
        // Draw grid lines
        gridGraphics.lineStyle(1, 0x333333, 0.3);
        
        // Vertical lines
        for (let x = 0; x <= this.app.screen.width; x += this.gridSize) {
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, this.app.screen.height);
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.app.screen.height; y += this.gridSize) {
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(this.app.screen.width, y);
        }
        
        // Add center lines (more prominent)
        const centerX = this.app.screen.width / 2;
        const centerY = this.app.screen.height / 2;
        
        gridGraphics.lineStyle(1, 0x4a9eff, 0.5);
        
        // Center vertical line
        gridGraphics.moveTo(centerX, 0);
        gridGraphics.lineTo(centerX, this.app.screen.height);
        
        // Center horizontal line
        gridGraphics.moveTo(0, centerY);
        gridGraphics.lineTo(this.app.screen.width, centerY);
        
        // Add to stage at bottom
        this.app.stage.addChildAt(gridGraphics, 0);
        this.gridGraphics = gridGraphics;
    }
    
    drawLayer(layer) {
        if (layer.type === 'shape') {
            const g = layer.graphics;
            g.clear();
            
            // Apply effects (simplified for compatibility)
            const filters = [];
            
            if (layer.properties.blurAmount > 0) {
                const blur = new PIXI.BlurFilter(layer.properties.blurAmount);
                filters.push(blur);
            }
            
            // Note: DropShadowFilter and GlowFilter are not in base PIXI v7
            // For now, we'll simulate shadow with a second shape
            if (filters.length > 0) {
                g.filters = filters;
            }
            
            // Draw shape
            g.beginFill(layer.properties.fillColor, layer.properties.opacity);
            if (layer.properties.borderRadius > 0) {
                g.drawRoundedRect(
                    -layer.properties.width / 2,
                    -layer.properties.height / 2,
                    layer.properties.width,
                    layer.properties.height,
                    layer.properties.borderRadius
                );
            } else {
                g.drawRect(
                    -layer.properties.width / 2,
                    -layer.properties.height / 2,
                    layer.properties.width,
                    layer.properties.height
                );
            }
            g.endFill();
        }
        else if (layer.type === 'port') {
            const g = layer.graphics;
            g.clear();
            
            // Draw port circle
            g.beginFill(layer.properties.fillColor, layer.properties.opacity);
            g.drawCircle(0, 0, layer.properties.radius || 6);
            g.endFill();
            
            // Simulate glow with larger background circle
            if (layer.properties.glowStrength > 0) {
                g.beginFill(layer.properties.fillColor, layer.properties.glowStrength * 0.3);
                g.drawCircle(0, 0, (layer.properties.radius || 6) + 3);
                g.endFill();
            }
        }
        else if (layer.type === 'field') {
            const g = layer.graphics;
            g.clear();
            
            // Draw field background
            g.beginFill(0x0a0a0a, layer.properties.opacity);
            g.drawRoundedRect(
                -layer.properties.width / 2,
                -layer.properties.height / 2,
                layer.properties.width,
                layer.properties.height,
                4
            );
            g.endFill();
            
            // Draw field border
            g.lineStyle(1, 0x333333, layer.properties.opacity);
            g.drawRoundedRect(
                -layer.properties.width / 2,
                -layer.properties.height / 2,
                layer.properties.width,
                layer.properties.height,
                4
            );
        }
    }
    
    setupToolbar() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Set current tool
                this.currentTool = btn.dataset.tool;
                
                // Update cursor
                this.updateCursor();
            });
        });
    }
    
    setupPropertyPanels() {
        // Node properties
        const nodeWidth = document.getElementById('node-width');
        const nodeHeight = document.getElementById('node-height');
        
        nodeWidth.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = value;
            
            // Update base layer
            const baseLayer = this.layers.find(l => l.id === 'base');
            if (baseLayer) {
                baseLayer.properties.width = value;
                this.drawLayer(baseLayer);
                this.updateGizmos();
                this.autoSave();
            }
        });
        
        nodeHeight.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = value;
            
            // Update base layer
            const baseLayer = this.layers.find(l => l.id === 'base');
            if (baseLayer) {
                baseLayer.properties.height = value;
                this.drawLayer(baseLayer);
                this.updateGizmos();
                this.autoSave();
            }
        });
        
        // Layer properties
        const layerOpacity = document.getElementById('layer-opacity');
        const borderRadius = document.getElementById('border-radius');
        const glowStrength = document.getElementById('glow-strength');
        const shadowStrength = document.getElementById('shadow-strength');
        const blurAmount = document.getElementById('blur-amount');
        
        layerOpacity.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) / 100;
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            
            if (this.selectedLayer) {
                this.selectedLayer.properties.opacity = value;
                this.drawLayer(this.selectedLayer);
                this.autoSave();
            }
        });
        
        borderRadius.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = value;
            
            if (this.selectedLayer && this.selectedLayer.type === 'shape') {
                this.selectedLayer.properties.borderRadius = value;
                this.drawLayer(this.selectedLayer);
                this.autoSave();
            }
        });
        
        glowStrength.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) / 100;
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            
            if (this.selectedLayer) {
                this.selectedLayer.properties.glowStrength = value;
                this.drawLayer(this.selectedLayer);
                this.autoSave();
            }
        });
        
        shadowStrength.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) / 100;
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            
            if (this.selectedLayer) {
                this.selectedLayer.properties.shadowStrength = value;
                this.drawLayer(this.selectedLayer);
                this.autoSave();
            }
        });
        
        blurAmount.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = value;
            
            if (this.selectedLayer) {
                this.selectedLayer.properties.blurAmount = value;
                this.drawLayer(this.selectedLayer);
                this.autoSave();
            }
        });
        
        // Color picker
        const colorPicker = document.getElementById('color-picker');
        const colorHex = document.getElementById('color-hex');
        
        colorPicker.addEventListener('input', (e) => {
            const hex = e.target.value;
            colorHex.value = hex;
            
            if (this.selectedLayer) {
                const color = parseInt(hex.replace('#', '0x'));
                this.selectedLayer.properties.fillColor = color;
                this.drawLayer(this.selectedLayer);
                this.autoSave();
            }
        });
        
        colorHex.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                colorPicker.value = hex;
                
                if (this.selectedLayer) {
                    const color = parseInt(hex.replace('#', '0x'));
                    this.selectedLayer.properties.fillColor = color;
                    this.drawLayer(this.selectedLayer);
                    this.autoSave();
                }
            }
        });
        
        // Text properties
        const fontSize = document.getElementById('font-size');
        const fontFamily = document.getElementById('font-family');
        const fontWeight = document.getElementById('font-weight');
        const textContent = document.getElementById('text-content');
        
        fontSize.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${value}px`;
            
            if (this.selectedLayer && this.selectedLayer.type === 'text') {
                this.selectedLayer.text.style.fontSize = value;
                this.autoSave();
            }
        });
        
        fontFamily.addEventListener('change', (e) => {
            if (this.selectedLayer && this.selectedLayer.type === 'text') {
                // Create fallback font stacks for better compatibility
                const fontStacks = {
                    'Roboto': 'Roboto, Arial, sans-serif',
                    'Open Sans': 'Open Sans, Arial, sans-serif',
                    'Lato': 'Lato, Arial, sans-serif',
                    'Ubuntu': 'Ubuntu, Arial, sans-serif',
                    'Segoe UI': 'Segoe UI, Arial, sans-serif',
                    'Merriweather': 'Merriweather, Georgia, serif',
                    'Playfair Display': 'Playfair Display, Georgia, serif',
                    'Consolas': 'Consolas, Monaco, monospace',
                    'Monaco': 'Monaco, Consolas, monospace',
                    'Fira Code': 'Fira Code, Consolas, monospace',
                    'Source Code Pro': 'Source Code Pro, Consolas, monospace',
                    'JetBrains Mono': 'JetBrains Mono, Consolas, monospace',
                    'Inconsolata': 'Inconsolata, Consolas, monospace',
                    'Oswald': 'Oswald, Arial, sans-serif',
                    'Montserrat': 'Montserrat, Arial, sans-serif',
                    'Poppins': 'Poppins, Arial, sans-serif',
                    'Nunito': 'Nunito, Arial, sans-serif'
                };
                
                const fontFamily = fontStacks[e.target.value] || e.target.value;
                this.selectedLayer.text.style.fontFamily = fontFamily;
                this.autoSave();
            }
        });
        
        fontWeight.addEventListener('change', (e) => {
            if (this.selectedLayer && this.selectedLayer.type === 'text') {
                this.selectedLayer.text.style.fontWeight = e.target.value;
                this.autoSave();
            }
        });
        
        textContent.addEventListener('input', (e) => {
            if (this.selectedLayer && this.selectedLayer.type === 'text') {
                this.selectedLayer.text.text = e.target.value;
                this.updateGizmos();
                this.autoSave();
            }
        });
        
        // Add layer button
        document.querySelector('.add-layer-btn').addEventListener('click', () => {
            this.addNewLayer();
        });
        
        // Manual save button
        document.getElementById('manual-save-btn').addEventListener('click', () => {
            this.manualSave();
        });
        
        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportDesign();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetCanvas();
        });
        
        // Font style controls
        const fontStyle = document.getElementById('font-style');
        const letterSpacing = document.getElementById('letter-spacing');
        const lineHeight = document.getElementById('line-height');
        
        fontStyle.addEventListener('change', (e) => {
            if (this.selectedLayer && this.selectedLayer.type === 'text') {
                this.selectedLayer.text.style.fontStyle = e.target.value;
                this.autoSave();
            }
        });
        
        letterSpacing.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = value;
            
            if (this.selectedLayer && this.selectedLayer.type === 'text') {
                this.selectedLayer.text.style.letterSpacing = value;
                this.autoSave();
            }
        });
        
        lineHeight.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = value;
            
            if (this.selectedLayer && this.selectedLayer.type === 'text') {
                this.selectedLayer.text.style.lineHeight = value;
                this.autoSave();
            }
        });
        
        // Text alignment buttons
        document.querySelectorAll('[data-align]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.selectedLayer && this.selectedLayer.type === 'text') {
                    const align = btn.dataset.align;
                    this.selectedLayer.text.style.align = align;
                    this.selectedLayer.text.anchor.x = align === 'left' ? 0 : align === 'right' ? 1 : 0.5;
                    this.autoSave();
                }
            });
        });
        
        // Alignment tools
        this.setupAlignmentTools();
        
        // Canvas settings
        this.setupCanvasControls();
    }
    
    setupAlignmentTools() {
        // Alignment buttons
        document.getElementById('align-left')?.addEventListener('click', () => {
            if (this.selectedLayer) this.alignLayer('left');
        });
        document.getElementById('align-center-h')?.addEventListener('click', () => {
            if (this.selectedLayer) this.alignLayer('center-h');
        });
        document.getElementById('align-right')?.addEventListener('click', () => {
            if (this.selectedLayer) this.alignLayer('right');
        });
        document.getElementById('align-top')?.addEventListener('click', () => {
            if (this.selectedLayer) this.alignLayer('top');
        });
        document.getElementById('align-center-v')?.addEventListener('click', () => {
            if (this.selectedLayer) this.alignLayer('center-v');
        });
        document.getElementById('align-bottom')?.addEventListener('click', () => {
            if (this.selectedLayer) this.alignLayer('bottom');
        });
        
        // Distribution buttons
        document.getElementById('distribute-h')?.addEventListener('click', () => {
            this.distributeSelected('horizontal');
        });
        document.getElementById('distribute-v')?.addEventListener('click', () => {
            this.distributeSelected('vertical');
        });
        
        // Layer order buttons
        document.getElementById('bring-front')?.addEventListener('click', () => {
            if (this.selectedLayer) this.bringToFront(this.selectedLayer);
        });
        document.getElementById('bring-forward')?.addEventListener('click', () => {
            if (this.selectedLayer) this.bringForward(this.selectedLayer);
        });
        document.getElementById('send-backward')?.addEventListener('click', () => {
            if (this.selectedLayer) this.sendBackward(this.selectedLayer);
        });
        document.getElementById('send-back')?.addEventListener('click', () => {
            if (this.selectedLayer) this.sendToBack(this.selectedLayer);
        });
    }
    
    setupCanvasControls() {
        // DPI/Resolution control
        document.getElementById('canvas-dpi')?.addEventListener('change', (e) => {
            this.currentDPI = parseFloat(e.target.value);
            this.updateCanvasResolution();
        });
        
        // Anti-aliasing control
        document.getElementById('canvas-antialias')?.addEventListener('change', (e) => {
            this.currentAntialias = e.target.value === 'true';
            this.updateCanvasResolution();
        });
        
        // Grid size control
        document.getElementById('grid-size')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${value}px`;
            this.gridSize = value;
            this.recreateGrid();
        });
        
        // Grid snap control
        document.getElementById('grid-snap')?.addEventListener('change', (e) => {
            this.gridSnapEnabled = e.target.checked;
        });
    }
    
    alignLayer(alignment) {
        if (!this.selectedLayer) return;
        
        const centerX = 0; // Node container center
        const centerY = 0;
        
        switch (alignment) {
            case 'left':
                if (this.selectedLayer.graphics) {
                    this.selectedLayer.graphics.x = -this.layers[0].properties.width / 2 + (this.selectedLayer.properties.width || 20) / 2;
                } else if (this.selectedLayer.text) {
                    this.selectedLayer.text.x = -this.layers[0].properties.width / 2;
                }
                break;
            case 'center-h':
                if (this.selectedLayer.graphics) {
                    this.selectedLayer.graphics.x = centerX;
                } else if (this.selectedLayer.text) {
                    this.selectedLayer.text.x = centerX;
                }
                break;
            case 'right':
                if (this.selectedLayer.graphics) {
                    this.selectedLayer.graphics.x = this.layers[0].properties.width / 2 - (this.selectedLayer.properties.width || 20) / 2;
                } else if (this.selectedLayer.text) {
                    this.selectedLayer.text.x = this.layers[0].properties.width / 2;
                }
                break;
            case 'top':
                if (this.selectedLayer.graphics) {
                    this.selectedLayer.graphics.y = -this.layers[0].properties.height / 2 + (this.selectedLayer.properties.height || 20) / 2;
                } else if (this.selectedLayer.text) {
                    this.selectedLayer.text.y = -this.layers[0].properties.height / 2;
                }
                break;
            case 'center-v':
                if (this.selectedLayer.graphics) {
                    this.selectedLayer.graphics.y = centerY;
                } else if (this.selectedLayer.text) {
                    this.selectedLayer.text.y = centerY;
                }
                break;
            case 'bottom':
                if (this.selectedLayer.graphics) {
                    this.selectedLayer.graphics.y = this.layers[0].properties.height / 2 - (this.selectedLayer.properties.height || 20) / 2;
                } else if (this.selectedLayer.text) {
                    this.selectedLayer.text.y = this.layers[0].properties.height / 2;
                }
                break;
        }
        
        this.updateGizmos();
        this.autoSave();
    }
    
    distributeSelected(direction) {
        // Implementation for distributing multiple selected objects
        console.log('Distribute:', direction);
    }
    
    bringToFront(layer) {
        const index = this.layers.indexOf(layer);
        if (index > -1 && index < this.layers.length - 1) {
            this.layers.splice(index, 1);
            this.layers.push(layer);
            
            if (layer.graphics) {
                this.nodeContainer.removeChild(layer.graphics);
                this.nodeContainer.addChild(layer.graphics);
            }
            if (layer.text) {
                this.nodeContainer.removeChild(layer.text);
                this.nodeContainer.addChild(layer.text);
            }
            
            this.updateLayersList();
            this.autoSave();
        }
    }
    
    bringForward(layer) {
        const index = this.layers.indexOf(layer);
        if (index > -1 && index < this.layers.length - 1) {
            [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
            this.updateLayersList();
            this.autoSave();
        }
    }
    
    sendBackward(layer) {
        const index = this.layers.indexOf(layer);
        if (index > 0) {
            [this.layers[index], this.layers[index - 1]] = [this.layers[index - 1], this.layers[index]];
            this.updateLayersList();
            this.autoSave();
        }
    }
    
    sendToBack(layer) {
        const index = this.layers.indexOf(layer);
        if (index > 0) {
            this.layers.splice(index, 1);
            this.layers.unshift(layer);
            this.updateLayersList();
            this.autoSave();
        }
    }
    
    updateCanvasResolution() {
        // Recreate PIXI app with new settings
        const oldView = this.app.view;
        this.app.destroy(true);
        
        this.app = new PIXI.Application({
            width: window.innerWidth - 280,
            height: window.innerHeight,
            backgroundColor: 0x0f0f0f,
            antialias: this.currentAntialias,
            resolution: this.currentDPI
        });
        
        // Replace canvas
        const container = document.getElementById('canvas-container');
        container.replaceChild(this.app.view, oldView);
        
        // Recreate everything
        this.createGrid();
        this.nodeContainer = new PIXI.Container();
        this.nodeContainer.x = this.app.screen.width / 2 + this.cameraOffset.x;
        this.nodeContainer.y = this.app.screen.height / 2 + this.cameraOffset.y;
        this.app.stage.addChild(this.nodeContainer);
        
        this.gizmoContainer = new PIXI.Container();
        this.app.stage.addChild(this.gizmoContainer);
        
        // Recreate all layers
        this.layers.forEach(layer => {
            if (layer.graphics) {
                this.nodeContainer.addChild(layer.graphics);
            }
            if (layer.text) {
                this.nodeContainer.addChild(layer.text);
            }
        });
        
        // Reapply interactions
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        this.setupInteractions();
        this.updateGizmos();
    }
    
    recreateGrid() {
        if (this.gridGraphics) {
            this.app.stage.removeChild(this.gridGraphics);
        }
        this.createGrid();
    }
    
    setupInteractions() {
        // Initialize drag state
        this.isDragging = false;
        this.dragTarget = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Pan state
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.cameraOffset = { x: 0, y: 0 };
        
        // Stage-level interactions for tool usage
        this.app.stage.on('pointerdown', (e) => {
            const pos = e.data.global;
            
            console.log('Stage pointer down:', pos, 'Button:', e.data.originalEvent.button, 'Space pressed:', this.spacePressed);
            
            // Check if middle mouse button or space+click for panning
            if (e.data.originalEvent.button === 1 || (e.data.originalEvent.button === 0 && this.spacePressed)) {
                this.startPanning(pos.x, pos.y);
                e.stopPropagation();
                return;
            }
            
            const localPos = this.nodeContainer.toLocal(pos);
            this.onPointerDown({ x: localPos.x, y: localPos.y, originalEvent: e });
        });
        
        this.app.stage.on('pointermove', (e) => {
            const pos = e.data.global;
            
            if (this.isPanning) {
                this.updatePanning(pos.x, pos.y);
                e.stopPropagation();
                return;
            }
            
            if (this.isDragging || this.dragTarget) {
                const localPos = this.nodeContainer.toLocal(pos);
                this.onPointerMove({ x: localPos.x, y: localPos.y, originalEvent: e });
            }
        });
        
        this.app.stage.on('pointerup', (e) => {
            if (this.isPanning) {
                this.stopPanning();
                e.stopPropagation();
                return;
            }
            this.onPointerUp(e);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.selectedLayer && this.selectedLayer.id !== 'base') {
                this.deleteLayer(this.selectedLayer);
            }
            
            // Space key for panning
            if (e.key === ' ') {
                e.preventDefault();
                this.spacePressed = true;
                this.app.view.style.cursor = 'grab';
            }
            
            // ESC key to deselect
            if (e.key === 'Escape') {
                this.selectedLayer = null;
                this.updateGizmos();
                this.updateLayersList();
                this.updatePropertyPanel();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === ' ') {
                this.spacePressed = false;
                this.updateCursor();
            }
        });
    }
    
    onPointerDown(e) {
        const x = e.x;
        const y = e.y;
        
        console.log('Pointer down at:', x, y, 'Tool:', this.currentTool);
        
        if (this.currentTool === 'select') {
            // Check for gizmo interaction first
            const gizmoHit = this.checkGizmoHit(x, y);
            if (gizmoHit) {
                this.startGizmoDrag(gizmoHit, x, y);
                return;
            }
            
            // Check for layer selection
            const layer = this.getLayerAt(x, y);
            if (layer) {
                this.selectLayer(layer);
                // Start drag with proper coordinates
                this.isDragging = true;
                this.dragTarget = {
                    type: 'move',
                    layer: layer,
                    startX: x,
                    startY: y,
                    originalX: layer.graphics ? layer.graphics.x : layer.text.x,
                    originalY: layer.graphics ? layer.graphics.y : layer.text.y
                };
            } else {
                // Deselect when clicking empty space
                this.selectedLayer = null;
                this.updateGizmos();
                this.updateLayersList();
                this.updatePropertyPanel();
            }
        }
        else if (this.currentTool === 'rectangle') {
            this.createRectangle(x, y);
        }
        else if (this.currentTool === 'circle') {
            this.createCircle(x, y);
        }
        else if (this.currentTool === 'port') {
            this.createPort(x, y);
        }
        else if (this.currentTool === 'field') {
            this.createField(x, y);
        }
        else if (this.currentTool === 'text') {
            this.createText(x, y);
        }
        else if (this.currentTool === 'delete') {
            this.deleteLayerAt(x, y);
        }
    }
    
    onPointerMove(e) {
        const x = e.x;
        const y = e.y;
        
        if (this.isDragging && this.dragTarget) {
            if (this.dragTarget.type === 'resize') {
                this.handleResize(x, y);
            } else if (this.dragTarget.type === 'move') {
                this.handleMove(x, y);
            }
        }
    }
    
    onPointerUp(e) {
        // Update gizmos after drag operation is complete
        if (this.isDragging && this.selectedLayer) {
            this.updateGizmos();
        }
        
        this.isDragging = false;
        this.dragTarget = null;
    }
    
    createRectangle(x, y) {
        const layer = {
            id: `layer_${this.nextLayerId++}`,
            type: 'shape',
            name: 'Rectangle',
            graphics: new PIXI.Graphics(),
            properties: {
                x: x,
                y: y,
                width: 80,
                height: 40,
                fillColor: 0x4a9eff,
                borderRadius: 4,
                opacity: 1,
                glowStrength: 0,
                shadowStrength: 0,
                blurAmount: 0
            },
            visible: true,
            locked: false
        };
        
        layer.graphics.position.set(x, y);
        layer.graphics.eventMode = 'static';
        layer.graphics.cursor = 'pointer';
        this.nodeContainer.addChild(layer.graphics);
        this.layers.push(layer);
        this.drawLayer(layer);
        this.selectLayer(layer);
        this.updateLayersList();
    }
    
    createCircle(x, y) {
        const layer = {
            id: `layer_${this.nextLayerId++}`,
            type: 'shape',
            name: 'Circle',
            graphics: new PIXI.Graphics(),
            properties: {
                x: x,
                y: y,
                width: 60,
                height: 60,
                fillColor: 0xff4a4a,
                borderRadius: 30,
                opacity: 1,
                glowStrength: 0,
                shadowStrength: 0,
                blurAmount: 0
            },
            visible: true,
            locked: false
        };
        
        layer.graphics.position.set(x, y);
        layer.graphics.eventMode = 'static';
        layer.graphics.cursor = 'pointer';
        this.nodeContainer.addChild(layer.graphics);
        this.layers.push(layer);
        this.drawLayer(layer);
        this.selectLayer(layer);
        this.updateLayersList();
    }
    
    createPort(x, y) {
        const layer = {
            id: `layer_${this.nextLayerId++}`,
            type: 'port',
            name: 'Port',
            graphics: new PIXI.Graphics(),
            properties: {
                x: x,
                y: y,
                radius: 6,
                fillColor: 0x4aff9e,
                opacity: 1,
                glowStrength: 0.3
            },
            visible: true,
            locked: false
        };
        
        layer.graphics.position.set(x, y);
        layer.graphics.eventMode = 'static';
        layer.graphics.cursor = 'pointer';
        this.nodeContainer.addChild(layer.graphics);
        this.layers.push(layer);
        this.drawLayer(layer);
        this.selectLayer(layer);
        this.updateLayersList();
    }
    
    createField(x, y) {
        const layer = {
            id: `layer_${this.nextLayerId++}`,
            type: 'field',
            name: 'Field',
            graphics: new PIXI.Graphics(),
            properties: {
                x: x,
                y: y,
                width: 80,
                height: 24,
                fillColor: 0x0a0a0a,
                opacity: 1
            },
            visible: true,
            locked: false
        };
        
        layer.graphics.position.set(x, y);
        layer.graphics.eventMode = 'static';
        layer.graphics.cursor = 'pointer';
        this.nodeContainer.addChild(layer.graphics);
        this.layers.push(layer);
        this.drawLayer(layer);
        this.selectLayer(layer);
        this.updateLayersList();
    }
    
    createText(x, y) {
        const layer = {
            id: `layer_${this.nextLayerId++}`,
            type: 'text',
            name: 'Text',
            text: new PIXI.Text('Label', {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xcccccc
            }),
            properties: {
                x: x,
                y: y,
                opacity: 1
            },
            visible: true,
            locked: false
        };
        
        layer.text.anchor.set(0.5);
        layer.text.position.set(x, y);
        layer.text.eventMode = 'static';
        layer.text.cursor = 'pointer';
        this.nodeContainer.addChild(layer.text);
        this.layers.push(layer);
        this.selectLayer(layer);
        this.updateLayersList();
    }
    
    selectLayer(layer) {
        this.selectedLayer = layer;
        this.updateGizmos();
        this.updateLayersList();
        this.updatePropertyPanel();
    }
    
    getLayerAt(x, y) {
        // Check layers from top to bottom
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (!layer.visible || layer.locked) continue;
            
            if (this.isPointInLayer(x, y, layer)) {
                return layer;
            }
        }
        return null;
    }
    
    isPointInLayer(x, y, layer) {
        if (layer.type === 'shape' || layer.type === 'field') {
            const halfWidth = layer.properties.width / 2;
            const halfHeight = layer.properties.height / 2;
            const lx = layer.graphics.x;
            const ly = layer.graphics.y;
            
            return x >= lx - halfWidth && x <= lx + halfWidth &&
                   y >= ly - halfHeight && y <= ly + halfHeight;
        }
        else if (layer.type === 'port') {
            const dx = x - layer.graphics.x;
            const dy = y - layer.graphics.y;
            return Math.sqrt(dx * dx + dy * dy) <= layer.properties.radius;
        }
        else if (layer.type === 'text') {
            const bounds = layer.text.getBounds();
            return bounds.contains(x + this.nodeContainer.x, y + this.nodeContainer.y);
        }
        
        return false;
    }
    
    updateGizmos() {
        // Clear existing gizmos from BOTH containers
        this.gizmoContainer.removeChildren();
        this.gizmoHandles = [];
        
        // Remove any gizmo elements from nodeContainer (safe iteration)
        const gizmoChildren = this.nodeContainer.children.filter(child => child.isGizmo);
        gizmoChildren.forEach(gizmo => {
            this.nodeContainer.removeChild(gizmo);
        });
        
        if (!this.selectedLayer || this.selectedLayer.locked) return;
        
        // Create selection outline with professional styling
        const outline = new PIXI.Graphics();
        outline.lineStyle(1, 0x4a9eff, 0.8); // Thinner line, lower opacity
        outline.isGizmo = true; // Mark as gizmo for cleanup
        
        if (this.selectedLayer.type === 'shape' || this.selectedLayer.type === 'field') {
            const x = this.selectedLayer.graphics.x;
            const y = this.selectedLayer.graphics.y;
            const halfWidth = this.selectedLayer.properties.width / 2;
            const halfHeight = this.selectedLayer.properties.height / 2;
            
            // Draw outline in local space
            outline.drawRect(
                x - halfWidth - 2,
                y - halfHeight - 2,
                this.selectedLayer.properties.width + 4,
                this.selectedLayer.properties.height + 4
            );
            
            // Add resize handles
            this.createResizeHandles(x, y, halfWidth, halfHeight);
        }
        else if (this.selectedLayer.type === 'port') {
            const x = this.selectedLayer.graphics.x;
            const y = this.selectedLayer.graphics.y;
            const radius = this.selectedLayer.properties.radius;
            
            outline.drawCircle(x, y, radius + 4);
        }
        else if (this.selectedLayer.type === 'text') {
            const x = this.selectedLayer.text.x;
            const y = this.selectedLayer.text.y;
            const bounds = this.selectedLayer.text.getLocalBounds();
            
            outline.drawRect(
                x + bounds.x - 2,
                y + bounds.y - 2,
                bounds.width + 4,
                bounds.height + 4
            );
        }
        
        // Add outline to nodeContainer (same coordinate space as nodes)
        this.nodeContainer.addChild(outline);
    }
    
    createResizeHandles(x, y, halfWidth, halfHeight) {
        const handleSize = 6; // Smaller, more professional
        const handles = [
            { x: x - halfWidth, y: y - halfHeight, cursor: 'nw-resize', type: 'tl' },
            { x: x + halfWidth, y: y - halfHeight, cursor: 'ne-resize', type: 'tr' },
            { x: x - halfWidth, y: y + halfHeight, cursor: 'sw-resize', type: 'bl' },
            { x: x + halfWidth, y: y + halfHeight, cursor: 'se-resize', type: 'br' },
            { x: x, y: y - halfHeight, cursor: 'n-resize', type: 't' },
            { x: x, y: y + halfHeight, cursor: 's-resize', type: 'b' },
            { x: x - halfWidth, y: y, cursor: 'w-resize', type: 'l' },
            { x: x + halfWidth, y: y, cursor: 'e-resize', type: 'r' }
        ];
        
        handles.forEach(handleData => {
            const h = new PIXI.Graphics();
            
            // Professional styling with border and lower opacity
            h.lineStyle(1, 0x2a5bff, 0.9);
            h.beginFill(0x4a9eff, 0.7); // Lower opacity fill
            h.drawRect(-handleSize/2, -handleSize/2, handleSize, handleSize);
            h.endFill();
            
            h.position.set(handleData.x, handleData.y);
            h.isGizmo = true; // Mark as gizmo for cleanup
            
            // Store handle data for hit testing
            this.gizmoHandles.push({
                x: handleData.x,
                y: handleData.y,
                type: handleData.type,
                graphics: h
            });
            
            this.nodeContainer.addChild(h);
        });
    }
    
    handleResize(x, y) {
        if (!this.dragTarget || !this.dragTarget.layer) return;
        
        const layer = this.dragTarget.layer;
        const handle = this.dragTarget.handle;
        const centerX = layer.graphics.x;
        const centerY = layer.graphics.y;
        
        // Calculate new dimensions based on handle type
        if (handle.includes('r')) {
            layer.properties.width = Math.max(20, Math.abs(x - centerX) * 2);
        }
        if (handle.includes('l')) {
            layer.properties.width = Math.max(20, Math.abs(centerX - x) * 2);
        }
        if (handle.includes('b')) {
            layer.properties.height = Math.max(20, Math.abs(y - centerY) * 2);
        }
        if (handle.includes('t')) {
            layer.properties.height = Math.max(20, Math.abs(centerY - y) * 2);
        }
        
        this.drawLayer(layer);
        this.updateGizmos();
    }
    
    checkGizmoHit(x, y) {
        if (!this.selectedLayer || !this.gizmoHandles) return null;
        
        // Check each handle
        for (let handle of this.gizmoHandles) {
            const dx = x - handle.x;
            const dy = y - handle.y;
            if (Math.sqrt(dx * dx + dy * dy) < 10) {
                return handle;
            }
        }
        return null;
    }
    
    startGizmoDrag(handle, x, y) {
        this.isDragging = true;
        this.dragTarget = {
            type: 'resize',
            handle: handle.type,
            layer: this.selectedLayer,
            startX: x,
            startY: y,
            originalWidth: this.selectedLayer.properties.width,
            originalHeight: this.selectedLayer.properties.height
        };
    }
    
    handleMove(x, y) {
        if (!this.dragTarget || !this.dragTarget.layer) return;
        
        const dx = x - this.dragTarget.startX;
        const dy = y - this.dragTarget.startY;
        
        if (this.dragTarget.layer.graphics) {
            this.dragTarget.layer.graphics.x = this.dragTarget.originalX + dx;
            this.dragTarget.layer.graphics.y = this.dragTarget.originalY + dy;
        } else if (this.dragTarget.layer.text) {
            this.dragTarget.layer.text.x = this.dragTarget.originalX + dx;
            this.dragTarget.layer.text.y = this.dragTarget.originalY + dy;
        }
        
        // Only update gizmos after drag is complete to prevent trails
        // this.updateGizmos(); // Removed to prevent trail effect
    }
    
    deleteLayer(layer) {
        if (layer.id === 'base' || layer.id === 'title') return;
        
        // Remove from container
        if (layer.graphics) {
            this.nodeContainer.removeChild(layer.graphics);
        }
        if (layer.text) {
            this.nodeContainer.removeChild(layer.text);
        }
        
        // Remove from layers array
        const index = this.layers.indexOf(layer);
        if (index > -1) {
            this.layers.splice(index, 1);
        }
        
        // Clear selection if this was selected
        if (this.selectedLayer === layer) {
            this.selectedLayer = null;
            this.updateGizmos();
        }
        
        this.updateLayersList();
    }
    
    deleteLayerAt(x, y) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (!layer.visible || layer.locked) continue;
            
            if (this.isPointInLayer(x, y, layer)) {
                this.deleteLayer(layer);
                return;
            }
        }
    }
    
    updateLayersList() {
        const container = document.getElementById('layers-list');
        container.innerHTML = '';
        
        // Add layers in reverse order (top to bottom)
        [...this.layers].reverse().forEach(layer => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            if (layer === this.selectedLayer) {
                item.classList.add('selected');
            }
            item.dataset.layerId = layer.id;
            
            const icon = document.createElement('span');
            icon.className = 'layer-icon';
            icon.textContent = layer.type === 'shape' ? '□' : 
                             layer.type === 'port' ? '●' :
                             layer.type === 'field' ? '▬' :
                             layer.type === 'text' ? 'T' : '?';
            
            const name = document.createElement('span');
            name.className = 'layer-name';
            name.textContent = layer.name;
            
            const visibility = document.createElement('span');
            visibility.className = 'layer-visibility';
            visibility.textContent = layer.visible ? '👁' : '👁‍🗨';
            visibility.style.opacity = layer.visible ? '1' : '0.3';
            
            visibility.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                if (layer.graphics) layer.graphics.visible = layer.visible;
                if (layer.text) layer.text.visible = layer.visible;
                visibility.textContent = layer.visible ? '👁' : '👁‍🗨';
                visibility.style.opacity = layer.visible ? '1' : '0.3';
                this.autoSave();
            });
            
            // Add delete button (except for base and title layers)
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'layer-delete';
            deleteBtn.textContent = '✕';
            deleteBtn.title = 'Delete Layer';
            
            if (layer.id === 'base' || layer.id === 'title') {
                deleteBtn.style.display = 'none';
            } else {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteLayer(layer);
                });
            }
            
            item.appendChild(icon);
            item.appendChild(name);
            item.appendChild(visibility);
            item.appendChild(deleteBtn);
            
            item.addEventListener('click', () => {
                this.selectLayer(layer);
            });
            
            container.appendChild(item);
        });
    }
    
    updatePropertyPanel() {
        if (!this.selectedLayer) return;
        
        // Show/hide text panel
        const textPanel = document.getElementById('text-panel');
        if (this.selectedLayer.type === 'text') {
            textPanel.style.display = 'block';
            
            // Update text controls
            const fontSize = this.selectedLayer.text.style.fontSize || 14;
            document.getElementById('font-size').value = fontSize;
            document.getElementById('font-size').nextElementSibling.textContent = `${fontSize}px`;
            
            // Extract base font name from font family stack
            const fontFamily = this.selectedLayer.text.style.fontFamily || 'Arial';
            const baseFontName = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            document.getElementById('font-family').value = baseFontName;
            
            document.getElementById('font-weight').value = this.selectedLayer.text.style.fontWeight || 'normal';
            document.getElementById('font-style').value = this.selectedLayer.text.style.fontStyle || 'normal';
            document.getElementById('letter-spacing').value = this.selectedLayer.text.style.letterSpacing || 0;
            document.getElementById('line-height').value = this.selectedLayer.text.style.lineHeight || 1.2;
            document.getElementById('text-content').value = this.selectedLayer.text.text || 'Label';
            
            // Update slider displays
            document.getElementById('letter-spacing').nextElementSibling.textContent = this.selectedLayer.text.style.letterSpacing || 0;
            document.getElementById('line-height').nextElementSibling.textContent = this.selectedLayer.text.style.lineHeight || 1.2;
        } else {
            textPanel.style.display = 'none';
        }
        
        // Update color picker
        if (this.selectedLayer.properties.fillColor !== undefined) {
            const hex = '#' + this.selectedLayer.properties.fillColor.toString(16).padStart(6, '0');
            document.getElementById('color-picker').value = hex;
            document.getElementById('color-hex').value = hex;
        }
        
        // Update sliders based on selected layer
        if (this.selectedLayer.properties.opacity !== undefined) {
            document.getElementById('layer-opacity').value = this.selectedLayer.properties.opacity * 100;
            document.getElementById('layer-opacity').nextElementSibling.textContent = `${Math.round(this.selectedLayer.properties.opacity * 100)}%`;
        }
        
        if (this.selectedLayer.properties.borderRadius !== undefined) {
            document.getElementById('border-radius').value = this.selectedLayer.properties.borderRadius;
            document.getElementById('border-radius').nextElementSibling.textContent = this.selectedLayer.properties.borderRadius;
        }
        
        if (this.selectedLayer.properties.glowStrength !== undefined) {
            document.getElementById('glow-strength').value = this.selectedLayer.properties.glowStrength * 100;
            document.getElementById('glow-strength').nextElementSibling.textContent = `${Math.round(this.selectedLayer.properties.glowStrength * 100)}%`;
        }
        
        if (this.selectedLayer.properties.shadowStrength !== undefined) {
            document.getElementById('shadow-strength').value = this.selectedLayer.properties.shadowStrength * 100;
            document.getElementById('shadow-strength').nextElementSibling.textContent = `${Math.round(this.selectedLayer.properties.shadowStrength * 100)}%`;
        }
        
        if (this.selectedLayer.properties.blurAmount !== undefined) {
            document.getElementById('blur-amount').value = this.selectedLayer.properties.blurAmount;
            document.getElementById('blur-amount').nextElementSibling.textContent = this.selectedLayer.properties.blurAmount;
        }
    }
    
    addNewLayer() {
        const layerType = document.getElementById('layer-type').value;
        
        if (layerType === 'shape') {
            this.createRectangle(0, 0);
        } else if (layerType === 'port') {
            this.createPort(-40, 0);
        } else if (layerType === 'field') {
            this.createField(0, 20);
        } else if (layerType === 'text') {
            this.createText(0, -30);
        }
    }
    
    updateCursor() {
        const cursors = {
            select: 'default',
            rectangle: 'crosshair',
            circle: 'crosshair',
            port: 'crosshair',
            field: 'crosshair',
            text: 'text',
            delete: 'not-allowed'
        };
        
        if (!this.spacePressed) {
            this.app.view.style.cursor = cursors[this.currentTool] || 'default';
        }
    }
    
    startPanning(x, y) {
        console.log('Starting pan at:', x, y);
        this.isPanning = true;
        this.panStart.x = x;
        this.panStart.y = y;
        this.app.view.style.cursor = 'grabbing';
    }
    
    updatePanning(x, y) {
        if (!this.isPanning) return;
        
        console.log('Panning to:', x, y, 'from:', this.panStart.x, this.panStart.y);
        
        const dx = x - this.panStart.x;
        const dy = y - this.panStart.y;
        
        // Update camera offset
        this.cameraOffset.x += dx;
        this.cameraOffset.y += dy;
        
        // Apply to containers
        this.nodeContainer.x = (this.app.screen.width / 2) + this.cameraOffset.x;
        this.nodeContainer.y = (this.app.screen.height / 2) + this.cameraOffset.y;
        
        // Update grid position
        if (this.gridGraphics) {
            this.gridGraphics.x = this.cameraOffset.x;
            this.gridGraphics.y = this.cameraOffset.y;
        }
        
        // Update gizmos (but don't do it during panning to avoid lag)
        // this.updateGizmos();
        
        // Update pan start for next frame
        this.panStart.x = x;
        this.panStart.y = y;
    }
    
    stopPanning() {
        console.log('Stopping pan');
        this.isPanning = false;
        
        // Update gizmos after panning is done
        this.updateGizmos();
        
        // Auto-save pan position
        this.autoSave();
        
        if (this.spacePressed) {
            this.app.view.style.cursor = 'grab';
        } else {
            this.updateCursor();
        }
    }
    
    update() {
        // Update loop - no longer need preview updates
    }
    
    drawRoundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    setupAutoSave() {
        // Auto-save every 10 seconds
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 10000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
        
        // Load existing design if available
        this.loadAutoSave();
    }
    
    autoSave() {
        const design = this.getCurrentDesign();
        localStorage.setItem('nodeEditor_autoSave', JSON.stringify(design));
        
        // Update auto-save indicator
        const indicator = document.querySelector('div[style*="color: #4aff9e"]');
        if (indicator) {
            indicator.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                indicator.style.animation = '';
            }, 500);
        }
    }
    
    manualSave() {
        const design = this.getCurrentDesign();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        localStorage.setItem(`nodeDesign_${timestamp}`, JSON.stringify(design));
        
        // Show confirmation
        const btn = document.getElementById('manual-save-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Saved!';
        btn.style.background = '#4aff9e';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#222';
        }, 2000);
    }
    
    loadAutoSave() {
        const saved = localStorage.getItem('nodeEditor_autoSave');
        if (saved) {
            try {
                const design = JSON.parse(saved);
                
                // Restore camera position
                if (design.camera) {
                    this.cameraOffset.x = design.camera.offsetX || 0;
                    this.cameraOffset.y = design.camera.offsetY || 0;
                    
                    // Apply camera position
                    this.nodeContainer.x = (this.app.screen.width / 2) + this.cameraOffset.x;
                    this.nodeContainer.y = (this.app.screen.height / 2) + this.cameraOffset.y;
                    
                    // Update grid position
                    if (this.gridGraphics) {
                        this.gridGraphics.x = this.cameraOffset.x;
                        this.gridGraphics.y = this.cameraOffset.y;
                    }
                }
                
                // Restore node name
                if (design.name) {
                    document.getElementById('node-name').value = design.name;
                }
                
                console.log('Auto-save loaded:', design);
            } catch (e) {
                console.warn('Failed to load auto-save:', e);
            }
        }
    }
    
    getCurrentDesign() {
        return {
            name: document.getElementById('node-name').value,
            timestamp: Date.now(),
            camera: {
                offsetX: this.cameraOffset.x,
                offsetY: this.cameraOffset.y
            },
            layers: this.layers.map(layer => {
                const layerData = {
                    id: layer.id,
                    type: layer.type,
                    name: layer.name,
                    properties: { ...layer.properties },
                    visible: layer.visible,
                    locked: layer.locked
                };
                
                // Add text-specific data
                if (layer.type === 'text' && layer.text) {
                    layerData.textData = {
                        content: layer.text.text,
                        style: {
                            fontSize: layer.text.style.fontSize,
                            fontFamily: layer.text.style.fontFamily,
                            fontWeight: layer.text.style.fontWeight,
                            fill: layer.text.style.fill
                        },
                        position: {
                            x: layer.text.x,
                            y: layer.text.y
                        }
                    };
                }
                
                // Add graphics position
                if (layer.graphics) {
                    layerData.position = {
                        x: layer.graphics.x,
                        y: layer.graphics.y
                    };
                }
                
                return layerData;
            })
        };
    }
    
    exportDesign() {
        const design = this.getCurrentDesign();
        
        // Save to localStorage with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        localStorage.setItem(`nodeDesign_export_${timestamp}`, JSON.stringify(design));
        
        // Also log to console
        console.log('🎨 Exported Node Design:', design);
        
        // Show confirmation
        const btn = document.getElementById('export-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Exported!';
        btn.style.background = '#4aff9e';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#4a9eff';
        }, 2000);
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Node Visual Editor...');
    try {
        window.nodeEditor = new NodeVisualEditor();
        console.log('Node Visual Editor initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize Node Visual Editor:', error);
    }
});
