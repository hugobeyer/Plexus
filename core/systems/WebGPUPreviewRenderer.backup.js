/**
 * 🎨 WEBGPU PREVIEW RENDERER
 * 512x512 HDR preview window showing node textures
 * Renders procedural textures from node fragment shaders
 */

class WebGPUPreviewRenderer {
    constructor() {
        this.canvas = null;
        this.device = null;
        this.context = null;
        this.renderPassDescriptor = null;
        this.currentNode = null;
        this.outputNode = null; // For showing output when no node selected
        this.nodeSystem = null; // Reference to main node system
        
        // RENDERING BACKEND DETECTION
        this.useWebGPU = false;
        this.gl = null; // WebGL context for fallback
        this.webglPrograms = new Map(); // WebGL shader programs
        
        // SIMPLE MODE - no heavy frameworks
        this.simpleMode = true;
        
        // HDR rendering setup
        this.format = 'rgba16float'; // HDR format for high precision
        this.size = 512;
        
        // Shader pipeline cache
        this.shaderPipelines = new Map();
        this.uniformBuffers = new Map();
        
        // Time for animation
        this.time = 0;
        this.lastFrameTime = 0;
        
        // FPS tracking
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        this.currentFPS = 0;
        
        console.log('🎨 WebGPU Preview Renderer initialized');
    }

    async initialize() {
        try {
            console.log('🔄 Initializing GPU Renderer...');
            
            // TRY WebGPU FIRST
            if (await this.tryWebGPU()) {
                this.useWebGPU = true;
                console.log('✅ Using WebGPU backend');
                return true;
            }
            
            // FALLBACK to WebGL
            if (await this.tryWebGL()) {
                this.useWebGPU = false;
                console.log('✅ Using WebGL fallback backend');
                return true;
            }
            
            throw new Error('No rendering backend available');
        } catch (error) {
            console.error('❌ GPU initialization failed:', error);
            return false;
        }
    }

    // TRY WebGPU INITIALIZATION
    async tryWebGPU() {
        try {
            console.log('🔄 Trying WebGPU...');
            
            // Check WebGPU support
            if (!navigator.gpu) {
                console.log('⚠️ WebGPU not supported');
                return false;
            }

            // Request adapter and device
            const adapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance'
            });
            
            if (!adapter) {
                console.log('⚠️ No WebGPU adapter found');
                return false;
            }

            this.device = await adapter.requestDevice({
                requiredFeatures: ['float32-filterable'],
                requiredLimits: {
                    maxTextureDimension2D: 2048
                }
            });

            // Create canvas and configure context
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.size;
            this.canvas.height = this.size;
            this.canvas.style.width = `${this.size}px`;
            this.canvas.style.height = `${this.size}px`;
            this.canvas.style.border = '2px solid #333';
            this.canvas.style.borderRadius = '8px';

            this.context = this.canvas.getContext('webgpu', { alpha: true });
            this.context.configure({
                device: this.device,
                format: this.format,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                alphaMode: 'premultiplied'
            });

            // Setup render pass
            this.renderPassDescriptor = {
                colorAttachments: [{
                    view: null, // Will be set each frame
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
            };

            return true;
        } catch (error) {
            console.log('⚠️ WebGPU failed:', error.message);
            return false;
        }
    }

    // TRY WebGL FALLBACK
    async tryWebGL() {
        try {
            console.log('🔄 Trying WebGL fallback...');
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.size;
            this.canvas.height = this.size;
            this.canvas.style.width = `${this.size}px`;
            this.canvas.style.height = `${this.size}px`;
            this.canvas.style.border = '2px solid #333';
            this.canvas.style.borderRadius = '8px';

            // Try WebGL2 first, then WebGL1
            this.gl = this.canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true }) ||
                     this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
            
            if (!this.gl) {
                console.log('⚠️ No WebGL context available');
                return false;
            }

            // Setup WebGL state
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.viewport(0, 0, this.size, this.size);

