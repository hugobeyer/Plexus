/**
 * ⬆️ MAX NODE
 * Atomic maximum operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class MaxNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'float', 'A');
        this.addInput('b', 'float', 'B');
        this.addOutput('out', 'float', 'Max(A,B)');
        
        // Pure compute function
        this.compute = (a, b) => Math.max(a, b);
        
        // Visual properties
        this.title = 'Max';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - upward arrow
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Upward arrow for maximum
                vec2 center = vUv - 0.5;
                float arrow = smoothstep(0.05, 0.02, abs(center.x + center.y * 0.8));
                arrow = max(arrow, smoothstep(0.05, 0.02, abs(center.x - center.y * 0.8)));
                arrow *= smoothstep(0.2, 0.7, vUv.y);
                
                finalColor += vec3(0.3, 0.1, 0.1) * arrow * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default MaxNode;