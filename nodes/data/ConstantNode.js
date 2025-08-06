/**
 * 📄 CONSTANT NODE
 * Atomic constant value output
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class ConstantNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addOutput('out', 'float', 'Value');
        
        // Constant value
        this.value = 1.0;
        
        // Pure compute function
        this.compute = () => this.value;
        
        // Visual properties
        this.title = 'Constant';
        this.category = 'data';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Override to not require inputs
    validateInputs(inputs) {
        return true; // Constants don't need inputs
    }

    // Modern WGSL fragment shader for WebGPU with computed values
    getWGSLShader() {
        return `
            @fragment
            fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
                let resolution = vec2f(512.0, 512.0);
                let vUv = coord.xy / resolution;
                let color = uniforms.color;
                let time = uniforms.time;
                let glowIntensity = uniforms.glowIntensity;
                let nodeValue = uniforms.nodeValue;
                let inputCount = uniforms.inputCount;
                
                var finalColor = color;
                
                // Rectangular constant representation with HDR values
                let center = vUv - vec2f(0.5, 0.5);
                let rect = smoothstep(0.05, 0.02, 
                    max(abs(center.x) - 0.2, abs(center.y) - 0.15));
                
                // Enhanced constant visualization with value display
                finalColor += vec3f(0.3, 0.5, 0.2) * rect * (glowIntensity + 0.4);
                
                // Animated value indicator - pulse based on actual value
                let valuePulse = sin(time * 1.5 + nodeValue) * 0.2 + 0.8;
                let valueDot = smoothstep(0.08, 0.05, length(center));
                
                // Scale dot brightness based on actual constant value
                let valueIntensity = min(1.0, abs(nodeValue) / 5.0);
                finalColor += vec3f(0.8, 0.9, 0.3) * valueDot * valuePulse * (valueIntensity + 0.3);
                
                // Display numerical value as pattern intensity
                let valuePattern = smoothstep(0.1, 0.05, abs(center.x)) * 
                                 smoothstep(0.05, 0.02, abs(center.y));
                finalColor += vec3f(0.4, 0.6, 0.2) * valuePattern * valueIntensity;
                
                // Edge highlight
                let edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                          smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3f(0.15, 0.15, 0.15) * edge;
                
                return vec4f(finalColor, 1.0);
            }
        `;
    }

    // Legacy GLSL shader for compatibility
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Simple rectangular constant representation
                vec2 center = vUv - 0.5;
                float rect = smoothstep(0.05, 0.02, 
                    max(abs(center.x) - 0.2, abs(center.y) - 0.15));
                
                finalColor += vec3(0.2, 0.3, 0.1) * rect * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default ConstantNode;