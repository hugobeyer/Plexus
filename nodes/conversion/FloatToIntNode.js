/**
 * 🔢 FLOAT TO INT NODE
 * Atomic float to integer conversion
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class FloatToIntNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('float', 'float', 'Float');
        this.addOutput('out', 'int', 'Integer');
        
        // Pure compute function
        this.compute = (floatVal) => Math.round(floatVal || 0);
        
        // Visual properties
        this.title = 'Float→Int';
        this.category = 'conversion';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - conversion arrow
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Arrow pointing right for conversion
                vec2 center = vUv - 0.5;
                float arrow = smoothstep(0.05, 0.02, abs(center.y));
                arrow *= smoothstep(0.3, 0.1, abs(center.x));
                
                float arrowHead = smoothstep(0.05, 0.02, abs(center.y - center.x + 0.2));
                arrowHead = max(arrowHead, smoothstep(0.05, 0.02, abs(center.y + center.x - 0.2)));
                arrowHead *= step(0.1, center.x) * step(center.x, 0.3);
                
                float pattern = max(arrow, arrowHead);
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

export default FloatToIntNode;