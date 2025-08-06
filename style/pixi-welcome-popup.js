/**
 * 🎮 PLEXUS WELCOME POPUP
 * Welcome banner system using Plexus UI styles
 * Shows on first visit, integrates with existing UI system
 */

window.PlexusWelcomePopup = {
    popup: null,
    overlay: null,
    isInitialized: false,
    
    // WELCOME POPUP STYLES - Uses Plexus UI system
    getStyles() {
        const uiStyles = window.PixiUIStyles;
        const savedColors = this.loadSavedColors();
        
        return {
            overlay: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.85)',
                zIndex: '10000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'stretch'
            },
            
            popup: {
                width: '100%',
                height: '320px',
                background: `linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)`,
                border: 'none',
                borderRadius: '0',
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: savedColors?.text?.fontFamily || "'Courier New', monospace",
                position: 'relative'
            },
            
            header: {
                background: `linear-gradient(90deg, #3a3a3a 0%, #2a2a2a 50%, #3a3a3a 100%)`,
                padding: '20px',
                textAlign: 'center',
                position: 'relative',
                borderBottom: '1px solid #444'
            },
            
            title: {
                margin: '0',
                fontFamily: "'Courier New', monospace",
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '2px'
            },
            
            subtitle: {
                margin: '5px 0 0 0',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '300'
            },
            
            closeButton: {
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
            },
            
            content: {
                flex: '1',
                padding: '30px 60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                color: savedColors?.text?.primary || '#ffffff',
                lineHeight: '1.6'
            }
        };
    },
    
    // LOAD SAVED COLORS from Color Palette Manager
    loadSavedColors() {
        try {
            const saved = localStorage.getItem('plexusColors');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load saved UI colors for welcome popup');
        }
        return null;
    },
    
    // UTILITY: Convert hex to rgba
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    // UTILITY: Darken color
    darkenColor(hex, amount = 0.1) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    },
    
    // CREATE WELCOME POPUP ELEMENTS
    createPopup() {
        const styles = this.getStyles();
        
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'plexus-welcome-overlay';
        Object.assign(this.overlay.style, styles.overlay);
        
        // Create popup container
        this.popup = document.createElement('div');
        this.popup.id = 'plexus-welcome-popup';
        Object.assign(this.popup.style, styles.popup);
        
        // Create header
        const header = document.createElement('div');
        Object.assign(header.style, styles.header);
        
        const title = document.createElement('h1');
        title.textContent = '🎮 WELCOME TO PLEXUS';
        Object.assign(title.style, styles.title);
        
        const subtitle = document.createElement('p');
        subtitle.textContent = 'INDUSTRY-GRADE NODE EDITOR';
        Object.assign(subtitle.style, styles.subtitle);
        
        const closeBtn = document.createElement('button');
        closeBtn.id = 'plexus-welcome-close';
        closeBtn.textContent = '✕';
        Object.assign(closeBtn.style, styles.closeButton);
        
        header.appendChild(title);
        header.appendChild(subtitle);
        header.appendChild(closeBtn);
        
        // Create content
        const content = document.createElement('div');
        Object.assign(content.style, styles.content);
        
        content.innerHTML = `
            <p style="font-size: 24px; margin-bottom: 20px; color: #ffffff; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                🚀 WELCOME TO PLEXUS
            </p>
            
            <p style="font-size: 16px; margin-bottom: 15px; color: #cccccc; font-weight: 300;">
                Next-generation visual programming with <strong style="color: #ffffff;">75% FREE CONTENT</strong>
            </p>
            
            <div style="display: flex; justify-content: center; gap: 40px; margin: 25px 0; flex-wrap: wrap;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #666; margin-bottom: 8px;">📋</div>
                    <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">SUBSCRIPTION</div>
                    <div style="font-size: 11px; color: #aaa; margin-top: 4px;">Complex nodes require subscription</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #666; margin-bottom: 8px;">🎨</div>
                    <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">CREATE</div>
                    <div style="font-size: 11px; color: #aaa; margin-top: 4px;">Build custom node networks</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #666; margin-bottom: 8px;">⚡</div>
                    <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">EXPLORE</div>
                    <div style="font-size: 11px; color: #aaa; margin-top: 4px;">75% free content available</div>
                </div>
            </div>
            
            <div style="
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                font-size: 10px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
            ">
                <p>PLEXUS DEVELOPMENT TEAM © 2024</p>
            </div>
        `;
        
        // Assemble popup
        this.popup.appendChild(header);
        this.popup.appendChild(content);
        this.overlay.appendChild(this.popup);
        
        // Add to DOM
        document.body.appendChild(this.overlay);
        
        // Setup events
        this.setupEvents();
        
        return this.overlay;
    },
    
    // SETUP EVENT HANDLERS
    setupEvents() {
        const closeBtn = document.getElementById('plexus-welcome-close');
        
        // Close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
            
            // Close button hover effects
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = 'rgba(255,255,255,0.3)';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = 'rgba(255,255,255,0.2)';
            });
        }
        
        // Close on overlay click (backdrop)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.close();
            }
        });
    },
    
    // INITIALIZE WELCOME POPUP SYSTEM
    init() {
        if (this.isInitialized) return;
        
        console.log('🎮 Initializing Plexus Welcome Popup...');
        
        // Add CSS animations to the page
        this.addAnimations();
        
        // Check if user should see welcome
        if (this.shouldShowWelcome()) {
            this.show();
        }
        
        this.isInitialized = true;
    },
    
    // ADD CSS ANIMATIONS
    addAnimations() {
        const style = document.createElement('style');
        style.id = 'plexus-welcome-animations';
        style.textContent = `
            @keyframes plexusWelcomeSlideIn {
                0% {
                    opacity: 0;
                    transform: translateY(-100%);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes plexusWelcomeSlideOut {
                0% {
                    opacity: 1;
                    transform: translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-100%);
                }
            }
            
            .plexus-welcome-show {
                animation: plexusWelcomeSlideIn 0.5s ease-out !important;
            }
            
            .plexus-welcome-hide {
                animation: plexusWelcomeSlideOut 0.3s ease-in forwards !important;
            }
        `;
        
        // Only add if not already added
        if (!document.getElementById('plexus-welcome-animations')) {
            document.head.appendChild(style);
        }
    },
    
    // CHECK IF WELCOME SHOULD BE SHOWN
    shouldShowWelcome() {
        const hasSeenWelcome = localStorage.getItem('plexus_welcome_seen');
        return !hasSeenWelcome;
    },
    
    // SHOW WELCOME POPUP
    show() {
        if (!this.popup) {
            this.createPopup();
        }
        
        this.overlay.style.display = 'flex';
        this.popup.classList.remove('plexus-welcome-hide');
        this.popup.classList.add('plexus-welcome-show');
        
        console.log('🎮 Welcome popup shown');
    },
    
    // CLOSE WELCOME POPUP
    close() {
        if (!this.isVisible()) return;
        
        this.popup.classList.remove('plexus-welcome-show');
        this.popup.classList.add('plexus-welcome-hide');
        
        setTimeout(() => {
            this.hide();
            // Mark as seen so it doesn't show again
            localStorage.setItem('plexus_welcome_seen', 'true');
            console.log('🎮 Welcome popup closed and marked as seen');
        }, 400);
    },
    
    // HIDE WELCOME POPUP (without animation)
    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    },
    
    // CHECK IF POPUP IS VISIBLE
    isVisible() {
        return this.overlay && this.overlay.style.display !== 'none';
    },
    
    // RESET WELCOME STATUS (for testing)
    reset() {
        localStorage.removeItem('plexus_welcome_seen');
        console.log('🎮 Welcome popup status reset');
    }
};

// AUTO-INITIALIZE when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Give UI styles time to load first
        setTimeout(() => {
            window.PlexusWelcomePopup.init();
        }, 100);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        window.PlexusWelcomePopup.init();
    }, 100);
}

console.log('🎮 Plexus Welcome Popup module loaded');
