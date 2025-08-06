/**
 * ICON MANAGER SYSTEM
 * Modular icon management for nodes
 * - Centralized icon definitions
 * - Support for sprite sheets & individual files
 * - Easy to extend with new icons
 */

class IconManager {
    constructor() {
        // ICON MAPPINGS - Node type to icon file
                this.iconMap = {
            // MATH NODES  
            'Add': 'icon_AddNode.svg',
            'Subtract': 'icon_SubtractNode.svg',
            'Multiply': 'icon_MultiplyNode.svg',
            'Divide': 'icon_DivideNode.svg',
            'Power': 'icon_PowerNode.svg',
            'Sin': 'icon_SinNode.svg',
            'Cos': 'icon_CosNode.svg',
            'Abs': 'icon_AbsNode.svg',
            'Min': 'icon_MinNode.svg',
            'Max': 'icon_MaxNode.svg',
            'Floor': 'icon_FloorNode.svg',
            'Sqrt': 'icon_SqrtNode.svg',
            'Mod': 'icon_ModNode.svg',
            
            // VECTOR NODES
            'Join': 'icon_JoinNode.svg',
            'Split': 'icon_SplitNode.svg',
            'Length': 'icon_LengthNode.svg',
            'Normalize': 'icon_NormalizeNode.svg',
            'Dot': 'icon_DotNode.svg',
            
            // LOGIC NODES
            'Greater': 'icon_GreaterNode.svg',
            'Less': 'icon_LessNode.svg',
            'Equal': 'icon_EqualNode.svg',
            'And': 'icon_AndNode.svg',
            'Or': 'icon_OrNode.svg',
            'Not': 'icon_NotNode.svg',
            'Branch': 'icon_BranchNode.svg',
            
            // CONVERSION NODES
            'FloatToInt': 'icon_FloatToIntNode.svg',
            'IntToFloat': 'icon_IntToFloatNode.svg',
            'BoolToFloat': 'icon_BoolToFloatNode.svg',
            
            // DATA NODES
            'Constant': 'icon_ConstantNode.svg',
            'Random': 'icon_RandomNode.svg',
            'Time': 'icon_TimeNode.svg',
            'Hash': 'icon_HashNode.svg',
            
            // NESTED NODES
            'Receive': 'icon_InputNode.svg',
            'Transmit': 'icon_OutputNode.svg'
        };
        
        // SPRITE SHEET POSITIONS - For cutting icons from sprite sheet
        this.spritePositions = {
            'icon_AbsNode.png': {x: 1, y: 0},
            'icon_AddNode.png': {x: 1, y: 0},
            'icon_AndNode.png': {x: 2, y: 0},
            'icon_BoolToFloatNode.png': {x: 3, y: 0},
            'icon_BranchNode.png': {x: 4, y: 0},
            'icon_ConstantNode.png': {x: 5, y: 0},
            'icon_CosNode.png': {x: 6, y: 0},
            'icon_DivideNode.png': {x: 7, y: 0},
            
            'icon_DotNode.png': {x: 0, y: 1},
            'icon_EqualNode.png': {x: 1, y: 1},
            'icon_FloatToIntNode.png': {x: 2, y: 1},
            'icon_FloorNode.png': {x: 3, y: 1},
            'icon_GreaterNode.png': {x: 4, y: 1},
            'icon_HashNode.png': {x: 5, y: 1},
            'icon_InputNode.png': {x: 6, y: 1},
            'icon_IntToFloatNode.png': {x: 7, y: 1},
            
            'icon_JoinNode.png': {x: 0, y: 2},
            'icon_LengthNode.png': {x: 1, y: 2},
            'icon_LessNode.png': {x: 2, y: 2},
            'icon_MaxNode.png': {x: 3, y: 2},
            'icon_MinNode.png': {x: 4, y: 2},
            'icon_ModNode.png': {x: 5, y: 2},
            'icon_MultiplyNode.png': {x: 6, y: 2},
            'icon_NormalizeNode.png': {x: 7, y: 2},
            
            'icon_NotNode.png': {x: 0, y: 3},
            'icon_OrNode.png': {x: 1, y: 3},
            'icon_OutputNode.png': {x: 2, y: 3},
            'icon_PowerNode.png': {x: 3, y: 3},
            'icon_RandomNode.png': {x: 4, y: 3},
            'icon_SinNode.png': {x: 5, y: 3},
            'icon_SplitNode.png': {x: 6, y: 3},
            'icon_SqrtNode.png': {x: 7, y: 3},
            
            'icon_SubtractNode.png': {x: 0, y: 4},
            'icon_TimeNode.png': {x: 1, y: 4}
        };
        
        // CONFIGURATION
        this.config = {
            iconSize: 32,        // Size of icons in sprite sheet
            gridWidth: 8,        // Icons per row in sprite sheet
            basePath: 'imgs/icons/', // Base path for individual icon files
            spriteSheet: 'imgs/node_icons_white_sheet.png', // Sprite sheet path
            
            // GLOBAL SETTINGS
            globalOpacity: 0.07,  // Global opacity for all icons (7% OPACITY - increased by 4%)
            defaultScale: 2.5,   // Default scale for icons (5X BIGGER - was 0.5, now 2.5)
            defaultOffset: { x: 0, y: 0 }, // Default offset (centered)
            defaultColor: '#FFFFFF', // Default icon color (WHITE)
            
            // COLOR MODES
            colorMode: 'uniform', // 'uniform', 'category', 'custom'
            
            // DPI SETTINGS
            dpiMultiplier: 4 // Extra resolution multiplier for ULTRA CRISP icons (4x DPI)
        };
        
        // NO INDIVIDUAL SETTINGS - All icons use uniform settings
        this.iconSettings = {};
        
        // NO HARDCODED COLORS - Use existing color system from nodeSystem.styles.colors.categories
        
        // CACHE for loaded textures
        this.textureCache = new Map();
        this.spriteSheetTexture = null;
    }
    
