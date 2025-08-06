/**
 * 📏 LENGTH NODE
 * Atomic vector length operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class LengthNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('vec', 'vec2', 'Vector');
        this.addOutput('out', 'float', 'Length');
        
        // Pure compute function
        this.compute = (vec) => {
            const v = Array.isArray(vec) ? vec : [vec || 0, 0];
            const x = v[0] || 0;
            const y = v[1] || 0;
            return Math.sqrt(x * x + y * y);
        };
        
        // Visual properties
        this.title = 'Length';
        this.category = 'vector';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - radius from center
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Concentric circles for length visualization
                vec2 center = vUv - 0.5;
                float dist = length(center);
                float circles = sin(dist * 20.0) * 0.5 + 0.5;
                circles *= smoothstep(0.5, 0.3, dist);
                
                finalColor += vec3(0.1, 0.3, 0.1) * circles * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default LengthNode;