/**
 * 📐 SPLIT NODE
 * Atomic vector split operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class SplitNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('vec', 'vec2', 'Vector');
        this.addOutput('x', 'float', 'X');
        this.addOutput('y', 'float', 'Y');
        
        // Pure compute function
        this.compute = (vec) => {
            const v = Array.isArray(vec) ? vec : [vec || 0, 0];
            return { x: v[0] || 0, y: v[1] || 0 };
        };
        
        // Visual properties
        this.title = 'Split';
        this.category = 'vector';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Override to handle multiple outputs
    onProcess(inputs) {
        const result = this.compute(inputs.vec);
        return result;
    }

    // Custom fragment shader - split arrow
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Split arrows pointing outward
                vec2 center = vUv - 0.5;
                float arrowX = smoothstep(0.05, 0.02, abs(center.y));
                arrowX *= smoothstep(0.3, 0.1, abs(center.x));
                
                float arrowY = smoothstep(0.05, 0.02, abs(center.x));
                arrowY *= smoothstep(0.3, 0.1, abs(center.y));
                
                float pattern = max(arrowX, arrowY);
                finalColor += vec3(0.1, 0.2, 0.3) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default SplitNode;