    /**
     * GET ICON FILENAME for a node
     * @param {string} nodeTitle - Node title or type
     * @returns {string|null} Icon filename or null if not found
     */
    getIconFilename(nodeTitle) {
        const filename = this.iconMap[nodeTitle];
        if (!filename) {
            console.warn(`⚠️ No icon mapping for node: "${nodeTitle}"`);
            console.log(`Available icons:`, Object.keys(this.iconMap));
        }
        return filename;
    }
    
    /**
     * GET ICON PATH for a node
     * @param {string} nodeTitle - Node title or type
     * @returns {string|null} Full icon path or null
     */
    getIconPath(nodeTitle) {
        const filename = this.getIconFilename(nodeTitle);
        return filename ? `${this.config.basePath}${filename}` : null;
    }
    
    /**
     * GET SPRITE POSITION for icon
     * @param {string} iconFilename - Icon filename
     * @returns {object|null} Position {x, y} or null
     */
    getSpritePosition(iconFilename) {
        return this.spritePositions[iconFilename] || null;
    }
    
    /**
     * REGISTER NEW ICON
     * @param {string} nodeTitle - Node title/type
     * @param {string} iconFilename - Icon filename
     * @param {object} spritePosition - Optional sprite position {x, y}
     */
    registerIcon(nodeTitle, iconFilename, spritePosition = null) {
        this.iconMap[nodeTitle] = iconFilename;
        if (spritePosition) {
            this.spritePositions[iconFilename] = spritePosition;
        }
        console.log(`✅ Registered icon for "${nodeTitle}": ${iconFilename}`);
    }
    
    /**
     * REGISTER MULTIPLE ICONS
     * @param {object} iconDefinitions - {nodeTitle: {filename, position}}
     */
    registerIcons(iconDefinitions) {
        for (const [nodeTitle, definition] of Object.entries(iconDefinitions)) {
            if (typeof definition === 'string') {
                this.registerIcon(nodeTitle, definition);
            } else {
                this.registerIcon(nodeTitle, definition.filename, definition.position);
            }
        }
    }
    
    /**
     * GET ALL ICONS BY CATEGORY
     * @returns {object} Icons grouped by category
     */
    getIconsByCategory() {
        return {
            math: ['Add', 'Subtract', 'Multiply', 'Divide', 'Power', 'Sin', 'Cos', 'Abs', 'Min', 'Max', 'Floor', 'Sqrt', 'Mod'],
            vector: ['Join', 'Split', 'Length', 'Normalize', 'Dot'],
            logic: ['Greater', 'Less', 'Equal', 'And', 'Or', 'Not', 'Branch'],
            conversion: ['FloatToInt', 'IntToFloat', 'BoolToFloat'],
            data: ['Constant', 'Random', 'Time', 'Hash'],
            nested: ['Receive', 'Transmit']
        };
    }
    
    /**
     * GET ICON SETTINGS for a node
     * @param {string} nodeTitle - Node title/type
     * @param {string} category - Node category for color
     * @returns {object} Settings {scale, offset, opacity, color}
     */
    getIconSettings(nodeTitle, category = null) {
        const settings = this.iconSettings[nodeTitle] || {};
        return {
            scale: settings.scale ?? this.config.defaultScale,
            offset: settings.offset ?? { ...this.config.defaultOffset },
            opacity: settings.opacity ?? this.config.globalOpacity,
            color: this.getIconColor(nodeTitle, category)
        };
    }
    
