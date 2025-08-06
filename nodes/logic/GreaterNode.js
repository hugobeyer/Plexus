/**
 * > GREATER NODE
 * Atomic greater than comparison
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class GreaterNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'float', 'A');
        this.addInput('b', 'float', 'B');
        this.addOutput('out', 'bool', 'A > B');
        
        // Pure compute function
        this.compute = (a, b) => (a || 0) > (b || 0);
        
        // Visual properties
        this.title = 'Greater';
        this.category = 'logic';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - greater than symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Greater than symbol
                vec2 center = vUv - 0.5;
                float line1 = smoothstep(0.05, 0.02, abs(center.y - center.x * 0.8));
                float line2 = smoothstep(0.05, 0.02, abs(center.y + center.x * 0.8));
                line1 *= smoothstep(0.3, -0.3, center.x);
                line2 *= smoothstep(0.3, -0.3, center.x);
                
                float pattern = max(line1, line2);
                finalColor += vec3(0.3, 0.2, 0.1) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default GreaterNode;