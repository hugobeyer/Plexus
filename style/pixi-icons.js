// NODE ICON MAPPING - Extracted from index.html
window.PixiIcons = {
    // Icon definitions by node type
    nodeIcons: {
        // Data nodes
        'Constant': '📄',
        'Random': '🎲', 
        'Time': '⏰',
        'Hash': '#',
        
        // Math nodes
        'Add': '➕',
        'Subtract': '➖', 
        'Multiply': '✖️',
        'Divide': '➗',
        'Power': '^',
        'Sin': 'sin',
        'Cos': 'cos', 
        'Abs': '|x|',
        'Min': 'min',
        'Max': 'max',
        'Floor': '⌊⌋',
        'Sqrt': '√',
        'Mod': '%',
        
        // Vector nodes
        'Join': '🔗',
        'Split': '📐',
        'Length': '📏', 
        'Normalize': '🧭',
        'Dot': '•',
        
        // Logic nodes
        'Greater': '>',
        'Less': '<',
        'Equal': '=',
        'And': '&',
        'Or': '|',
        'Not': '!',
        'Branch': '?',
        
        // Conversion nodes
        'FloatToInt': '🔄',
        'IntToFloat': '🔄', 
        'BoolToFloat': '🔄'
    },
    
    // Fallback icon for unknown types
    defaultIcon: '⚙️',
    
    // Get icon for a node type
    getIcon(nodeType) {
        return this.nodeIcons[nodeType] || this.defaultIcon;
    },
    
    // Get all available icons by category
    getIconsByCategory() {
        return {
            data: ['Constant', 'Random', 'Time', 'Hash'],
            math: ['Add', 'Subtract', 'Multiply', 'Divide', 'Power', 'Sin', 'Cos', 'Abs', 'Min', 'Max', 'Floor', 'Sqrt', 'Mod'],
            vector: ['Join', 'Split', 'Length', 'Normalize', 'Dot'],
            logic: ['Greater', 'Less', 'Equal', 'And', 'Or', 'Not', 'Branch'],
            conversion: ['FloatToInt', 'IntToFloat', 'BoolToFloat']
        };
    },
    
    // Add or update icon
    setIcon(nodeType, icon) {
        this.nodeIcons[nodeType] = icon;
    }
};