/**
 * 🌊 SIN NODE
 * Atomic sine wave operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class SinNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('x', 'float', 'X');
        this.addOutput('out', 'float', 'Sin(X)');
        
        // Pure compute function
        this.compute = (x) => Math.sin(x);
        
        // Visual properties
        this.title = 'Sin';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - subtle wave
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Subtle sine wave when processing
                float wave = sin((vUv.x - 0.5) * 8.0) * 0.5 + 0.5;
                wave *= smoothstep(0.3, 0.7, vUv.y) * smoothstep(0.7, 0.3, vUv.y);
                
                finalColor += vec3(0.1, 0.2, 0.3) * wave * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default SinNode;