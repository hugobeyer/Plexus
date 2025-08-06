/**
 * ⚡ POWER NODE
 * Atomic power operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class PowerNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('base', 'float', 'Base');
        this.addInput('exp', 'float', 'Exp');
        this.addOutput('out', 'float', 'Base^Exp');
        
        // Pure compute function
        this.compute = (base, exp) => Math.pow(base, exp);
        
        // Visual properties
        this.title = 'Power';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - exponential curve
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Exponential curve visualization
                float curve = pow(vUv.x, 2.0);
                float line = smoothstep(0.05, 0.02, abs(vUv.y - curve));
                line *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
                
                finalColor += vec3(0.3, 0.3, 0.1) * line * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default PowerNode;