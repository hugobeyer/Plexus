/**
 * ! NOT NODE
 * Atomic logical NOT operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class NotNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'bool', 'A');
        this.addOutput('out', 'bool', '!A');
        
        // Pure compute function
        this.compute = (a) => !Boolean(a);
        
        // Visual properties
        this.title = 'Not';
        this.category = 'logic';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - NOT gate symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // NOT gate - triangle with circle
                vec2 center = vUv - 0.5;
                
                // Triangle
                float triangle = smoothstep(0.05, 0.02, 
                    abs(center.y - clamp(center.x * 2.0, -0.3, 0.3)));
                triangle *= step(-0.3, center.x) * step(center.x, 0.3);
                
                // Circle (bubble)
                float circle = smoothstep(0.05, 0.02, abs(length(center - vec2(0.35, 0.0)) - 0.08));
                
                float pattern = max(triangle, circle);
                finalColor += vec3(0.1, 0.3, 0.2) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default NotNode;