            console.log(`✅ WebGL${this.gl.constructor.name === 'WebGL2RenderingContext' ? '2' : '1'} context created`);
            return true;
        } catch (error) {
            console.log('⚠️ WebGL failed:', error.message);
            return false;
        }
    }

    // CREATE PREVIEW WINDOW in UI
    async createPreviewWindow() {
        // Load UI colors from palette
        const savedColors = this.loadSavedColors();
        
        // Create preview container with UI styles
        const previewContainer = document.createElement('div');
        previewContainer.id = 'preview-container';
        previewContainer.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: ${this.size + 20}px;
            height: ${this.size + 60}px;
            background: ${savedColors?.uiElements?.panelBackground || '#2a2a2a'};
            border: 1px solid ${savedColors?.uiElements?.panelBorder || '#555'};
            border-radius: 4px;
            padding: 0;
            z-index: 1000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.6);
            user-select: none;
            overflow: hidden;
            min-width: 200px;
            min-height: 200px;
            resize: both;
        `;

        // Title bar with drag handle and controls
        const titleBar = document.createElement('div');
        titleBar.id = 'preview-titlebar';
        titleBar.style.cssText = `
            background: ${savedColors?.uiElements?.headerBackground || '#333'};
            border-bottom: 1px solid ${savedColors?.uiElements?.panelBorder || '#555'};
            color: ${savedColors?.text?.primary || '#fff'};
            font-family: 'Courier New', monospace;
            font-size: 9px;
            font-weight: bold;
            padding: 4px 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 20px;
            box-sizing: border-box;
        `;

        // Title text
        const titleText = document.createElement('span');
        titleText.textContent = 'NODE PREVIEW';
        
        // FPS display
        const fpsDisplay = document.createElement('span');
        fpsDisplay.id = 'webgpu-fps-display';
        fpsDisplay.style.cssText = `
            color: ${savedColors?.text?.secondary || '#888'};
            font-size: 8px;
            margin-left: 6px;
            font-family: 'Courier New', monospace;
        `;
        fpsDisplay.textContent = '60';
        
        // Controls container
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 4px;
            align-items: center;
        `;

        // Collapse/Expand button
        const collapseBtn = this.createControlButton('−', 'Collapse Window');
        collapseBtn.id = 'webgpu-collapse-btn';
        
        // Zoom controls
        const zoomOut = this.createControlButton('−', 'Zoom Out');
        const zoomReset = this.createControlButton('◉', 'Reset Zoom');
        const zoomIn = this.createControlButton('+', 'Zoom In');
        
        // Close button
        const closeBtn = this.createControlButton('✕', 'Close Preview');
        closeBtn.style.color = '#ff6666';

        controls.appendChild(collapseBtn);
        controls.appendChild(zoomOut);
        controls.appendChild(zoomReset);
        controls.appendChild(zoomIn);
        controls.appendChild(closeBtn);

        // Title container with text and FPS
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            display: flex;
            align-items: center;
        `;
        titleContainer.appendChild(titleText);
        titleContainer.appendChild(fpsDisplay);
        
        titleBar.appendChild(titleContainer);
        titleBar.appendChild(controls);

        // Corner info overlays - positioned absolutely over canvas
        const cornerInfo = this.createCornerInfoOverlays(savedColors);

        // Canvas container with pan/zoom capabilities
        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'preview-canvas-container';
        canvasContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: calc(100% - 20px);
            overflow: hidden;
            background: #0a0a0a;
            cursor: grab;
        `;

        // Setup canvas with proper styling
        this.canvas.style.cssText = `
            position: absolute;
            border: none;
            border-radius: 4px;
            transform-origin: center center;
            transition: transform 0.1s ease-out;
            z-index: 2;
            pointer-events: none;
        `;

        // Initialize transform state with SMOOTH DAMPING like main canvas
        this.transform = {
            x: 10,
            y: 10,
            scale: 1,
            isDragging: false,
            lastX: 0,
            lastY: 0
        };
        
        // SMOOTH ANIMATION - target values for smooth interpolation
        this.targetTransform = {
            x: 10,
            y: 10,
            scale: 1
        };
        this.smoothingFactor = 0.15; // Same as main canvas
        this.animationRunning = false;
        
        // Window state
        this.isCollapsed = false;
        this.expandedHeight = this.size + 60;
        this.collapsedHeight = 20;

        // Add interaction handlers
        this.setupWindowInteractions(previewContainer, titleBar, canvasContainer, controls);

        // Assemble the window
        previewContainer.appendChild(titleBar);
        canvasContainer.appendChild(this.canvas);
        
        // Add corner info overlays to canvas container
        Object.values(cornerInfo).forEach(overlay => {
            canvasContainer.appendChild(overlay);
        });
        
        previewContainer.appendChild(canvasContainer);

        // Add to DOM
        document.body.appendChild(previewContainer);

        // CREATE PIXI GRID BACKGROUND
        await this.createGridBackground(canvasContainer);

        // Update canvas size and position
        this.updateCanvasTransform();

        // START SMOOTH ANIMATION LOOP like main canvas
        this.startSmoothAnimation();

        console.log('🖼️ Interactive preview window created');
        return previewContainer;
    }

    // CREATE PIXI GRID BACKGROUND
    async createGridBackground(container) {
        try {
            // Create PIXI app for grid overlay - PIXI v8 ASYNC INIT
            this.gridApp = new PIXI.Application();
            await this.gridApp.init({
                width: container.clientWidth,
                height: container.clientHeight,
                backgroundColor: 0x1a1a1a, // Slightly lighter gray for better contrast
                antialias: true,
                resolution: window.devicePixelRatio || 1
            });

            // Style grid canvas (v8 uses .canvas not .view)
            this.gridApp.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: auto;
            `;

            // Add grid canvas to container (behind WebGPU canvas)
            container.insertBefore(this.gridApp.canvas, container.firstChild);

            // LOAD BACKGROUND IMAGE first
            await this.loadBackgroundImage();

            // Create grid graphics
            this.createPixiGrid();

            // Add PIXI grid interactions for pan/zoom
            this.setupGridInteractions();

            console.log('📐 PIXI v8 grid background created with bg image');
        } catch (error) {
            console.error('❌ Failed to create PIXI grid background:', error);
        }
    }

    // CREATE TEXTURE OUTLINE ONLY (no grid)
    createPixiGrid() {
        const gridGraphics = new PIXI.Graphics();
        const width = this.gridApp.screen.width;
        const height = this.gridApp.screen.height;

        // ONLY ADD TEXTURE OUTLINE - 512x512 centered
        const textureSize = 512;
        const outlineX = (width - textureSize) / 2;
        const outlineY = (height - textureSize) / 2;
        
        gridGraphics.lineStyle(3, 0xffffff, 1.0); // WHITE outline for maximum visibility
        gridGraphics.drawRect(outlineX, outlineY, textureSize, textureSize);

        this.gridApp.stage.addChild(gridGraphics);
        this.gridGraphics = gridGraphics;
    }

    // CREATE SIMPLE DARK GRAY BACKGROUND
    async loadBackgroundImage() {
        // Skip texture loading - just use dark gray background
        // Background is already set via PIXI app backgroundColor: 0x0a0a0a
        console.log('🖼️ Using simple dark gray background');
    }

    // SETUP PIXI GRID INTERACTIONS with SMOOTH DAMPING like main canvas
    setupGridInteractions() {
        if (!this.gridApp || !this.gridApp.canvas) return;

        const canvas = this.gridApp.canvas;
        let isDragging = false;
        let lastX = 0, lastY = 0;

        // Mouse down - start dragging
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
        });

        // Mouse move - pan both grids (update TARGETS for smooth interpolation)
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                
                // Update TARGET transform for smooth animation
                this.targetTransform.x += dx;
                this.targetTransform.y += dy;
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        // Mouse up - stop dragging
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });

        // Mouse leave - stop dragging
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });

        // Wheel - ZOOM TO MOUSE POSITION like main canvas
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Get mouse position relative to canvas
            const rect = canvas.getBoundingClientRect();
            const mousePos = { 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
            };
            
            // Get world position BEFORE zoom (using CURRENT transform)
            const worldPosBefore = {
                x: (mousePos.x - this.transform.x) / this.transform.scale,
                y: (mousePos.y - this.transform.y) / this.transform.scale
            };
            
            // Apply zoom delta to TARGET (smooth)
            const delta = e.deltaY > 0 ? 0.9 : 1.1; // Same speed as main canvas
            this.targetTransform.scale = Math.max(0.1, Math.min(5.0, this.targetTransform.scale * delta));
            
            // Adjust target pan so SAME world point stays under mouse
            this.targetTransform.x = mousePos.x - (worldPosBefore.x * this.targetTransform.scale);
            this.targetTransform.y = mousePos.y - (worldPosBefore.y * this.targetTransform.scale);
        });

        console.log('🎮 PIXI grid interactions with smooth damping setup');
    }

    // SMOOTH ANIMATION LOOP - interpolates transform like main canvas
    startSmoothAnimation() {
        if (this.animationRunning) return;
        this.animationRunning = true;
        
        const animate = (currentTime) => {
            if (!this.animationRunning) return;
            
            // FPS CALCULATION
            this.frameCount++;
            if (currentTime - this.fpsUpdateTime >= 1000) { // Update every second
                this.currentFPS = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
                this.frameCount = 0;
                this.fpsUpdateTime = currentTime;
                
                // Update FPS display
                const fpsDisplay = document.getElementById('webgpu-fps-display');
                if (fpsDisplay) {
                    const color = this.currentFPS >= 55 ? '#4a9eff' : this.currentFPS >= 30 ? '#ffa500' : '#ff4444';
                    fpsDisplay.style.color = color;
                    fpsDisplay.textContent = `${this.currentFPS}`;
                }
                
                // Update zoom info
                const zoomInfo = document.getElementById('webgpu-zoom-info');
                if (zoomInfo) {
                    zoomInfo.textContent = `${Math.round(this.transform.scale * 100)}%`;
                }
            }
            
            // Interpolate scale (zoom)
            const scaleDiff = this.targetTransform.scale - this.transform.scale;
            if (Math.abs(scaleDiff) > 0.001) {
                this.transform.scale += scaleDiff * this.smoothingFactor;
            }
            
            // Interpolate position (pan)
            const xDiff = this.targetTransform.x - this.transform.x;
            const yDiff = this.targetTransform.y - this.transform.y;
            if (Math.abs(xDiff) > 0.1 || Math.abs(yDiff) > 0.1) {
                this.transform.x += xDiff * this.smoothingFactor;
                this.transform.y += yDiff * this.smoothingFactor;
            }
            
            // Apply smoothed transform to both canvases
            this.updateCanvasTransform();
            this.updateGridTransform();
            
            requestAnimationFrame(animate);
        };
        
        // Initialize FPS timing
        this.fpsUpdateTime = performance.now();
        animate(this.fpsUpdateTime);
        
        console.log('🎬 Smooth animation loop with FPS counter started');
    }

    // UPDATE GRID TRANSFORM to match WebGPU
    updateGridTransform() {
        if (!this.gridApp || !this.gridGraphics) return;
        
        // Update grid graphics transform (CURRENT values, not targets)
        this.gridGraphics.x = this.transform.x;
        this.gridGraphics.y = this.transform.y;
        this.gridGraphics.scale.set(this.transform.scale);
        
        // No background sprite to update - using solid color
    }

    // UPDATE BACKGROUND ON WINDOW RESIZE
    updateBackgroundOnResize() {
        // No background sprite to update - using solid color
        console.log('🔄 Window resized - no background update needed');
    }

    // SHOW GRID WITH NODE ICON (no connections)
    showGridWithIcon(node) {
        if (!this.device || !this.gridApp) return;
        
        // MAKE WebGPU canvas TRANSPARENT to show grid
        this.clearToTransparent();
        
        // Clear any existing icon
        if (this.nodeIconSprite) {
            this.gridApp.stage.removeChild(this.nodeIconSprite);
            this.nodeIconSprite = null;
        }
        
        // Update name display
        const nameDisplay = document.getElementById('preview-node-name');
        if (nameDisplay) {
            console.log(`🐛 DEBUG showGridWithIcon node:`, node);
            const nodeTitle = node.title || node.definition?.title || 'Unknown';
            const nodeCategory = node.category || node.definition?.category || 'misc';
            nameDisplay.textContent = `${nodeTitle} (${nodeCategory}) - No connections`;
        }
        
        // ADD NODE ICON to bottom right
        this.addNodeIcon(node);
        
        let nodeTitle = node.title || node.definition?.title || 'Unknown';
        
        // FAILSAFE: If we still get [object Object], force it to Unknown
        if (nodeTitle.toString().includes('[object') || typeof nodeTitle === 'object') {
            console.warn(`🚨 FAILSAFE: Got object instead of string for node title, forcing to Unknown`);
            nodeTitle = 'Unknown';
        }
        
        console.log(`📐 Showing grid for unconnected node: ${nodeTitle}`);
    }

    // SHOW GRID ONLY (no node/icon)
    showGridOnly() {
        if (!this.device || !this.gridApp) return;
        
        // RENDER 3D CUBE instead of just clearing
        this.renderCube();
        
        // Clear any existing icon
        if (this.nodeIconSprite) {
            this.gridApp.stage.removeChild(this.nodeIconSprite);
            this.nodeIconSprite = null;
        }
        
        // Update corner info
        const nodeInfo = document.getElementById('webgpu-node-info');
        if (nodeInfo) {
            nodeInfo.textContent = '3D Cube';
        }
        
        console.log(`🧊 Showing 3D cube (no node selected)`);
    }

    // ADD NODE ICON to grid view
    async addNodeIcon(node) {
        if (!this.gridApp) return;
        
        try {
            // Extract title safely from node structure
            console.log(`🐛 DEBUG addNodeIcon node:`, node);
            console.log(`🐛 DEBUG addNodeIcon node.title:`, node.title);
            console.log(`🐛 DEBUG addNodeIcon node.definition:`, node.definition);
            
            let nodeTitle = node.title || node.definition?.title || 'Unknown';
            
            // FAILSAFE: If we still get [object Object], force it to Unknown
            if (nodeTitle.toString().includes('[object') || typeof nodeTitle === 'object') {
                console.warn(`🚨 FAILSAFE: Got object instead of string for node title, forcing to Unknown`);
                nodeTitle = 'Unknown';
            }
            
            console.log(`🐛 DEBUG addNodeIcon nodeTitle:`, nodeTitle);
            
            // Build icon path
            const iconPath = `imgs/icons/icon_${nodeTitle}Node.svg`;
            console.log(`🐛 DEBUG addNodeIcon iconPath:`, iconPath);
            
            // Load icon texture
            const iconTexture = await PIXI.Assets.load(iconPath);
            
            // Create sprite
            this.nodeIconSprite = new PIXI.Sprite(iconTexture);
            
            // Position bottom right
            const padding = 20;
            this.nodeIconSprite.width = 48;
            this.nodeIconSprite.height = 48;
            this.nodeIconSprite.x = this.gridApp.screen.width - this.nodeIconSprite.width - padding;
            this.nodeIconSprite.y = this.gridApp.screen.height - this.nodeIconSprite.height - padding;
            
            // Semi-transparent
            this.nodeIconSprite.alpha = 0.6;
            
            // Add to grid stage
            this.gridApp.stage.addChild(this.nodeIconSprite);
            
            console.log(`🎨 Added icon for ${nodeTitle}`);
            
        } catch (error) {
            const nodeTitle = node.title || node.definition?.title || 'Unknown';
            console.warn(`⚠️ Failed to load icon for ${nodeTitle}:`, error);
        }
    }

    // CLEAR CANVAS TO TRANSPARENT
    clearToTransparent() {
        if (this.useWebGPU && this.device && this.context) {
            const commandEncoder = this.device.createCommandEncoder();
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: { r: 0, g: 0, b: 0, a: 0 }, // ALPHA = 0 for transparency
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
            });
            renderPass.end();
            this.device.queue.submit([commandEncoder.finish()]);
        } else if (!this.useWebGPU && this.gl) {
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
    }

    // RENDER 3D CUBE in center
    async renderCube() {
        if (this.useWebGPU) {
            return this.renderCubeWebGPU();
        } else {
            return this.renderCubeWebGL();
        }
    }

    // RENDER CUBE with WebGPU
    async renderCubeWebGPU() {
        if (!this.device) return;

        try {
            // Create or get cube pipeline
            let cubePipeline = this.shaderPipelines.get('cube');
            if (!cubePipeline) {
                cubePipeline = await this.createCubePipeline();
                if (!cubePipeline) return;
            }

            const { pipeline, bindGroup, uniformBuffer } = cubePipeline;

            // Update cube uniforms with rotation
            const cubeUniforms = new Float32Array([
                1.0, 0.5, 0.2,  // color: bright orange cube for visibility
                this.time,      // time for rotation
                1.0,           // glow intensity
                0.0, 0.0, 0.0  // padding
            ]);

            this.device.queue.writeBuffer(uniformBuffer, 0, cubeUniforms);

            // Begin render pass with opaque background for cube visibility
            const opaqueRenderPass = {
                colorAttachments: [{
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 }, // Dark opaque background
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
            };
            
            const commandEncoder = this.device.createCommandEncoder();
            const passEncoder = commandEncoder.beginRenderPass(opaqueRenderPass);
            
            passEncoder.setPipeline(pipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.draw(36); // 6 faces * 2 triangles * 3 vertices
            passEncoder.end();
            
            this.device.queue.submit([commandEncoder.finish()]);

            console.log('🧊 WebGPU Cube rendered');
        } catch (error) {
            console.error('❌ Failed to render cube:', error);
            this.clearToTransparent();
        }
    }

    // RENDER CUBE with WebGL FALLBACK
    async renderCubeWebGL() {
        if (!this.gl) return;

        try {
            // Get or create WebGL cube program
            let cubeProgram = this.webglPrograms.get('cube');
            if (!cubeProgram) {
                cubeProgram = this.createWebGLCubeProgram();
                if (!cubeProgram) return;
            }

            const { program, uniforms, buffers } = cubeProgram;

            // Clear with dark background
            this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.enable(this.gl.DEPTH_TEST);

            // Use shader program
            this.gl.useProgram(program);

            // Update uniforms
            this.gl.uniform3f(uniforms.color, 1.0, 0.5, 0.2); // Orange cube
            this.gl.uniform1f(uniforms.time, this.time);
            this.gl.uniform1f(uniforms.glowIntensity, 1.0);

            // Bind vertex buffer
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.vertices);
            this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(0);

            // Draw cube (36 vertices)
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);

            console.log('🧊 WebGL Cube rendered');
        } catch (error) {
            console.error('❌ Failed to render WebGL cube:', error);
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
    }

    // CREATE WebGL CUBE PROGRAM
    createWebGLCubeProgram() {
        try {
            // Vertex shader (GLSL)
            const vertexShaderSource = `
                attribute vec3 a_position;
                uniform float u_time;
                varying vec3 v_color;
                
                void main() {
                    vec3 pos = a_position;
                    
                    // Rotation
                    float cosX = cos(u_time * 0.5);
                    float sinX = sin(u_time * 0.5);
                    float cosY = cos(u_time * 0.3);
                    float sinY = sin(u_time * 0.3);
                    
                    // Rotate Y then X
                    vec3 rotated = vec3(
                        pos.x * cosY - pos.z * sinY,
                        pos.y,
                        pos.x * sinY + pos.z * cosY
                    );
                    rotated = vec3(
                        rotated.x,
                        rotated.y * cosX - rotated.z * sinX,
                        rotated.y * sinX + rotated.z * cosX
                    );
                    
                    // Scale and project
                    rotated *= 0.3;
                    gl_Position = vec4(rotated.x, rotated.y, 0.0, 1.0);
                    
                    // Face colors
                    v_color = vec3(1.0, 0.5, 0.2);
                    if (pos.z > 0.5) v_color *= 1.2;      // Front
                    else if (pos.z < -0.5) v_color *= 0.6; // Back
                    else if (pos.y > 0.5) v_color *= 1.0;  // Top
                    else if (pos.y < -0.5) v_color *= 0.8; // Bottom
                    else if (pos.x > 0.5) v_color *= 0.9;  // Right
                    else v_color *= 0.7;                   // Left
                }
            `;

            // Fragment shader (GLSL)
            const fragmentShaderSource = `
                precision mediump float;
                varying vec3 v_color;
                
                void main() {
                    gl_FragColor = vec4(v_color, 1.0);
                }
            `;

            // Compile shaders
            const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
            
            if (!vertexShader || !fragmentShader) return null;

            // Create program
            const program = this.gl.createProgram();
            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);
            this.gl.linkProgram(program);

            if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                console.error('WebGL program link error:', this.gl.getProgramInfoLog(program));
                return null;
            }

            // Get uniform locations
            const uniforms = {
                color: this.gl.getUniformLocation(program, 'u_color'),
                time: this.gl.getUniformLocation(program, 'u_time'),
                glowIntensity: this.gl.getUniformLocation(program, 'u_glowIntensity')
            };

            // Create cube geometry
            const cubeVertices = new Float32Array([
                // Front face
                -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0,
                 1.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0,
                // Back face
                -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,
                 1.0,  1.0, -1.0,  1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
                // Top face
                -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,
                 1.0,  1.0,  1.0,  1.0,  1.0, -1.0, -1.0,  1.0, -1.0,
                // Bottom face
                -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0,
                 1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0, -1.0, -1.0,
                // Right face
                 1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,
                 1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0,
                // Left face
                -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0,
                -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0, -1.0, -1.0
            ]);

            // Create vertex buffer
            const vertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, cubeVertices, this.gl.STATIC_DRAW);

            const programData = {
                program,
                uniforms,
                buffers: { vertices: vertexBuffer }
            };

            this.webglPrograms.set('cube', programData);
            console.log('✅ WebGL cube program created');
            
            return programData;
        } catch (error) {
            console.error('❌ Failed to create WebGL cube program:', error);
            return null;
        }
    }

    // COMPILE WebGL SHADER
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // CREATE WebGL NODE PROGRAM for shader rendering
    createWebGLNodeProgram(node, nodeKey) {
        try {
            console.log(`🔨 Creating WebGL program for: ${nodeKey}`);

            // Get WGSL shader and convert to GLSL
            const wgslShader = this.getWGSLShader(node);
            const glslFragment = this.convertWGSLToGLSL(wgslShader);

            // Vertex shader (GLSL) - fullscreen quad
            const vertexShaderSource = `
                attribute vec2 a_position;
                varying vec2 v_uv;
                
                void main() {
                    v_uv = a_position * 0.5 + 0.5;
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;

            // Compile shaders
            const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, glslFragment);
            
            if (!vertexShader || !fragmentShader) return null;

            // Create program
            const program = this.gl.createProgram();
            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);
            this.gl.linkProgram(program);

            if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                console.error('WebGL node program link error:', this.gl.getProgramInfoLog(program));
                return null;
            }

            // Get uniform locations
            const uniforms = {
                color: this.gl.getUniformLocation(program, 'u_color'),
                time: this.gl.getUniformLocation(program, 'u_time'),
                glowIntensity: this.gl.getUniformLocation(program, 'u_glowIntensity'),
                nodeValue: this.gl.getUniformLocation(program, 'u_nodeValue'),
                inputCount: this.gl.getUniformLocation(program, 'u_inputCount'),
                resolution: this.gl.getUniformLocation(program, 'u_resolution')
            };

            // Create fullscreen quad vertices
            const quadVertices = new Float32Array([
                -1.0, -1.0,
                 3.0, -1.0,
                -1.0,  3.0
            ]);

            // Create vertex buffer
            const vertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);

            const programData = {
                program,
                uniforms,
                buffers: { vertices: vertexBuffer }
            };

            this.webglPrograms.set(nodeKey, programData);
            console.log(`✅ WebGL node program created for: ${nodeKey}`);
            
            return programData;
        } catch (error) {
            console.error(`❌ Failed to create WebGL node program for ${nodeKey}:`, error);
            return null;
        }
    }

    // CONVERT WGSL TO GLSL
    convertWGSLToGLSL(wgslShader) {
        try {
            console.log('🔄 Converting WGSL to GLSL...');
            
            // Extract the fragment function content
            const fragmentMatch = wgslShader.match(/@fragment\s+fn\s+fs_main[^{]*\{([\s\S]*)\}/);
            if (!fragmentMatch) {
                return this.getDefaultGLSLFragment();
            }

            let fragmentBody = fragmentMatch[1];

            // Basic WGSL to GLSL conversions
            fragmentBody = fragmentBody
                // Types
                .replace(/vec([234])f/g, 'vec$1')
                .replace(/f32/g, 'float')
                
                // Built-in variables
                .replace(/coord\.xy\s*\/\s*resolution/g, 'gl_FragCoord.xy / u_resolution')
                .replace(/vUv/g, 'v_uv')
                
                // Uniforms access
                .replace(/uniforms\.color/g, 'u_color')
                .replace(/uniforms\.time/g, 'u_time')
                .replace(/uniforms\.glowIntensity/g, 'u_glowIntensity')
                .replace(/uniforms\.nodeValue/g, 'u_nodeValue')
                .replace(/uniforms\.inputCount/g, 'u_inputCount')
                
                // Variable declarations
                .replace(/var\s+(\w+):\s*vec([234])\s*=/g, 'vec$2 $1 =')
                .replace(/var\s+(\w+):\s*float\s*=/g, 'float $1 =')
                .replace(/var\s+(\w+)\s*=/g, 'vec4 $1 =')
                
                // Return statement
                .replace(/return\s+vec4f\(([^)]+)\);?/g, 'gl_FragColor = vec4($1);')
                
                // Function calls
                .replace(/fract/g, 'fract')
                .replace(/mix/g, 'mix')
                .replace(/smoothstep/g, 'smoothstep')
                .replace(/step/g, 'step')
                .replace(/abs/g, 'abs')
                .replace(/sin/g, 'sin')
                .replace(/cos/g, 'cos')
                .replace(/sqrt/g, 'sqrt')
                .replace(/pow/g, 'pow')
                .replace(/max/g, 'max')
                .replace(/min/g, 'min')
                .replace(/dot/g, 'dot')
                .replace(/length/g, 'length')
                .replace(/normalize/g, 'normalize')
                .replace(/floor/g, 'floor')
                .replace(/ceil/g, 'ceil');

            // Create complete GLSL fragment shader
            const glslFragment = `
                precision mediump float;
                
                uniform vec3 u_color;
                uniform float u_time;
                uniform float u_glowIntensity;
                uniform float u_nodeValue;
                uniform float u_inputCount;
                uniform vec2 u_resolution;
                
                varying vec2 v_uv;
                
                void main() {
                    vec2 resolution = u_resolution;
                    vec3 color = u_color;
                    float time = u_time;
                    float glowIntensity = u_glowIntensity;
                    float nodeValue = u_nodeValue;
                    float inputCount = u_inputCount;
                    
                    ${fragmentBody}
                    
                    // Fallback if no gl_FragColor was set
                    if (gl_FragColor.a == 0.0) {
                        gl_FragColor = vec4(color, 1.0);
                    }
                }
            `;

            console.log('✅ WGSL to GLSL conversion completed');
            return glslFragment;
        } catch (error) {
            console.warn('⚠️ WGSL to GLSL conversion failed:', error);
            return this.getDefaultGLSLFragment();
        }
    }

    // GET DEFAULT GLSL FRAGMENT when conversion fails
    getDefaultGLSLFragment() {
        return `
            precision mediump float;
            
            uniform vec3 u_color;
            uniform float u_time;
            uniform float u_glowIntensity;
            uniform vec2 u_resolution;
            
            varying vec2 v_uv;
            
            void main() {
                vec2 grid = abs(fract(v_uv * 6.0) - 0.5);
                float line = smoothstep(0.0, 0.1, min(grid.x, grid.y));
                vec3 finalColor = mix(u_color * 0.7, u_color, line);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }

    // CREATE CUBE SHADER PIPELINE
    async createCubePipeline() {
        try {
            console.log('🔨 Creating cube shader pipeline');

            // VERTEX SHADER - 3D cube with rotation
            const vertexShaderSource = `
                struct Uniforms {
                    color: vec3f,
                    time: f32,
                    glowIntensity: f32,
                    _padding: vec3f
                };
                
                @group(0) @binding(0) var<uniform> uniforms: Uniforms;
                
                struct VertexOutput {
                    @builtin(position) position: vec4f,
                    @location(0) color: vec3f,
                    @location(1) normal: vec3f
                };
                
                @vertex
                fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
                    // Cube vertices (36 vertices for 6 faces)
                    var positions = array<vec3f, 36>(
                        // Front face
                        vec3f(-1.0, -1.0,  1.0), vec3f( 1.0, -1.0,  1.0), vec3f( 1.0,  1.0,  1.0),
                        vec3f( 1.0,  1.0,  1.0), vec3f(-1.0,  1.0,  1.0), vec3f(-1.0, -1.0,  1.0),
                        // Back face
                        vec3f(-1.0, -1.0, -1.0), vec3f(-1.0,  1.0, -1.0), vec3f( 1.0,  1.0, -1.0),
                        vec3f( 1.0,  1.0, -1.0), vec3f( 1.0, -1.0, -1.0), vec3f(-1.0, -1.0, -1.0),
                        // Top face
                        vec3f(-1.0,  1.0, -1.0), vec3f(-1.0,  1.0,  1.0), vec3f( 1.0,  1.0,  1.0),
                        vec3f( 1.0,  1.0,  1.0), vec3f( 1.0,  1.0, -1.0), vec3f(-1.0,  1.0, -1.0),
                        // Bottom face
                        vec3f(-1.0, -1.0, -1.0), vec3f( 1.0, -1.0, -1.0), vec3f( 1.0, -1.0,  1.0),
                        vec3f( 1.0, -1.0,  1.0), vec3f(-1.0, -1.0,  1.0), vec3f(-1.0, -1.0, -1.0),
                        // Right face
                        vec3f( 1.0, -1.0, -1.0), vec3f( 1.0,  1.0, -1.0), vec3f( 1.0,  1.0,  1.0),
                        vec3f( 1.0,  1.0,  1.0), vec3f( 1.0, -1.0,  1.0), vec3f( 1.0, -1.0, -1.0),
                        // Left face
                        vec3f(-1.0, -1.0, -1.0), vec3f(-1.0, -1.0,  1.0), vec3f(-1.0,  1.0,  1.0),
                        vec3f(-1.0,  1.0,  1.0), vec3f(-1.0,  1.0, -1.0), vec3f(-1.0, -1.0, -1.0)
                    );
                    
                    var normals = array<vec3f, 36>(
                        // Front face normals
                        vec3f( 0.0,  0.0,  1.0), vec3f( 0.0,  0.0,  1.0), vec3f( 0.0,  0.0,  1.0),
                        vec3f( 0.0,  0.0,  1.0), vec3f( 0.0,  0.0,  1.0), vec3f( 0.0,  0.0,  1.0),
                        // Back face normals
                        vec3f( 0.0,  0.0, -1.0), vec3f( 0.0,  0.0, -1.0), vec3f( 0.0,  0.0, -1.0),
                        vec3f( 0.0,  0.0, -1.0), vec3f( 0.0,  0.0, -1.0), vec3f( 0.0,  0.0, -1.0),
                        // Top face normals
                        vec3f( 0.0,  1.0,  0.0), vec3f( 0.0,  1.0,  0.0), vec3f( 0.0,  1.0,  0.0),
                        vec3f( 0.0,  1.0,  0.0), vec3f( 0.0,  1.0,  0.0), vec3f( 0.0,  1.0,  0.0),
                        // Bottom face normals
                        vec3f( 0.0, -1.0,  0.0), vec3f( 0.0, -1.0,  0.0), vec3f( 0.0, -1.0,  0.0),
                        vec3f( 0.0, -1.0,  0.0), vec3f( 0.0, -1.0,  0.0), vec3f( 0.0, -1.0,  0.0),
                        // Right face normals
                        vec3f( 1.0,  0.0,  0.0), vec3f( 1.0,  0.0,  0.0), vec3f( 1.0,  0.0,  0.0),
                        vec3f( 1.0,  0.0,  0.0), vec3f( 1.0,  0.0,  0.0), vec3f( 1.0,  0.0,  0.0),
                        // Left face normals
                        vec3f(-1.0,  0.0,  0.0), vec3f(-1.0,  0.0,  0.0), vec3f(-1.0,  0.0,  0.0),
                        vec3f(-1.0,  0.0,  0.0), vec3f(-1.0,  0.0,  0.0), vec3f(-1.0,  0.0,  0.0)
                    );
                    
                    let pos = positions[vertexIndex];
                    let normal = normals[vertexIndex];
                    
                    // Rotation matrices
                    let time = uniforms.time;
                    let cosX = cos(time * 0.5);
                    let sinX = sin(time * 0.5);
                    let cosY = cos(time * 0.3);
                    let sinY = sin(time * 0.3);
                    
                    // Rotate around Y axis then X axis
                    var rotatedPos = pos;
                    rotatedPos = vec3f(
                        pos.x * cosY - pos.z * sinY,
                        pos.y,
                        pos.x * sinY + pos.z * cosY
                    );
                    rotatedPos = vec3f(
                        rotatedPos.x,
                        rotatedPos.y * cosX - rotatedPos.z * sinX,
                        rotatedPos.y * sinX + rotatedPos.z * cosX
                    );
                    
                    // Scale down and project
                    rotatedPos *= 0.3;
                    let projectedPos = vec4f(rotatedPos.x, rotatedPos.y, 0.0, 1.0);
                    
                    // Face colors based on normal
                    var faceColor = uniforms.color;
                    if (normal.z > 0.5) { faceColor *= 1.2; }      // Front - brighter
                    else if (normal.z < -0.5) { faceColor *= 0.6; } // Back - darker
                    else if (normal.y > 0.5) { faceColor *= 1.0; }  // Top
                    else if (normal.y < -0.5) { faceColor *= 0.8; } // Bottom - darker
                    else if (normal.x > 0.5) { faceColor *= 0.9; }  // Right
                    else { faceColor *= 0.7; }                      // Left - darker
                    
                    var output: VertexOutput;
                    output.position = projectedPos;
                    output.color = faceColor;
                    output.normal = normal;
                    return output;
                }
            `;

            // FRAGMENT SHADER - Simple cube shading
            const fragmentShaderSource = `
                @fragment
                fn fs_main(input: VertexOutput) -> @location(0) vec4f {
                    return vec4f(input.color, 1.0);
                }
                
                struct VertexOutput {
                    @builtin(position) position: vec4f,
                    @location(0) color: vec3f,
                    @location(1) normal: vec3f
                };
            `;

            // Create shader modules
            const vertexModule = this.device.createShaderModule({
                code: vertexShaderSource
            });

            const fragmentModule = this.device.createShaderModule({
                code: fragmentShaderSource
            });

            // Create uniform buffer
            const uniformBuffer = this.device.createBuffer({
                size: 48, // vec3 color + float time + float glowIntensity + vec3 padding (16-byte aligned)
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            // Create bind group layout
            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: [{
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                }]
            });

            // Create bind group
            const bindGroup = this.device.createBindGroup({
                layout: bindGroupLayout,
                entries: [{
                    binding: 0,
                    resource: { buffer: uniformBuffer }
                }]
            });

            // Create pipeline layout
            const pipelineLayout = this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            });

            // Create render pipeline
            const pipeline = this.device.createRenderPipeline({
                layout: pipelineLayout,
                vertex: {
                    module: vertexModule,
                    entryPoint: 'vs_main'
                },
                fragment: {
                    module: fragmentModule,
                    entryPoint: 'fs_main',
                    targets: [{
                        format: this.format,
                        blend: {
                            color: {
                                srcFactor: 'src-alpha',
                                dstFactor: 'one-minus-src-alpha'
                            },
                            alpha: {
                                srcFactor: 'one',
                                dstFactor: 'one-minus-src-alpha'
                            }
                        }
                    }]
                },
                primitive: {
                    topology: 'triangle-list',
                    cullMode: 'back'
                }
            });

            const pipelineData = {
                pipeline,
                bindGroup,
                uniformBuffer
            };

            this.shaderPipelines.set('cube', pipelineData);
            console.log('✅ Cube shader pipeline created');
            
            return pipelineData;
        } catch (error) {
            console.error('❌ Failed to create cube pipeline:', error);
            return null;
        }
    }

    // LOAD SAVED COLORS helper
    loadSavedColors() {
        try {
            const saved = localStorage.getItem('plexusColors');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load saved colors for preview window');
        }
        return null;
    }

    // CREATE CONTROL BUTTON helper
    createControlButton(text, title) {
        const button = document.createElement('button');
        const savedColors = this.loadSavedColors();
        
        button.textContent = text;
        button.title = title;
        button.style.cssText = `
            background: ${savedColors?.uiElements?.buttonBackground || '#444'};
            border: 1px solid ${savedColors?.uiElements?.buttonBorder || '#666'};
            color: ${savedColors?.text?.primary || '#fff'};
            width: 20px;
            height: 20px;
            border-radius: 3px;
            font-size: 10px;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        button.onmouseenter = () => {
            button.style.background = savedColors?.uiElements?.buttonHover || '#555';
            button.style.borderColor = savedColors?.uiElements?.buttonHoverBorder || '#777';
        };

        button.onmouseleave = () => {
            button.style.background = savedColors?.uiElements?.buttonBackground || '#444';
            button.style.borderColor = savedColors?.uiElements?.buttonBorder || '#666';
        };

        return button;
    }

    // CREATE CORNER INFO OVERLAYS
    createCornerInfoOverlays(savedColors) {
        const overlays = {};
        
        // Top-left: Node info
        overlays.nodeInfo = document.createElement('div');
        overlays.nodeInfo.id = 'webgpu-node-info';
        overlays.nodeInfo.style.cssText = `
            position: absolute;
            top: 6px;
            left: 6px;
            color: #ccc;
            font-family: 'Courier New', monospace;
            font-size: 8px;
            padding: 2px 4px;
            z-index: 10;
            pointer-events: none;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        `;
        overlays.nodeInfo.textContent = 'Select Node';
        
        // Top-right: Zoom level
        overlays.zoomInfo = document.createElement('div');
        overlays.zoomInfo.id = 'webgpu-zoom-info';
        overlays.zoomInfo.style.cssText = `
            position: absolute;
            top: 6px;
            right: 6px;
            color: #bbb;
            font-family: 'Courier New', monospace;
            font-size: 8px;
            padding: 2px 4px;
            z-index: 10;
            pointer-events: none;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        `;
        overlays.zoomInfo.textContent = '100%';
        
        // Bottom-left: Render mode
        overlays.renderInfo = document.createElement('div');
        overlays.renderInfo.id = 'webgpu-render-info';
        overlays.renderInfo.style.cssText = `
            position: absolute;
            bottom: 6px;
            left: 6px;
            color: #aaa;
            font-family: 'Courier New', monospace;
            font-size: 8px;
            padding: 2px 4px;
            z-index: 10;
            pointer-events: none;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        `;
        overlays.renderInfo.textContent = this.useWebGPU ? 'WebGPU' : 'WebGL';
        
        // Bottom-right: Resolution
        overlays.resInfo = document.createElement('div');
        overlays.resInfo.id = 'webgpu-res-info';
        overlays.resInfo.style.cssText = `
            position: absolute;
            bottom: 6px;
            right: 6px;
            color: #bbb;
            font-family: 'Courier New', monospace;
            font-size: 8px;
            padding: 2px 4px;
            z-index: 10;
            pointer-events: none;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        `;
        overlays.resInfo.textContent = '512×512';
        
        return overlays;
    }

    // SETUP WINDOW INTERACTIONS
    setupWindowInteractions(container, titleBar, canvasContainer, controls) {
        let isDraggingWindow = false;
        let dragOffset = { x: 0, y: 0 };

        // Window dragging
        titleBar.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON') return; // Don't drag on buttons
            
            isDraggingWindow = true;
            dragOffset.x = e.clientX - container.offsetLeft;
            dragOffset.y = e.clientY - container.offsetTop;
            titleBar.style.cursor = 'grabbing';
            e.preventDefault();
        };

        document.onmousemove = (e) => {
            if (isDraggingWindow) {
                container.style.left = (e.clientX - dragOffset.x) + 'px';
                container.style.top = (e.clientY - dragOffset.y) + 'px';
            }
        };

        document.onmouseup = () => {
            isDraggingWindow = false;
            titleBar.style.cursor = 'move';
        };

        // Control button actions
        const [collapseBtn, zoomOut, zoomReset, zoomIn, closeBtn] = controls.children;

        zoomOut.onclick = () => {
            this.targetTransform.scale = Math.max(0.1, this.targetTransform.scale * 0.8);
        };

        zoomReset.onclick = () => {
            this.targetTransform.scale = 1;
            this.targetTransform.x = 10;
            this.targetTransform.y = 10;
        };

        zoomIn.onclick = () => {
            this.targetTransform.scale = Math.min(5, this.targetTransform.scale * 1.25);
        };

        closeBtn.onclick = () => {
            container.style.display = 'none';
        };

        // Add resize handles to all sides
        this.addResizeHandles(container);

        // Window resize observer
        if (ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.updateCanvasTransform();
                this.updateBackgroundOnResize();
            });
            resizeObserver.observe(container);
        }
    }

    // ADD RESIZE HANDLES to all sides
    addResizeHandles(container) {
        const savedColors = this.loadSavedColors();
        const handleSize = 4;
        const cornerSize = 8;
        
        // Create resize handles for edges and corners
        const handles = [
            // Edges
            { type: 'n', style: `top: 0; left: ${cornerSize}px; right: ${cornerSize}px; height: ${handleSize}px; cursor: n-resize;` },
            { type: 's', style: `bottom: 0; left: ${cornerSize}px; right: ${cornerSize}px; height: ${handleSize}px; cursor: s-resize;` },
            { type: 'w', style: `left: 0; top: ${cornerSize}px; bottom: ${cornerSize}px; width: ${handleSize}px; cursor: w-resize;` },
            { type: 'e', style: `right: 0; top: ${cornerSize}px; bottom: ${cornerSize}px; width: ${handleSize}px; cursor: e-resize;` },
            
            // Corners
            { type: 'nw', style: `top: 0; left: 0; width: ${cornerSize}px; height: ${cornerSize}px; cursor: nw-resize;` },
            { type: 'ne', style: `top: 0; right: 0; width: ${cornerSize}px; height: ${cornerSize}px; cursor: ne-resize;` },
            { type: 'sw', style: `bottom: 0; left: 0; width: ${cornerSize}px; height: ${cornerSize}px; cursor: sw-resize;` },
            { type: 'se', style: `bottom: 0; right: 0; width: ${cornerSize}px; height: ${cornerSize}px; cursor: se-resize;` }
        ];

        let isResizing = false;
        let resizeType = '';
        let startX = 0, startY = 0;
        let startWidth = 0, startHeight = 0;
        let startLeft = 0, startTop = 0;

        handles.forEach(handle => {
            const element = document.createElement('div');
            element.className = `resize-handle resize-${handle.type}`;
            element.style.cssText = `
                position: absolute;
                ${handle.style}
                background: transparent;
                z-index: 1001;
                transition: background-color 0.2s ease;
            `;

            // Visual feedback on hover
            element.onmouseenter = () => {
                element.style.backgroundColor = savedColors?.uiElements?.resizeHandle || 'rgba(74, 158, 255, 0.3)';
            };

            element.onmouseleave = () => {
                if (!isResizing) {
                    element.style.backgroundColor = 'transparent';
                }
            };

            // Start resize
            element.onmousedown = (e) => {
                isResizing = true;
                resizeType = handle.type;
                startX = e.clientX;
                startY = e.clientY;
                
                const rect = container.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;
                startLeft = rect.left;
                startTop = rect.top;
                
                element.style.backgroundColor = savedColors?.uiElements?.resizeHandleActive || 'rgba(74, 158, 255, 0.5)';
                e.preventDefault();
                e.stopPropagation();
            };

            container.appendChild(element);
        });

        // Handle resize drag
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            // Calculate new dimensions based on resize type
            switch (resizeType) {
                case 'n':
                    newHeight = Math.max(200, startHeight - dy);
                    newTop = startTop + (startHeight - newHeight);
                    break;
                case 's':
                    newHeight = Math.max(200, startHeight + dy);
                    break;
                case 'w':
                    newWidth = Math.max(200, startWidth - dx);
                    newLeft = startLeft + (startWidth - newWidth);
                    break;
                case 'e':
                    newWidth = Math.max(200, startWidth + dx);
                    break;
                case 'nw':
                    newWidth = Math.max(200, startWidth - dx);
                    newHeight = Math.max(200, startHeight - dy);
                    newLeft = startLeft + (startWidth - newWidth);
                    newTop = startTop + (startHeight - newHeight);
                    break;
                case 'ne':
                    newWidth = Math.max(200, startWidth + dx);
                    newHeight = Math.max(200, startHeight - dy);
                    newTop = startTop + (startHeight - newHeight);
                    break;
                case 'sw':
                    newWidth = Math.max(200, startWidth - dx);
                    newHeight = Math.max(200, startHeight + dy);
                    newLeft = startLeft + (startWidth - newWidth);
                    break;
                case 'se':
                    newWidth = Math.max(200, startWidth + dx);
                    newHeight = Math.max(200, startHeight + dy);
                    break;
            }

            // Apply new size and position
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
            container.style.left = newLeft + 'px';
            container.style.top = newTop + 'px';

            this.updateCanvasTransform();
        });

        // End resize
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizeType = '';
                
                // Clear active resize handle color
                container.querySelectorAll('.resize-handle').forEach(handle => {
                    handle.style.backgroundColor = 'transparent';
                });
            }
        });
    }

    // UPDATE CANVAS TRANSFORM
    updateCanvasTransform() {
        if (!this.canvas) return;
        
        this.canvas.style.transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`;
        
        // Update canvas size to fit container if needed
        const container = document.getElementById('preview-canvas-container');
        if (container) {
            const rect = container.getBoundingClientRect();
            // Keep original canvas size but allow transform scaling
        }
    }

    // SET NODE SYSTEM REFERENCE
    setNodeSystem(nodeSystem) {
        this.nodeSystem = nodeSystem;
        console.log('🔗 Node system reference set');
    }

    // CREATE SHADER PIPELINE for a node
    async createShaderPipeline(node) {
        const nodeKey = node.title || node.definition?.title || 'unknown';
        
        if (this.useWebGPU) {
            if (this.shaderPipelines.has(nodeKey)) {
                return this.shaderPipelines.get(nodeKey);
            }
            return this.createWebGPUPipeline(node, nodeKey);
        } else {
            if (this.webglPrograms.has(nodeKey)) {
                return this.webglPrograms.get(nodeKey);
            }
            return this.createWebGLNodeProgram(node, nodeKey);
        }
    }

    // CREATE WebGPU PIPELINE for a node
    async createWebGPUPipeline(node, nodeKey) {
        console.log(`🔨 Creating WebGPU pipeline for: ${nodeKey}`);

        // VERTEX SHADER - fullscreen quad
        const vertexShaderSource = `
            @vertex
            fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
                var pos = array<vec2f, 3>(
                    vec2f(-1.0, -1.0),
                    vec2f( 3.0, -1.0),
                    vec2f(-1.0,  3.0)
                );
                return vec4f(pos[vertexIndex], 0.0, 1.0);
            }
        `;

        // FRAGMENT SHADER - use modern WGSL
        const fragmentShaderSource = this.getWGSLShader(node);

        try {
            // Create shader modules
            const vertexModule = this.device.createShaderModule({
                code: vertexShaderSource
            });

            const fragmentModule = this.device.createShaderModule({
                code: fragmentShaderSource
            });

            // Create uniform buffer - expanded for computed values
            const uniformBuffer = this.device.createBuffer({
                size: 80, // vec3 color + float time + float glowIntensity + float nodeValue + float inputCount + padding
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            // Create bind group layout
            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: [{
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                }]
            });

            // Create bind group
            const bindGroup = this.device.createBindGroup({
                layout: bindGroupLayout,
                entries: [{
                    binding: 0,
                    resource: { buffer: uniformBuffer }
                }]
            });

            // Create pipeline layout
            const pipelineLayout = this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            });

            // Create render pipeline
            const pipeline = this.device.createRenderPipeline({
                layout: pipelineLayout,
                vertex: {
                    module: vertexModule,
                    entryPoint: 'vs_main'
                },
                fragment: {
                    module: fragmentModule,
                    entryPoint: 'fs_main',
                    targets: [{
                        format: this.format,
                        blend: {
                            color: {
                                srcFactor: 'one',
                                dstFactor: 'one-minus-src-alpha'
                            },
                            alpha: {
                                srcFactor: 'one',
                                dstFactor: 'one-minus-src-alpha'
                            }
                        }
                    }]
                },
                primitive: {
                    topology: 'triangle-list'
                }
            });

            const pipelineData = {
                pipeline,
                bindGroup,
                uniformBuffer
            };

            this.shaderPipelines.set(nodeKey, pipelineData);
            console.log(`✅ Shader pipeline created for: ${nodeKey}`);
            
            return pipelineData;
        } catch (error) {
            console.error(`❌ Failed to create shader pipeline for ${nodeKey}:`, error);
            return null;
        }
    }

    // GET MODERN WGSL SHADER
    getWGSLShader(node) {
        const nodeTitle = node.title || node.definition?.title || 'Unknown';
        console.log(`🎨 Getting WGSL shader for: ${nodeTitle}`);
        
        // Check if node has modern WGSL shader
        if (node.getWGSLShader) {
            console.log(`✅ Using native WGSL shader for: ${nodeTitle}`);
            const wgslFragment = node.getWGSLShader();
            
            // Create complete WGSL shader with uniforms
            return `
                struct Uniforms {
                    color: vec3f,
                    time: f32,
                    glowIntensity: f32,
                    nodeValue: f32,
                    inputCount: f32,
                    _padding: f32
                };
                
                @group(0) @binding(0) var<uniform> uniforms: Uniforms;
                
                ${wgslFragment}
            `;
        }
        
        // Fallback to generated WGSL for nodes without native shaders
        console.log(`⚠️ Generating WGSL shader for: ${nodeTitle}`);
        return this.generateWGSLShader(node);
    }

    // CONVERT GLSL BODY to WGSL syntax
    convertGLSLBody(glslShader) {
        // Extract the main function body
        const mainMatch = glslShader.match(/void\s+main\s*\(\s*\)\s*\{([\s\S]*)\}/);
        if (!mainMatch) {
            return 'return vec4f(color, 1.0);';
        }

        let body = mainMatch[1];
        
        // Basic conversions
        body = body.replace(/vec3/g, 'vec3f');
        body = body.replace(/vec2/g, 'vec2f');
        body = body.replace(/vec4/g, 'vec4f');
        body = body.replace(/float/g, 'f32');
        body = body.replace(/gl_FragColor/g, 'var output: vec4f; output');
        body = body.replace(/smoothstep/g, 'smoothstep');
        body = body.replace(/mix/g, 'mix');
        body = body.replace(/abs/g, 'abs');
        body = body.replace(/max/g, 'max');
        body = body.replace(/min/g, 'min');
        body = body.replace(/step/g, 'step');
        body = body.replace(/sin/g, 'sin');
        body = body.replace(/cos/g, 'cos');
        body = body.replace(/sqrt/g, 'sqrt');
        body = body.replace(/pow/g, 'pow');

        // Handle variable declarations
        body = body.replace(/vec([234])f\s+(\w+)/g, 'var $2: vec$1f');
        body = body.replace(/f32\s+(\w+)/g, 'var $1: f32');

        // Handle final color assignment
        if (body.includes('gl_FragColor') || body.includes('output')) {
            body += '\nreturn output;';
        } else {
            body += '\nreturn vec4f(color, 1.0);';
        }

        return body;
    }

    // GENERATE WGSL SHADER for nodes without native WGSL
    generateWGSLShader(node) {
        const nodeType = node.title || node.definition?.title || 'Unknown';
        const category = node.category || 'data';
        
        let fragmentBody = '';
        
        switch (nodeType) {
            case 'Multiply':
                fragmentBody = `
                    var finalColor = color;
                    
                    // X pattern for multiplication
                    let center = vUv - vec2f(0.5, 0.5);
                    let x1 = smoothstep(0.05, 0.02, abs(center.x - center.y));
                    let x2 = smoothstep(0.05, 0.02, abs(center.x + center.y));
                    let cross = max(x1, x2);
                    
                    // Animated multiplication energy
                    let energy = sin(time * 2.5 + dot(center, center) * 10.0) * 0.2 + 0.8;
                    finalColor += vec3f(0.4, 0.2, 0.6) * cross * (glowIntensity + 0.3) * energy;
                    
                    return vec4f(finalColor, 1.0);
                `;
                break;
                
            case 'Sin':
                fragmentBody = `
                    var finalColor = color;
                    
                    // Sine wave visualization
                    let wave = sin((vUv.x - 0.5) * 6.28318 + time) * 0.15;
                    let dist = abs(vUv.y - 0.5 - wave);
                    let line = smoothstep(0.05, 0.02, dist);
                    
                    // Multiple harmonics
                    let wave2 = sin((vUv.x - 0.5) * 12.56636 + time * 1.5) * 0.05;
                    let dist2 = abs(vUv.y - 0.5 - wave - wave2);
                    let line2 = smoothstep(0.03, 0.01, dist2);
                    
                    finalColor += vec3f(0.3, 0.4, 0.8) * (line + line2 * 0.5) * (glowIntensity + 0.4);
                    
                    return vec4f(finalColor, 1.0);
                `;
                break;
                
            case 'Random':
                fragmentBody = `
                    var finalColor = color;
                    
                    // Noise pattern with time animation
                    let noise = fract(sin(dot(vUv * 12.0 + time * 0.1, vec2f(12.9898, 78.233))) * 43758.5453);
                    let noise2 = fract(sin(dot(vUv * 8.0 + time * 0.2, vec2f(93.9898, 67.345))) * 28765.1234);
                    
                    // Pixelated noise effect
                    let pixelUv = floor(vUv * 16.0) / 16.0;
                    let pixelNoise = fract(sin(dot(pixelUv + time * 0.05, vec2f(12.9898, 78.233))) * 43758.5453);
                    
                    finalColor += vec3f(0.2, 0.4, 0.2) * (noise * 0.5 + pixelNoise * 0.5) * (glowIntensity + 0.3);
                    
                    return vec4f(finalColor, 1.0);
                `;
                break;
                
            default:
                // Category-based defaults
                switch (category) {
                    case 'math':
                        fragmentBody = `
                            var finalColor = color;
                            
                            // Mathematical grid
                            let grid = abs(fract(vUv * 8.0) - 0.5);
                            let line = smoothstep(0.0, 0.1, min(grid.x, grid.y));
                            finalColor = mix(finalColor * 0.6, finalColor, line);
                            
                            // Central math symbol
                            let center = vUv - vec2f(0.5, 0.5);
                            let symbol = smoothstep(0.12, 0.08, length(center));
                            finalColor += vec3f(0.2, 0.4, 0.8) * symbol * (glowIntensity + 0.2);
                            
                            return vec4f(finalColor, 1.0);
                        `;
                        break;
                        
                    case 'logic':
                        fragmentBody = `
                            var finalColor = color;
                            
                            // Binary pattern
                            let binary = step(0.5, fract(sin(dot(floor(vUv * 10.0), vec2f(12.9898, 78.233))) * 43758.5453));
                            finalColor += vec3f(0.2, 0.6, 0.2) * binary * 0.4;
                            
                            // Logic gate symbol
                            let center = vUv - vec2f(0.5, 0.5);
                            let gate = smoothstep(0.15, 0.1, abs(center.x)) * smoothstep(0.1, 0.05, abs(center.y));
                            finalColor += vec3f(0.3, 0.8, 0.3) * gate * (glowIntensity + 0.3);
                            
                            return vec4f(finalColor, 1.0);
                        `;
                        break;
                        
                    default:
                        fragmentBody = `
                            var finalColor = color;
                            
                            // Simple pattern
                            let grid = abs(fract(vUv * 6.0) - 0.5);
                            let line = smoothstep(0.0, 0.1, min(grid.x, grid.y));
                            finalColor = mix(finalColor * 0.7, finalColor, line);
                            
                            return vec4f(finalColor, 1.0);
                        `;
                        break;
                }
        }
        
        return `
            struct Uniforms {
                color: vec3f,
                time: f32,
                glowIntensity: f32,
                nodeValue: f32,
                inputCount: f32,
                _padding: f32
            };
            
            @group(0) @binding(0) var<uniform> uniforms: Uniforms;
            
            @fragment
            fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
                let resolution = vec2f(512.0, 512.0);
                let vUv = coord.xy / resolution;
                let color = uniforms.color;
                let time = uniforms.time;
                let glowIntensity = uniforms.glowIntensity;
                let nodeValue = uniforms.nodeValue;
                let inputCount = uniforms.inputCount;
                
                ${fragmentBody}
            }
        `;
    }

    // UPDATE NODE PREVIEW with actual computed values
    async updatePreview(node = null) {
        if (!this.device) return;

        // Determine which node to show
        let targetNode = node;
        
        if (!targetNode) {
            // Show output node or last selected node
            targetNode = this.outputNode || this.currentNode;
        }

        if (!targetNode) {
            // Show grid with no icon (no node selected)
            this.showGridOnly();
            return;
        }

        this.currentNode = targetNode;
        
        // COMPUTE ACTUAL NODE VALUES from connections
        const computedValues = this.computeNodeValues(targetNode);
        
        // CHECK if node has NO CONNECTIONS - show grid instead (skip shader rendering)
        const hasConnections = computedValues && Object.keys(computedValues.inputs || {}).length > 0;
        // Extract title safely from node structure - DEBUG WHAT WE'RE GETTING
        console.log(`🐛 DEBUG targetNode:`, targetNode);
        console.log(`🐛 DEBUG targetNode.title:`, targetNode.title);
        console.log(`🐛 DEBUG targetNode.definition:`, targetNode.definition);
        console.log(`🐛 DEBUG targetNode.definition?.title:`, targetNode.definition?.title);
        
        let nodeTitle = targetNode.title || targetNode.definition?.title || 'Unknown';
        
        // FAILSAFE: If we still get [object Object], force it to Unknown
        if (nodeTitle.toString().includes('[object') || typeof nodeTitle === 'object') {
            console.warn(`🚨 FAILSAFE: Got object instead of string for node title, forcing to Unknown`);
            nodeTitle = 'Unknown';
        }
        
        console.log(`🔍 Node ${nodeTitle} - computedValues:`, computedValues, 'hasConnections:', hasConnections);
        
        if (!hasConnections) {
            this.showGridWithIcon(targetNode);
            return;
        }
        
        // Update UI with computed info
        const nameDisplay = document.getElementById('preview-node-name');
        if (nameDisplay) {
            const nodeCategory = targetNode.category || targetNode.definition?.category || 'misc';
            const valueInfo = computedValues ? ` → ${JSON.stringify(computedValues).slice(0, 30)}` : '';
            nameDisplay.textContent = `${nodeTitle} (${nodeCategory})${valueInfo}`;
        }

        // Create pipeline if needed
        const pipelineData = await this.createShaderPipeline(targetNode);
        if (!pipelineData) {
            this.showGridOnly();
            return;
        }

        // Render the node texture with computed values
        this.renderNode(pipelineData, targetNode, computedValues);
    }

    // COMPUTE NODE VALUES from connections
    computeNodeValues(nodeDefinition) {
        if (!this.nodeSystem || !this.nodeSystem.connections) return null;
        
        try {
            // Find the actual node instance in the system
            const actualNode = this.nodeSystem.nodes.find(n => 
                n.definition.title === (nodeDefinition.title || nodeDefinition.definition?.title) && 
                n.definition.x === nodeDefinition.x && 
                n.definition.y === nodeDefinition.y
            );
            
            if (!actualNode) return null;
            
            // Get input values from connections
            const inputValues = {};
            
            // Find connections to this node's inputs
            const inputConnections = this.nodeSystem.connections.filter(conn => 
                conn.toNode === actualNode
            );
            
            inputConnections.forEach(connection => {
                const portLabel = connection.toDef.label;
                const sourceValue = this.getNodeOutputValue(connection.fromNode, connection.fromDef);
                if (sourceValue !== null) {
                    inputValues[portLabel.toLowerCase()] = sourceValue;
                }
            });
            
            const nodeName = nodeDefinition.title || nodeDefinition.definition?.title || 'Unknown';
            console.log(`💭 Computing values for ${nodeName}:`, inputValues);
            
            // Compute node output using actual compute function
            if (nodeDefinition.compute && typeof nodeDefinition.compute === 'function') {
                const result = nodeDefinition.compute(...Object.values(inputValues));
                console.log(`✅ Computed result:`, result);
                return { inputs: inputValues, output: result };
            }
            
            return { inputs: inputValues, output: null };
        } catch (error) {
            console.warn(`⚠️ Failed to compute values for ${nodeName}:`, error);
            return null;
        }
    }

    // GET OUTPUT VALUE from a source node
    getNodeOutputValue(sourceNode, outputDef) {
        try {
            // For Constant nodes, get the parameter value
            if (sourceNode.definition.title === 'Constant') {
                const valueParam = sourceNode.definition.params?.find(p => p.label === 'Value');
                return valueParam ? parseFloat(valueParam.value) || 0 : 1.0;
            }
            
            // For other nodes, recursively compute their values
            const sourceValues = this.computeNodeValues(sourceNode.definition);
            return sourceValues?.output || 0;
        } catch (error) {
            console.warn(`⚠️ Failed to get output value:`, error);
            return 0;
        }
    }

    // RENDER NODE TEXTURE with computed values
    renderNode(pipelineData, node, computedValues = null) {
        if (this.useWebGPU) {
            this.renderNodeWebGPU(pipelineData, node, computedValues);
        } else {
            this.renderNodeWebGL(pipelineData, node, computedValues);
        }
    }

    // RENDER NODE with WebGPU
    renderNodeWebGPU(pipelineData, node, computedValues = null) {
        const { pipeline, bindGroup, uniformBuffer } = pipelineData;

        // Update uniforms with computed values
        const categoryColors = {
            'math': [0.2, 0.6, 0.9],      // Blue
            'data': [0.9, 0.6, 0.2],      // Orange
            'logic': [0.6, 0.9, 0.2],     // Green
            'vector': [0.9, 0.2, 0.6],    // Magenta
            'conversion': [0.6, 0.2, 0.9], // Purple
            'nested': [0.9, 0.9, 0.2]     // Yellow
        };

        let color = categoryColors[node.category] || [0.5, 0.5, 0.5];
        let glowIntensity = node.uniforms?.glowIntensity?.value || 0.0;

        // MODIFY COLOR/INTENSITY based on computed values
        if (computedValues) {
            // For Join nodes - show color from connected constants
            const nodeTitle = node.title || node.definition?.title || 'Unknown';
            if (nodeTitle === 'Join' && computedValues.inputs) {
                const x = computedValues.inputs.x || 0;
                const y = computedValues.inputs.y || 0;
                
                // Map values to colors (normalize to 0-1 range)
                const normalizeValue = (val) => Math.max(0, Math.min(1, Math.abs(val) / 10));
                color = [normalizeValue(x), normalizeValue(y), 0.3];
                glowIntensity = 0.5; // Higher glow for connected nodes
            }
            
            // For Split nodes - show input vector as color
            else if (nodeTitle === 'Split' && computedValues.inputs && computedValues.inputs.vector) {
                const vec = computedValues.inputs.vector;
                if (Array.isArray(vec)) {
                    const normalizeValue = (val) => Math.max(0, Math.min(1, Math.abs(val) / 10));
                    color = [normalizeValue(vec[0] || 0), normalizeValue(vec[1] || 0), 0.3];
                    glowIntensity = 0.5;
                }
            }
            
            // For Constant nodes - pulse based on value
            else if (nodeTitle === 'Constant' && computedValues.output !== null) {
                const value = Math.abs(computedValues.output);
                glowIntensity = Math.min(1.0, value / 5.0); // Scale glow based on constant value
                
                // Tint color based on value sign
                if (computedValues.output > 0) {
                    color = [color[0] * 1.2, color[1] * 1.2, color[2] * 0.8]; // Warmer for positive
                } else if (computedValues.output < 0) {
                    color = [color[0] * 0.8, color[1] * 0.8, color[2] * 1.2]; // Cooler for negative
                }
            }
            
            // For other connected nodes - increase glow
            else if (Object.keys(computedValues.inputs || {}).length > 0) {
                glowIntensity = Math.max(glowIntensity, 0.3);
            }
        }

        // Create uniform data - expanded to pass computed values
        const uniformData = new Float32Array([
            ...color,           // color: vec3f
            this.time,          // time: f32
            glowIntensity,      // glowIntensity: f32
            // Add computed values as additional uniforms
            computedValues?.output || 0,  // nodeValue: f32
            computedValues ? Object.keys(computedValues.inputs || {}).length : 0, // inputCount: f32
            0                   // padding: f32
        ]);

        this.device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // Begin render pass
        this.renderPassDescriptor.colorAttachments[0].view = this.context.getCurrentTexture().createView();
        
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);
        
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(3); // Fullscreen triangle
        passEncoder.end();
        
        this.device.queue.submit([commandEncoder.finish()]);
    }

    // RENDER NODE with WebGL
    renderNodeWebGL(pipelineData, node, computedValues = null) {
        const { program, uniforms, buffers } = pipelineData;

        // Calculate colors and values (same as WebGPU)
        const categoryColors = {
            'math': [0.2, 0.6, 0.9],
            'data': [0.9, 0.6, 0.2],
            'logic': [0.6, 0.9, 0.2],
            'vector': [0.9, 0.2, 0.6],
            'conversion': [0.6, 0.2, 0.9],
            'nested': [0.9, 0.9, 0.2]
        };

        let color = categoryColors[node.category] || [0.5, 0.5, 0.5];
        let glowIntensity = node.uniforms?.glowIntensity?.value || 0.0;

        // Apply computed value modifications (same logic as WebGPU)
        if (computedValues) {
            const nodeTitle = node.title || node.definition?.title || 'Unknown';
            if (nodeTitle === 'Join' && computedValues.inputs) {
                const x = computedValues.inputs.x || 0;
                const y = computedValues.inputs.y || 0;
                const normalizeValue = (val) => Math.max(0, Math.min(1, Math.abs(val) / 10));
                color = [normalizeValue(x), normalizeValue(y), 0.3];
                glowIntensity = 0.5;
            } else if (nodeTitle === 'Split' && computedValues.inputs && computedValues.inputs.vector) {
                const vec = computedValues.inputs.vector;
                if (Array.isArray(vec)) {
                    const normalizeValue = (val) => Math.max(0, Math.min(1, Math.abs(val) / 10));
                    color = [normalizeValue(vec[0] || 0), normalizeValue(vec[1] || 0), 0.3];
                    glowIntensity = 0.5;
                }
            } else if (nodeTitle === 'Constant' && computedValues.output !== null) {
                const value = Math.abs(computedValues.output);
                glowIntensity = Math.min(1.0, value / 5.0);
                if (computedValues.output > 0) {
                    color = [color[0] * 1.2, color[1] * 1.2, color[2] * 0.8];
                } else if (computedValues.output < 0) {
                    color = [color[0] * 0.8, color[1] * 0.8, color[2] * 1.2];
                }
            } else if (Object.keys(computedValues.inputs || {}).length > 0) {
                glowIntensity = Math.max(glowIntensity, 0.3);
            }
        }

        // Clear canvas
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Use shader program
        this.gl.useProgram(program);

        // Set uniforms
        this.gl.uniform3f(uniforms.color, ...color);
        this.gl.uniform1f(uniforms.time, this.time);
        this.gl.uniform1f(uniforms.glowIntensity, glowIntensity);
        this.gl.uniform1f(uniforms.nodeValue, computedValues?.output || 0);
        this.gl.uniform1f(uniforms.inputCount, computedValues ? Object.keys(computedValues.inputs || {}).length : 0);
        this.gl.uniform2f(uniforms.resolution, this.size, this.size);

        // Bind vertex buffer and set attributes
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.vertices);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        // Draw fullscreen triangle
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    // RENDER DEFAULT PATTERN
    renderDefault() {
        if (!this.device) return;

        // Simple clear to show "no node selected"
        this.renderPassDescriptor.colorAttachments[0].view = this.context.getCurrentTexture().createView();
        this.renderPassDescriptor.colorAttachments[0].clearValue = { r: 0.1, g: 0.1, b: 0.1, a: 1.0 };
        
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);
        passEncoder.end();
        
        this.device.queue.submit([commandEncoder.finish()]);

        // Update UI
        const nameDisplay = document.getElementById('preview-node-name');
        if (nameDisplay) {
            nameDisplay.textContent = 'Select a node to preview';
        }
    }

    // START RENDER LOOP
    startRenderLoop() {
        const render = (currentTime) => {
            this.time = currentTime * 0.001; // Convert to seconds
            
            // Update preview if we have a current node
            if (this.currentNode) {
                this.updatePreview(this.currentNode);
            }
            
            requestAnimationFrame(render);
        };
        
        requestAnimationFrame(render);
        console.log('🔄 Render loop started');
    }

    // HANDLE NODE SELECTION from main system
    onNodeSelected(node) {
        const nodeTitle = node?.title || node?.definition?.title || 'none';
        console.log(`🎯 Preview updating for selected node: ${nodeTitle}`);
        this.updatePreview(node);
    }

    // SET OUTPUT NODE reference
    setOutputNode(outputNode) {
        this.outputNode = outputNode;
        console.log('📤 Output node reference set');
    }
}

// Export for use in main system
window.WebGPUPreviewRenderer = WebGPUPreviewRenderer;

console.log('🎨 WebGPU Preview Renderer loaded');
