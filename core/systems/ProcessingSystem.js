/**
 * ⚡ PROCESSING SYSTEM
 * Handles node execution and data flow
 */

class ProcessingSystem {
    constructor(eventSystem) {
        this.events = eventSystem;
        this.nodes = new Map();
        this.connections = new Map();
        this.processingQueue = new Set();
        this.isProcessing = false;
    }

    // Node management
    addNode(node) {
        this.nodes.set(node.id, node);
        this.events.emit('node:added', node);
    }

    removeNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node) {
            this.nodes.delete(nodeId);
            this.events.emit('node:removed', node);
        }
    }

    // Connection management
    addConnection(connection) {
        this.connections.set(connection.id, connection);
        this.events.emit('connection:added', connection);
    }

    removeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            this.connections.delete(connectionId);
            this.events.emit('connection:removed', connection);
        }
    }

    // Processing queue
    queueNode(node) {
        this.processingQueue.add(node);
        this.scheduleProcessing();
    }

    scheduleProcessing() {
        if (this.isProcessing) return;

        requestAnimationFrame(() => {
            this.processQueue();
        });
    }

    processQueue() {
        if (this.processingQueue.size === 0) return;
        
        this.isProcessing = true;

        try {
            // Sort nodes by dependency order
            const sortedNodes = this.topologicalSort();
            
            // Process each node
            sortedNodes.forEach(node => {
                if (node.isDirty) {
                    this.processNode(node);
                }
            });

            this.processingQueue.clear();
        } finally {
            this.isProcessing = false;
        }
    }

    processNode(node) {
        try {
            // Start visual feedback
            this.startProcessingEffect(node);
            
            node.process();
            
            // End visual feedback after delay
            setTimeout(() => {
                this.endProcessingEffect(node);
            }, 200);
            
            this.events.emit('node:processed', node);
        } catch (error) {
            node.hasError = true;
            node.errorMessage = error.message;
            this.showErrorEffect(node);
            this.events.emit('node:error', { node, error });
        }
    }

    // Visual feedback methods
    startProcessingEffect(node) {
        // Node mesh is now a group, get the actual mesh (first child)
        const nodeMesh = node.mesh?.children?.[0];
        if (nodeMesh && nodeMesh.material && nodeMesh.material.uniforms) {
            const uniforms = nodeMesh.material.uniforms;
            if (uniforms.processing) uniforms.processing.value = 1.0;
            if (uniforms.glowIntensity) uniforms.glowIntensity.value = 1.0;
        }
        this.events.emit('node:processing:start', node);
    }

    endProcessingEffect(node) {
        // Node mesh is now a group, get the actual mesh (first child)
        const nodeMesh = node.mesh?.children?.[0];
        if (nodeMesh && nodeMesh.material && nodeMesh.material.uniforms) {
            const uniforms = nodeMesh.material.uniforms;
            if (uniforms.processing) uniforms.processing.value = 0.0;
            if (uniforms.glowIntensity) uniforms.glowIntensity.value = 0.0;
        }
        this.events.emit('node:processing:end', node);
    }

    showErrorEffect(node) {
        // Node mesh is now a group, get the actual mesh (first child)
        const nodeMesh = node.mesh?.children?.[0];
        if (nodeMesh && nodeMesh.material && nodeMesh.material.uniforms) {
            const uniforms = nodeMesh.material.uniforms;
            if (uniforms.error) uniforms.error.value = 1.0;
            
            // Flash error state
            setTimeout(() => {
                if (uniforms.error) uniforms.error.value = 0.0;
            }, 500);
        }
        this.events.emit('node:error:visual', node);
    }

    // Dependency sorting
    topologicalSort() {
        const sorted = [];
        const visited = new Set();
        const temp = new Set();

        const visit = (node) => {
            if (temp.has(node)) {
                throw new Error('Circular dependency detected');
            }
            if (!visited.has(node)) {
                temp.add(node);
                
                // Visit input nodes first
                node.inputs.forEach(port => {
                    port.connections.forEach(sourcePort => {
                        visit(sourcePort.node);
                    });
                });
                
                temp.delete(node);
                visited.add(node);
                sorted.unshift(node);
            }
        };

        Array.from(this.processingQueue).forEach(node => {
            if (!visited.has(node)) {
                visit(node);
            }
        });

        return sorted;
    }

    // Data transfer
    transferConnections() {
        this.connections.forEach(connection => {
            if (connection.validate()) {
                connection.transfer();
            }
        });
    }
}

export default ProcessingSystem;