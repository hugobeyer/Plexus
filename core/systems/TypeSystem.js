/**
 * 🎯 TYPE SYSTEM
 * Centralized type management and validation
 */

class TypeSystem {
    constructor() {
        this.types = this.initializeTypes();
        this.conversionRules = this.initializeConversions();
    }

    initializeTypes() {
        return new Map([
            ['float', {
                name: 'float',
                color: '#FF6B6B',
                validate: (v) => typeof v === 'number',
                convert: (v) => Number(v),
                default: 0,
                glsl: 'float'
            }],
            ['vec2', {
                name: 'vec2',
                color: '#4ECDC4',
                validate: (v) => Array.isArray(v) && v.length === 2,
                convert: (v) => typeof v === 'number' ? [v, v] : [v[0] || 0, v[1] || 0],
                default: [0, 0],
                glsl: 'vec2'
            }],
            ['vec3', {
                name: 'vec3',
                color: '#95E1D3',
                validate: (v) => Array.isArray(v) && v.length === 3,
                convert: (v) => typeof v === 'number' ? [v, v, v] : [v[0] || 0, v[1] || 0, v[2] || 0],
                default: [0, 0, 0],
                glsl: 'vec3'
            }],
            ['vec4', {
                name: 'vec4',
                color: '#45B7D1',
                validate: (v) => Array.isArray(v) && v.length === 4,
                convert: (v) => typeof v === 'number' ? [v, v, v, v] : [v[0] || 0, v[1] || 0, v[2] || 0, v[3] || 0],
                default: [0, 0, 0, 0],
                glsl: 'vec4'
            }],
            ['int', {
                name: 'int',
                color: '#F38BA8',
                validate: (v) => Number.isInteger(v),
                convert: (v) => Math.floor(Number(v)),
                default: 0,
                glsl: 'int'
            }],
            ['bool', {
                name: 'bool',
                color: '#FFD93D',
                validate: (v) => typeof v === 'boolean',
                convert: (v) => Boolean(v),
                default: false,
                glsl: 'bool'
            }]
        ]);
    }

    initializeConversions() {
        return new Map([
            ['float', new Set(['int', 'vec2', 'vec3', 'vec4'])],
            ['int', new Set(['float'])],
            ['vec2', new Set(['float', 'vec3', 'vec4'])],
            ['vec3', new Set(['float', 'vec2', 'vec4'])],
            ['vec4', new Set(['float', 'vec2', 'vec3'])]
        ]);
    }

    // Core validation
    canConnect(fromType, toType) {
        if (fromType === toType) return true;
        
        const conversions = this.conversionRules.get(fromType);
        return conversions ? conversions.has(toType) : false;
    }

    // Value conversion
    convert(value, fromType, toType) {
        if (fromType === toType) return value;
        
        if (!this.canConnect(fromType, toType)) {
            throw new Error(`Cannot convert ${fromType} to ${toType}`);
        }

        const targetType = this.types.get(toType);
        return targetType.convert(value);
    }

    // Type info
    getType(typeName) {
        return this.types.get(typeName);
    }

    getColor(typeName) {
        const color = this.types.get(typeName)?.color || '#666666';
        // Convert to PIXI format if needed
        if (typeof color === 'string') {
            return parseInt(color.replace('#', ''), 16);
        }
        return color;
    }

    getDefault(typeName) {
        return this.types.get(typeName)?.default;
    }

    validate(value, typeName) {
        const type = this.types.get(typeName);
        return type ? type.validate(value) : false;
    }
}

export default TypeSystem;