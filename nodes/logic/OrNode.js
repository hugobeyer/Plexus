/**
 * | OR NODE
 * Atomic logical OR operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class OrNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'bool', 'A');
        this.addInput('b', 'bool', 'B');
        this.addOutput('out', 'bool', 'A | B');
        
        // Pure compute function
        this.compute = (a, b) => Boolean(a) || Boolean(b);
        
        // Visual properties
        this.title = 'Or';
        this.category = 'logic';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - OR gate symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // OR gate curved shape
                vec2 center = vUv - 0.5;
                float curve1 = smoothstep(0.05, 0.02, abs(center.x - sin(center.y * 3.0) * 0.2));
                float curve2 = smoothstep(0.05, 0.02, abs(center.x + 0.3 - cos(center.y * 2.0) * 0.1));
                curve1 *= smoothstep(0.4, -0.4, center.y);
                curve2 *= step(center.x, -0.1);
                
                float pattern = max(curve1, curve2);
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

export default OrNode;