/**
 * ? BRANCH NODE
 * Atomic conditional branch operation
 */

import AtomicNode from '../../core/base/AtomicNode.js';

class BranchNode extends AtomicNode {
    constructor() {
        super();
        
        // Add ports with labels
        this.addInput('condition', 'bool', 'Condition');
        this.addInput('true', 'float', 'True');
        this.addInput('false', 'float', 'False');
        this.addOutput('out', 'float', 'Result');
        
        // Pure compute function
        this.compute = (condition, trueVal, falseVal) => {
            return Boolean(condition) ? (trueVal || 0) : (falseVal || 0);
        };
        
        // Visual properties
        this.title = 'Branch';
        this.category = 'logic';
        
        // Custom shader uniforms
        this.uniforms = {
            glowIntensity: { value: 0.0 }
        };
    }

    // Custom fragment shader - branching paths
    getFragmentShader() {
        return `
            uniform float glowIntensity;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec3 finalColor = color;
                
                // Branching Y shape
                vec2 center = vUv - 0.5;
                
                // Main stem
                float stem = smoothstep(0.05, 0.02, abs(center.x));
                stem *= smoothstep(0.5, 0.2, vUv.y);
                
                // Left branch
                float leftBranch = smoothstep(0.05, 0.02, 
                    abs(center.y - (center.x + 0.3) * 0.8));
                leftBranch *= step(center.x, 0.0) * step(0.2, vUv.y);
                
                // Right branch
                float rightBranch = smoothstep(0.05, 0.02, 
                    abs(center.y - (-center.x + 0.3) * 0.8));
                rightBranch *= step(0.0, center.x) * step(0.2, vUv.y);
                
                float pattern = max(stem, max(leftBranch, rightBranch));
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

export default BranchNode;