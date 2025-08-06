/**
 * √ SQRT NODE
 * Atomic square root operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class SqrtNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('x', 'float', 'X');
        this.addOutput('out', 'float', 'Sqrt(X)');
        
        // Pure compute function with negative protection
        this.compute = (x) => x < 0 ? 0 : Math.sqrt(x);
        
        // Visual properties
        this.title = 'Sqrt';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - square root symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Square root symbol
                vec2 center = vUv - 0.5;
                float sqrt_symbol = smoothstep(0.05, 0.02, abs(sqrt(abs(center.x)) - abs(center.y)));
                sqrt_symbol *= smoothstep(-0.5, -0.2, center.x);
                sqrt_symbol *= smoothstep(0.5, 0.2, center.y);
                
                finalColor += vec3(0.1, 0.3, 0.2) * sqrt_symbol * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default SqrtNode;