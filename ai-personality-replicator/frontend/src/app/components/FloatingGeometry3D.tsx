'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingIcosahedron() {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.4;
            ref.current.rotation.y = state.clock.elapsedTime * 0.6;
        }
    });
    return (
        <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
            <mesh ref={ref} position={[-2.5, 1, 0]}>
                <icosahedronGeometry args={[0.5, 0]} />
                <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.4} />
            </mesh>
        </Float>
    );
}

function FloatingOctahedron() {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.3;
            ref.current.rotation.z = state.clock.elapsedTime * 0.5;
        }
    });
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1.2}>
            <mesh ref={ref} position={[2.5, -1, 0]}>
                <octahedronGeometry args={[0.4, 0]} />
                <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.4} />
            </mesh>
        </Float>
    );
}

function FloatingTorus() {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.2;
            ref.current.rotation.y = state.clock.elapsedTime * 0.4;
        }
    });
    return (
        <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
            <mesh ref={ref} position={[0, 2, -1]}>
                <torusKnotGeometry args={[0.3, 0.1, 64, 16]} />
                <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.3} />
            </mesh>
        </Float>
    );
}

function FloatingTetrahedron() {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.5;
            ref.current.rotation.z = state.clock.elapsedTime * 0.3;
        }
    });
    return (
        <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1}>
            <mesh ref={ref} position={[-1.5, -2, 0.5]}>
                <tetrahedronGeometry args={[0.35, 0]} />
                <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.35} />
            </mesh>
        </Float>
    );
}

function FloatingDodecahedron() {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.25;
            ref.current.rotation.y = state.clock.elapsedTime * 0.35;
        }
    });
    return (
        <Float speed={1.8} rotationIntensity={0.7} floatIntensity={1.3}>
            <mesh ref={ref} position={[1.8, 1.5, -0.5]}>
                <dodecahedronGeometry args={[0.3, 0]} />
                <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.35} />
            </mesh>
        </Float>
    );
}

export default function FloatingGeometry3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.7 }}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <FloatingIcosahedron />
                <FloatingOctahedron />
                <FloatingTorus />
                <FloatingTetrahedron />
                <FloatingDodecahedron />
            </Canvas>
        </div>
    );
}
