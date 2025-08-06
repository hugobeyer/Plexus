/**
 * ➖ SUBTRACT NODE
 * Atomic subtraction operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class SubtractNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'float', 'A');
        this.addInput('b', 'float', 'B');
        this.addOutput('out', 'float', 'A-B');
        
        // Pure compute function
        this.compute = (a, b) => a - b;
        
        // Visual properties
        this.title = 'Subtract';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - minus symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Subtle minus pattern when processing
                vec2 center = vUv - 0.5;
                float line = smoothstep(0.05, 0.02, abs(center.y));
                line *= smoothstep(0.2, 0.05, abs(center.x));
                
                finalColor += vec3(0.3, 0.1, 0.1) * line * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default SubtractNode;