/**
 * ✖️ MULTIPLY NODE
 * Atomic multiplication operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class MultiplyNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'float', 'A');
        this.addInput('b', 'float', 'B');
        this.addOutput('out', 'float', 'Result');
        
        // Pure compute function
        this.compute = (a, b) => a * b;
        
        // Visual properties
        this.title = 'Multiply';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - subtle X pattern
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Subtle X pattern for multiply
                vec2 center = vUv - 0.5;
                float diagonal1 = smoothstep(0.05, 0.02, abs(center.x - center.y));
                float diagonal2 = smoothstep(0.05, 0.02, abs(center.x + center.y));
                float cross = max(diagonal1, diagonal2);
                
                finalColor += vec3(0.1, 0.2, 0.3) * cross * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default MultiplyNode;