/**
 * 📤 TRANSMIT NODE
 * Nested graph output parameter - transmits data from the network
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class OutputNode extends AtomicNode {
    constructor() {
        super();
        
        // Add input port
        this.addInput('in', 'any', 'Input');
        
        // Default values
        this.value = 0.0;
        this.variableName = 'transmit';
        
        // Pure compute function - pass through input
        this.compute = (input) => {
            this.value = input || 0.0;
            return this.value;
        };
        
        // Visual properties
        this.title = 'Transmit';
        this.category = 'nested';
        
        // Parameters for UI editing
        this.params = [
            { label: 'Value', value: this.value, type: 'float' },
            { label: 'Name', value: this.variableName, type: 'string' }
        ];
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Update values from parameters
    updateFromParams() {
        if (this.params && this.params.length >= 2) {
            this.value = parseFloat(this.params[0].value) || 0.0;
            this.variableName = this.params[1].value || 'transmit';
        }
    }

    // Custom fragment shader - TRANSMIT arrow symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                // Unique orange/amber color for output nodes
                vec3 baseColor = vec3(1.0, 0.6, 0.1); // Bright orange
                vec3 finalColor = mix(color, baseColor, 0.6);
                
                // Transmit arrow pointing left (out of the graph)
                vec2 center = vUv - 0.5;
                
                // Arrow shaft
                float shaft = smoothstep(0.05, 0.02, abs(center.y));
                shaft *= smoothstep(0.4, 0.05, abs(center.x - 0.1));
                
                // Arrow head
                float head1 = smoothstep(0.05, 0.02, abs(center.y - (center.x + 0.1) * -1.5));
                float head2 = smoothstep(0.05, 0.02, abs(center.y + (center.x + 0.1) * -1.5));
                head1 *= step(-0.3, center.x) * step(center.x, -0.1);
                head2 *= step(-0.3, center.x) * step(center.x, -0.1);
                
                // Square background for contrast with input
                float square = smoothstep(0.05, 0.02, 
                    max(abs(center.x) - 0.25, abs(center.y) - 0.25));
                finalColor = mix(finalColor, baseColor * 1.3, square * 0.2);
                
                float pattern = max(shaft, max(head1, head2));
                finalColor += vec3(0.5, 0.3, 0.1) * pattern * (glowIntensity + 0.5);
                
                // Strong edge highlight
                float edge = smoothstep(0.5, 0.42, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.42, abs(vUv.y - 0.5));
                finalColor += baseColor * 0.3 * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default OutputNode;