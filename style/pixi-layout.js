// GRID LAYOUT CONFIGURATION - Extracted from index.html
window.PixiLayout = {
    // Grid configuration
    grid: {
        columns: 6,
        spacing: 320,
        startPosition: {
            x: -600,
            y: -300
        }
    },
    
    // Node positioning
    nodeSpacing: {
        horizontal: 44,
        vertical: 220,
        padding: {
            top: 50,
            left: 50,
            right: 50,
            bottom: 50
        }
    },
    
    // Calculate grid position for node index
    getGridPosition(index) {
        const col = index % this.grid.columns;
        const row = Math.floor(index / this.grid.columns);
        
        return {
            x: this.grid.startPosition.x + col * this.grid.spacing,
            y: this.grid.startPosition.y + row * this.grid.spacing
        };
    },
    
    // Calculate position with custom spacing
    getPositionWithSpacing(index, customSpacing = null) {
        const spacing = customSpacing || this.nodeSpacing;
        const col = index % this.grid.columns;
        const row = Math.floor(index / this.grid.columns);
        
        return {
            x: this.grid.startPosition.x + col * spacing.horizontal,
            y: this.grid.startPosition.y + row * spacing.vertical
        };
    },
    
    // Get layout bounds
    getBounds(nodeCount) {
        const rows = Math.ceil(nodeCount / this.grid.columns);
        const width = this.grid.columns * this.grid.spacing;
        const height = rows * this.grid.spacing;
        
        return {
            width,
            height,
            minX: this.grid.startPosition.x,
            minY: this.grid.startPosition.y,
            maxX: this.grid.startPosition.x + width,
            maxY: this.grid.startPosition.y + height
        };
    },
    
    // Update configuration
    setGridConfig(columns, spacing, startX, startY) {
        this.grid.columns = columns;
        this.grid.spacing = spacing;
        this.grid.startPosition.x = startX;
        this.grid.startPosition.y = startY;
    }
};