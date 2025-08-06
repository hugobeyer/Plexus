/**
 * ➡️ NORMALIZE NODE
 * Atomic vector normalize operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class NormalizeNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('vec', 'vec2', 'Vector');
        this.addOutput('out', 'vec2', 'Normalized');
        
        // Pure compute function
        this.compute = (vec) => {
            const v = Array.isArray(vec) ? vec : [vec || 0, 0];
            const x = v[0] || 0;
            const y = v[1] || 0;
            const length = Math.sqrt(x * x + y * y);
            
            if (length === 0) return [0, 0];
            return [x / length, y / length];
        };
        
        // Visual properties
        this.title = 'Normalize';
        this.category = 'vector';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - unit circle
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Unit circle for normalization
                vec2 center = vUv - 0.5;
                float dist = length(center);
                float circle = smoothstep(0.05, 0.02, abs(dist - 0.3));
                
                // Arrow pointing to edge
                float angle = atan(center.y, center.x);
                vec2 arrowPos = vec2(cos(angle), sin(angle)) * 0.3;
                float arrow = smoothstep(0.1, 0.05, length(center - arrowPos));
                
                float pattern = max(circle, arrow);
                finalColor += vec3(0.2, 0.2, 0.3) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default NormalizeNode;