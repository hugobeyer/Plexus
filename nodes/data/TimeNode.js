/**
 * ⏰ TIME NODE
 * Atomic time value output
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class TimeNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addOutput('out', 'float', 'Time');
        
        // Pure compute function
        this.compute = () => performance.now() * 0.001; // Time in seconds
        
        // Visual properties
        this.title = 'Time';
        this.category = 'data';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Override to not require inputs
    validateInputs(inputs) {
        return true; // Time doesn't need inputs
    }

    // Custom fragment shader - clock visualization
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Clock face
                vec2 center = vUv - 0.5;
                float dist = length(center);
                float circle = smoothstep(0.05, 0.02, abs(dist - 0.3));
                
                // Clock hands
                float angle = time * 2.0;
                vec2 hand = vec2(cos(angle), sin(angle)) * 0.25;
                float handLine = smoothstep(0.05, 0.02, 
                    abs(dot(normalize(hand), center) - dist * cos(0.0)));
                handLine *= step(dist, 0.25);
                
                float pattern = max(circle, handLine);
                finalColor += vec3(0.1, 0.3, 0.3) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default TimeNode;