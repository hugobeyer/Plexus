/**
 * 📐 FLOOR NODE
 * Atomic floor operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class FloorNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('x', 'float', 'X');
        this.addOutput('out', 'int', 'Floor(X)');
        
        // Pure compute function
        this.compute = (x) => Math.floor(x);
        
        // Visual properties
        this.title = 'Floor';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - subtle steps
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Subtle step pattern when processing
                float steps = floor((vUv.y - 0.3) * 6.0) / 6.0;
                steps *= smoothstep(0.3, 0.4, vUv.y) * smoothstep(0.7, 0.6, vUv.y);
                
                finalColor += vec3(0.1, 0.1, 0.2) * steps * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default FloorNode;