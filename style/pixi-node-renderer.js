/**
 * 🎨 PIXI NODE RENDERER
 * Dedicated node creation and styling system
 * EVERYTHING for nodes: creation, styling, ports, parameters, interactions
 */

// Load saved colors for port animations
function loadSavedColors() {
    try {
        const saved = localStorage.getItem('plexusColors');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load saved colors for node renderer');
    }
    return null;
}

const rendererSavedColors = loadSavedColors();

window.PixiNodeRenderer = {
    
    // 📐 CENTRALIZED NODE SPACING CONFIGURATION
    spacing: {
        // NODE DIMENSIONS
        baseHeight: 20,                    // Base node height
        minHeight: 40,                     // Minimum node height
        
        // PARAMETER SPACING
        parameter: {
            vertical: 4,                   // Between parameters
            startOffset: -16,               // From title to first parameter
            heightPerParam: 12,            // Height added per parameter
            heightPadding: 4,              // Extra padding for parameters
            labelSpacing: 4,               // Space after parameter label
            inputPadding: 4                // Text padding inside input field
        },
        
        // PORT SPACING  
        port: {
            vertical: 12,                  // Between ports
            startOffset: 6,               // From top of node to first port
            heightPerPort: 24,             // Height added per port
            heightPadding: 14,             // Extra padding for ports
            labelOffset: 15                // Distance of port labels from edge
        },
            
        // LAYOUT SPACING
        layout: {
            nodeWidth: 110,                // Standard node width
            titlePadding: 4,              // Padding around title
            titleVerticalOffset: 32,       // Title vertical offset from node edge
            categoryVerticalOffset: 0,     // Category label offset above node
            titleHorizontalOffset: 8,       // Title vertical offset from node edge

            borderPadding: 8               // Internal node padding
        },
        
        // HOVER & INTERACTION EFFECTS
        hover: {
            nodeOverlayAlpha: 0.2,         // Node hover overlay transparency (20%)
            portScaleMultiplier: 1.2,      // Port hover scale increase (20% larger)
            colorBrightenFactor: 1.5,      // Color brightening for hover effects
            categoryAlpha: 0.6,            // Category text transparency
            iconAlpha: 0.3,                // Icon/watermark transparency
            glowAlpha: 0.3                 // Port glow transparency
        },
        
        // VISUAL MULTIPLIERS
        visual: {
            iconSizeMultiplier: 0.4,       // Icon size relative to node width
            dynamicScaleMin: 1.2,          // Minimum dynamic scale (doubled)
            dynamicScaleMax: 3.1           // Maximum dynamic scale (1.5x)
        }
    },
    
    // ICON TEXTURE CACHE - Store loaded textures
    iconTextureCache: new Map(),
    
    // SPRITE SHEET TEXTURE - Single sheet for all icons
    spriteSheetTexture: null,
    
    // TEST FILE ACCESS - Simple check if sprite sheet is accessible
    async testSpriteSheetAccess() {
        const testPath = 'imgs/node_icons_white_sheet.png';
        console.log(`🧪 Testing sprite sheet access: ${testPath}`);
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                console.log(`✅ Sprite sheet file accessible: ${img.width}x${img.height}`);
                resolve(true);
            };
            img.onerror = () => {
                console.error(`❌ Sprite sheet file NOT accessible: ${testPath}`);
                resolve(false);
            };
            img.src = testPath;
        });
    },

    // PRELOAD SPRITE SHEET - Call this before creating any nodes
    async preloadSpriteSheet() {
        if (this.spriteSheetTexture && this.spriteSheetTexture.baseTexture && this.spriteSheetTexture.baseTexture.valid) {
            console.log(`✅ Sprite sheet already loaded`);
            return Promise.resolve();
        }
        
        // First test if file is accessible
        const accessible = await this.testSpriteSheetAccess();
        if (!accessible) {
            throw new Error('Sprite sheet file not accessible');
        }
        
        console.log(`🔄 Preloading sprite sheet: imgs/node_icons_white_sheet.png`);
        
        try {
            // TRY PIXI.Assets.load() first (recommended in PIXI v8)
            console.log(`🔄 Using PIXI.Assets.load() for sprite sheet...`);
            this.spriteSheetTexture = await PIXI.Assets.load('imgs/node_icons_white_sheet.png');
            console.log(`🔍 Assets.load() result:`, this.spriteSheetTexture);
            
            // FALLBACK to Texture.from if Assets.load fails
            if (!this.spriteSheetTexture) {
                console.warn(`⚠️ PIXI.Assets.load() failed, trying Texture.from()...`);
                this.spriteSheetTexture = PIXI.Texture.from('imgs/node_icons_white_sheet.png');
                console.log(`🔍 Texture.from() result:`, this.spriteSheetTexture);
            }
            
            // LAST RESORT: Create fallback texture if both methods fail
            if (!this.spriteSheetTexture) {
                console.warn(`⚠️ Both methods failed, creating fallback texture`);
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, 256, 256);
                // Draw grid pattern to show fallback is active
                ctx.fillStyle = '#cccccc';
                for (let x = 0; x < 256; x += 32) {
                    for (let y = 0; y < 256; y += 32) {
                        if ((x/32 + y/32) % 2 === 0) {
                            ctx.fillRect(x, y, 32, 32);
                        }
                    }
                }
                this.spriteSheetTexture = PIXI.Texture.from(canvas);
                console.log(`🔍 Fallback texture created:`, this.spriteSheetTexture);
            }
        } catch (error) {
            console.error(`❌ Failed to create texture:`, error);
            throw error;
        }
        
        // If we got here, texture was loaded via PIXI.Assets.load (already awaited)
        // or created via fallback - no need for additional Promise wrapping
        if (this.spriteSheetTexture && this.spriteSheetTexture.baseTexture) {
            console.log(`✅ Sprite sheet ready! Size: ${this.spriteSheetTexture.width}x${this.spriteSheetTexture.height}`);
            return Promise.resolve();
        } else {
            // This shouldn't happen with our fallbacks, but just in case
            console.error(`❌ No texture after all loading attempts`);
            throw new Error('Failed to create any texture');
        }
    },

    // GET NODE ICON TEXTURE - Load individual PNG files
    async getNodeIconTexture(nodeTitle, customIcon = null) {
        // CHECK for custom icon first (from node definition)
        let iconFile;
        if (customIcon) {
            iconFile = customIcon;
            console.log(`🎯 Using custom icon for "${nodeTitle}": ${iconFile}`);
        } else {
            // GET icon filename from window.IconManager
            iconFile = window.IconManager.getIconFilename(nodeTitle);
            if (!iconFile) {
                return null;
            }
            console.log(`📍 Found icon mapping: "${nodeTitle}" → "${iconFile}"`);
        }
        
        const iconPath = customIcon ? `${window.IconManager.config.basePath}${iconFile}` : window.IconManager.getIconPath(nodeTitle);
        
        // TEMPORARILY DISABLE CACHE for SVG updates
        // if (this.iconTextureCache.has(iconPath)) {
        //     console.log(`✅ Icon cached: ${iconPath}`);
        //     return this.iconTextureCache.get(iconPath);
        // }
        
        // LOAD INDIVIDUAL ICON FILE (SVG or PNG) with HIGH DPI handling
        try {
            console.log(`🔄 Loading individual icon file: ${iconPath}`);
            
            // Try SVG first (new Lucide icons), then fallback to PNG
            const svgPath = iconPath.replace('.png', '.svg');
            let texture = null;
            
            try {
                // Try loading SVG first with high resolution settings
                const options = {
                    resolution: window.devicePixelRatio * 2, // 2x extra resolution for crisp icons
                    scaleMode: PIXI.SCALE_MODES.LINEAR,
                    format: PIXI.FORMATS.RGBA
                };
                
                texture = await PIXI.Assets.load({
                    src: svgPath,
                    data: options
                });
                console.log(`✅ High-res SVG icon loaded: ${svgPath}`);
            } catch (svgError) {
                console.log(`⚠️ SVG failed, trying PNG: ${iconPath}`);
                // Fallback to PNG with high resolution
                const options = {
                    resolution: window.devicePixelRatio * 2,
                    scaleMode: PIXI.SCALE_MODES.LINEAR
                };
                
                texture = await PIXI.Assets.load({
                    src: iconPath,
                    data: options
                });
                console.log(`✅ High-res PNG icon loaded: ${iconPath}`);
            }
            
            if (texture) {
                // Ensure texture has proper resolution settings
                if (texture.baseTexture) {
                    texture.baseTexture.resolution = window.devicePixelRatio * 2;
                    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
                }
                
                // Cache the loaded texture
                this.iconTextureCache.set(iconPath, texture);
                console.log(`✅ High-DPI icon loaded and cached: ${iconPath} (${texture.width}x${texture.height}, res: ${texture.baseTexture?.resolution || 'unknown'})`);
                return texture;
            } else {
                console.warn(`⚠️ Texture loaded but is null for: ${iconPath}`);
                return null;
            }
        } catch (e) {
            console.error(`❌ Failed to load icon file: ${iconPath}`, e);
            
            // Try alternate loading method as final fallback with high DPI
            try {
                console.log(`🔄 Trying alternate high-DPI loading method...`);
                const img = new Image();
                img.src = iconPath;
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                
                // Create high-DPI texture
                const baseTexture = new PIXI.BaseTexture(img, {
                    resolution: window.devicePixelRatio * 2,
                    scaleMode: PIXI.SCALE_MODES.LINEAR
                });
                const texture = new PIXI.Texture(baseTexture);
                
                this.iconTextureCache.set(iconPath, texture);
                console.log(`✅ High-DPI icon loaded via Image: ${iconPath} (res: ${baseTexture.resolution})`);
                return texture;
            } catch (e2) {
                console.error(`❌ Alternate loading also failed: ${iconPath}`, e2);
                return null;
            }
        }
    },
    

    
    // HELPER: Cut icon from already loaded sprite sheet
    _cutIconFromLoadedSheet(nodeTitle, iconFileName) {
        // Icon grid mapping from window.IconManager
        const iconSize = window.IconManager.config.iconSize;
        const gridWidth = window.IconManager.config.gridWidth;
        
        const position = window.IconManager.getSpritePosition(iconFileName);
        if (!position) {
            console.warn(`⚠️ No sprite position found for: ${iconFileName}`);
            return null;
        }
        
        // Calculate pixel coordinates
        const pixelX = position.x * iconSize;
        const pixelY = position.y * iconSize;
        
        // Create texture from sprite sheet region
        const rect = new PIXI.Rectangle(pixelX, pixelY, iconSize, iconSize);
        const texture = new PIXI.Texture(this.spriteSheetTexture, rect);
        
        // Cache it
        const cacheKey = `sprite_${nodeTitle}`;
        this.iconTextureCache.set(cacheKey, texture);
        
        console.log(`✅ Icon cut from sprite sheet: ${nodeTitle} at (${pixelX}, ${pixelY})`);
        return texture;
    },
    
    // NODE CREATION SYSTEM
    createNodesFromDefinitions(nodeSystem) {
        nodeSystem.nodeDefinitions.forEach((def, index) => {
            const node = this.createNode(nodeSystem, def, index);
            nodeSystem.nodes.push(node);
            nodeSystem.nodeLayer.addChild(node.container);
        });
    },

    createNode(nodeSystem, definition, id) {
        const node = {
            id: id,
            definition: definition,
            container: new PIXI.Container(),
            selected: false,
            ports: { inputs: [], outputs: [] },
            glow: null,
            // Store dimensions for hover callbacks
            width: this.spacing.layout.nodeWidth,
            height: this.calculateNodeHeight(definition)
        };

        // ENABLE Z-INDEX SORTING for proper layer ordering
        node.container.sortableChildren = true;
        
        node.container.x = definition.x;
        node.container.y = definition.y;

        const width = node.width;
        const height = node.height;
        
        // GRAY NODE FIRST (background WITHOUT border)
        const bottomSectionHeight = nodeSystem.styles.node.bottomSectionHeight;
        const categoryColor = nodeSystem.styles.colors.categories[definition.category] || parseInt('666666', 16);
        
        const bg = new PIXI.Graphics();
        
        // SPECIAL BACKGROUND for nested nodes (Input/Output)
        if (definition.category === 'nested') {
            // Darker background with category color tint
            const nestedBgColor = this.blendColors(nodeSystem.styles.colors.nodeBg, categoryColor, 0.1);
            bg.beginFill(nestedBgColor);
        } else {
            bg.beginFill(nodeSystem.styles.colors.nodeBg);
        }
        
        // NO BORDER YET - draw it later to avoid black line
        bg.drawRoundedRect(-width/2, -height/2, width, height, 8);
        bg.endFill();
        bg.zIndex = 0; // BACKGROUND layer
        node.container.addChild(bg);
        
        // COLORED BOX - will be added LATER on top
        const coloredBox = new PIXI.Graphics();
        const colorMask = new PIXI.Graphics();
        
        // BORDER REMOVED - using overlays for hover/selected states
        
        node.background = bg;
        node.coloredBox = coloredBox;
        node.colorMask = colorMask;
        // node.border removed - using overlays instead

        // WATERMARK ICON - PNG icons from imgs/icons/
        console.log(`🎨 Attempting to load icon for node: "${definition.title}"`);
        
        // ASYNC LOAD ICON - Don't block node creation
        // FORCE DEBUGGING - Check what's being passed
        console.log(`🔍 TRYING TO LOAD ICON FOR: "${definition.title}" with custom icon: "${definition.icon}"`);
        this.getNodeIconTexture(definition.title, definition.icon).then(iconTexture => {
            if (iconTexture && node.container) {
                console.log(`✅ Creating high-DPI sprite for: "${definition.title}"`);
                const watermarkIcon = new PIXI.Sprite(iconTexture);
                
                // GET ICON SETTINGS from IconManager
                const iconSettings = window.IconManager.getIconSettings(definition.title, definition.category);
                
                // SIZE: Use EXACT SCALE from settings - NO AUTO DPI ADJUSTMENT
                watermarkIcon.scale.set(iconSettings.scale, iconSettings.scale);
                
                // POSITION: Center + offset
                watermarkIcon.anchor.set(0.5, 0.5);
                watermarkIcon.x = iconSettings.offset.x;
                watermarkIcon.y = iconSettings.offset.y;
                
                // ROTATION: 16 degrees anti-clockwise around center
                watermarkIcon.rotation = -16 * Math.PI / 180; // Convert degrees to radians
                
                // STYLE: Use opacity and color from settings
                watermarkIcon.alpha = iconSettings.opacity;
                const pixiColor = window.IconManager.hexToPixiColor(iconSettings.color);
                watermarkIcon.tint = pixiColor;
                watermarkIcon.zIndex = 1; // BACKGROUND layer - below everything except base background
                
                // ENSURE icon doesn't interfere with node interactions
                watermarkIcon.interactive = false;
                watermarkIcon.interactiveChildren = false;
                
                // TEMPORARILY DISABLE MASKING FOR DEBUGGING
                // const iconMask = new PIXI.Graphics();
                // iconMask.beginFill(0xFFFFFF);
                // iconMask.drawRoundedRect(-width/2, -height/2, width, height, 8);
                // iconMask.endFill();
                // iconMask.zIndex = 49; // Just below icon
                // watermarkIcon.mask = iconMask;
                // node.container.addChild(iconMask);
                
                // ADD ICON WITHOUT MASK - Should be visible now
                node.container.addChild(watermarkIcon);
                
                // Store references for later access
                node.watermarkIcon = watermarkIcon;
                node.iconMask = null; // No mask for debugging
                console.log(`🎯 High-DPI icon successfully added to node: "${definition.title}" (scale: ${iconSettings.scale}, DPI: ${iconTexture.baseTexture?.resolution || 1}x, offset: ${iconSettings.offset.x},${iconSettings.offset.y}, opacity: ${iconSettings.opacity}, masked)`);
                
                // Ensure container sorts children by zIndex
                node.container.sortableChildren = true;
            } else if (!iconTexture) {
                console.warn(`❌ No texture loaded for node: "${definition.title}" - NO FALLBACK (box removed)`);
                node.watermarkIcon = null;
            }
        }).catch(error => {
            console.error(`❌ Error loading icon for node: "${definition.title}"`, error);
            node.watermarkIcon = null;
        });

        // Node title - CROSSES TOP of main body, DYNAMIC ZOOM SCALING
        const title = new PIXI.Text(definition.title.toUpperCase(), nodeSystem.styles.helpers.createTextStyle('title', {
            color: nodeSystem.styles.colors.textSecondary,
            weight: 'bold',
            resolution: nodeSystem.resolution,
            fontSize: (nodeSystem.styles.text.sizes.title || 32) + 14, // Increase by 7 (was 3, +4 more)
            letterSpacing: 0.5 // Tiny letter spacing increase
        }));
        
        // DYNAMIC SCALING: Min/Max based on zoom level
        const dynamicScale = Math.max(this.spacing.visual.dynamicScaleMin, Math.min(this.spacing.visual.dynamicScaleMax, 1 / nodeSystem.zoom));
        const baseScale = 1 / nodeSystem.resolution;
        title.scale.set(baseScale * dynamicScale);
        
        // ADD ENHANCED DROP SHADOW to title
        const titleShadow = new PIXI.Text(definition.title.toUpperCase(), nodeSystem.styles.helpers.createTextStyle('title', {
            color: 0x000000, // Black shadow
            weight: 'bold',
            resolution: nodeSystem.resolution,
            fontSize: (nodeSystem.styles.text.sizes.title || 32) + 14,
            letterSpacing: 0.5
        }));
        titleShadow.tint = 0x000000; // FORCE BLACK - override any style color
        titleShadow.scale.set(baseScale * dynamicScale * 1.01); // LARGER shadow (10% bigger)
        titleShadow.anchor.set(0, 1); // LEFT-BOTTOM pivot to match title (position set by updateNodeVisual)
        titleShadow.alpha = 0.4; // Slightly less opacity for blur effect
        titleShadow.zIndex = 1000; // HIGH Z-INDEX to stay in front
        
        // ADD REAL BLUR + DILATION FILTERS
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = 8; // INCREASED blur strength
        
                 // ADD DILATION (OUTLINE) FILTER - Check if available first
         let outlineFilter = null;
         if (PIXI.filters && PIXI.filters.OutlineFilter) {
             outlineFilter = new PIXI.filters.OutlineFilter();
             outlineFilter.thickness = 4; // INCREASED dilation thickness
             outlineFilter.color = 0x000000; // Black outline
             outlineFilter.alpha = 0.6; // Outline opacity (lower for softer effect)
             titleShadow.filters = [outlineFilter, blurFilter]; // Apply both filters
         } else {
             console.warn('⚠️ OutlineFilter not available, using blur only');
             titleShadow.filters = [blurFilter]; // Blur only fallback
         }
        node.container.addChild(titleShadow);
        
        // POSITION WILL BE SET BY updateNodeVisual() - don't set here to avoid conflict
        title.anchor.set(0, 1); // LEFT-BOTTOM pivot (positioning handled by updateNodeVisual)
        title.zIndex = 1001; // HIGHEST Z-INDEX to stay in front of shadow
        node.container.addChild(title);
        
        // Store title and shadow references for dynamic scaling
        node.title = title;
        node.titleShadow = titleShadow;
        node.titleShadowBlur = blurFilter; // Store blur filter reference
        if (outlineFilter) {
            node.titleShadowOutline = outlineFilter; // Store outline/dilation filter reference
        }

        // Category text - underneath node, right-aligned, transparent, uppercase
        const category = new PIXI.Text(definition.category.toUpperCase(), nodeSystem.styles.helpers.createTextStyle('category', {
                                        color: rendererSavedColors?.portAnimation?.paramLabel ? window.PixiNodeStyles.helpers.hexToPixi(rendererSavedColors.portAnimation.paramLabel) : parseInt('666666', 16), // 🎨 #666666 more transparent gray
            resolution: nodeSystem.resolution,
            fontSize: (nodeSystem.styles.text.sizes.category || 22), // Decrease by 1
            letterSpacing: 1.35 // Increase letter spacing
        }));
        category.scale.set(1 / nodeSystem.resolution);
        category.anchor.set(1, 1); // Right align horizontally, bottom align vertically
        category.x = width/2 -12; // Right edge of node
        category.y = -height/2 - this.spacing.layout.categoryVerticalOffset; // Above the node with margin
        category.alpha = this.spacing.hover.categoryAlpha; // Make it more transparent
        category.zIndex = 1002; // ABOVE title and shadow
        node.container.addChild(category);

        // Parameters section - exact AllNodes32.html styling
        if (definition.params && definition.params.length > 0) {
            this.createParameters(nodeSystem, node, definition, width, height);
        }

        // Create ports
        this.createPorts(nodeSystem, node, definition, width, height);

        // ADD PARAMETER BUTTON for nested nodes (Input/Output)
        if (definition.category === 'nested') {
            this.createParameterButton(nodeSystem, node, definition, width, height);
        }

        // Make interactive with HOVER EFFECTS
        node.container.interactive = true;
        node.container.buttonMode = true;
        
        // Simple HOVER EFFECTS - store context to avoid 'this' issues
        const self = this;
        const styles = nodeSystem.styles;
        
        node.container.on('pointerover', function() {
            if (!node.selected) {
                // HOVER OUTLINE: STROKE ONLY approach - no fill operations
                const categoryColor = styles.colors.categories[definition.category] || styles.colors.hoverGlow;
                
                if (!node.hoverOverlay) {
                    node.hoverOverlay = new PIXI.Graphics();
                    node.hoverOverlay.interactive = false;
                    node.container.addChild(node.hoverOverlay);
                }
                
                node.hoverOverlay.clear();
                node.hoverOverlay.lineStyle(2, categoryColor, 0.8); // 2px width, 80% opacity for visibility
                // NO beginFill/endFill - pure stroke only
                node.hoverOverlay.drawRoundedRect(-node.width/2, -node.height/2, node.width, node.height, styles.node.borderRadius);
            }
        });
        
        node.container.on('pointerout', function() {
            // ALWAYS clear hover overlay when mouse leaves
            if (node.hoverOverlay) {
                node.hoverOverlay.clear();
            }
        });
        
        node.container.on('pointerdown', (e) => nodeSystem.onNodeMouseDown(e, node));

        // COLORED BOX ON TOP - add LAST so it appears above everything
        nodeSystem.styles.helpers.createColoredSection(node.coloredBox, categoryColor, width, height, bottomSectionHeight, nodeSystem.zoom);
        nodeSystem.styles.helpers.createNodeMask(node.colorMask, width, height, 8);
        
        // Add colored box to container with proper Z-INDEX
        node.coloredBox.zIndex = 10; // Above background, below title
        node.colorMask.zIndex = 11; // Above colored box
        node.container.addChild(node.coloredBox);
        node.container.addChild(node.colorMask);
        
        // Apply mask but keep it on top
        nodeSystem.styles.helpers.applyColoredSectionMask(node.coloredBox, node.colorMask);

        // Apply initial visual state (includes shadows)
        this.updateNodeVisual(nodeSystem, node);

        return node;
    },

    // HELPER: Blend two colors
    blendColors(color1, color2, factor) {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return (r << 16) | (g << 8) | b;
    },

    // CREATE PARAMETER BUTTON for nested nodes
    createParameterButton(nodeSystem, node, definition, width, height) {
        const buttonSize = 16;
        const margin = 4;
        
        // Button container
        const buttonContainer = new PIXI.Container();
        buttonContainer.x = width/2 - buttonSize/2 - margin;
        buttonContainer.y = height/2 - buttonSize/2 - margin;
        buttonContainer.zIndex = 1000; // High z-index to stay on top
        
        // Button background (rounded square)
        const buttonBg = new PIXI.Graphics();
        const categoryColor = nodeSystem.styles.colors.categories[definition.category];
        buttonBg.beginFill(categoryColor, 0.8);
        buttonBg.drawRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 3);
        buttonBg.endFill();
        
        // Plus icon
        const plusIcon = new PIXI.Graphics();
        plusIcon.lineStyle(2, 0xFFFFFF, 1.0);
        // Horizontal line
        plusIcon.moveTo(-buttonSize/4, 0);
        plusIcon.lineTo(buttonSize/4, 0);
        // Vertical line
        plusIcon.moveTo(0, -buttonSize/4);
        plusIcon.lineTo(0, buttonSize/4);
        
        buttonContainer.addChild(buttonBg);
        buttonContainer.addChild(plusIcon);
        
        // Make interactive
        buttonContainer.interactive = true;
        buttonContainer.buttonMode = true;
        buttonContainer.cursor = 'pointer';
        
        // Hover effects
        buttonContainer.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.beginFill(categoryColor, 1.0);
            buttonBg.drawRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 3);
            buttonBg.endFill();
        });
        
        buttonContainer.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.beginFill(categoryColor, 0.8);
            buttonBg.drawRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 3);
            buttonBg.endFill();
        });
        
        // Click handler - open parameter manager
        buttonContainer.on('pointerdown', (e) => {
            e.stopPropagation(); // Prevent node selection
            this.openParameterManager(nodeSystem, node, definition);
        });
        
        node.container.addChild(buttonContainer);
        node.paramButton = buttonContainer; // Store reference
    },

    // OPEN PARAMETER MANAGER UI
    openParameterManager(nodeSystem, node, definition) {
        console.log(`🔧 Opening parameter manager for ${definition.title}`);
        
        // Create modal UI for parameter management
        const overlay = document.createElement('div');
        overlay.className = 'parameter-manager-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.className = 'parameter-manager-modal';
        modal.style.cssText = `
            background: #2a2a2a;
            border: 2px solid #FF0080;
            border-radius: 8px;
            padding: 20px;
            min-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            font-family: 'Consolas', monospace;
        `;
        
        modal.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #FF0080;">${definition.title} Parameters</h3>
            <div id="parameter-list"></div>
            <div style="margin-top: 20px;">
                <button id="add-param" style="background: #FF0080; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Add Parameter</button>
                <button id="close-modal" style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Load existing parameters
        this.refreshParameterList(node, definition);
        
        // Event handlers
        document.getElementById('add-param').onclick = () => {
            this.addNewParameter(node, definition);
            this.refreshParameterList(node, definition);
            this.refreshNodeVisual(nodeSystem, node);
        };
        
        document.getElementById('close-modal').onclick = () => {
            document.body.removeChild(overlay);
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
    },

    // REFRESH PARAMETER LIST in UI
    refreshParameterList(node, definition) {
        const paramList = document.getElementById('parameter-list');
        if (!paramList) return;
        
        paramList.innerHTML = '';
        
        // Ensure node has parameters array
        if (!node.definition.params) {
            node.definition.params = [];
        }
        
        node.definition.params.forEach((param, index) => {
            const paramDiv = document.createElement('div');
            paramDiv.style.cssText = `
                margin-bottom: 15px;
                padding: 10px;
                border: 1px solid #555;
                border-radius: 4px;
                background: #333;
            `;
            
            paramDiv.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <label style="display: inline-block; width: 60px;">Name:</label>
                    <input type="text" value="${param.label || ''}" 
                           style="background: #444; color: white; border: 1px solid #666; padding: 4px; width: 150px;"
                           onchange="window.PixiNodeRenderer.updateParamField(${index}, 'label', this.value, '${node.id}')">
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: inline-block; width: 60px;">Default:</label>
                    <input type="text" value="${param.value || ''}" 
                           style="background: #444; color: white; border: 1px solid #666; padding: 4px; width: 150px;"
                           onchange="window.PixiNodeRenderer.updateParamField(${index}, 'value', this.value, '${node.id}')"
                           placeholder="Default value when no input connected">
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: inline-block; width: 60px;">Type:</label>
                    <span style="color: #999; font-style: italic; padding: 4px;">Auto-detected from connections</span>
                </div>
                <button onclick="window.PixiNodeRenderer.removeParameter(${index}, '${node.id}')" 
                        style="background: #cc4444; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                    Remove
                </button>
            `;
            
            paramList.appendChild(paramDiv);
        });
    },

    // ADD NEW PARAMETER
    addNewParameter(node, definition) {
        if (!node.definition.params) {
            node.definition.params = [];
        }
        
        node.definition.params.push({
            label: `param${node.definition.params.length + 1}`,
            value: 0.0
            // type: auto-detected from connections
        });
    },

    // UPDATE PARAMETER FIELD
    updateParamField(index, field, value, nodeId) {
        // Find node by ID
        const node = window.nodeSystem?.nodes?.find(n => n.id === nodeId);
        if (!node || !node.definition.params[index]) return;
        
        node.definition.params[index][field] = value;
        
        // Update node if it has an updateFromParams method
        if (node.definition.updateFromParams) {
            node.definition.updateFromParams();
        }
        
        // Refresh node visual to show new parameters
        this.refreshNodeVisual(window.nodeSystem, node);
        
        console.log(`Updated ${field} for param ${index}:`, value);
    },

    // REMOVE PARAMETER
    removeParameter(index, nodeId) {
        const node = window.nodeSystem?.nodes?.find(n => n.id === nodeId);
        if (!node || !node.definition.params) return;
        
        node.definition.params.splice(index, 1);
        window.PixiNodeRenderer.refreshParameterList(node, node.definition);
        
        // Refresh node visual to show updated parameters
        window.PixiNodeRenderer.refreshNodeVisual(window.nodeSystem, node);
    },

    // REFRESH NODE VISUAL - rebuild the node to show parameter changes
    refreshNodeVisual(nodeSystem, node) {
        if (!node || !nodeSystem) return;
        
        // Store current position
        const currentX = node.container.x;
        const currentY = node.container.y;
        const isSelected = node.selected;
        
        // Remove old node from layer
        nodeSystem.nodeLayer.removeChild(node.container);
        
        // Update node height to accommodate new parameters
        node.height = this.calculateNodeHeight(node.definition);
        node.width = this.spacing.layout.nodeWidth;
        
        // Recreate the node visual elements
        const newNode = this.createNode(nodeSystem, node.definition, node.id);
        
        // Restore position and state
        newNode.container.x = currentX;
        newNode.container.y = currentY;
        newNode.selected = isSelected;
        
        // Replace old node reference in nodes array
        const nodeIndex = nodeSystem.nodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
            nodeSystem.nodes[nodeIndex] = newNode;
        }
        
        // Update selection if this node was selected
        if (isSelected) {
            nodeSystem.selectedNodes.delete(node);
            nodeSystem.selectedNodes.add(newNode);
            this.updateNodeVisual(nodeSystem, newNode);
        }
        
        // Add to layer
        nodeSystem.nodeLayer.addChild(newNode.container);
        
        console.log(`🔄 Refreshed visual for node: ${node.definition.title}`);
    },

    calculateNodeHeight(definition) {
        let height = this.spacing.baseHeight;
        
        if (definition.params && definition.params.length > 0) {
            height += definition.params.length * this.spacing.parameter.heightPerParam + this.spacing.parameter.heightPadding;
        }
        
        const maxPorts = Math.max(definition.inputs.length, definition.outputs.length);
        if (maxPorts > 0) {
            height += Math.max(maxPorts * this.spacing.port.heightPerPort + this.spacing.port.heightPadding, 20);
        }
        
        return Math.max(height, this.spacing.minHeight);
    },

    // PARAMETER CREATION
    createParameters(nodeSystem, node, definition, width, height) {
        // Use centralized spacing config
        const paramSpacing = this.spacing.parameter.vertical;
        const totalParamHeight = (definition.params.length - 1) * paramSpacing;
        const startY = this.spacing.parameter.startOffset;
        
        // Separator line REMOVED - borderless design
        
        definition.params.forEach((param, index) => {
            const y = startY + index * paramSpacing;
            
            // Parameter label - hide for constant/random/time/hash nodes since they're self-explanatory
            const nodeTypesToHide = ['Constant', 'Random', 'Time', 'Hash', 'ConstantNode', 'RandomNode', 'TimeNode', 'HashNode'];
            const shouldShowParamLabel = !nodeTypesToHide.some(type => 
                definition.title === type || definition.title.toLowerCase() === type.toLowerCase()
            );
            
            let labelWidth = 0;
            if (shouldShowParamLabel) {
                const label = new PIXI.Text((param.label + ':').toLowerCase(), nodeSystem.styles.helpers.createTextStyle('param', {
                    color: nodeSystem.styles.colors.textMuted,
                    resolution: nodeSystem.resolution
                }));
                label.scale.set(1 / nodeSystem.resolution);
                label.x = -width/2 + 14;
                label.y = y;
                node.container.addChild(label);
                
                // Calculate label width for positioning input right beside it
                labelWidth = label.getBounds().width + this.spacing.parameter.labelSpacing;
            }
            
            // Parameter input background - NO BORDER (borderless design)
            const inputBg = new PIXI.Graphics();
            inputBg.beginFill(nodeSystem.styles.parameters.input.backgroundColor);
            
            // Position input right beside label, or center if no label
            const inputX = shouldShowParamLabel ? 
                (-width/2 + 14 + labelWidth) : 
                -nodeSystem.styles.parameters.input.width/2;
                
            // FIXED: Center input background properly around y position
            const inputY = y - nodeSystem.styles.parameters.input.height/2;
            inputBg.drawRoundedRect(inputX, inputY, nodeSystem.styles.parameters.input.width, nodeSystem.styles.parameters.input.height, nodeSystem.styles.parameters.input.borderRadius);
            inputBg.endFill();
            node.container.addChild(inputBg);
            
            // Parameter value text - larger font, centered vertically in field
            const value = new PIXI.Text(param.value.toString(), nodeSystem.styles.helpers.createTextStyle('param', {
                color: nodeSystem.styles.colors.textPrimary,
                resolution: nodeSystem.resolution,
                fontSize: ((nodeSystem.styles.text.sizes.param || 12) + 1) * 2 // DOUBLE the parameter text size
            }));
            value.scale.set(1 / nodeSystem.resolution);
            
            // FIXED: Position text properly inside input field
            value.anchor.set(0, 0.5); // ALWAYS left align, vertically center
            value.x = inputX + this.spacing.parameter.inputPadding; // Padding from left edge of input
            value.y = y; // Center vertically - same as input field center
            value.zIndex = 2000; // HIGH Z-INDEX to stay on top
            node.container.addChild(value);
            
            // STORE references and LOCAL coordinates for parameter editor to access later
            node.parameterInputBg = inputBg;
            node.parameterValue = value;
            node.parameterInputData = {
                inputX: inputX,
                inputY: inputY,
                inputWidth: nodeSystem.styles.parameters.input.width,
                inputHeight: nodeSystem.styles.parameters.input.height
            };
            
            // SETUP PARAMETER INTERACTIVITY via modular system
            if (nodeSystem.parameterEditor) {
                console.log(`🔧 Setting up parameter: ${definition.title}.${param.label} via modular system`);
                nodeSystem.parameterEditor.setupParameterInteractivity(node, inputBg, value, param, index);
            } else {
                console.warn(`⚠️ No parameter editor available for: ${definition.title}.${param.label}`);
            }
        });
    },



    // PORT CREATION
    createPorts(nodeSystem, node, definition, width, height) {
        const portStartY = this.spacing.port.startOffset;  
        const portSpacing = this.spacing.port.vertical;
        
        // Input ports
        definition.inputs.forEach((input, index) => {
            const port = this.createPort(nodeSystem, input, 'input', index, node);
            port.x = -width/2;
            port.y = portStartY - (index * portSpacing);
            node.container.addChild(port);
            node.ports.inputs.push(port);
        });

        // Output ports
        definition.outputs.forEach((output, index) => {
            const port = this.createPort(nodeSystem, output, 'output', index, node);
            port.x = width/2;
            port.y = portStartY - (index * portSpacing);
            node.container.addChild(port);
            node.ports.outputs.push(port);
        });
    },

    createPort(nodeSystem, portDef, direction, index, node) {
        const portContainer = new PIXI.Container();
        
        // Port dot using modular styles - FILLED with type color since borders removed
        const dot = new PIXI.Graphics();
        const typeColor = nodeSystem.styles.helpers.getTypeColor(portDef.type);
        
        dot.beginFill(typeColor); // Fill with data type color instead of node background
        dot.drawCircle(0, 0, nodeSystem.styles.ports.dot.radius);
        dot.endFill();
        
        portContainer.addChild(dot);
        
        // Port label using modular styles - lowercase, DOUBLE SIZE
        const label = new PIXI.Text(portDef.label.toLowerCase(), nodeSystem.styles.helpers.createTextStyle('port', {
            color: nodeSystem.styles.colors.textMuted,
            resolution: nodeSystem.resolution,
            fontSize: (nodeSystem.styles.text.sizes.port || 14) * 2 // DOUBLE the socket title size
        }));
        label.scale.set(1 / nodeSystem.resolution);
        
        if (direction === 'input') {
            label.x = 8;
            label.y = -6;
        } else {
            label.anchor.set(1, 0);
            label.x = -8;
            label.y = -6;
        }
        
        portContainer.addChild(label);
        
        // Make ports interactive with BIGGER HITBOX
        portContainer.interactive = true;
        portContainer.cursor = 'pointer';
        
        // Create larger invisible hitbox for easier clicking
        // Use hitArea only - no need for visible graphics
        const hitBoxSize = nodeSystem.styles.ports.dot.radius * 4; // 3x larger than visual
        portContainer.hitArea = new PIXI.Circle(0, 0, hitBoxSize);
        
        // Create hover glow that will appear behind the node
        const hoverGlow = new PIXI.Graphics();
        const glowSize = nodeSystem.styles.ports.dot.radius * 4; // Triple size
        const orangeColor = rendererSavedColors?.portAnimation?.connectorOrange ? window.PixiNodeStyles.helpers.hexToPixi(rendererSavedColors.portAnimation.connectorOrange) : parseInt('FF6600', 16); // 🎨 #FF6600 Bright Orange
        const glowAlpha = rendererSavedColors?.opacity?.portConnectorGlow || this.spacing.hover.glowAlpha;
        hoverGlow.beginFill(orangeColor, glowAlpha); // Semi-transparent orange
        hoverGlow.drawCircle(0, 0, glowSize);
        hoverGlow.endFill();
        hoverGlow.visible = false;
        
        // Add to node's background layer (behind everything)
        if (!node.hoverGlowLayer) {
            node.hoverGlowLayer = new PIXI.Container();
            node.container.addChildAt(node.hoverGlowLayer, 0); // Add at bottom
        }
        node.hoverGlowLayer.addChild(hoverGlow);
        
        // Store reference for easy access
        portContainer.hoverGlow = hoverGlow;
        
        // Store port data for easier access
        portContainer.portData = { portDef, direction, node };
        
        // Store type color for events
        const portTypeColor = typeColor;
        
        portContainer.on('pointerover', (e) => {
            e.stopPropagation();
            nodeSystem.hoveredPort = { container: portContainer, def: portDef, direction, node };
            
            // Show orange glow behind node for ALL port hovers
            if (portContainer.hoverGlow) {
                portContainer.hoverGlow.visible = true;
                // Position glow at port's position relative to node
                portContainer.hoverGlow.x = portContainer.x;
                portContainer.hoverGlow.y = portContainer.y;
            }
            
            // Scale and highlight the port itself
            // INPUT PORTS: Only highlight when connecting
            // OUTPUT PORTS: Always highlight
            if (direction === 'output' || nodeSystem.isConnecting) {
                // Simple scale without animation
                let portScale = nodeSystem.styles.ports.hover.scale;
                
                // TYPE VALIDATION: Check compatibility when connecting
                let fillColor = portTypeColor;
                
                if (direction === 'input' && nodeSystem.isConnecting && nodeSystem.activeConnection) {
                    const compatible = nodeSystem.canConnect(nodeSystem.activeConnection.fromDef, portDef);
                    if (!compatible) {
                        fillColor = rendererSavedColors?.portAnimation?.incompatibleRed ? window.PixiNodeStyles.helpers.hexToPixi(rendererSavedColors.portAnimation.incompatibleRed) : parseInt('FF0000', 16); // 🎨 #FF0000 Red for incompatible
                        console.log(`❌ Type mismatch: ${nodeSystem.activeConnection.fromDef.type} → ${portDef.type}`);
                    } else {
                        // Compatible connection - make 20% larger and brighter
                        portScale = nodeSystem.styles.ports.hover.scale * this.spacing.hover.portScaleMultiplier; // Hover scale increase
                        // Make color brighter by mixing with white
                        const r = (fillColor >> 16) & 0xFF;
                        const g = (fillColor >> 8) & 0xFF;
                        const b = fillColor & 0xFF;
                        const brighterR = Math.min(255, Math.floor(r * this.spacing.hover.colorBrightenFactor));
                        const brighterG = Math.min(255, Math.floor(g * this.spacing.hover.colorBrightenFactor));
                        const brighterB = Math.min(255, Math.floor(b * this.spacing.hover.colorBrightenFactor));
                        fillColor = (brighterR << 16) | (brighterG << 8) | brighterB;
                        console.log(`✅ Type compatible: ${nodeSystem.activeConnection.fromDef.type} → ${portDef.type}`);
                    }
                }
                
                // Apply scale and color
                dot.scale.set(portScale);
                dot.clear();
                dot.beginFill(fillColor);
                dot.drawCircle(0, 0, nodeSystem.styles.ports.dot.radius);
                dot.endFill();
            }
            
            // Update connection preview if connecting
            if (nodeSystem.isConnecting) {
                nodeSystem.updateConnectionPreview();
            }
        });
        
        portContainer.on('pointerout', (e) => {
            e.stopPropagation();
            nodeSystem.hoveredPort = null;
            
            // Hide orange glow
            if (portContainer.hoverGlow) {
                portContainer.hoverGlow.visible = false;
            }
            
            // INPUT PORTS: Only reset if was highlighted
            // OUTPUT PORTS: Always reset
            if (direction === 'output' || nodeSystem.isConnecting) {
                // Reset scale
                dot.scale.set(1.0);
            
                // Restore normal appearance - use type color (NO BORDERS)
                dot.clear();
                dot.beginFill(portTypeColor); // Use data type color as default
                dot.drawCircle(0, 0, nodeSystem.styles.ports.dot.radius);
                dot.endFill();
            }
        });
        
        // DRAG-TO-CONNECT: Different behavior for input vs output
        if (direction === 'output') {
            // OUTPUT PORTS: Start connection on click
            portContainer.on('pointerdown', (e) => {
                console.log(`🖱️ OUTPUT PORT CLICKED: ${portDef.label}`);
                e.stopPropagation();
                
                // Visual feedback
                dot.clear();
                dot.beginFill(rendererSavedColors?.portAnimation?.validGreen ? window.PixiNodeStyles.helpers.hexToPixi(rendererSavedColors.portAnimation.validGreen) : parseInt('00FF00', 16)); // 🎨 #00FF00 Green flash for output
                dot.drawCircle(0, 0, nodeSystem.styles.ports.dot.radius + 2);
                dot.endFill();
                
                setTimeout(() => {
                    dot.clear();
                    dot.beginFill(portTypeColor); // Use data type color
    
                    dot.drawCircle(0, 0, nodeSystem.styles.ports.dot.radius);
                    dot.endFill();
                }, 200);
                
                nodeSystem.startConnection(portContainer, portDef, direction, node);
            });
        } else {
            // INPUT PORTS: Complete connection on mouse release
            portContainer.on('pointerup', (e) => {
                e.stopPropagation();
                if (nodeSystem.isConnecting && nodeSystem.activeConnection) {
                    console.log(`🖱️ INPUT PORT RELEASE: ${portDef.label}`);
                    e.stopPropagation();
                    
                    // TYPE VALIDATION: Check before completion
                    const compatible = nodeSystem.canConnect(nodeSystem.activeConnection.fromDef, portDef);
                    
                    // Visual feedback based on compatibility
                    dot.clear();
                    if (compatible) {
                        dot.beginFill(rendererSavedColors?.portAnimation?.validGreen ? window.PixiNodeStyles.helpers.hexToPixi(rendererSavedColors.portAnimation.validGreen) : parseInt('00FF00', 16)); // 🎨 #00FF00 Green flash for valid connection
                        console.log(`✅ Valid connection: ${nodeSystem.activeConnection.fromDef.type} → ${portDef.type}`);
                    } else {
                        dot.beginFill(rendererSavedColors?.portAnimation?.invalidRed ? window.PixiNodeStyles.helpers.hexToPixi(rendererSavedColors.portAnimation.invalidRed) : parseInt('FF0000', 16)); // 🎨 #FF0000 Red flash for invalid
                        console.log(`❌ Invalid connection: ${nodeSystem.activeConnection.fromDef.type} → ${portDef.type}`);
                    }
                    dot.drawCircle(0, 0, nodeSystem.styles.ports.dot.radius + 2);
                    dot.endFill();
                    
                    setTimeout(() => {
                        dot.clear();
                        dot.beginFill(portTypeColor); // Use data type color
        
                        dot.drawCircle(0, 0, nodeSystem.styles.ports.dot.radius);
                        dot.endFill();
                    }, 200);
                    
                    // Only complete connection if valid
                    if (compatible) {
                        nodeSystem.endConnection(portContainer, portDef, direction, node);
                    } else {
                        nodeSystem.showConnectionError(`Cannot connect ${nodeSystem.activeConnection.fromDef.type} to ${portDef.type}`);
                        nodeSystem.cancelConnection();
                    }
                }
            });
        }
        
        portContainer.userData = { type: portDef.type, direction: direction, label: portDef.label };
        
        return portContainer;
    },

    // NODE VISUAL UPDATES - using overlays instead of borders
    updateNodeVisual(nodeSystem, node) {
        const width = this.spacing.layout.nodeWidth;
        const height = this.calculateNodeHeight(node.definition);
        const bottomSectionHeight = nodeSystem.styles.node.bottomSectionHeight;
        
        // UPDATE node object with dynamic height
        node.height = height;
        
        // Update main background - ALWAYS use normal nodeBg (no selectedBg)
        const bgColor = nodeSystem.styles.colors.nodeBg;
        
        node.background.clear();
        node.background.beginFill(bgColor);
        node.background.drawRoundedRect(-width/2, -height/2, width, height, nodeSystem.styles.node.borderRadius);
        node.background.endFill();
        
        // CLEAR HOVER OVERLAY when updating visual state (fixes stuck hover)
        if (node.hoverOverlay) {
            node.hoverOverlay.clear();
        }
        
        // SELECTED STATE: Use configurable selection styling
        if (node.selected) {
            if (!node.selectedOverlay) {
                node.selectedOverlay = new PIXI.Graphics();
                node.selectedOverlay.interactive = false;
                node.container.addChild(node.selectedOverlay);
            }
            
            // Get selection styling from effects system
            const selectionConfig = nodeSystem.effects.selection.node;
            const borderColor = nodeSystem.effects.hexToPixi(selectionConfig.borderColor);
            const borderAlpha = selectionConfig.borderAlpha;
            const borderWidth = selectionConfig.borderWidth;
            
            node.selectedOverlay.clear();
            
            // Only draw if alpha > 0
            if (borderAlpha > 0) {
                node.selectedOverlay.beginFill(borderColor, borderAlpha);
                node.selectedOverlay.drawRoundedRect(-width/2, -height/2, width, height, nodeSystem.styles.node.borderRadius);
                node.selectedOverlay.endFill();
            }
        } else if (node.selectedOverlay) {
            node.selectedOverlay.clear();
        }
        
        // Update colored box using style system (KEEP ON TOP)
        if (node.coloredBox) {
            const categoryColor = nodeSystem.styles.colors.categories[node.definition.category] || parseInt('666666', 16);
            nodeSystem.styles.helpers.createColoredSection(node.coloredBox, categoryColor, width, height, bottomSectionHeight, nodeSystem.zoom);
            
            // ENSURE colored box maintains proper Z-INDEX
            if (node.container.children.includes(node.coloredBox)) {
                node.container.removeChild(node.coloredBox);
            }
            node.coloredBox.zIndex = 10; // Above background, below title
            node.container.addChild(node.coloredBox);
        }
        
        // Update mask using style system (KEEP ON TOP)
        if (node.colorMask) {
            nodeSystem.styles.helpers.createNodeMask(node.colorMask, width, height, nodeSystem.styles.node.borderRadius);
            
            // ENSURE mask maintains proper Z-INDEX
            node.container.removeChild(node.colorMask);
            node.colorMask.zIndex = 11; // Above colored box
            node.container.addChild(node.colorMask);
            
            // Reapply mask
            nodeSystem.styles.helpers.applyColoredSectionMask(node.coloredBox, node.colorMask);
        }
        
        // DYNAMIC TITLE SCALING based on zoom level
        if (node.title) {
            // MAINTAIN LEFT-BOTTOM ANCHOR for snapping to bottom-left of node
            node.title.anchor.set(0,.32); // LEFT-BOTTOM pivot
            const dynamicScale = Math.max(this.spacing.visual.dynamicScaleMin, Math.min(this.spacing.visual.dynamicScaleMax, 1 / nodeSystem.zoom));
            const baseScale = .75 / nodeSystem.resolution;
            node.title.scale.set(baseScale * dynamicScale);
            
                         // UPDATE title position - LEFT PADDING from edge (use DYNAMIC height from above)
             node.title.x = -width/2 + this.spacing.layout.titleHorizontalOffset; // LEFT PADDING from edge
             node.title.y = height/2 - 7; // SNAP to DYNAMIC bottom edge - MOVED UP 7px
            
            // ALSO SCALE THE SHADOW to match AND update position
            if (node.titleShadow) {
                node.titleShadow.anchor.set(0,.55); // LEFT-BOTTOM pivot to match title
                node.titleShadow.scale.set(baseScale * dynamicScale * 1.0); // LARGER shadow (10% bigger)
                
                // UPDATE shadow position with LARGER offset for blur + dilation visibility
                node.titleShadow.x = -width/2 + this.spacing.layout.titleHorizontalOffset + 3; // +3px right from title with padding
                node.titleShadow.y = height/2 - 7 + 3; // +3px down from MOVED UP title
            }
        }
        
        // ICON STAYS FIXED SIZE - No dynamic scaling with zoom
        // Icons should scale with the node, not with zoom level
    }
};

// TEXTURE DEBUGGING FUNCTION
window.debugTextures = function() {
    console.log('🔍 DEBUGGING TEXTURE SYSTEM...');
    const renderer = window.PixiNodeRenderer;
    
    // Test a few common nodes
    const testNodes = ['Add', 'Multiply', 'Constant', 'Random'];
    
    testNodes.forEach(nodeTitle => {
        console.log(`\n--- Testing: ${nodeTitle} ---`);
        const texture = renderer.getNodeIconTexture(nodeTitle);
        console.log(`Result:`, texture);
        
        if (texture && texture.baseTexture) {
            console.log(`Texture valid: ${texture.valid}`);
            console.log(`BaseTexture resource:`, texture.baseTexture.resource);
            console.log(`BaseTexture valid: ${texture.baseTexture.valid}`);
        }
    });
    
    console.log('\n📦 Texture Cache:', renderer.iconTextureCache);
};

// SPRITE SHEET DEBUG FUNCTION
window.testSpriteSheetDebug = async function() {
    console.log('\n🧪 SPRITE SHEET DEBUG TEST');
    console.log('=========================');
    
    const renderer = window.PixiNodeRenderer;
    
    try {
        console.log('1. Testing file access...');
        const accessible = await renderer.testSpriteSheetAccess();
        console.log(`File accessible: ${accessible}`);
        
        if (accessible) {
            console.log('2. Testing PIXI.Assets.load()...');
            try {
                const texture = await PIXI.Assets.load('imgs/node_icons_white_sheet.png');
                console.log('Assets.load() result:', texture);
                console.log('Texture type:', typeof texture);
                console.log('Is PIXI.Texture:', texture instanceof PIXI.Texture);
                
                if (texture) {
                    console.log('Texture width:', texture.width);
                    console.log('Texture height:', texture.height);
                    console.log('BaseTexture exists:', !!texture.baseTexture);
                }
            } catch (error) {
                console.error('Assets.load() failed:', error);
                
                console.log('3. Falling back to PIXI.Texture.from()...');
                const texture2 = PIXI.Texture.from('imgs/node_icons_white_sheet.png');
                console.log('Texture.from() result:', texture2);
            }
        }
    } catch (error) {
        console.error('Debug test failed:', error);
    }
};

console.log('🎨 PIXI Node Renderer loaded successfully');
console.log('💡 Run window.debugTextures() to test texture loading');
console.log('🧪 Run window.testSpriteSheetDebug() to debug sprite sheet issues');

// TEST PATH ACCESSIBILITY
window.testIconPaths = async function() {
    console.log('🔍 TESTING ICON PATH ACCESSIBILITY...');
    const testPaths = [
        'imgs/icons/icon_AddNode.png',
        'imgs/icons/icon_MultiplyNode.png', 
        'imgs/icons/icon_ConstantNode.png'
    ];
    
    for (const path of testPaths) {
        try {
            const response = await fetch(path);
            console.log(`${response.ok ? '✅' : '❌'} ${path} - Status: ${response.status}`);
        } catch (error) {
            console.error(`❌ ${path} - Error:`, error);
        }
    }
};

// TEST PIXI TEXTURE LOADING DIRECTLY
window.testPixiTextures = function() {
    console.log('🔍 TESTING PIXI TEXTURE LOADING...');
    
    const testPath = 'imgs/icons/icon_AddNode.png';
    console.log(`Testing PIXI.Texture.from('${testPath}')`);
    
    try {
        const texture = PIXI.Texture.from(testPath);
        console.log('Texture object:', texture);
        console.log('BaseTexture:', texture.baseTexture);
        console.log('Valid:', texture.valid);
        
        // Listen for events
        texture.baseTexture.on('loaded', () => {
            console.log('✅ PIXI Texture loaded successfully!');
        });
        
        texture.baseTexture.on('error', (error) => {
            console.error('❌ PIXI Texture failed to load:', error);
        });
        
        return texture;
    } catch (error) {
        console.error('❌ PIXI Texture.from() threw error:', error);
        return null;
    }
};