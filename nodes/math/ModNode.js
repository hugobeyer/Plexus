/**
 * 🔄 MOD NODE
 * Atomic modulo operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class ModNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'float', 'A');
        this.addInput('b', 'float', 'B');
        this.addOutput('out', 'float', 'A % B');
        
        // Pure compute function with zero protection
        this.compute = (a, b) => b === 0 ? 0 : a % b;
        
        // Visual properties
        this.title = 'Mod';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - wave pattern
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Repeating pattern for modulo
                float pattern = sin(vUv.x * 20.0) * sin(vUv.y * 20.0);
                pattern = smoothstep(-0.2, 0.2, pattern);
                
                finalColor += vec3(0.2, 0.1, 0.2) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default ModNode;