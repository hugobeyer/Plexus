/**
 * 📏 ABS NODE
 * Atomic absolute value operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class AbsNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('x', 'float', 'X');
        this.addOutput('out', 'float', 'Abs(X)');
        
        // Pure compute function
        this.compute = (x) => Math.abs(x);
        
        // Visual properties
        this.title = 'Abs';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - absolute value visualization
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // V-shape for absolute value
                vec2 center = vUv - 0.5;
                float vShape = smoothstep(0.05, 0.02, abs(abs(center.x) - (0.5 - vUv.y) * 0.6));
                vShape *= smoothstep(0.7, 0.3, vUv.y);
                
                finalColor += vec3(0.3, 0.2, 0.1) * vShape * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default AbsNode;