/**
 * 🎨 NODE TEXT STYLE MANAGER
 * Complete control over text styling, positioning, and effects for node elements
 * Handles: scale, offsets, padding, alignment, pivot, font effects
 */

window.NodeTextStyleManager = {
    
    // 📝 TEXT STYLE PRESETS
    presets: {
        title: {
            fontFamily: 'Consolas, sans-serif',
            fontSize: 11,
            fontWeight: 'bold',
            fill: 0xffffff,
            align: 'center',
            scale: { x: 1.0, y: 1.0 },
            offset: { x: 0, y: -8 },
            padding: { top: 2, bottom: 2, left: 4, right: 4 },
            pivot: { x: 0.5, y: 0.5 },
            effects: {
                dropShadow: true,
                shadowColor: 0x000000,
                shadowAlpha: 0.8,
                shadowOffset: { x: 1, y: 1 },
                shadowBlur: 2
            }
        },
        
        category: {
            fontFamily: 'Consolas, sans-serif',
            fontSize: 8,
            fontWeight: 'normal',
            fill: 0xaaaaaa,
            align: 'center',
            scale: { x: 0.9, y: 0.9 },
            offset: { x: 0, y: -4 },
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            pivot: { x: 0.5, y: 1.0 },
            effects: {
                dropShadow: false,
                glow: false
            }
        },
        
        parameter: {
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 9,
            fontWeight: 'normal',
            fill: 0xe0e0e0,
            align: 'left',
            scale: { x: 1.0, y: 1.0 },
            offset: { x: 8, y: 0 },
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            pivot: { x: 0.0, y: 0.5 },
            effects: {
                dropShadow: false,
                outline: true,
                outlineColor: 0x000000,
                outlineWidth: 1
            }
        },
        
        port: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 8,
            fontWeight: 'normal',
            fill: 0xcccccc,
            align: 'left',
            scale: { x: 0.95, y: 0.95 },
            offset: { x: 15, y: 0 },
            padding: { top: 1, bottom: 1, left: 1, right: 1 },
            pivot: { x: 0.0, y: 0.5 },
            effects: {
                dropShadow: false,
                glow: false
            }
        },
        
        value: {
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 8,
            fontWeight: 'normal',
            fill: 0x90ff90,
            align: 'right',
            scale: { x: 0.9, y: 0.9 },
            offset: { x: -8, y: 0 },
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            pivot: { x: 1.0, y: 0.5 },
            effects: {
                dropShadow: false,
                glow: true,
                glowColor: 0x90ff90,
                glowAlpha: 0.3,
                glowRadius: 3
            }
        }
    },
    
    // 🎯 CUSTOM TEXT STYLES STORAGE
    customStyles: new Map(),
    
    // 📐 APPLY COMPLETE TEXT STYLING
    applyTextStyle(textObject, styleType, customOverrides = {}) {
        if (!textObject || !(textObject instanceof PIXI.Text)) {
            console.warn('Invalid text object provided to applyTextStyle');
            return textObject;
        }
        
        // Get base style
        let baseStyle = this.presets[styleType];
        if (!baseStyle) {
            console.warn(`Unknown style type: ${styleType}`);
            baseStyle = this.presets.title; // Fallback
        }
        
        // Merge with custom overrides
        const finalStyle = this.mergeStyles(baseStyle, customOverrides);
        
        // Apply basic text properties
        this.applyBasicTextProperties(textObject, finalStyle);
        
        // Apply positioning and scaling
        this.applyTextTransform(textObject, finalStyle);
        
        // Apply visual effects
        this.applyTextEffects(textObject, finalStyle);
        
        return textObject;
    },
    
    // 🔧 APPLY BASIC TEXT PROPERTIES
    applyBasicTextProperties(textObject, style) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fill: style.fill,
            align: style.align,
            wordWrap: style.wordWrap || false,
            wordWrapWidth: style.wordWrapWidth || 100,
            lineHeight: style.lineHeight || style.fontSize * 1.2,
            letterSpacing: style.letterSpacing || 0
        });
        
        textObject.style = textStyle;
    },
    
    // 📍 APPLY TRANSFORM (SCALE, POSITION, PIVOT)
    applyTextTransform(textObject, style) {
        // Scale
        if (style.scale) {
            textObject.scale.set(style.scale.x || 1.0, style.scale.y || 1.0);
        }
        
        // Pivot (anchor point)
        if (style.pivot) {
            textObject.anchor.set(style.pivot.x || 0.5, style.pivot.y || 0.5);
        }
        
        // Offset (position adjustment)
        if (style.offset) {
            textObject.x += style.offset.x || 0;
            textObject.y += style.offset.y || 0;
        }
        
        // Padding simulation (adjust bounds)
        if (style.padding) {
            textObject._paddingStyle = style.padding;
        }
    },
    
    // ✨ APPLY VISUAL EFFECTS
    applyTextEffects(textObject, style) {
        if (!style.effects) return;
        
        const effects = style.effects;
        textObject.filters = textObject.filters || [];
        
        // Drop Shadow Effect
        if (effects.dropShadow && PIXI.DropShadowFilter) {
            const shadowFilter = new PIXI.DropShadowFilter({
                color: effects.shadowColor || 0x000000,
                alpha: effects.shadowAlpha || 0.8,
                offset: effects.shadowOffset || { x: 1, y: 1 },
                blur: effects.shadowBlur || 2,
                quality: 3
            });
            textObject.filters.push(shadowFilter);
        }
        
        // Glow Effect
        if (effects.glow && PIXI.GlowFilter) {
            const glowFilter = new PIXI.GlowFilter({
                color: effects.glowColor || textObject.style.fill,
                alpha: effects.glowAlpha || 0.5,
                outerStrength: effects.glowRadius || 2,
                innerStrength: 0,
                quality: 0.3
            });
            textObject.filters.push(glowFilter);
        }
        
        // Outline Effect
        if (effects.outline) {
            textObject.style.stroke = effects.outlineColor || 0x000000;
            textObject.style.strokeThickness = effects.outlineWidth || 1;
        }
        
        // Gradient Fill Effect
        if (effects.gradient && effects.gradientStops) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 20;
            
            const gradient = ctx.createLinearGradient(0, 0, 100, 0);
            effects.gradientStops.forEach(stop => {
                gradient.addColorStop(stop.position, stop.color);
            });
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 100, 20);
            
            const texture = PIXI.Texture.from(canvas);
            textObject.style.fill = texture;
        }
    },
    
    // 🔄 MERGE STYLE OBJECTS
    mergeStyles(baseStyle, overrides) {
        const merged = JSON.parse(JSON.stringify(baseStyle)); // Deep clone
        
        Object.keys(overrides).forEach(key => {
            if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
                merged[key] = { ...merged[key], ...overrides[key] };
            } else {
                merged[key] = overrides[key];
            }
        });
        
        return merged;
    },
    
    // 💾 SAVE CUSTOM STYLE
    saveCustomStyle(name, style) {
        this.customStyles.set(name, style);
        
        // Persist to localStorage
        try {
            const stylesObj = {};
            this.customStyles.forEach((value, key) => {
                stylesObj[key] = value;
            });
            localStorage.setItem('nodeTextStyles', JSON.stringify(stylesObj));
            console.log(`💾 Saved custom text style: ${name}`);
        } catch (e) {
            console.warn('Failed to save custom text style to localStorage');
        }
    },
    
    // 📂 LOAD CUSTOM STYLES
    loadCustomStyles() {
        try {
            const saved = localStorage.getItem('nodeTextStyles');
            if (saved) {
                const stylesObj = JSON.parse(saved);
                Object.keys(stylesObj).forEach(key => {
                    this.customStyles.set(key, stylesObj[key]);
                });
                console.log(`📂 Loaded ${this.customStyles.size} custom text styles`);
            }
        } catch (e) {
            console.warn('Failed to load custom text styles from localStorage');
        }
    },
    
    // 🎨 CREATE STYLED TEXT (HELPER FUNCTION)
    createStyledText(content, styleType, position = { x: 0, y: 0 }, customOverrides = {}) {
        const textObject = new PIXI.Text(content);
        textObject.x = position.x;
        textObject.y = position.y;
        
        return this.applyTextStyle(textObject, styleType, customOverrides);
    },
    
    // 📏 GET STYLED TEXT BOUNDS (INCLUDING PADDING)
    getStyledTextBounds(textObject) {
        const bounds = textObject.getBounds();
        const padding = textObject._paddingStyle || { top: 0, bottom: 0, left: 0, right: 0 };
        
        return {
            x: bounds.x - padding.left,
            y: bounds.y - padding.top,
            width: bounds.width + padding.left + padding.right,
            height: bounds.height + padding.top + padding.bottom
        };
    },
    
    // 🔄 UPDATE TEXT CONTENT (PRESERVE STYLING)
    updateTextContent(textObject, newContent) {
        if (textObject && textObject instanceof PIXI.Text) {
            textObject.text = newContent;
            return textObject;
        }
        return null;
    },
    
    // 🎯 ALIGNMENT HELPERS
    alignText: {
        // Align text relative to a container/node
        toContainer(textObject, container, alignment = 'center') {
            if (!textObject || !container) return;
            
            const containerBounds = container.getBounds ? container.getBounds() : container;
            const textBounds = textObject.getBounds();
            
            switch (alignment) {
                case 'center':
                    textObject.x = containerBounds.x + containerBounds.width / 2;
                    textObject.y = containerBounds.y + containerBounds.height / 2;
                    textObject.anchor.set(0.5, 0.5);
                    break;
                    
                case 'top-left':
                    textObject.x = containerBounds.x;
                    textObject.y = containerBounds.y;
                    textObject.anchor.set(0, 0);
                    break;
                    
                case 'top-right':
                    textObject.x = containerBounds.x + containerBounds.width;
                    textObject.y = containerBounds.y;
                    textObject.anchor.set(1, 0);
                    break;
                    
                case 'bottom-left':
                    textObject.x = containerBounds.x;
                    textObject.y = containerBounds.y + containerBounds.height;
                    textObject.anchor.set(0, 1);
                    break;
                    
                case 'bottom-right':
                    textObject.x = containerBounds.x + containerBounds.width;
                    textObject.y = containerBounds.y + containerBounds.height;
                    textObject.anchor.set(1, 1);
                    break;
            }
        }
    },
    
    // 🔧 ADVANCED EFFECTS
    advancedEffects: {
        // Animate text properties
        animateTextProperty(textObject, property, fromValue, toValue, duration = 1000) {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smooth easing function
                const eased = progress < 0.5 
                    ? 2 * progress * progress 
                    : -1 + (4 - 2 * progress) * progress;
                
                const currentValue = fromValue + (toValue - fromValue) * eased;
                
                // Apply the property
                if (property.includes('.')) {
                    const parts = property.split('.');
                    let obj = textObject;
                    for (let i = 0; i < parts.length - 1; i++) {
                        obj = obj[parts[i]];
                    }
                    obj[parts[parts.length - 1]] = currentValue;
                } else {
                    textObject[property] = currentValue;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        },
        
        // Create typewriter effect
        typewriterEffect(textObject, finalText, speed = 50) {
            let currentIndex = 0;
            textObject.text = '';
            
            const typeInterval = setInterval(() => {
                if (currentIndex < finalText.length) {
                    textObject.text += finalText[currentIndex];
                    currentIndex++;
                } else {
                    clearInterval(typeInterval);
                }
            }, speed);
        }
    }
};

// 🚀 INITIALIZE AND LOAD SAVED STYLES
NodeTextStyleManager.loadCustomStyles();

console.log('🎨 NodeTextStyleManager loaded with advanced text styling capabilities');
