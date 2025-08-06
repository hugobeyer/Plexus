/**
 * 🌊 COS NODE
 * Atomic cosine operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class CosNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('x', 'float', 'X');
        this.addOutput('out', 'float', 'Cos(X)');
        
        // Pure compute function
        this.compute = (x) => Math.cos(x);
        
        // Visual properties
        this.title = 'Cos';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - cosine wave
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Cosine wave visual effect (phase shifted from sin)
                float wave = cos(vUv.x * 10.0 + time * 3.0 + 1.57) * 0.5 + 0.5;
                wave *= smoothstep(0.3, 0.7, vUv.y) * smoothstep(0.7, 0.3, vUv.y);
                
                finalColor += vec3(0.2, 0.1, 0.3) * wave * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default CosNode;