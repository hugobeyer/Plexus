/**
 * 🎯 CREDITS POPUP SYSTEM
 * Standalone credits popup with scrollable content
 * Follows context menu styling for consistency
 */

// Load saved colors for credits popup
function loadSavedColors() {
    try {
        const saved = localStorage.getItem('plexusColors');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load saved colors for credits popup');
    }
    return null;
}

const creditsSavedColors = loadSavedColors();

window.PixiCreditsPopup = {
    // POPUP CONFIGURATION
    dimensions: {
        width: 420,
        height: 500,
        borderRadius: 6,
        zIndex: 100000
    },
    
    // COLOR SCHEME - follows context menu styling
    colors: {
        background: creditsSavedColors?.contextMenu?.background || '#2a2a2a',
        border: creditsSavedColors?.contextMenu?.border || '#444',
        shadow: creditsSavedColors?.contextMenu?.shadow || 'rgba(0,0,0,0.4)',
        
        headerBackground: creditsSavedColors?.contextMenu?.categoryBackground || '#383838',
        headerText: creditsSavedColors?.contextMenu?.categoryText || '#fff',
        
        contentBackground: creditsSavedColors?.contextMenu?.background || '#2a2a2a',
        contentText: creditsSavedColors?.text?.primary || '#ddd',
        linkColor: creditsSavedColors?.ui?.accent || '#4CAF50',
        
        scrollbarTrack: creditsSavedColors?.contextMenu?.gridItemBorder || '#333',
        scrollbarThumb: creditsSavedColors?.contextMenu?.itemHover || '#4CAF50'
    },
    
    // POPUP STATE
    isVisible: false,
    popupElement: null,
    overlayElement: null,
    
    // CREDITS CONTENT
    creditsText: `
🎯 PLEXUS NODE EDITOR
━━━━━━━━━━━━━━━━━━━━━━

A VISUAL PROGRAMMING environment for creating complex procedural systems through node-based workflows.

🔧 CORE TECHNOLOGIES
━━━━━━━━━━━━━━━━━━━━━━

• PIXI.js - High-performance 2D WebGL rendering
• WebGL/WebGPU - Hardware-accelerated graphics
• JavaScript ES6+ - Modern web standards
• CSS3 Grid & Flexbox - Responsive layouts

📦 NODE CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━

MATH NODES
• Basic arithmetic (Add, Subtract, Multiply, Divide)
• Advanced functions (Power, Sin, Cos, Sqrt)
• Utility operations (Abs, Min, Max, Floor, Mod)

VECTOR NODES  
• Component operations (Join, Split)
• Vector math (Length, Normalize, Dot)

LOGIC NODES
• Comparison operators (Greater, Less, Equal)
• Boolean logic (And, Or, Not)
• Conditional branching (Branch)

DATA NODES
• Value generators (Constant, Random, Time)
• Hash functions and utilities

CONVERSION NODES
• Type casting (FloatToInt, IntToFloat, BoolToFloat)

🎨 VISUAL SYSTEM
━━━━━━━━━━━━━━━━━━━━━━

• DYNAMIC COLOR THEMES with live palette management
• CRISP SVG ICONS at 4x DPI resolution
• SMOOTH ANIMATIONS and transitions
• RESPONSIVE UI that adapts to any screen size

⚡ PERFORMANCE FEATURES
━━━━━━━━━━━━━━━━━━━━━━

• GPU-ACCELERATED rendering via WebGL
• EFFICIENT node culling and viewport optimization
• SMOOTH 60FPS viewport navigation
• MINIMAL MEMORY FOOTPRINT

🔗 INTERACTION SYSTEM
━━━━━━━━━━━━━━━━━━━━━━

• INTUITIVE DRAG & DROP workflow
• CONTEXT MENUS with multiple display modes
• KEYBOARD SHORTCUTS for power users
• REAL-TIME PARAMETER EDITING

💾 DATA MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━

• AUTO-SAVE with history tracking
• EXPORT/IMPORT functionality
• MULTI-TAB workspace management
• UNDO/REDO with full state preservation

🎛️ USER INTERFACE
━━━━━━━━━━━━━━━━━━━━━━

• TAB SYSTEM for multiple graphs
• CUSTOMIZABLE THEMES and color palettes
• GRID SNAPPING and alignment tools
• ZOOM & PAN with smooth interpolation

📊 TECHNICAL SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━

• Viewport: Infinite 2D canvas
• Node Limit: Virtually unlimited
• Connection Types: Multiple data types
• Rendering: Hardware-accelerated WebGL
• Browser Support: Modern ES6+ browsers

🌟 ADVANCED FEATURES
━━━━━━━━━━━━━━━━━━━━━━

• NESTED GRAPHS with input/output nodes
• LIVE PREVIEW with WebGL/WebGPU rendering
• PARAMETER AUTOMATION and keyframing
• MODULAR ARCHITECTURE for extensibility

📝 LICENSING & CREDITS
━━━━━━━━━━━━━━━━━━━━━━

LUCIDE ICONS
Licensed under ISC License
Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

🔗 MORE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━

Lucide Icons: https://lucide.dev/license
Project Repository: Built with modern web technologies
Documentation: Available in project docs/

━━━━━━━━━━━━━━━━━━━━━━
Built with ❤️ for visual programming
    `,
    
    // SHOW CREDITS POPUP
    show() {
        if (this.isVisible) return;
        
        this.createPopup();
        this.isVisible = true;
        
        console.log('📖 Credits popup opened');
    },
    
    // HIDE CREDITS POPUP
    hide() {
        if (!this.isVisible) return;
        
        if (this.overlayElement) {
            document.body.removeChild(this.overlayElement);
        }
        if (this.popupElement) {
            document.body.removeChild(this.popupElement);
        }
        
        this.overlayElement = null;
        this.popupElement = null;
        this.isVisible = false;
        
        console.log('📖 Credits popup closed');
    },
    
    // CREATE POPUP ELEMENT
    createPopup() {
        // CREATE OVERLAY
        this.overlayElement = document.createElement('div');
        this.overlayElement.style.cssText = this.getOverlayStyle();
        
        // CREATE POPUP CONTAINER
        this.popupElement = document.createElement('div');
        this.popupElement.style.cssText = this.getPopupStyle();
        
        // CREATE HEADER
        const header = document.createElement('div');
        header.style.cssText = this.getHeaderStyle();
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 16px;">ℹ️</div>
                <div style="font-weight: bold; font-size: 12px;">ABOUT PLEXUS</div>
            </div>
            <button class="credits-close-btn" style="${this.getCloseButtonStyle()}">×</button>
        `;
        
        // CREATE CONTENT AREA
        const content = document.createElement('div');
        content.style.cssText = this.getContentStyle();
        
        // CREATE SCROLLABLE TEXT
        const textArea = document.createElement('pre');
        textArea.style.cssText = this.getTextAreaStyle();
        textArea.textContent = this.creditsText.trim();
        
        content.appendChild(textArea);
        
        // ASSEMBLE POPUP
        this.popupElement.appendChild(header);
        this.popupElement.appendChild(content);
        
        // ADD TO DOM
        document.body.appendChild(this.overlayElement);
        document.body.appendChild(this.popupElement);
        
        // POSITION POPUP (CENTER)
        this.centerPopup();
        
        // EVENT LISTENERS
        this.setupEventListeners();
    },
    
    // SETUP EVENT LISTENERS
    setupEventListeners() {
        // CLOSE BUTTON
        const closeBtn = this.popupElement.querySelector('.credits-close-btn');
        closeBtn.addEventListener('click', () => this.hide());
        
        // OVERLAY CLICK
        this.overlayElement.addEventListener('click', () => this.hide());
        
        // PREVENT POPUP CLICK FROM CLOSING
        this.popupElement.addEventListener('click', (e) => e.stopPropagation());
        
        // ESC KEY
        const escHandler = (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // WINDOW RESIZE
        const resizeHandler = () => {
            if (this.isVisible) {
                this.centerPopup();
            }
        };
        window.addEventListener('resize', resizeHandler);
    },
    
    // CENTER POPUP ON SCREEN
    centerPopup() {
        if (!this.popupElement) return;
        
        const x = (window.innerWidth - this.dimensions.width) / 2;
        const y = (window.innerHeight - this.dimensions.height) / 2;
        
        this.popupElement.style.left = Math.max(20, x) + 'px';
        this.popupElement.style.top = Math.max(20, y) + 'px';
    },
    
    // STYLE GENERATORS
    getOverlayStyle() {
        return `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: ${this.dimensions.zIndex - 1};
            backdrop-filter: blur(2px);
        `;
    },
    
    getPopupStyle() {
        return `
            position: fixed;
            width: ${this.dimensions.width}px;
            height: ${this.dimensions.height}px;
            background: ${this.colors.background};
            border: 1px solid ${this.colors.border};
            border-radius: ${this.dimensions.borderRadius}px;
            box-shadow: 0 8px 32px ${this.colors.shadow};
            z-index: ${this.dimensions.zIndex};
            font-family: 'Consolas', 'Monaco', monospace;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;
    },
    
    getHeaderStyle() {
        return `
            background: ${this.colors.headerBackground};
            color: ${this.colors.headerText};
            padding: 12px 16px;
            border-bottom: 1px solid ${this.colors.border};
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        `;
    },
    
    getCloseButtonStyle() {
        return `
            background: none;
            border: none;
            color: ${this.colors.headerText};
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 3px;
            transition: background 0.15s;
        `;
    },
    
    getContentStyle() {
        return `
            flex: 1;
            overflow: hidden;
            background: ${this.colors.contentBackground};
        `;
    },
    
    getTextAreaStyle() {
        return `
            width: 100%;
            height: 100%;
            padding: 16px;
            margin: 0;
            background: none;
            border: none;
            color: ${this.colors.contentText};
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 11px;
            line-height: 1.4;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            box-sizing: border-box;
            
            /* CUSTOM SCROLLBAR */
            scrollbar-width: thin;
            scrollbar-color: ${this.colors.scrollbarThumb} ${this.colors.scrollbarTrack};
        `;
    },
    
    // TOGGLE POPUP
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    },
    
    // UPDATE COLORS from theme system
    updateColors(newColors) {
        Object.assign(this.colors, newColors);
        
        // Update existing popup if visible
        if (this.isVisible && this.popupElement) {
            this.hide();
            setTimeout(() => this.show(), 50);
        }
    }
};

// GLOBAL ACCESS
window.showCredits = () => window.PixiCreditsPopup.show();
window.hideCredits = () => window.PixiCreditsPopup.hide();
window.toggleCredits = () => window.PixiCreditsPopup.toggle();

// CSS INJECTION for hover effects
const creditsStyle = document.createElement('style');
creditsStyle.textContent = `
    .credits-close-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
    }
    
    /* WEBKIT SCROLLBAR STYLING */
    .credits-popup pre::-webkit-scrollbar {
        width: 8px;
    }
    .credits-popup pre::-webkit-scrollbar-track {
        background: ${creditsSavedColors?.contextMenu?.gridItemBorder || '#333'};
    }
    .credits-popup pre::-webkit-scrollbar-thumb {
        background: ${creditsSavedColors?.contextMenu?.itemHover || '#4CAF50'};
        border-radius: 4px;
    }
    .credits-popup pre::-webkit-scrollbar-thumb:hover {
        background: ${creditsSavedColors?.ui?.accent || '#66BB6A'};
    }
`;
document.head.appendChild(creditsStyle);

console.log('📖 PIXI Credits Popup System loaded successfully');
