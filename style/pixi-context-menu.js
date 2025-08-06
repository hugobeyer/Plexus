/**
 * 🎯 PIXI CONTEXT MENU STYLES
 * Modular styling for the context menu system
 * AUTO-LOADS from Color Palette Manager
 */

// Load saved colors for context menu
function loadSavedColors() {
    try {
        const saved = localStorage.getItem('plexusColors');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load saved colors for context menu');
    }
    return null;
}

// Hex to PIXI color converter
function hexToPixi(hexString) {
    if (typeof hexString === 'number') {
        return Math.max(0, Math.min(0xFFFFFF, hexString));
    }
    if (typeof hexString === 'string') {
        let clean = hexString.replace('#', '').toUpperCase();
        
        if (clean.length === 3) {
            clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        } else if (clean.length === 8) {
            clean = clean.substring(0, 6);
        } else if (clean.length !== 6) {
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
    return parseInt('666666', 16);
}

const contextMenuSavedColors = loadSavedColors();

window.PixiContextMenu = {
    // CONTEXT MENU CONFIGURATION - DYNAMIC WIDTH
    dimensions: {
        width: 'auto',  // AUTO width based on grid content
        maxHeight: 9999,  // NO HEIGHT LIMIT - let content determine size
        borderRadius: 3,  // LESS corner radius
        zIndex: 99999
    },
    
    // GRID LAYOUT SETTINGS for inventory-style menu
    grid: {
        itemSize: 44,        // BIGGER boxes (was 50)
        itemsPerRow: 6,      // More items per row
        gap: 2,              // Slightly more gap for bigger boxes
        padding: 4,          // LESS container padding
        iconSize: 40,        // BIGGER SVG icon size
        labelHeight: 10      // Height for tiny labels
    },
    
    // COLOR SCHEME - auto-loaded from Color Palette Manager
    colors: {
        // Main menu colors - NO UGLY GREEN BORDER
        background: contextMenuSavedColors?.contextMenu?.background || '#2a2a2a',
        border: contextMenuSavedColors?.contextMenu?.border || '#444',  // SUBTLE gray border
        shadow: contextMenuSavedColors?.contextMenu?.shadow || 'rgba(0,0,0,0.3)',  // LIGHTER shadow
        
        // Search input colors - LIGHTER GRAY
        searchBackground: contextMenuSavedColors?.contextMenu?.searchBackground || '#333',
        inputBackground: contextMenuSavedColors?.contextMenu?.inputBackground || '#3a3a3a',  // LIGHTER gray
        inputBorder: contextMenuSavedColors?.contextMenu?.inputBorder || '#555',
        inputText: contextMenuSavedColors?.contextMenu?.inputText || 'white',
        
        // Category colors
        categoryBackground: contextMenuSavedColors?.contextMenu?.categoryBackground || '#383838',
        categoryText: contextMenuSavedColors?.contextMenu?.categoryText || '#ccc',
        
        // Node item colors
        itemText: contextMenuSavedColors?.contextMenu?.itemText || 'white',
        itemHover: contextMenuSavedColors?.contextMenu?.itemHover || '#4CAF50',
        itemBorder: contextMenuSavedColors?.contextMenu?.itemBorder || '#333',
        
        // Grid item colors
        gridItem: contextMenuSavedColors?.contextMenu?.gridItem || '#1a1a1a',
        gridItemHover: contextMenuSavedColors?.contextMenu?.gridItemHover || '#2a4a2a',
        gridItemBorder: contextMenuSavedColors?.contextMenu?.gridItemBorder || '#444',
        labelText: contextMenuSavedColors?.contextMenu?.labelText || '#888',
        
        // First item highlight - TRANSPARENT ORANGE
        firstItemHighlight: contextMenuSavedColors?.contextMenu?.firstItemHighlight || 'rgba(255, 165, 0, 0.15)'
    },
    
    // STYLE GENERATORS
    getMainMenuStyle() {
        const currentMode = this.menuModes[this.currentModeIndex];
        
        // Calculate width based on mode
        let calculatedWidth;
        if (currentMode === 'list') {
            calculatedWidth = 400; // WIDER for dual-column list
        } else if (currentMode === 'compact') {
            calculatedWidth = 200; // NARROW for compact mode
        } else {
            calculatedWidth = this.calculateGridWidth(); // ICON mode
        }
        
        return `
            position: fixed;
            width: ${calculatedWidth}px;
            background: ${this.colors.background};
            border: 1px solid ${this.colors.border};
            border-radius: ${this.dimensions.borderRadius}px;
            box-shadow: 0 4px 16px ${this.colors.shadow};
            z-index: ${this.dimensions.zIndex};
            font-family: 'Consolas', monospace;
            opacity: 1;
            display: block;
        `;
    },
    
    getSearchContainerStyle() {
        return `
            padding: 2px 4px;  // REDUCED padding for COMPACT design
            border-bottom: 1px solid #444;
            background: ${this.colors.searchBackground};
        `;
    },
    
    getSearchInputStyle() {
        return `
            width: 100%;
            padding: 2px 3px;  // SMALLER padding for COMPACT layout
            background: ${this.colors.inputBackground};
            border: 1px solid ${this.colors.inputBorder};
            border-radius: 3px;  // SMALLER radius
            color: ${this.colors.inputText};
            font-family: inherit;
            font-size: 10px;  // REDUCED font size
            outline: none;
        `;
    },
    
    getListContainerStyle() {
        return `
            max-height: ${Math.max(this.dimensions.maxHeight - 80, 250)}px;  // DYNAMIC height based on screen size
            overflow-y: auto;
            scrollbar-width: thin;  // THIN scrollbar for COMPACT design
        `;
    },
    
    // MAIN CONTAINER for category sections - MODE DEPENDENT
    getMainContainerStyle() {
        const currentMode = this.menuModes[this.currentModeIndex];
        
        if (currentMode === 'list') {
            return `
                display: flex;
                flex-direction: row;
                gap: 8px;
                padding: ${this.grid.padding}px;
                height: 300px;
            `;
        } else {
            return `
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: ${this.grid.padding}px;
            `;
        }
    },
    
    // HOUDINI LIST MODE - Categories column
    getCategoryListStyle() {
        return `
            width: 140px;
            overflow-y: auto;
            border-right: 1px solid #444;
            padding-right: 8px;
        `;
    },
    
    // HOUDINI LIST MODE - Nodes column  
    getNodeListStyle() {
        return `
            flex: 1;
            overflow-y: auto;
            padding-left: 8px;
        `;
    },
    
    // CATEGORY ITEM in list mode
    getCategoryItemStyle(isHovered = false) {
        return `
            padding: 6px 8px;
            cursor: pointer;
            color: #ccc;
            font-size: 11px;
            border-radius: 3px;
            margin-bottom: 2px;
            background: ${isHovered ? '#2a4a2a' : 'transparent'};
            transition: background 0.15s;
        `;
    },
    
    // NODE ITEM in list mode
    getListNodeItemStyle() {
        return `
            padding: 4px 8px;
            color: #fff;
            font-size: 10px;
            cursor: pointer;
            border-radius: 3px;
            margin-bottom: 1px;
            transition: background 0.15s;
        `;
    },
    
    // CATEGORY CONTAINER - Individual category box
    getCategoryContainerStyle() {
        return `
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid #444;
            border-radius: 4px;
            padding: 2px;
            margin-bottom: 2px;
        `;
    },
    
    // CATEGORY TITLE styling
    getCategoryTitleStyle() {
        return `
            color: #aaa;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            text-align: middle;
            padding: 2px 4px 2px 4px;
            margin-bottom: 2px;
            border-bottom: 1px solid #333;
        `;
    },
    
    // GRID CONTAINER for nodes within each category
    getCategoryGridStyle() {
        return `
            display: grid;
            grid-template-columns: repeat(auto-fit, ${this.grid.itemSize}px);
            gap: ${this.grid.gap}px;
            justify-content: flex-start;
        `;
    },
    
    // GRID ITEM style for each node box - NO BORDERS
    getGridItemStyle() {
        return `
            width: ${this.grid.itemSize}px;
            height: ${this.grid.itemSize}px;
            background: ${this.colors.gridItem};
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 2px;
            box-sizing: border-box;
        `;
    },
    
    // GRID ITEM ICON container - BIGGER icons
    getGridIconStyle() {
        return `
            width: ${this.grid.iconSize}px;
            height: ${this.grid.iconSize}px;
            margin-bottom: 1px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
    },
    
    // GRID ITEM LABEL (tiny text under icon)
    getGridLabelStyle() {
        return `
            font-size: 8px;
            color: ${this.colors.labelText};
            text-align: center;
            font-weight: 500;
            line-height: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 100%;
            max-height: ${this.grid.labelHeight}px;
        `;
    },
    
    getCategoryHeaderStyle() {
        return `
            padding: 3px 8px;  // REDUCED padding for COMPACT layout
            background: ${this.colors.categoryBackground};
            color: ${this.colors.categoryText};
            font-size: 8px;  // SMALLER font size
            font-weight: bold;
            letter-spacing: 0.5px;  // REDUCED letter spacing
            border-bottom: 1px solid #444;
        `;
    },
    
    getNodeItemStyle() {
        return `
            padding: 4px 10px;  // REDUCED padding for COMPACT spacing
            color: ${this.colors.itemText};
            cursor: pointer;
            border-bottom: 1px solid ${this.colors.itemBorder};
            transition: background-color 0.15s;  // FASTER transition
            font-size: 10px;  // SMALLER font size
            line-height: 1.2;  // TIGHTER line height
        `;
    },
    
        // INTERACTION STYLES
    applyHoverEffect(element) {
        element.style.backgroundColor = this.colors.itemHover;
    },

    removeHoverEffect(element) {
        element.style.backgroundColor = 'transparent';
    },
    
    // GRID HOVER EFFECTS - NO BORDERS
    applyGridHoverEffect(element) {
        element.style.backgroundColor = this.colors.gridItemHover;
        element.style.transform = 'scale(1.05)';
    },
    
    removeGridHoverEffect(element) {
        element.style.backgroundColor = this.colors.gridItem;
        element.style.transform = 'scale(1)';
    },
    
    // FIRST ITEM HIGHLIGHT - TRANSPARENT ORANGE (NO BORDER)
    applyFirstItemHighlight(element) {
        element.style.backgroundColor = this.colors.firstItemHighlight;
    },
    
    removeFirstItemHighlight(element) {
        element.style.backgroundColor = this.colors.gridItem;
    },
    
    // THEME SUPPORT
    updateColors(newColors) {
        Object.assign(this.colors, newColors);
    },
    
    // CALCULATE EXACT WIDTH based on grid content
    calculateGridWidth() {
        const totalWidth = (this.grid.itemSize * this.grid.itemsPerRow) + 
                          (this.grid.gap * (this.grid.itemsPerRow - 1)) + 
                          (this.grid.padding * 2);
        return totalWidth;
    },

    // DYNAMIC SIZING BASED ON DISPLAY
    updateDimensionsForDisplay() {
        // Width is now calculated based on grid content
        this.dimensions.width = this.calculateGridWidth();
        console.log(`🎯 Context menu WIDTH: ${this.dimensions.width}px (grid-based)`);
    },

    // NODE ICON MAPPING - Maps node types to SVG file names
    getNodeIconPath(nodeType) {
        // Convert node type to SVG file name pattern
        const iconMap = {
            'Constant': 'icon_ConstantNode.svg',
            'Random': 'icon_RandomNode.svg',
            'Time': 'icon_TimeNode.svg',
            'Hash': 'icon_HashNode.svg',
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
            'Join': 'icon_JoinNode.svg',
            'Split': 'icon_SplitNode.svg',
            'Length': 'icon_LengthNode.svg',
            'Normalize': 'icon_NormalizeNode.svg',
            'Dot': 'icon_DotNode.svg',
            'Greater': 'icon_GreaterNode.svg',
            'Less': 'icon_LessNode.svg',
            'Equal': 'icon_EqualNode.svg',
            'And': 'icon_AndNode.svg',
            'Or': 'icon_OrNode.svg',
            'Not': 'icon_NotNode.svg',
            'Branch': 'icon_BranchNode.svg',
            'FloatToInt': 'icon_FloatToIntNode.svg',
            'IntToFloat': 'icon_IntToFloatNode.svg',
            'BoolToFloat': 'icon_BoolToFloatNode.svg',
            'Input': 'icon_InputNode.svg',
            'Output': 'icon_OutputNode.svg'
        };
        
        return iconMap[nodeType] ? `imgs/icons/${iconMap[nodeType]}` : null;
    },
    
    // LOAD SVG ICON as HTML string
    async loadSVGIcon(nodeType) {
        const iconPath = this.getNodeIconPath(nodeType);
        if (!iconPath) return '⚙️'; // Fallback emoji
        
        try {
            const response = await fetch(iconPath);
            if (response.ok) {
                const svgContent = await response.text();
                return svgContent;
            }
        } catch (error) {
            console.warn(`Failed to load icon for ${nodeType}:`, error);
        }
        
        return '⚙️'; // Fallback emoji
    },

    // CONTEXT MENU BEHAVIOR METHODS
    contextMenuVisible: false,
    contextMenuElement: null,
    contextMenuSearchInput: null,
    contextMenuList: null,
    firstFilteredNode: null,
    lastCursorPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    
    // MENU MODES - HOUDINI STYLE
    menuModes: ['list', 'icon', 'compact'],
    currentModeIndex: 0,
    hoveredCategory: null,

    // INITIALIZE context menu system
    init(nodeEditor) {
        this.nodeEditor = nodeEditor;
        
        // TRACK CURSOR POSITION for context menu
        window.addEventListener('mousemove', (e) => {
            this.lastCursorPosition = { x: e.clientX, y: e.clientY };
        });
        
        // HANDLE WINDOW RESIZE for responsive context menu
        window.addEventListener('resize', () => {
            this.updateDimensionsForDisplay();
            // If context menu is open, recreate it with new dimensions
            if (this.contextMenuVisible) {
                this.hideContextMenu();
                setTimeout(() => {
                    this.toggleContextMenu(this.lastCursorPosition.x, this.lastCursorPosition.y);
                }, 50);
            }
        });
        
        // TAB KEY to toggle context menu - SHIFT+TAB to cycle modes
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                if (e.shiftKey && this.contextMenuVisible) {
                    // SHIFT+TAB: Cycle through modes
                    this.cycleMenuMode();
                    return;
                } else {
                    // TAB: Toggle context menu at cursor position
                    const x = this.lastCursorPosition.x || window.innerWidth / 2;
                    const y = this.lastCursorPosition.y || window.innerHeight / 2;
                    this.toggleContextMenu(x, y);
                    return;
                }
            }
            
            if (e.key === 'Escape') {
                e.preventDefault();
                this.hideContextMenu();
                return;
            }
        });

        // RIGHT CLICK CONTEXT MENU
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });
        
        // CLICK OUTSIDE to close context menu
        window.addEventListener('click', (e) => {
            if (this.contextMenuVisible && this.contextMenuElement) {
                if (!this.contextMenuElement.contains(e.target)) {
                    this.hideContextMenu();
                }
            }
        });
    },

    // CONTEXT MENU TOGGLE
    async toggleContextMenu(cursorX, cursorY) {
        if (this.contextMenuVisible) {
            this.hideContextMenu();
        } else {
            await this.showContextMenu(cursorX, cursorY);
        }
    },

    // SHOW CONTEXT MENU - ALWAYS at specified position
    async showContextMenu(cursorX, cursorY) {
        if (this.contextMenuVisible) return;
        
        // ENSURE we have valid cursor coordinates
        if (cursorX === undefined || cursorY === undefined) {
            cursorX = this.lastCursorPosition.x || window.innerWidth / 2;
            cursorY = this.lastCursorPosition.y || window.innerHeight / 2;
        }
        
        try {
            this.contextMenuElement = await this.createContextMenu(cursorX, cursorY);
            
            if (!this.contextMenuElement) {
                return;
            }
            
            document.body.appendChild(this.contextMenuElement);
            this.contextMenuVisible = true;
            
        } catch (error) {
            console.warn('Failed to show context menu:', error);
        }
    },

    // HIDE CONTEXT MENU
    hideContextMenu() {
        if (!this.contextMenuVisible || !this.contextMenuElement) return;
        
        document.body.removeChild(this.contextMenuElement);
        this.contextMenuElement = null;
        this.contextMenuSearchInput = null;
        this.contextMenuList = null;
        this.contextMenuVisible = false;
    },

    // CREATE CONTEXT MENU ELEMENT
    async createContextMenu(cursorX, cursorY) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        
        // UPDATE DIMENSIONS for current display size
        this.updateDimensionsForDisplay();
        
        // CALCULATE POSITION with STRICT boundary checks for cursor positioning
        const menuWidth = this.calculateGridWidth();
        const estimatedMenuHeight = 400; // ESTIMATED height for positioning
        
        // ALWAYS use cursor position - NO defaults to center
        let x = cursorX;
        let y = cursorY;
        
        // BOUNDARY CHECKS - EXACT cursor positioning with minimal screen limits
        const margin = 10;
        
        // X-axis boundaries - keep within screen
        x = Math.max(margin, Math.min(window.innerWidth - menuWidth - margin, x));
        
        // Y-axis boundaries - EXACT positioning, only adjust if going off screen
        if (y + estimatedMenuHeight > window.innerHeight - margin) {
            // If menu would go below screen, position ABOVE cursor
            y = y - estimatedMenuHeight;
        }
        // ENSURE minimum top position
        y = Math.max(margin, y);
        
        // APPLY STYLES with DIRECT position (no transform centering)
        const baseStyle = this.getMainMenuStyle();
        menu.style.cssText = baseStyle;
        menu.style.top = y + 'px';
        menu.style.left = x + 'px';
        menu.style.transform = 'none'; // NO centering transform - use exact position

        // SEARCH INPUT HEADER
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = this.getSearchContainerStyle();

        this.contextMenuSearchInput = document.createElement('input');
        this.contextMenuSearchInput.type = 'text';
        this.contextMenuSearchInput.placeholder = 'Search nodes...';
        this.contextMenuSearchInput.style.cssText = this.getSearchInputStyle();
        
        this.contextMenuSearchInput.addEventListener('input', async (e) => {
            await this.filterNodeList(e.target.value);
        });
        
        // ENTER KEY selects FIRST filtered node
        this.contextMenuSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.firstFilteredNode) {
                    this.selectNodeFromMenu(this.firstFilteredNode);
                }
            }
        });

        searchContainer.appendChild(this.contextMenuSearchInput);
        menu.appendChild(searchContainer);

        // MAIN CONTAINER for category sections
        this.contextMenuList = document.createElement('div');
        this.contextMenuList.style.cssText = this.getMainContainerStyle();

        console.log('📦 Populating node list...');
        await this.populateNodeList('');
        menu.appendChild(this.contextMenuList);
        
        // IMMEDIATE FOCUS on search input
        setTimeout(() => {
            if (this.contextMenuSearchInput) {
                this.contextMenuSearchInput.focus();
                this.contextMenuSearchInput.select();
                console.log('🎯 Search input focused');
            }
        }, 0);

        console.log('✅ Context menu created successfully');
        return menu;
    },

    // POPULATE NODE LIST - MODE DEPENDENT
    async populateNodeList(searchTerm = '') {
        if (!this.contextMenuList || !this.nodeEditor) return;

        const currentMode = this.menuModes[this.currentModeIndex];
        
        if (currentMode === 'list') {
            await this.populateListMode(searchTerm);
        } else {
            await this.populateGridMode(searchTerm);
        }
    },
    
    // HOUDINI LIST MODE - Dual column layout
    async populateListMode(searchTerm = '') {
        this.contextMenuList.innerHTML = '';
        
        // Filter nodes by search term
        const filteredNodes = this.nodeEditor.nodeDefinitions.filter(node => 
            node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.firstFilteredNode = filteredNodes.length > 0 ? filteredNodes[0] : null;

        // GROUP by category
        const categories = {};
        filteredNodes.forEach(node => {
            if (!categories[node.category]) {
                categories[node.category] = [];
            }
            categories[node.category].push(node);
        });

        // CREATE DUAL COLUMN LAYOUT
        const categoryColumn = document.createElement('div');
        categoryColumn.style.cssText = this.getCategoryListStyle();
        
        const nodeColumn = document.createElement('div');
        nodeColumn.style.cssText = this.getNodeListStyle();
        
        // POPULATE CATEGORY LIST
        const sortedCategories = Object.keys(categories).sort();
        for (const category of sortedCategories) {
            const categoryItem = document.createElement('div');
            categoryItem.textContent = category;
            categoryItem.style.cssText = this.getCategoryItemStyle();
            
            // CATEGORY HOVER - show all nodes in that category
            categoryItem.addEventListener('mouseenter', () => {
                this.hoveredCategory = category;
                categoryItem.style.cssText = this.getCategoryItemStyle(true);
                this.updateNodeColumn(categories, searchTerm);
            });
            
            categoryItem.addEventListener('mouseleave', () => {
                if (this.hoveredCategory === category) {
                    this.hoveredCategory = null;
                }
                categoryItem.style.cssText = this.getCategoryItemStyle(false);
                this.updateNodeColumn(categories, searchTerm);
            });
            
            categoryColumn.appendChild(categoryItem);
        }
        
        this.contextMenuList.appendChild(categoryColumn);
        this.contextMenuList.appendChild(nodeColumn);
        
        // INITIAL NODE DISPLAY
        this.updateNodeColumn(categories, searchTerm);
    },
    
    // UPDATE NODE COLUMN based on category hover and search
    updateNodeColumn(categories, searchTerm) {
        const nodeColumn = this.contextMenuList.children[1];
        if (!nodeColumn) return;
        
        nodeColumn.innerHTML = '';
        
        if (this.hoveredCategory && categories[this.hoveredCategory]) {
            // SHOW ALL NODES in hovered category
            for (const node of categories[this.hoveredCategory]) {
                this.addNodeToColumn(nodeColumn, node);
            }
        } else {
            // SHOW MAX 4 NODES per category (Houdini behavior)
            const sortedCategories = Object.keys(categories).sort();
            for (const category of sortedCategories) {
                const nodesToShow = categories[category].slice(0, 4);
                for (const node of nodesToShow) {
                    this.addNodeToColumn(nodeColumn, node);
                }
            }
        }
    },
    
    // ADD NODE TO LIST COLUMN
    addNodeToColumn(nodeColumn, node) {
        const nodeItem = document.createElement('div');
        nodeItem.textContent = node.title;
        nodeItem.style.cssText = this.getListNodeItemStyle();
        
        nodeItem.addEventListener('mouseenter', () => {
            nodeItem.style.backgroundColor = '#2a4a2a';
        });
        
        nodeItem.addEventListener('mouseleave', () => {
            nodeItem.style.backgroundColor = 'transparent';
        });
        
        nodeItem.addEventListener('click', () => {
            this.selectNodeFromMenu(node);
        });
        
        nodeColumn.appendChild(nodeItem);
    },
    
    // GRID MODE (existing icon mode)
    async populateGridMode(searchTerm = '') {
        this.contextMenuList.innerHTML = '';
        
        // Filter nodes by search term
        const filteredNodes = this.nodeEditor.nodeDefinitions.filter(node => 
            node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.firstFilteredNode = filteredNodes.length > 0 ? filteredNodes[0] : null;

        // GROUP by category
        const categories = {};
        filteredNodes.forEach(node => {
            if (!categories[node.category]) {
                categories[node.category] = [];
            }
            categories[node.category].push(node);
        });

        // Create category containers
        let isFirstItem = true;
        for (const category of Object.keys(categories).sort()) {
            // CREATE CATEGORY CONTAINER BOX
            const categoryContainer = document.createElement('div');
            categoryContainer.style.cssText = this.getCategoryContainerStyle();
            
            // CATEGORY TITLE
            const categoryTitle = document.createElement('div');
            categoryTitle.textContent = category.toUpperCase();
            categoryTitle.style.cssText = this.getCategoryTitleStyle();
            categoryContainer.appendChild(categoryTitle);
            
            // CATEGORY GRID for nodes
            const categoryGrid = document.createElement('div');
            categoryGrid.style.cssText = this.getCategoryGridStyle();

            // ADD NODES TO CATEGORY GRID
            for (const node of categories[category]) {
                const gridItem = document.createElement('div');
                gridItem.style.cssText = this.getGridItemStyle();
                
                // Create icon container
                const iconContainer = document.createElement('div');
                iconContainer.style.cssText = this.getGridIconStyle();
                
                // Load SVG icon or use fallback
                try {
                    const svgIcon = await this.loadSVGIcon(node.title);
                    if (svgIcon.startsWith('<svg')) {
                        iconContainer.innerHTML = svgIcon;
                    } else {
                        iconContainer.innerHTML = `<div style="font-size: 24px;">${svgIcon}</div>`;
                    }
                } catch (error) {
                    iconContainer.innerHTML = '<div style="font-size: 24px;">⚙️</div>';
                }
                
                // Create tiny label
                const label = document.createElement('div');
                label.textContent = node.title;
                label.style.cssText = this.getGridLabelStyle();
                
                // Add hover effects
                gridItem.addEventListener('mouseenter', () => {
                    this.applyGridHoverEffect(gridItem);
                });
                
                gridItem.isFirstItem = isFirstItem;
                
                gridItem.addEventListener('mouseleave', () => {
                    if (gridItem.isFirstItem) {
                        this.applyFirstItemHighlight(gridItem);
                    } else {
                        this.removeGridHoverEffect(gridItem);
                    }
                });
                
                gridItem.addEventListener('click', () => {
                    this.selectNodeFromMenu(node);
                });
                
                // Assemble grid item
                gridItem.appendChild(iconContainer);
                gridItem.appendChild(label);
                categoryGrid.appendChild(gridItem);
                
                // HIGHLIGHT FIRST ITEM
                if (isFirstItem) {
                    this.applyFirstItemHighlight(gridItem);
                    isFirstItem = false;
                }
            }
            
            // ADD CATEGORY GRID TO CATEGORY CONTAINER
            categoryContainer.appendChild(categoryGrid);
            
            // ADD CATEGORY CONTAINER TO MAIN LIST  
            this.contextMenuList.appendChild(categoryContainer);
        }
    },

    // FILTER NODE LIST
    async filterNodeList(searchTerm) {
        await this.populateNodeList(searchTerm);
    },
    
    // CYCLE MENU MODES - SHIFT+TAB with COMPLETE REFRESH
    async cycleMenuMode() {
        if (!this.contextMenuVisible || !this.contextMenuElement) return;
        
        this.currentModeIndex = (this.currentModeIndex + 1) % this.menuModes.length;
        const currentMode = this.menuModes[this.currentModeIndex];
        
        console.log(`🔄 Switching to ${currentMode.toUpperCase()} mode`);
        
        // PRESERVE current state
        const searchTerm = this.contextMenuSearchInput ? this.contextMenuSearchInput.value : '';
        const currentPosition = {
            x: parseInt(this.contextMenuElement.style.left),
            y: parseInt(this.contextMenuElement.style.top)
        };
        
        // COMPLETELY DESTROY and RECREATE menu to prevent styling issues
        this.hideContextMenu();
        
        // RECREATE menu at same position with new mode
        setTimeout(async () => {
            this.contextMenuElement = await this.createContextMenu(currentPosition.x, currentPosition.y);
            
            if (this.contextMenuElement) {
                document.body.appendChild(this.contextMenuElement);
                this.contextMenuVisible = true;
                
                // RESTORE search term
                if (this.contextMenuSearchInput && searchTerm) {
                    this.contextMenuSearchInput.value = searchTerm;
                    await this.filterNodeList(searchTerm);
                }
                
                // FOCUS search input
                if (this.contextMenuSearchInput) {
                    this.contextMenuSearchInput.focus();
                    this.contextMenuSearchInput.select();
                }
                
                console.log(`✅ ${currentMode.toUpperCase()} mode activated`);
            }
        }, 50); // Small delay to ensure clean recreation
    },
    
    // GET MENU WIDTH based on current mode
    getMenuWidth() {
        const currentMode = this.menuModes[this.currentModeIndex];
        
        if (currentMode === 'list') {
            return 400; // WIDE for dual columns
        } else if (currentMode === 'compact') {
            return 200; // NARROW for compact
        } else {
            return this.calculateGridWidth(); // ICON mode
        }
    },

    // SELECT NODE FROM MENU
    selectNodeFromMenu(nodeDefinition) {
        if (!this.nodeEditor) return;
        
        // Create node at cursor position (world coordinates)
        const worldX = (this.lastCursorPosition.x - this.nodeEditor.pan.x) / this.nodeEditor.zoom;
        const worldY = (this.lastCursorPosition.y - this.nodeEditor.pan.y) / this.nodeEditor.zoom;
        
        // Create new node using the renderer
        const newNode = window.PixiNodeRenderer.createNode(this.nodeEditor, nodeDefinition, this.nodeEditor.nodes.length);
        newNode.container.x = worldX;
        newNode.container.y = worldY;
        
        this.nodeEditor.nodes.push(newNode);
        this.nodeEditor.nodeLayer.addChild(newNode.container);
        
        // Close context menu
        this.hideContextMenu();
    },

    // UTILITY FUNCTIONS
    helpers: {
        hexToPixi: hexToPixi,
        
        // Apply theme changes
        applyTheme(theme) {
            // Theme switching logic can be added here
            console.log(`🎯 Context menu theme updated: ${theme}`);
        }
    }
};
// Confirm successful loading
console.log('🎯 PIXI Context Menu Styles & Behaviors loaded successfully');
