/**
 * 🔗 JOIN NODE
 * Atomic vector join operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class JoinNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('x', 'float', 'X');
        this.addInput('y', 'float', 'Y');
        this.addOutput('out', 'vec2', 'Vector');
        
        // Pure compute function
        this.compute = (x, y) => [x || 0, y || 0];
        
        // Visual properties
        this.title = 'Join';
        this.category = 'vector';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Modern WGSL fragment shader for WebGPU with connection-based colors
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
                
                // Use connection-based color if available, otherwise default
                var finalColor = color;
                
                // Join arrows pointing inward with connection awareness
                let center = vUv - vec2f(0.5, 0.5);
                
                // Left arrow (X input)
                let leftArrow = smoothstep(0.05, 0.02, abs(center.y)) * 
                               step(-0.4, center.x) * step(center.x, -0.1);
                
                // Right arrow (Y input) 
                let rightArrow = smoothstep(0.05, 0.02, abs(center.y)) *
                                step(0.1, center.x) * step(center.x, 0.4);
                
                // Central convergence point
                let convergence = smoothstep(0.08, 0.04, length(center));
                
                // If connected (inputCount > 0), show the computed color
                if (inputCount > 0.5) {
                    // Color comes from computed values passed via uniforms.color
                    let connectionGlow = sin(time * 2.0) * 0.2 + 0.8;
                    finalColor += finalColor * (leftArrow + rightArrow) * connectionGlow * 0.8;
                    finalColor += finalColor * convergence * 1.2;
                } else {
                    // Default arrows when not connected
                    finalColor += vec3f(0.2, 0.3, 0.1) * (leftArrow + rightArrow) * (glowIntensity + 0.3);
                    finalColor += vec3f(0.3, 0.4, 0.2) * convergence;
                }
                
                // Edge highlight
                let edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                          smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3f(0.15, 0.15, 0.15) * edge;
                
                return vec4f(finalColor, 1.0);
            }
        `;
    }

    // Custom fragment shader - join arrows
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Join arrows pointing inward
                vec2 center = vUv - 0.5;
                float arrowX = smoothstep(0.05, 0.02, abs(center.y));
                arrowX *= smoothstep(0.1, 0.3, abs(center.x));
                
                float arrowY = smoothstep(0.05, 0.02, abs(center.x));
                arrowY *= smoothstep(0.1, 0.3, abs(center.y));
                
                float pattern = max(arrowX, arrowY);
                finalColor += vec3(0.2, 0.3, 0.1) * pattern * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default JoinNode;