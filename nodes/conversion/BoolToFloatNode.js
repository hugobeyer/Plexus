/**
 * 🔢 BOOL TO FLOAT NODE
 * Atomic boolean to float conversion
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class BoolToFloatNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('bool', 'bool', 'Boolean');
        this.addOutput('out', 'float', 'Float');
        
        // Pure compute function
        this.compute = (boolVal) => Boolean(boolVal) ? 1.0 : 0.0;
        
        // Visual properties
        this.title = 'Bool→Float';
        this.category = 'conversion';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - binary conversion
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Binary representation
                vec2 center = vUv - 0.5;
                float binary = step(0.5, fract(center.x * 8.0));
                binary *= smoothstep(0.3, 0.1, abs(center.y));
                
                // Arrow
                float arrow = smoothstep(0.05, 0.02, abs(center.y));
                arrow *= smoothstep(0.2, 0.05, abs(center.x + 0.1));
                
                float pattern = max(binary, arrow);
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

export default BoolToFloatNode;