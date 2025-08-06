/**
 * # HASH NODE
 * Atomic hash function
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class HashNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('value', 'float', 'Value');
        this.addOutput('out', 'float', 'Hash');
        
        // Pure compute function - simple hash
        this.compute = (value) => {
            const x = (value || 0) * 12.9898;
            return Math.abs(Math.sin(x) * 43758.5453123) % 1;
        };
        
        // Visual properties
        this.title = 'Hash';
        this.category = 'data';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - hash pattern
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Hash-like scattered pattern
                vec2 center = vUv;
                float hash1 = fract(sin(dot(center * 5.0, vec2(12.9898, 78.233))) * 43758.5453);
                float hash2 = fract(sin(dot(center * 7.0, vec2(127.1, 311.7))) * 43758.5453);
                
                float pattern = smoothstep(0.7, 0.9, hash1) + smoothstep(0.8, 0.95, hash2);
                pattern = clamp(pattern, 0.0, 1.0);
                
                finalColor += vec3(0.2, 0.2, 0.3) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default HashNode;