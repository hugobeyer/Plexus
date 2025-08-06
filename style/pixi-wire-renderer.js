/**
 * 🔌 PIXI WIRE RENDERER
 * Handles all wire/connection rendering with proper style system integration
 */

window.PixiWireRenderer = {
    /**
     * Draw a wire connection with full style system support
     */
    drawWire(graphics, fromPos, toPos, type, options = {}) {
        const { isValid = true, selected = false, hover = false } = options;
        const styles = window.PixiNodeStyles;
        
        // GET STATE AND COLOR
        const state = selected ? 'selected' : (isValid ? 'normal' : 'invalid');
        const lineColor = styles.helpers.getWireColor(type, state);
        
        // GET THICKNESS
        const thickness = styles.wire.thickness;
        let lineWidth = thickness.normal;
        if (selected) lineWidth = thickness.selected;
        else if (hover) lineWidth = thickness.hover;
        
        // GET ALPHA
        const alpha = isValid ? styles.wire.alpha.normal : styles.wire.alpha.invalid;
        
        // DRAW WIRE
        graphics.lineStyle(lineWidth, lineColor, alpha);
        graphics.moveTo(fromPos.x, fromPos.y);
        graphics.lineTo(toPos.x, toPos.y);
        graphics.stroke();
        
        // DRAW ENDPOINTS IF NEEDED
        if (selected && styles.wire.endpoints.showOnSelected) {
            const radius = styles.wire.endpoints.selectedRadius;
            graphics.beginFill(lineColor, alpha);
            graphics.drawCircle(fromPos.x, fromPos.y, radius);
            graphics.drawCircle(toPos.x, toPos.y, radius);
            graphics.endFill();
        }
    },
    
    /**
     * Draw wire hit area with style system support
     */
    drawWireHitArea(graphics, fromPos, toPos, hitThickness) {
        const styles = window.PixiNodeStyles;
        
        // HIT AREA STYLING FROM STYLE SYSTEM
        const hitColor = styles.wire.hitArea.color || 0x000000;
        const hitAlpha = styles.wire.hitArea.alpha || 0.01;
        
        graphics.lineStyle(hitThickness, hitColor, hitAlpha);
        graphics.moveTo(fromPos.x, fromPos.y);
        graphics.lineTo(toPos.x, toPos.y);
        graphics.stroke();
    },
    
    /**
     * Draw wire with scale-invariant support
     */
    drawWireScaled(graphics, fromPos, toPos, type, options, scaleFunction) {
        const { isValid = true, selected = false, hover = false } = options;
        const styles = window.PixiNodeStyles;
        
        // GET STATE AND COLOR
        const state = selected ? 'selected' : (isValid ? 'normal' : 'invalid');
        const lineColor = styles.helpers.getWireColor(type, state);
        
        // GET THICKNESS
        const thickness = styles.wire.thickness;
        let lineWidth = thickness.normal;
        if (selected) lineWidth = thickness.selected;
        else if (hover) lineWidth = thickness.hover;
        
        // APPLY SCALE FUNCTION
        const scaledWidth = scaleFunction ? scaleFunction(lineWidth) : lineWidth;
        
        // GET ALPHA
        const alpha = isValid ? styles.wire.alpha.normal : styles.wire.alpha.invalid;
        
        // DRAW WIRE
        graphics.lineStyle(scaledWidth, lineColor, alpha);
        graphics.moveTo(fromPos.x, fromPos.y);
        graphics.lineTo(toPos.x, toPos.y);
        graphics.stroke();
        
        // DRAW ENDPOINTS IF NEEDED
        if (selected && styles.wire.endpoints.showOnSelected) {
            const radius = styles.wire.endpoints.selectedRadius;
            graphics.beginFill(lineColor, alpha);
            graphics.drawCircle(fromPos.x, fromPos.y, radius);
            graphics.drawCircle(toPos.x, toPos.y, radius);
            graphics.endFill();
        }
    },
    
    /**
     * Draw wire hit area with scale support
     */
    drawWireHitAreaScaled(graphics, fromPos, toPos, scaleFunction) {
        const styles = window.PixiNodeStyles;
        
        // GET HIT AREA SETTINGS
        const hitThickness = styles.wire.hitArea.thickness;
        const hitColor = styles.wire.hitArea.color || 0x000000;
        const hitAlpha = styles.wire.hitArea.alpha || 0.01;
        
        // APPLY SCALE FUNCTION
        const scaledThickness = scaleFunction ? scaleFunction(hitThickness) : hitThickness;
        
        graphics.lineStyle(scaledThickness, hitColor, hitAlpha);
        graphics.moveTo(fromPos.x, fromPos.y);
        graphics.lineTo(toPos.x, toPos.y);
        graphics.stroke();
    }
};