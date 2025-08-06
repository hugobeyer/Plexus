/**
 * ➗ DIVIDE NODE
 * Atomic division operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class DivideNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'float', 'A');
        this.addInput('b', 'float', 'B');
        this.addOutput('out', 'float', 'A/B');
        
        // Pure compute function with zero protection
        this.compute = (a, b) => b === 0 ? 0 : a / b;
        
        // Visual properties
        this.title = 'Divide';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - division symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Division symbol when processing
                vec2 center = vUv - 0.5;
                float line = smoothstep(0.05, 0.02, abs(center.y));
                line *= smoothstep(0.15, 0.05, abs(center.x));
                
                float topDot = smoothstep(0.08, 0.05, length(center - vec2(0.0, 0.15)));
                float botDot = smoothstep(0.08, 0.05, length(center - vec2(0.0, -0.15)));
                
                float pattern = max(line, max(topDot, botDot));
                finalColor += vec3(0.2, 0.3, 0.1) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default DivideNode;