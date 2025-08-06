/**
 * ➕ ADD NODE
 * Atomic addition operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class AddNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('a', 'float', 'A');
        this.addInput('b', 'float', 'B');
        this.addOutput('out', 'float', 'Result');
        
        // Pure compute function
        this.compute = (a, b) => a + b;
        
        // Visual properties
        this.title = 'Add';
        this.category = 'math';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Modern WGSL fragment shader for WebGPU
    getWGSLShader() {
        return `
            @fragment
            fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
                let resolution = vec2f(512.0, 512.0);
                let vUv = coord.xy / resolution;
                let color = uniforms.color;
                let time = uniforms.time;
                let glowIntensity = uniforms.glowIntensity;
                
                var finalColor = color;
                
                // Advanced plus pattern with HDR lighting
                let center = vUv - vec2f(0.5, 0.5);
                
                // Main cross structure
                let crossH = smoothstep(0.06, 0.02, abs(center.y)) * smoothstep(0.25, 0.05, abs(center.x));
                let crossV = smoothstep(0.06, 0.02, abs(center.x)) * smoothstep(0.25, 0.05, abs(center.y));
                let cross = max(crossH, crossV);
                
                // Animated energy flow
                let flow = sin(time * 3.0 + length(center) * 8.0) * 0.3 + 0.7;
                finalColor += vec3f(0.2, 0.6, 0.3) * cross * (glowIntensity + 0.3) * flow;
                
                // Center intersection glow
                let centerGlow = smoothstep(0.1, 0.02, length(center));
                finalColor += vec3f(0.8, 1.0, 0.5) * centerGlow * sin(time * 2.0) * 0.3;
                
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
                
                // Subtle plus pattern when processing
                vec2 center = vUv - 0.5;
                float cross = min(
                    smoothstep(0.05, 0.02, abs(center.x)),
                    smoothstep(0.05, 0.02, abs(center.y))
                );
                cross = max(cross, 
                    min(smoothstep(0.2, 0.05, abs(center.x)),
                        smoothstep(0.05, 0.02, abs(center.y)))
                );
                
                finalColor += vec3(0.1, 0.3, 0.1) * cross * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }

    // Visual feedback is now handled by ProcessingSystem
}

export default AddNode;