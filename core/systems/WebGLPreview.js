/**
 * 🎮 WEBGL PREVIEW SYSTEM - MODULAR
 * Self-contained WebGL window system with dynamic HTML generation
 */

class WebGLPreview {
    constructor() {
        this.isActive = false;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.container = null;
        this.contentEl = null;
        this.headerEl = null;
        this.closeBtn = null;
        
        // Window state
        this.isVisible = false;
        this.isDragging = false;
        this.isResizing = false;
        this.currentResizeHandle = null;
        
        // Camera controls
        this.radius = 3;
        this.theta = 0;
        this.phi = 0;
        this.target = new THREE.Vector3(0, 0.5, 0);
        
        // Create window HTML dynamically
        this.createWindow();
        this.setupEventHandlers();
        
        console.log('✅ WebGL Preview system initialized (modular)');
        console.log('📍 Window created with ID:', this.container.id);
        console.log('📍 Container style display:', this.container.style.display);
    }

    createWindow() {
        // Create main window container
        this.container = document.createElement('div');
        this.container.id = 'webgl-window';
        this.container.style.cssText = `
            position: fixed;
            width: 720px;
            height: 540px;
            right: 100px;
            top: 100px;
            background: #1a1a1a;
            border: 1px solid #555;
            border-radius: 8px;
            display: none;
            flex-direction: column;
            box-shadow: 0 8px 32px rgba(0,0,0,.6);
            user-select: none;
            z-index: 99999;
            min-width: 320px;
            min-height: 240px;
            font-family: 'Courier New', monospace;
        `;

        // Create window header
        this.headerEl = document.createElement('div');
        this.headerEl.style.cssText = `
            height: 32px;
            background: #2a2a2a;
            border-bottom: 1px solid #444;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            cursor: move;
            font-size: 11px;
            color: #ccc;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'WebGL Preview';
        title.className = 'webgl-title';
        
        this.closeBtn = document.createElement('button');
        this.closeBtn.textContent = '×';
        this.closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        this.headerEl.appendChild(title);
        this.headerEl.appendChild(this.closeBtn);

        // Create content area
        this.contentEl = document.createElement('div');
        this.contentEl.style.cssText = `
            flex: 1;
            background: #111;
            position: relative;
            overflow: hidden;
        `;

        // Add resize handles
        this.createResizeHandles();

        // Assemble window
        this.container.appendChild(this.headerEl);
        this.container.appendChild(this.contentEl);
        
        // Add to document
        document.body.appendChild(this.container);
    }

    createResizeHandles() {
        const handles = [
            // Edges
            { pos: 'top: 0; left: 8px; right: 8px; height: 4px;', cursor: 'n-resize' },
            { pos: 'bottom: 0; left: 8px; right: 8px; height: 4px;', cursor: 's-resize' },
            { pos: 'left: 0; top: 8px; bottom: 8px; width: 4px;', cursor: 'w-resize' },
            { pos: 'right: 0; top: 8px; bottom: 8px; width: 4px;', cursor: 'e-resize' },
            // Corners
            { pos: 'top: 0; left: 0; width: 8px; height: 8px;', cursor: 'nw-resize' },
            { pos: 'top: 0; right: 0; width: 8px; height: 8px;', cursor: 'ne-resize' },
            { pos: 'bottom: 0; left: 0; width: 8px; height: 8px;', cursor: 'sw-resize' },
            { pos: 'bottom: 0; right: 0; width: 8px; height: 8px;', cursor: 'se-resize' }
        ];

        handles.forEach(handle => {
            const resizeHandle = document.createElement('div');
            resizeHandle.style.cssText = `
                position: absolute;
                ${handle.pos}
                cursor: ${handle.cursor};
                z-index: 1000;
            `;
            resizeHandle.dataset.cursor = handle.cursor;
            this.container.appendChild(resizeHandle);
        });
    }

    setupEventHandlers() {
        // Close button
        this.closeBtn.onclick = () => this.hide();

        // Setup drag and resize functionality
        this.setupDragAndResize();
    }

    async show() {
        if (this.isVisible) {
            console.log('⚠️ WebGL Preview already visible');
            return;
        }
        
        console.log('🎮 Starting WebGL Preview...');
        
        try {
            // Show window
            this.container.style.display = 'flex';
            this.container.style.visibility = 'visible';
            this.isVisible = true;
            
            console.log('🎮 Window made visible - checking DOM...');
            console.log('📍 Container parent:', this.container.parentNode);
            console.log('📍 Container display:', this.container.style.display);
            console.log('📍 Container z-index:', this.container.style.zIndex);
            
            // Initialize WebGL if not already done
            if (!this.isActive) {
                // Load Three.js dynamically
                if (!window.THREE) {
                    console.log('🔄 Loading Three.js...');
                    await this.loadThreeJS();
                } else {
                    console.log('✅ Three.js already loaded');
                }
                
                // Initialize Three.js scene
                console.log('🔄 Initializing Three.js scene...');
                this.initThreeJS();
                this.isActive = true;
                
                // Force initial render to make sure content appears
                setTimeout(() => {
                    if (this.renderer && this.scene && this.camera) {
                        console.log('🔄 Forcing initial render...');
                        this.renderer.render(this.scene, this.camera);
                    }
                }, 100);
            } else {
                // Just resize existing renderer
                this.resize();
            }
            
            console.log('🎮 WebGL Preview window opened!');
        } catch (error) {
            console.error('❌ Failed to show WebGL preview:', error);
            this.container.style.display = 'none';
            this.isVisible = false;
            throw error;
        }
    }

    hide() {
        if (!this.isVisible) return;
        
        this.container.style.display = 'none';
        this.isVisible = false;
        
        console.log('🎮 WebGL Preview window closed');
    }

    destroy() {
        // Complete cleanup - removes window from DOM
        if (this.isActive) {
            // Cleanup Three.js resources
            if (this.renderer) {
                this.renderer.dispose();
                this.renderer = null;
            }
            this.isActive = false;
        }
        
        // Remove from DOM
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        console.log('🎮 WebGL Preview system destroyed');
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.THREE) {
                console.log('✅ Three.js already available');
                resolve();
                return;
            }

            console.log('🔄 Loading Three.js...');
            
            // Create importmap if not exists
            if (!document.querySelector('script[type="importmap"]')) {
                const importMap = document.createElement('script');
                importMap.type = 'importmap';
                importMap.textContent = JSON.stringify({
                    "imports": {
                        "three": "https://unpkg.com/three@0.165.0/build/three.module.js",
                        "three/addons/": "https://unpkg.com/three@0.165.0/examples/jsm/"
                    }
                });
                document.head.appendChild(importMap);
            }

            // Load Three.js
            import('https://unpkg.com/three@0.165.0/build/three.module.js')
                .then(THREE => {
                    window.THREE = THREE;
                    console.log('✅ Three.js loaded successfully');
                    resolve();
                })
                .catch(error => {
                    console.error('❌ Failed to load Three.js:', error);
                    reject(error);
                });
        });
    }

    initThreeJS() {
        const THREE = window.THREE;
        if (!THREE) {
            console.error('❌ Three.js not available');
            return;
        }

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setClearColor(0x000000, 0); // Transparent
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.contentEl.appendChild(this.renderer.domElement);

        // Create scene
        this.scene = new THREE.Scene();
        
        // Add ground plane
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.ShadowMaterial({ opacity: 0.4 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add demo cube with animation (EXACT COPY from preview_window.html)
        this.cube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        this.cube.position.y = 0.5;
        this.cube.castShadow = true;
        this.scene.add(this.cube);
        
        console.log('✅ Demo cube added to scene');
        console.log('📍 Cube position:', this.cube.position);
        console.log('📍 Cube visible:', this.cube.visible);

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(3, 4, 2);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        light.shadow.radius = 4;
        this.scene.add(light);
        
        this.scene.add(new THREE.AmbientLight(0x404040, 0.6));

        // Create camera (EXACT COPY from preview_window.html)
        this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        this.camera.position.set(2, 2, 2);
        
        // Initialize camera position using exact method from working version
        this.updateSpherical();
        this.updateCamera();
        
        console.log('✅ Camera initialized at position:', this.camera.position);
        this.setupControls();
        this.resize();
        
        // Start render loop
        this.startRenderLoop();
        
        // Setup resize observer
        new ResizeObserver(() => this.resize()).observe(this.contentEl);
    }

    setupControls() {
        const canvas = this.renderer.domElement;
        let dragCam = false;
        let dragLight = false;
        let px = 0, py = 0;
        const rotationSpeed = 0.005;
        const zoomSpeed = 0.001;

        canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        canvas.addEventListener('pointerdown', e => {
            if (e.button === 0) dragCam = true;
            else if (e.button === 2) dragLight = true;
            px = e.clientX;
            py = e.clientY;
        });

        window.addEventListener('pointermove', e => {
            if (!dragCam && !dragLight) return;
            
            const dx = (e.clientX - px) * rotationSpeed;
            const dy = (e.clientY - py) * rotationSpeed;
            px = e.clientX;
            py = e.clientY;

            if (dragCam) {
                this.theta -= dx;
                this.phi += dy;
                const limit = Math.PI / 2 - 0.1;
                this.phi = Math.max(-limit, Math.min(limit, this.phi));
                this.updateCamera();
            }
        });

        window.addEventListener('pointerup', () => {
            dragCam = false;
            dragLight = false;
        });

        canvas.addEventListener('wheel', e => {
            this.radius *= 1 + e.deltaY * zoomSpeed;
            this.radius = Math.max(0.5, Math.min(50, this.radius));
            this.updateCamera();
        }, { passive: true });
    }

    // EXACT COPY from preview_window.html
    updateSpherical() {
        const v = this.camera.position.clone().sub(this.target);
        this.radius = v.length();
        this.theta = Math.atan2(v.x, v.z);
        this.phi = Math.asin(v.y / this.radius);
    }
    
    updateCamera() {
        if (!this.camera) return;
        
        const y = this.radius * Math.sin(this.phi);
        const r = this.radius * Math.cos(this.phi);
        const x = r * Math.sin(this.theta);
        const z = r * Math.cos(this.theta);
        
        this.camera.position.set(
            this.target.x + x,
            this.target.y + y,
            this.target.z + z
        );
        
        this.camera.lookAt(this.target);
    }

    resize() {
        if (!this.renderer || !this.camera) return;
        
        const w = this.contentEl.clientWidth || 1;
        const h = this.contentEl.clientHeight || 1;
        
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    startRenderLoop() {
        const animate = () => {
            if (!this.isActive || !this.renderer || !this.scene || !this.camera) return;
            
            requestAnimationFrame(animate);
            
            // NO animation on cube to match standalone version exactly
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        console.log('🎮 Render loop started');
    }

    setupDragAndResize() {
        // WINDOW DRAGGING
        this.headerEl.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            this.isDragging = true;
            const rect = this.container.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            e.preventDefault();
        });

        // WINDOW RESIZING - Setup resize handles
        const resizeHandles = this.container.querySelectorAll('[data-cursor]');
        resizeHandles.forEach(handle => {
            handle.addEventListener('pointerdown', e => {
                if (e.button !== 0) return;
                e.stopPropagation(); // Prevent window dragging
                
                this.isResizing = true;
                this.currentResizeHandle = handle.dataset.cursor;
                
                this.resizeStartPos = { x: e.clientX, y: e.clientY };
                
                const rect = this.container.getBoundingClientRect();
                this.resizeStartSize = { width: rect.width, height: rect.height };
                this.resizeStartPosition = { left: rect.left, top: rect.top };
                
                e.preventDefault();
            });
        });

        // GLOBAL POINTER MOVE handler
        window.addEventListener('pointermove', e => {
            if (this.isDragging) {
                // WINDOW DRAGGING
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const windowRect = this.container.getBoundingClientRect();
                
                const newX = e.clientX - this.dragOffset.x;
                const newY = e.clientY - this.dragOffset.y;
                
                // CONSTRAIN to screen boundaries
                const constrainedX = Math.max(0, Math.min(newX, windowWidth - windowRect.width));
                const constrainedY = Math.max(0, Math.min(newY, windowHeight - windowRect.height));
                
                this.container.style.left = constrainedX + 'px';
                this.container.style.top = constrainedY + 'px';
            } 
            else if (this.isResizing && this.currentResizeHandle) {
                // WINDOW RESIZING
                const deltaX = e.clientX - this.resizeStartPos.x;
                const deltaY = e.clientY - this.resizeStartPos.y;
                
                let newWidth = this.resizeStartSize.width;
                let newHeight = this.resizeStartSize.height;
                let newLeft = this.resizeStartPosition.left;
                let newTop = this.resizeStartPosition.top;
                
                // Handle different resize directions
                switch (this.currentResizeHandle) {
                    case 'se-resize': // Bottom-right corner
                        newWidth = Math.max(320, this.resizeStartSize.width + deltaX);
                        newHeight = Math.max(240, this.resizeStartSize.height + deltaY);
                        break;
                        
                    case 'sw-resize': // Bottom-left corner
                        newWidth = Math.max(320, this.resizeStartSize.width - deltaX);
                        newHeight = Math.max(240, this.resizeStartSize.height + deltaY);
                        newLeft = this.resizeStartPosition.left + deltaX;
                        if (newWidth === 320) newLeft = this.resizeStartPosition.left + this.resizeStartSize.width - 320;
                        break;
                        
                    case 'ne-resize': // Top-right corner
                        newWidth = Math.max(320, this.resizeStartSize.width + deltaX);
                        newHeight = Math.max(240, this.resizeStartSize.height - deltaY);
                        newTop = this.resizeStartPosition.top + deltaY;
                        if (newHeight === 240) newTop = this.resizeStartPosition.top + this.resizeStartSize.height - 240;
                        break;
                        
                    case 'nw-resize': // Top-left corner
                        newWidth = Math.max(320, this.resizeStartSize.width - deltaX);
                        newHeight = Math.max(240, this.resizeStartSize.height - deltaY);
                        newLeft = this.resizeStartPosition.left + deltaX;
                        newTop = this.resizeStartPosition.top + deltaY;
                        if (newWidth === 320) newLeft = this.resizeStartPosition.left + this.resizeStartSize.width - 320;
                        if (newHeight === 240) newTop = this.resizeStartPosition.top + this.resizeStartSize.height - 240;
                        break;
                        
                    case 'e-resize': // Right edge
                        newWidth = Math.max(320, this.resizeStartSize.width + deltaX);
                        break;
                        
                    case 'w-resize': // Left edge
                        newWidth = Math.max(320, this.resizeStartSize.width - deltaX);
                        newLeft = this.resizeStartPosition.left + deltaX;
                        if (newWidth === 320) newLeft = this.resizeStartPosition.left + this.resizeStartSize.width - 320;
                        break;
                        
                    case 's-resize': // Bottom edge
                        newHeight = Math.max(240, this.resizeStartSize.height + deltaY);
                        break;
                        
                    case 'n-resize': // Top edge
                        newHeight = Math.max(240, this.resizeStartSize.height - deltaY);
                        newTop = this.resizeStartPosition.top + deltaY;
                        if (newHeight === 240) newTop = this.resizeStartPosition.top + this.resizeStartSize.height - 240;
                        break;
                }
                
                // Apply constraints to keep window on screen
                const maxWidth = window.innerWidth - newLeft;
                const maxHeight = window.innerHeight - newTop;
                
                newWidth = Math.min(newWidth, maxWidth);
                newHeight = Math.min(newHeight, maxHeight);
                
                // Apply new dimensions and position
                this.container.style.width = newWidth + 'px';
                this.container.style.height = newHeight + 'px';
                this.container.style.left = newLeft + 'px';
                this.container.style.top = newTop + 'px';
                
                // Trigger WebGL resize if active
                if (this.isActive && this.renderer) {
                    setTimeout(() => this.resize(), 0);
                }
            }
        });

        // GLOBAL POINTER UP handler
        window.addEventListener('pointerup', () => {
            this.isDragging = false;
            this.isResizing = false;
            this.currentResizeHandle = null;
        });

        // Double-click header to toggle collapse
        this.headerEl.addEventListener('dblclick', () => {
            const isCollapsed = this.container.classList.contains('collapsed');
            this.container.classList.toggle('collapsed');
            this.contentEl.style.display = isCollapsed ? 'block' : 'none';
            if (!isCollapsed && this.isActive) {
                setTimeout(() => this.resize(), 100);
            }
        });
    }

    // Resize renderer to fit container
    resize() {
        if (!this.renderer || !this.camera || !this.contentEl) return;
        
        const w = this.contentEl.clientWidth || 1;
        const h = this.contentEl.clientHeight || 1;
        
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        
        console.log(`🔄 WebGL resized to ${w}x${h}`);
    }

    // Add mesh to preview
    addMesh(mesh) {
        if (this.scene && mesh) {
            this.scene.add(mesh);
        }
    }

    // Remove mesh from preview
    removeMesh(mesh) {
        if (this.scene && mesh) {
            this.scene.remove(mesh);
        }
    }

    // Clear all custom meshes
    clearMeshes() {
        if (!this.scene) return;
        
        // Remove all non-essential objects (keep ground, light, etc.)
        const toRemove = [];
        this.scene.traverse(child => {
            if (child.userData && child.userData.isCustomMesh) {
                toRemove.push(child);
            }
        });
        
        toRemove.forEach(mesh => this.scene.remove(mesh));
    }
}

// Create global instance
window.WebGLPreview = new WebGLPreview();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebGLPreview;
}
