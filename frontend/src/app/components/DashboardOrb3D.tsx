'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function CoreSphere() {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <Float speed={3} rotationIntensity={0.4} floatIntensity={0.6}>
            <Sphere ref={ref} args={[0.8, 32, 32]}>
                <MeshDistortMaterial
                    color="#00f5ff"
                    emissive="#00f5ff"
                    emissiveIntensity={0.1}
                    distort={0.3}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                    wireframe
                    transparent
                    opacity={0.6}
                />
            </Sphere>
        </Float>
    );
}

function DataRings() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.z = state.clock.elapsedTime * 0.2;
        }
    });

    return (
        <group ref={group}>
            {[1.2, 1.5, 1.8].map((r, i) => (
                <mesh key={i} rotation={[Math.PI / (3 + i), Math.PI / (4 + i), 0]}>
                    <torusGeometry args={[r, 0.008, 8, 64]} />
                    <meshBasicMaterial
                        color={['#00f5ff', '#8b5cf6', '#10b981'][i]}
                        transparent
                        opacity={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function DashboardOrb3D() {
    return (
        <div className="w-full h-[200px]">
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} intensity={0.4} color="#00f5ff" />
                <CoreSphere />
                <DataRings />
            </Canvas>
        </div>
    );
}
