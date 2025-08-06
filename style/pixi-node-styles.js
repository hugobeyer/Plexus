/**
 * 🎨 PIXI NODE EDITOR STYLES
 * Modular style system for PIXI-based node editor
 * AUTO-LOADS from Color Palette Manager if available
 * 
 * 🎨 CURSOR COLOR PICKER SUPPORT:
 * All hex colors are shown as #RRGGBB for visual preview in Cursor
 * PIXI uses 0xRRGGBB format internally (converted automatically)
 * 
 * 🌈 QUICK COLOR PALETTE OVERVIEW:
 * Categories: #4CAF50 #9C27B0 #FF9800 #2196F3 #607D8B #9013FE
 * Types:      #4CAF50 #2196F3 #FF9800 #9C27B0 #E91E63 #FFC107  
 * Wires:      #FF6B35 #FF0000
 * UI:         #1a1a1a #333333 #555555 #FFD700 #444444 #ffffff
 */

// Auto-load colors from Color Palette Manager
function loadSavedColors() {
    try {
        const saved = localStorage.getItem('plexusColors');
        if (saved) {
            const colors = JSON.parse(saved);
            console.log('🎨 Loaded custom colors from Color Palette Manager');
            return colors;
        }
    } catch (e) {
        console.warn('Failed to load saved colors, using defaults');
    }
    return null;
}

// Convert hex string to hex number for PIXI
function hexToPixi(hexString) {
    if (typeof hexString === 'number') {
        // Ensure it's within valid range
        return Math.max(0, Math.min(0xFFFFFF, hexString));
    }
    if (typeof hexString === 'string') {
        let clean = hexString.replace('#', '').toUpperCase();
        
        // Handle different hex formats
        if (clean.length === 3) {
            // Convert ABC to AABBCC
            clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        } else if (clean.length === 8) {
            // Remove alpha channel (RRGGBBAA -> RRGGBB)
            clean = clean.substring(0, 6);
        } else if (clean.length !== 6) {
            // Invalid format, use fallback
            console.warn('Invalid hex color format:', hexString);
            return parseInt('666666', 16);
        }
        
        const value = parseInt(clean, 16);
        if (isNaN(value)) {
            console.warn('Invalid hex color value:', hexString);
            return parseInt('666666', 16);
        }
        
        return Math.max(0, Math.min(0xFFFFFF, value));
    }
    return parseInt('666666', 16); // 🎨 #666666 fallback
}

const nodeStylesSavedColors = loadSavedColors();