    /**
     * GET ICON COLOR based on mode
     * @param {string} nodeTitle - Node title/type
     * @param {string} category - Node category
     * @param {object} nodeSystem - Optional nodeSystem for accessing existing colors
     * @returns {string|number} Color (hex string for custom, PIXI number for existing system)
     */
    getIconColor(nodeTitle, category, nodeSystem = null) {
        switch (this.config.colorMode) {
            case 'uniform':
                return this.config.defaultColor;
            case 'category':
                // Use existing color system if available
                if (nodeSystem && nodeSystem.styles && nodeSystem.styles.colors && nodeSystem.styles.colors.categories) {
                    return nodeSystem.styles.colors.categories[category] || this.hexToPixiColor(this.config.defaultColor);
                }
                return this.config.defaultColor;
            case 'custom':
                const settings = this.iconSettings[nodeTitle] || {};
                return settings.color ?? this.config.defaultColor;
            default:
                return this.config.defaultColor;
        }
    }
    
    /**
     * CONVERT HEX STRING to PIXI color number
     * @param {string} hexColor - Hex color string (e.g. '#FF0000')
     * @returns {number} PIXI color number
     */
    hexToPixiColor(hexColor) {
        if (typeof hexColor === 'string' && hexColor.startsWith('#')) {
            return parseInt(hexColor.substring(1), 16);
        }
        return parseInt(hexColor, 16);
    }
    
    /**
     * SET ICON SETTINGS for a node
     * @param {string} nodeTitle - Node title/type
     * @param {object} settings - {scale, offset, opacity}
     */
    setIconSettings(nodeTitle, settings) {
        if (!this.iconSettings[nodeTitle]) {
            this.iconSettings[nodeTitle] = {};
        }
        Object.assign(this.iconSettings[nodeTitle], settings);
        console.log(`✅ Updated settings for "${nodeTitle}":`, this.iconSettings[nodeTitle]);
    }
    
    /**
     * SET GLOBAL OPACITY for all icons
     * @param {number} opacity - Global opacity (0-1)
     */
    setGlobalOpacity(opacity) {
        this.config.globalOpacity = opacity;
        console.log(`✅ Global icon opacity set to: ${opacity}`);
    }
    
    /**
     * SET GLOBAL SCALE for all icons
     * @param {number} scale - Global scale
     */
    setGlobalScale(scale) {
        this.config.defaultScale = scale;
        console.log(`✅ Global icon scale set to: ${scale}`);
    }
    
    /**
     * SET GLOBAL OFFSET for all icons
     * @param {object} offset - Global offset {x, y}
     */
    setGlobalOffset(offset) {
        this.config.defaultOffset = { ...offset };
        console.log(`✅ Global icon offset set to: x=${offset.x}, y=${offset.y}`);
    }
    
    /**
     * SET DPI MULTIPLIER for crisp icons
     * @param {number} multiplier - DPI multiplier (default: 2)
     */
    setDPIMultiplier(multiplier) {
        this.config.dpiMultiplier = multiplier;
        console.log(`✅ Icon DPI multiplier set to: ${multiplier}x`);
    }
    
    /**
     * SET GLOBAL COLOR for all icons
     * @param {string} color - Hex color string (e.g. '#FF0000')
     */
    setGlobalColor(color) {
        this.config.defaultColor = color;
        console.log(`✅ Global icon color set to: ${color}`);
    }
    
    /**
     * CHECK if node has icon
     * @param {string} nodeTitle - Node title/type
     * @returns {boolean} True if icon exists
     */
    hasIcon(nodeTitle) {
        return !!this.iconMap[nodeTitle];
    }
    
    /**
     * CLEAR CACHE
     */
    clearCache() {
        this.textureCache.clear();
        this.spriteSheetTexture = null;
        console.log('🗑️ Icon cache cleared');
    }
}

// EXPORT as singleton on window
window.IconManager = new IconManager();

// UNIFORM ICON CONFIGURATION HELPERS
window.setGlobalIconOpacity = function(opacity) {
    window.IconManager.setGlobalOpacity(opacity);
};

window.setGlobalIconScale = function(scale) {
    window.IconManager.setGlobalScale(scale);
};

window.setGlobalIconOffset = function(x, y) {
    window.IconManager.setGlobalOffset({ x, y });
};

window.setIconDPI = function(multiplier) {
    window.IconManager.setDPIMultiplier(multiplier);
};

window.setGlobalIconColor = function(color) {
    window.IconManager.setGlobalColor(color);
};

// CONVENIENCE: Set all icon properties at once
window.configureAllIcons = function(scale, opacity, color = '#FFFFFF', offsetX = 0, offsetY = 0) {
    window.IconManager.setGlobalScale(scale);
    window.IconManager.setGlobalOpacity(opacity);
    window.IconManager.setGlobalColor(color);
    window.IconManager.setGlobalOffset({ x: offsetX, y: offsetY });
    console.log(`✅ All icons configured - Scale: ${scale}, Opacity: ${opacity}, Color: ${color}, Offset: ${offsetX},${offsetY}`);
};
