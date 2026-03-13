'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';

function BrainSphere() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
            meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1.5, 64, 64]}>
                <MeshDistortMaterial
                    color="#00f5ff"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                    emissive="#00f5ff"
                    emissiveIntensity={0.15}
                    transparent
                    opacity={0.85}
                    wireframe
                />
            </Sphere>
        </Float>
    );
}

function OrbitingRings() {
    const ring1Ref = useRef<THREE.Mesh>(null!);
    const ring2Ref = useRef<THREE.Mesh>(null!);
    const ring3Ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (ring1Ref.current) {
            ring1Ref.current.rotation.x = t * 0.5;
            ring1Ref.current.rotation.z = t * 0.2;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.y = t * 0.4;
            ring2Ref.current.rotation.x = t * 0.3;
        }
        if (ring3Ref.current) {
            ring3Ref.current.rotation.z = t * 0.6;
            ring3Ref.current.rotation.y = t * 0.15;
        }
    });

    return (
        <>
            <mesh ref={ring1Ref}>
                <torusGeometry args={[2.2, 0.01, 16, 100]} />
                <meshBasicMaterial color="#00f5ff" transparent opacity={0.3} />
            </mesh>
            <mesh ref={ring2Ref}>
                <torusGeometry args={[2.6, 0.01, 16, 100]} />
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.25} />
            </mesh>
            <mesh ref={ring3Ref}>
                <torusGeometry args={[3.0, 0.008, 16, 100]} />
                <meshBasicMaterial color="#ec4899" transparent opacity={0.2} />
            </mesh>
        </>
    );
}

function OrbitingNodes() {
    const groupRef = useRef<THREE.Group>(null!);
    const nodes = useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => ({
            angle: (i / 8) * Math.PI * 2,
            radius: 2 + Math.random() * 1.2,
            speed: 0.3 + Math.random() * 0.4,
            size: 0.03 + Math.random() * 0.05,
            color: ['#00f5ff', '#8b5cf6', '#ec4899', '#10b981'][i % 4],
        }));
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {nodes.map((node, i) => (
                <OrbitingNode key={i} {...node} index={i} />
            ))}
        </group>
    );
}

function OrbitingNode({ angle, radius, speed, size, color, index }: {
    angle: number; radius: number; speed: number; size: number; color: string; index: number;
}) {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime * speed + angle;
        if (ref.current) {
            ref.current.position.x = Math.cos(t) * radius;
            ref.current.position.y = Math.sin(t * 0.7) * (radius * 0.3);
            ref.current.position.z = Math.sin(t) * radius;
        }
    });

    return (
        <Trail width={0.5} length={6} color={color} attenuation={(t) => t * t}>
            <mesh ref={ref}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </Trail>
    );
}

export default function HeroBrain3D() {
    return (
        <div className="w-full h-[400px] sm:h-[500px]">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={0.6} color="#00f5ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
                <BrainSphere />
                <OrbitingRings />
                <OrbitingNodes />
            </Canvas>
        </div>
    );
}