window.PixiNodeStyles = {
    colors: {
        // Base colors - auto-loaded from Color Palette Manager
        // 🎨 COLOR PICKER PREVIEW: #1a1a1a #333333 #555555 #FFD700 #444444
        background: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.background?.main) : hexToPixi('#1a1a1a'),     // 🎨 #1a1a1a Dark Gray
        nodeBg: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.node?.background) : hexToPixi('#2e2e2e'),          // 🎨 #2e2e2e Darker Gray (10% darker)  
        nodeBorder: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.node?.border) : hexToPixi('#555555'),         // 🎨 #555555 Light Gray
        selectedBorder: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.node?.selectedBorder) : hexToPixi('#FFD700'), // 🎨 #FFD700 Gold
        selectedBg: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.node?.selectedBg) : hexToPixi('#444444'),     // 🎨 #444444 Gray
        
        // Text colors - auto-loaded from Color Palette Manager
        // 🎨 COLOR PICKER PREVIEW: #ffffff #dddddd #aaaaaa  
        textPrimary: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.text?.primary) : hexToPixi('#ffffff'),       // 🎨 #ffffff White
        textSecondary: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.text?.secondary) : hexToPixi('#dddddd'),   // 🎨 #dddddd Light Gray
        textMuted: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.text?.muted) : hexToPixi('#aaaaaa'),           // 🎨 #aaaaaa Gray
        
        // Effects  
        // 🎨 COLOR PICKER PREVIEW: #000000 #4CAF50
        shadow: nodeStylesSavedColors?.effects?.shadow ? hexToPixi(nodeStylesSavedColors.effects.shadow) : hexToPixi('#000000'), // 🎨 #000000 Black
        hoverGlow: nodeStylesSavedColors ? hexToPixi(nodeStylesSavedColors.node?.hoverGlow) : hexToPixi('#4CAF50'),      // 🎨 #4CAF50 Green
        
        // Category colors - auto-loaded from Color Palette Manager
        // 🎨 COLOR PICKER PREVIEW: #4CAF50 #9C27B0 #FF9800 #2196F3 #607D8B #9013FE #FF0080
        categories: nodeStylesSavedColors?.categories ? {
            math: hexToPixi(nodeStylesSavedColors.categories.math || '#4CAF50'),      // 🎨 #4CAF50 Green
            vector: hexToPixi(nodeStylesSavedColors.categories.vector || '#9C27B0'),  // 🎨 #9C27B0 Purple  
            logic: hexToPixi(nodeStylesSavedColors.categories.logic || '#FF9800'),    // 🎨 #FF9800 Orange
            data: hexToPixi(nodeStylesSavedColors.categories.data || '#2196F3'),      // 🎨 #2196F3 Blue
            conversion: hexToPixi(nodeStylesSavedColors.categories.conversion || '#607D8B'), // 🎨 #607D8B Gray
            utility: hexToPixi(nodeStylesSavedColors.categories.utility || '#9013FE'), // 🎨 #9013FE Purple
            nested: hexToPixi(nodeStylesSavedColors.categories.nested || '#FF0080')   // 🎨 #FF0080 Hot Pink
        } : {
            math: hexToPixi('#4CAF50'),      // 🎨 #4CAF50 Green
            vector: hexToPixi('#9C27B0'),    // 🎨 #9C27B0 Purple
            logic: hexToPixi('#FF9800'),     // 🎨 #FF9800 Orange
            data: hexToPixi('#2196F3'),      // 🎨 #2196F3 Blue
            conversion: hexToPixi('#607D8B'), // 🎨 #607D8B Gray
            utility: hexToPixi('#9013FE'),   // 🎨 #9013FE Purple
            nested: hexToPixi('#FF0080')     // 🎨 #FF0080 Hot Pink
        },
        
        // Type colors for ports - auto-loaded from Color Palette Manager  
        // 🎨 COLOR PICKER PREVIEW: #4CAF50 #2196F3 #FF9800 #9C27B0 #E91E63 #FFC107
        types: nodeStylesSavedColors?.types ? {
            float: hexToPixi(nodeStylesSavedColors.types.float || '#4CAF50'),   // 🎨 #4CAF50 Green
            int: hexToPixi(nodeStylesSavedColors.types.int || '#2196F3'),       // 🎨 #2196F3 Blue
            bool: hexToPixi(nodeStylesSavedColors.types.bool || '#FF9800'),     // 🎨 #FF9800 Orange
            vec2: hexToPixi(nodeStylesSavedColors.types.vec2 || '#9C27B0'),     // 🎨 #9C27B0 Purple
            vec3: hexToPixi(nodeStylesSavedColors.types.vec3 || '#E91E63'),     // 🎨 #E91E63 Pink
            string: hexToPixi(nodeStylesSavedColors.types.string || '#FFC107')  // 🎨 #FFC107 Yellow
        } : {
            float: hexToPixi('#4CAF50'),   // 🎨 #4CAF50 Green
            int: hexToPixi('#2196F3'),     // 🎨 #2196F3 Blue  
            bool: hexToPixi('#FF9800'),    // 🎨 #FF9800 Orange
            vec2: hexToPixi('#9C27B0'),    // 🎨 #9C27B0 Purple
            vec3: hexToPixi('#E91E63'),    // 🎨 #E91E63 Pink
            string: hexToPixi('#FFC107')   // 🎨 #FFC107 Yellow
        },
        
        // Wire/Connection colors - auto-loaded from Color Palette Manager
        // 🎨 COLOR PICKER PREVIEW: #FF6B35 #FF0000
        wires: nodeStylesSavedColors?.wires ? {
            normal: nodeStylesSavedColors.wires.normal !== 'useTypeColor' ? hexToPixi(nodeStylesSavedColors.wires.normal) : 'useTypeColor',
            selected: hexToPixi(nodeStylesSavedColors.wires.selected || '#FF6B35'), // 🎨 #FF6B35 Orange
            invalid: hexToPixi(nodeStylesSavedColors.wires.invalid || '#FF0000'),   // 🎨 #FF0000 Red
            preview: nodeStylesSavedColors.wires.preview !== 'useTypeColor' ? hexToPixi(nodeStylesSavedColors.wires.preview) : 'useTypeColor'
        } : {
            normal: hexToPixi('#4CAF50'),    // Fixed green color
            selected: hexToPixi('#FF6B35'),        // 🎨 #FF6B35 Orange for selected
            invalid: hexToPixi('#FF0000'),         // 🎨 #FF0000 Red for invalid connections
            preview: hexToPixi('#4CAF50')    // Fixed green color for preview
        }
    },

    node: {
        // Dimensions - width moved to pixi-node-renderer.js spacing config
        minHeight: 50,
        borderRadius: 5,
        borderWidth: 2, // Border thickness
       
        bottomSectionHeight: 5,  // Height of colored bottom section (handled by modular masking system in helpers)
        bottomSectionOffset: 10, // How far colored section extends beyond bottom edge
        
        // Scale-invariant settings
        scaleInvariantBorders: true, // Enable zoom-independent border thickness
        
        // Shadow settings (manual graphics)
        shadow: {
            offsetX: 12,
            offsetY: 12,
            blur: 1,
            alpha: nodeStylesSavedColors?.opacity?.nodeShadow || 1.7
        },
        
        // Selection effects
        selection: {
            glowSize: 4,
            glowAlpha: nodeStylesSavedColors?.opacity?.nodeSelectionGlow || 0.1
            // Animation removed
        },
        
        // Hover effects
        hover: {
            scale: 1.02,
            glowSize: 8,
            glowAlpha: nodeStylesSavedColors?.opacity?.nodeHoverGlow || 0.1
        },
        
        // Category border
        categoryBorder: {
            width: 3,
            height: '100%' // Full height
        }
    },

    text: {
        // Font settings
        fontFamily: "'Consolas', monospace",
        
        
        // Font sizes
        sizes: {
            // icon: 14, // REMOVED - no longer using icons
            title: 35,
            category: 24,
            param: 24,
            port: 14
        },
        
        // Font weights
        weights: {
            normal: 'normal',
            bold: 'bold'
        }
    },

    ports: {
        // Port dot settings
        dot: {
            radius: 4,
            borderWidth: 0,
            borderColor: nodeStylesSavedColors?.port?.borderColor ? hexToPixi(nodeStylesSavedColors.port.borderColor) : hexToPixi('#666666') // 🎨 #666666
        },
        
        // Port hover
        hover: {
            scale: 1.2,
            glowSize: 4,
            glowAlpha: nodeStylesSavedColors?.opacity?.portHoverGlow || 0.3
        },
        
        // Port spacing
        spacing: 14,
        labelOffset: 15
    },

    parameters: {
        // Parameter input styling
        input: {
            width: 70,
            height: 20, // Decreased from 24 to 20
            borderRadius: 1,
            backgroundColor: nodeStylesSavedColors?.tooltip?.backgroundColor ? hexToPixi(nodeStylesSavedColors.tooltip.backgroundColor) : hexToPixi('#222222'), // 🎨 #222222
            borderColor: nodeStylesSavedColors?.tooltip?.borderColor ? hexToPixi(nodeStylesSavedColors.tooltip.borderColor) : hexToPixi('#555555'),       // 🎨 #555555
            borderWidth: 1
        },
        
        // Parameter layout
        spacing: 2,
        labelWidth:12,
    },

            grid: {
            size: 64,
            color: nodeStylesSavedColors?.ui?.grid ? hexToPixi(nodeStylesSavedColors.ui.grid) : hexToPixi('#333333'), // 🎨 #333333 - More visible
        alpha: nodeStylesSavedColors?.opacity?.grid || 0.5,  // Reduced alpha for subtler grid
        extent: 2000
    },

    animations: {
        // Animation durations
        durations: {
            hover: 22222,
            selection: 4400,
            pulse: 100
        },
        
        // Easing functions
        easing: {
            // Smooth in-out cubic
            inOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        }
    },

    // Theme variants - AUTO-LOADED FROM COLOR PALETTE
    // 🎨 COLOR PICKER PREVIEW: #1a1a1a #333333 #ffffff #0f0f0f #222222 #005500 #001100 #00ff00
    themes: {
        dark: {
            background: nodeStylesSavedColors?.themes?.darkBackground ? hexToPixi(nodeStylesSavedColors.themes.darkBackground) : hexToPixi('#1a1a1a'),  // 🎨 #1a1a1a
            nodeBg: nodeStylesSavedColors?.themes?.darkNodeBg ? hexToPixi(nodeStylesSavedColors.themes.darkNodeBg) : hexToPixi('#333333'),      // 🎨 #333333
            textPrimary: nodeStylesSavedColors?.text?.primary ? hexToPixi(nodeStylesSavedColors.text.primary) : hexToPixi('#ffffff')  // 🎨 #ffffff
        },
        darker: {
            background: nodeStylesSavedColors?.themes?.darkerBackground ? hexToPixi(nodeStylesSavedColors.themes.darkerBackground) : hexToPixi('#0f0f0f'),  // 🎨 #0f0f0f
            nodeBg: nodeStylesSavedColors?.themes?.darkerNodeBg ? hexToPixi(nodeStylesSavedColors.themes.darkerNodeBg) : hexToPixi('#222222'),      // 🎨 #222222
            textPrimary: nodeStylesSavedColors?.text?.primary ? hexToPixi(nodeStylesSavedColors.text.primary) : hexToPixi('#ffffff')  // 🎨 #ffffff
        },
        matrix: {
            background: nodeStylesSavedColors?.themes?.matrixBackground ? hexToPixi(nodeStylesSavedColors.themes.matrixBackground) : hexToPixi('#005500'),  // 🎨 #005500
            nodeBg: nodeStylesSavedColors?.themes?.matrixNodeBg ? hexToPixi(nodeStylesSavedColors.themes.matrixNodeBg) : hexToPixi('#001100'),      // 🎨 #001100 
            textPrimary: nodeStylesSavedColors?.themes?.matrixText ? hexToPixi(nodeStylesSavedColors.themes.matrixText) : hexToPixi('#00ff00')  // 🎨 #00ff00
        }
    },

    wire: {
        // Line styles
        thickness: {
            normal: 2,
            hover: 3,
            selected: 3,
            preview: 1
        },
        
        // Hit detection
        hitArea: {
            thickness: 27,  // Wide invisible hit area for easy clicking
            color: nodeStylesSavedColors?.wire?.hitAreaColor ? hexToPixi(nodeStylesSavedColors.wire.hitAreaColor) : 0x000000,  // Black (invisible)
            alpha: nodeStylesSavedColors?.opacity?.wireHitArea || 0.01       // Nearly transparent but still clickable
        },
        
        // Endpoint styling
        endpoints: {
            radius: 2,
            selectedRadius: 3,
            showAlways: false,     // Only show when selected/hover
            showOnSelected: true,
            showOnHover: false
        },
        
        // Animation/feedback
        alpha: {
            normal: nodeStylesSavedColors?.opacity?.wireNormal || 1.0,
            preview: nodeStylesSavedColors?.opacity?.wirePreview || 0.7,
            invalid: nodeStylesSavedColors?.opacity?.wireInvalid || 0.8
        }
    },

    // Helper functions for style application
    helpers: {
        // Get category color
        getCategoryColor(category) {
            return window.PixiNodeStyles.colors.categories[category] || (nodeStylesSavedColors?.fallback?.category ? hexToPixi(nodeStylesSavedColors.fallback.category) : hexToPixi('#666666')); // 🎨 #666666
        },
        
        // Get type color
        getTypeColor(type) {
            return window.PixiNodeStyles.colors.types[type] || (nodeStylesSavedColors?.fallback?.type ? hexToPixi(nodeStylesSavedColors.fallback.type) : hexToPixi('#666666')); // 🎨 #666666
        },
        
        // Get wire color
        getWireColor(type, state = 'normal') {
            const wireColors = window.PixiNodeStyles.colors.wires;
            
            switch(state) {
                case 'selected':
                    return wireColors.selected;
                case 'invalid':
                    return wireColors.invalid;
                case 'preview':
                    return wireColors.preview === 'useTypeColor' ? this.getTypeColor(type) : wireColors.preview;
                case 'normal':
                default:
                    return wireColors.normal === 'useTypeColor' ? this.getTypeColor(type) : wireColors.normal;
            }
        },

        // NODE COLORED SECTION RENDERING - Modular masking system (BOTTOM PLACEMENT)
        createColoredSection(graphics, categoryColor, width, height, bottomSectionHeight, zoom = 1) {
            graphics.clear();
            
            // ZOOM-BASED OPACITY: Fade to 25% when zooming in closer
            // At zoom = 1 (normal), opacity = 100%
            // At zoom = 4+ (close), opacity = 25%
            const minOpacity = 0.25; // 25% minimum opacity
            const maxOpacity = 1.0;  // 100% maximum opacity
            const zoomThreshold = 4; // Start fading at 4x zoom
            
            let opacity = maxOpacity;
            if (zoom > 1) {
                // Linear interpolation between max and min opacity based on zoom
                const fadeProgress = Math.min((zoom - 1) / (zoomThreshold - 1), 1);
                opacity = maxOpacity - (fadeProgress * (maxOpacity - minOpacity));
            }
            
            // DEBUG: Log zoom and opacity values
            console.log(`🎨 Colored section - Zoom: ${zoom.toFixed(2)}, Opacity: ${opacity.toFixed(2)}`);
            
            graphics.beginFill(categoryColor, opacity);
            // Rectangle extends beyond bottom edge for masking effect  
            const offset = window.PixiNodeStyles.node.bottomSectionOffset || 10;
            graphics.drawRect(-width/2, height/2 - bottomSectionHeight, width, bottomSectionHeight + offset);
            graphics.endFill();
        },

        createNodeMask(graphics, width, height, borderRadius = 8) {
            graphics.clear();
            graphics.beginFill(nodeStylesSavedColors?.mask?.fill ? hexToPixi(nodeStylesSavedColors.mask.fill) : hexToPixi('#FFFFFF')); // 🎨 #FFFFFF
            // Mask shape matches node shape exactly
            graphics.drawRoundedRect(-width/2, -height/2, width, height, borderRadius);
            graphics.endFill();
        },

        applyColoredSectionMask(coloredBox, maskGraphics) {
            coloredBox.mask = maskGraphics;
        },
        
        // Apply theme
        applyTheme(themeName) {
            const theme = window.PixiNodeStyles.themes[themeName];
            if (theme) {
                Object.assign(window.PixiNodeStyles.colors, theme);
            }
        },
        
        // Create text style object
        createTextStyle(type, options = {}) {
            const styles = window.PixiNodeStyles.text;
            return {
                fontFamily: styles.fontFamily,
                fontSize: styles.sizes[type] || 12,
                fill: options.color || window.PixiNodeStyles.colors.textPrimary,
                fontWeight: options.weight || styles.weights.normal,
                resolution: options.resolution || 1,
                ...options
            };
        },
        
        // Hex to PIXI color conversion (reference to standalone function)
        hexToPixi: hexToPixi
    }
};

// 🎨 COLOR PICKER TEST AREA - Edit these to see live color preview in Cursor!
const colorPickerTest = {
    // Try changing these colors and see them update in Cursor's color picker
    testColors: {
        primary: "#4CAF50",     // Green  
        secondary: "#9C27B0",   // Purple
        accent: "#FF9800",      // Orange
        info: "#2196F3",        // Blue
        warning: "#FFC107",     // Yellow  
        error: "#FF0000",       // Red
        success: "#00C853"      // Dark Green
    }
};

console.log('🎨 PIXI Node Styles loaded successfully');