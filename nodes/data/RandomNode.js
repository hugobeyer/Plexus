/**
 * 🎲 RANDOM NODE
 * Atomic random value generator
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class RandomNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('seed', 'float', 'Seed');
        this.addOutput('out', 'float', 'Random');
        
        // Pure compute function with seeded random
        this.compute = (seed) => {
            const s = seed || Math.random() * 1000;
            // Simple LCG for deterministic random
            const a = 1664525;
            const c = 1013904223;
            const m = Math.pow(2, 32);
            const next = (a * s + c) % m;
            return next / m;
        };
        
        // Visual properties
        this.title = 'Random';
        this.category = 'data';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - noise pattern
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Pseudo-random noise pattern
                vec2 center = vUv - 0.5;
                float noise = fract(sin(dot(center * 10.0 + time, vec2(12.9898, 78.233))) * 43758.5453);
                noise = smoothstep(0.3, 0.7, noise);
                
                finalColor += vec3(0.3, 0.1, 0.2) * noise * glowIntensity;
                
                // Edge highlight
                float edge = smoothstep(0.5, 0.45, abs(vUv.x - 0.5)) * 
                           smoothstep(0.5, 0.45, abs(vUv.y - 0.5));
                finalColor += vec3(0.1) * edge;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
}

export default RandomNode;