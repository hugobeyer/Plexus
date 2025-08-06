/**
 * ⚫ DOT NODE
 * Atomic dot product operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class DotNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'vec2', 'Vector A');
        this.addInput('b', 'vec2', 'Vector B');
        this.addOutput('out', 'float', 'Dot Product');
        
        // Pure compute function
        this.compute = (a, b) => {
            const va = Array.isArray(a) ? a : [a || 0, 0];
            const vb = Array.isArray(b) ? b : [b || 0, 0];
            return (va[0] || 0) * (vb[0] || 0) + (va[1] || 0) * (vb[1] || 0);
        };
        
        // Visual properties
        this.title = 'Dot';
        this.category = 'vector';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - dot pattern
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Dot pattern for dot product
                vec2 center = vUv - 0.5;
                float dots = sin(center.x * 15.0) * sin(center.y * 15.0);
                dots = smoothstep(0.3, 0.7, dots);
                dots *= smoothstep(0.5, 0.2, length(center));
                
                finalColor += vec3(0.3, 0.1, 0.2) * dots * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default DotNode;