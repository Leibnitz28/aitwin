'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Utility: check if a point is inside a volumetric brain shape
function isInsideBrain(p: THREE.Vector3) {
    const x = Math.abs(p.x);
    const y = p.y;
    const z = p.z;
    
    // Central fissure (gap between left and right hemispheres)
    if (x < 0.15) return false;
    
    // Main brain ellipsoid volume
    const dist = Math.pow(x/1.8, 2) + Math.pow(y/1.3, 2) + Math.pow(z/1.9, 2);
    if (dist > 1) return false;
    
    // Flatten frontal lobe / bottom slightly to make it rest naturally
    if (y < -0.6 && z > 0) return false;
    
    return true;
}

// Jagged white lightning/neural paths exploding out of the center
function MajorNeuralPathways() {
    const groupRef = useRef<THREE.Group>(null!);

    const lines = useMemo(() => {
        const count = 20;
        const result: THREE.Line[] = [];

        for (let t = 0; t < count; t++) {
            const points: THREE.Vector3[] = [];
            
            // Random direction, biased slightly towards horizontal/forward
            const dir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 2
            ).normalize();
            
            const segments = 10 + Math.floor(Math.random() * 10);
            const maxLen = 2.5 + Math.random() * 1.5;
            
            let current = dir.clone().multiplyScalar(0.2); // start near core
            points.push(current.clone());

            for (let s = 1; s <= segments; s++) {
                const stepLen = maxLen / segments;
                // Add jagged deviation
                const dev = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                
                // Keep moving mostly outwards
                const next = current.clone().add(dir.clone().multiplyScalar(stepLen)).add(dev);
                points.push(next.clone());
                current = next;
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: '#ffffff',
                transparent: true,
                opacity: 0.8,
            });
            result.push(new THREE.Line(geometry, material));
        }
        return result;
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) groupRef.current.rotation.y = t * 0.05;
        
        lines.forEach((line, i) => {
            const mat = line.material as THREE.LineBasicMaterial;
            // Pulsing surges of brightness representing electrical signals
            const surge = Math.sin(t * 4 + i * 2) * 0.5 + 0.5;
            mat.opacity = 0.3 + surge * 0.7;
        });
    });

    return (
        <group ref={groupRef}>
            {lines.map((obj, i) => (
                <primitive key={i} object={obj} />
            ))}
        </group>
    );
}

// Background dark blue/cyan plexus network in the shape of a brain
function BrainPlexusWeb() {
    const groupRef = useRef<THREE.Group>(null!);

    const { lines, points } = useMemo(() => {
        const nodes: THREE.Vector3[] = [];
        let attempts = 0;
        // Generate valid nodes inside the brain volume
        while (nodes.length < 500 && attempts < 15000) {
            const p = new THREE.Vector3(
                (Math.random() - 0.5) * 4.0,
                (Math.random() - 0.5) * 3.0,
                (Math.random() - 0.5) * 4.0
            );
            if (isInsideBrain(p)) {
                nodes.push(p);
            }
            attempts++;
        }

        const lineObjs: THREE.LineSegments[] = [];
        const maxDist = 0.5; // Connection threshold

        // Build straight-line connections (Plexus)
        for (let i = 0; i < nodes.length; i++) {
            let connections = 0;
            for (let j = i + 1; j < nodes.length; j++) {
                if (connections > 6) break; // limit connections per node for aesthetics
                const dist = nodes[i].distanceTo(nodes[j]);
                if (dist < maxDist) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
                    const opacity = 1.0 - (dist / maxDist);
                    // Mix of bright cyan and dark slate blue lines
                    const color = Math.random() > 0.85 ? '#38bdf8' : '#0ea5e9'; 
                    const material = new THREE.LineBasicMaterial({
                        color: color, 
                        transparent: true,
                        opacity: opacity * 0.4,
                        blending: THREE.AdditiveBlending,
                    });
                    lineObjs.push(new THREE.LineSegments(geometry, material));
                    connections++;
                }
            }
        }
        
        // Render the nodes as points
        const posArray = new Float32Array(nodes.length * 3);
        nodes.forEach((n, i) => {
            posArray[i * 3] = n.x;
            posArray[i * 3 + 1] = n.y;
            posArray[i * 3 + 2] = n.z;
        });

        const pointsObj = (
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[posArray, 3]} count={nodes.length} />
                </bufferGeometry>
                <pointsMaterial color="#bae6fd" size={0.02} transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
            </points>
        );

        return { lines: lineObjs, points: pointsObj };
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) groupRef.current.rotation.y = t * 0.05;
        
        // Breathing effect on the plexus network
        lines.forEach((line, i) => {
            const mat = line.material as THREE.LineBasicMaterial;
            mat.opacity = mat.opacity * 0.99 + (Math.sin(t * 0.5 + i) * 0.1 + 0.1) * 0.01;
        });
    });

    return (
        <group ref={groupRef}>
            {points}
            {lines.map((obj, i) => (
                <primitive key={i} object={obj} />
            ))}
        </group>
    );
}

function FloatingParticles() {
    const ref = useRef<THREE.Points>(null!);
    
    const count = 400;
    const { positions, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for(let i=0; i<count; i++) {
            positions[i*3] = (Math.random() - 0.5) * 8;
            positions[i*3+1] = (Math.random() - 0.5) * 8;
            positions[i*3+2] = (Math.random() - 0.5) * 8;
            sizes[i] = Math.random() * 0.04;
        }
        return { positions, sizes };
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.01;
            ref.current.rotation.z = state.clock.elapsedTime * 0.005;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
            </bufferGeometry>
            <pointsMaterial color="#7dd3fc" size={0.02} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
}

export default function HeroBrain3D() {
    return (
        <div className="w-full h-[350px] sm:h-[450px]">
            <Canvas
                camera={{ position: [0, 0, 5.5], fov: 60 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                {/* Dark atmospheric lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 0, 0]} intensity={2} color="#22d3ee" distance={8} />

                {/* Brain-shaped plexus network */}
                <BrainPlexusWeb />

                {/* Floating ambient data dust */}
                <FloatingParticles />
            </Canvas>
        </div>
    );
}
