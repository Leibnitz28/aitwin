'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function VoiceOrb() {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (ref.current) {
            const material = ref.current.material as any;
            material.distort = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <Sphere ref={ref} args={[1.2, 64, 64]}>
                <MeshDistortMaterial
                    color="#8b5cf6"
                    emissive="#8b5cf6"
                    emissiveIntensity={0.2}
                    roughness={0.1}
                    metalness={0.9}
                    distort={0.3}
                    speed={3}
                    transparent
                    opacity={0.7}
                />
            </Sphere>
        </Float>
    );
}

function SoundWaves() {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                const mesh = child as THREE.Mesh;
                const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.3;
                mesh.scale.set(scale, scale, scale);
                (mesh.material as THREE.MeshBasicMaterial).opacity =
                    0.15 - (i * 0.03) + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {[1.8, 2.2, 2.6, 3.0, 3.4].map((radius, i) => (
                <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[radius, 0.01, 16, 64]} />
                    <meshBasicMaterial color="#8b5cf6" transparent opacity={0.12 - i * 0.02} />
                </mesh>
            ))}
        </group>
    );
}

export default function VoiceOrb3D() {
    return (
        <div className="w-full h-[250px]">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} intensity={0.6} color="#8b5cf6" />
                <pointLight position={[-5, -5, 5]} intensity={0.3} color="#00f5ff" />
                <VoiceOrb />
                <SoundWaves />
            </Canvas>
        </div>
    );
}
