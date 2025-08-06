/**
 * THEME SYSTEM - EXTRACTED FROM INDEX.HTML
 * Handles theme switching and application (currently only dark theme used)
 */

class ThemeSystem {
    constructor(pixiNodeSystem) {
        this.nodeSystem = pixiNodeSystem;
        this.currentTheme = 'dark'; // Only dark theme used in practice
    }

    /**
     * Initialize theme system
     */
    initialize() {
        this.applyTheme(this.currentTheme);
    }

    /**
     * Apply theme (simplified since only dark theme is used)
     */
    applyTheme(themeName = 'dark') {
        this.currentTheme = themeName;
        
        // Apply theme using modular style system
        if (this.nodeSystem.styles && this.nodeSystem.styles.helpers) {
            this.nodeSystem.styles.helpers.applyTheme(this.currentTheme);
        }
        
        // Update background (keep tiling background, no solid color change needed)
        this.nodeSystem.updateGrid();
        
        // Update all node visuals
        this.nodeSystem.nodes.forEach(node => {
            if (window.PixiNodeRenderer) {
                window.PixiNodeRenderer.updateNodeVisual(this.nodeSystem, node);
            }
        });
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Check if theme switching is enabled (currently disabled)
     */
    isThemeSwitchingEnabled() {
        return false; // Only dark theme used
    }

    /**
     * Update theme from tab settings (legacy compatibility)
     */
    updateFromTabSettings(tabSettings) {
        if (tabSettings && tabSettings.theme && tabSettings.theme !== this.currentTheme) {
            this.applyTheme(tabSettings.theme);
        }
    }
}

// Export for use in main system
window.ThemeSystem = ThemeSystem;
