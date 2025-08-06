/**
 * & AND NODE
 * Atomic logical AND operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class AndNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'bool', 'A');
        this.addInput('b', 'bool', 'B');
        this.addOutput('out', 'bool', 'A & B');
        
        // Pure compute function
        this.compute = (a, b) => Boolean(a) && Boolean(b);
        
        // Visual properties
        this.title = 'And';
        this.category = 'logic';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - AND gate symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // AND gate shape
                vec2 center = vUv - 0.5;
                float gate = smoothstep(0.05, 0.02, abs(length(center + vec2(0.2, 0.0)) - 0.3));
                gate *= step(center.x, 0.0);
                
                float rect = smoothstep(0.05, 0.02, max(abs(center.x + 0.2) - 0.1, abs(center.y) - 0.3));
                rect *= step(center.x, 0.0);
                
                float pattern = max(gate, rect);
                finalColor += vec3(0.2, 0.1, 0.3) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default AndNode;