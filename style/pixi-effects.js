/**
 * 🎨 PIXI EFFECTS CONFIG
 * Visual effects and animations configuration
 * AUTO-LOADS from Color Palette Manager
 */

// Load saved colors for effects
function loadSavedColors() {
    try {
        const saved = localStorage.getItem('plexusColors');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load saved colors for effects');
    }
    return null;
}

const effectsSavedColors = loadSavedColors();

window.PixiEffects = {
    // Effect configurations - AUTO-LOADED FROM COLOR PALETTE
    dangerZone: {
        enabled: false,  // Toggle danger zone effects
        background: effectsSavedColors?.ui?.error || '#ff4444',
        pulse: {
            min: effectsSavedColors?.opacity?.dangerZoneMin || 0.5,
            max: effectsSavedColors?.opacity?.dangerZoneMax || 0.8,
            speed: 0.05
        }
    },
    
    glow: {
        enabled: true,  // Toggle glow effects
        size: 10,
        alpha: effectsSavedColors?.opacity?.glowEffectNormal || 0.3,
        pulse: {
            enabled: false,
            min: effectsSavedColors?.opacity?.glowEffectPulseMin || 0.2,
            max: effectsSavedColors?.opacity?.glowEffectPulseMax || 0.4,
            speed: 0.02
        }
    },
    
            selection: {
        node: {
            borderColor: effectsSavedColors?.selectionBox?.lineColor || '#4CAF50',  // Green selection color
            borderAlpha: effectsSavedColors?.opacity?.nodeSelectionBorder || 0.5,  // 50% transparent
            borderWidth: 0,    // No extra border (use overlay instead)
            glowSize: 10,
            glowAlpha: effectsSavedColors?.opacity?.nodeSelectionGlow || 0.3
        },
        box: {
            lineColor: effectsSavedColors?.selectionBox?.lineColor ? parseInt(effectsSavedColors.selectionBox.lineColor.replace('#', ''), 16) : parseInt('4CAF50', 16),
            lineAlpha: effectsSavedColors?.opacity?.selectionBoxLine || 1.0,
            lineWidth: 2,
            fillAlpha: effectsSavedColors?.opacity?.selectionBoxFill || 0.0  // No fill
        }
    },
    
    background: {
        gradient: {
            enabled: true,
            inner: {
                color: effectsSavedColors?.gradientEffects?.innerColor ? parseInt(effectsSavedColors.gradientEffects.innerColor.replace('#', ''), 16) : parseInt('2A2A2A', 16),
                alpha: effectsSavedColors?.opacity?.gradientInner || 1.0,
                radiusMultiplier: 0.5
            },
            outer: {
                color: effectsSavedColors?.gradientEffects?.outerColor ? parseInt(effectsSavedColors.gradientEffects.outerColor.replace('#', ''), 16) : parseInt('424242', 16),
                alpha: effectsSavedColors?.opacity?.gradientOuter || 1.0
            }
        }
    },
    
    animation: {
        hover: {
            scaleAmount: 1.05,
            duration: 200,
            easing: 'quad'
        },
        connection: {
            snapDuration: 150,
            easing: 'cubic'
        },
        port: {
            highlightScale: 1.2,
            feedbackDuration: 200
        }
    },
    
    // Configuration getters
    getDangerZoneConfig() {
        return this.dangerZone;
    },
    
    getGlowConfig() {
        return this.glow;
    },
    
    getSelectionConfig() {
        return this.selection;
    },
    
    getBackgroundConfig() {
        return this.background.gradient;
    },
    
    getAnimationConfig(type) {
        return this.animation[type] || {};
    },
    
    getSelectionBoxConfig() {
        return this.selection.box;
    },
    
    // Utility functions (moved from index.html)
    hexToPixi(hexString) {
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
        return parseInt('666666', 16); // fallback
    }
};

// Confirm successful loading
console.log('🎨 PIXI Effects loaded successfully');