/**
 * 📡 RECEIVE NODE  
 * Nested graph input parameter - receives data into the network
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class InputNode extends AtomicNode {
    constructor() {
        super();
        
        // Input nodes can receive ANY type and pass it through
        this.addInput('in', 'any', 'Input'); // Accept any type
        this.addOutput('out', 'any', 'Output');
        
        // Default values
        this.value = 0.0;
        this.variableName = 'receive';
        
        // Pure compute function - use input if connected, otherwise default
        this.compute = (input) => {
            if (input !== undefined && input !== null) {
                this.value = input;
                return input;
            }
            // Use default value from parameters
            this.updateFromParams();
            return this.value;
        };
        
        // Visual properties
        this.title = 'Receive';
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

    // Override to not require inputs (optional input)
    validateInputs(inputs) {
        return true; // Input is optional - can work with or without connections
    }

    // Update values from parameters
    updateFromParams() {
        if (this.params && this.params.length >= 2) {
            this.value = parseFloat(this.params[0].value) || 0.0;
            this.variableName = this.params[1].value || 'receive';
        }
    }

    // Custom fragment shader - RECEIVE arrow symbol
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                // Unique teal/cyan color for input nodes
                vec3 baseColor = vec3(0.0, 0.8, 0.7); // Bright teal
                vec3 finalColor = mix(color, baseColor, 0.6);
                
                // Receive arrow pointing right (into the graph)
                vec2 center = vUv - 0.5;
                
                // Arrow shaft
                float shaft = smoothstep(0.05, 0.02, abs(center.y));
                shaft *= smoothstep(0.4, 0.05, abs(center.x + 0.1));
                
                // Arrow head
                float head1 = smoothstep(0.05, 0.02, abs(center.y - (center.x - 0.1) * 1.5));
                float head2 = smoothstep(0.05, 0.02, abs(center.y + (center.x - 0.1) * 1.5));
                head1 *= step(0.1, center.x) * step(center.x, 0.3);
                head2 *= step(0.1, center.x) * step(center.x, 0.3);
                
                // Circle background for emphasis
                float circle = smoothstep(0.35, 0.25, length(center));
                finalColor = mix(finalColor, baseColor * 1.2, circle * 0.3);
                
                float pattern = max(shaft, max(head1, head2));
                finalColor += vec3(0.2, 0.5, 0.4) * pattern * (glowIntensity + 0.5);
                
                // Strong edge highlight
                float edge = smoothstep(0.5, 0.42, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.42, abs(vUv.y - 0.5));
                finalColor += baseColor * 0.3 * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default InputNode;