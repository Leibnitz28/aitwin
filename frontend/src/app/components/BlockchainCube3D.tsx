'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function BlockchainCube() {
    const ref = useRef<THREE.Mesh>(null!);
    const edgesRef = useRef<THREE.LineSegments>(null!);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.3;
            ref.current.rotation.y = state.clock.elapsedTime * 0.4;
        }
        if (edgesRef.current) {
            edgesRef.current.rotation.x = state.clock.elapsedTime * 0.3;
            edgesRef.current.rotation.y = state.clock.elapsedTime * 0.4;
        }
    });

    const edgesGeometry = useMemo(() => {
        return new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 1.5, 1.5));
    }, []);

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
            <mesh ref={ref}>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.05} />
            </mesh>
            <lineSegments ref={edgesRef} geometry={edgesGeometry}>
                <lineBasicMaterial color="#10b981" transparent opacity={0.5} />
            </lineSegments>
        </Float>
    );
}

function ChainLinks() {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = state.clock.elapsedTime * 0.1;
            groupRef.current.children.forEach((child, i) => {
                const mesh = child as THREE.Mesh;
                mesh.rotation.x = state.clock.elapsedTime * (0.3 + i * 0.1);
            });
        }
    });

    return (
        <group ref={groupRef}>
            {[-2, 0, 2].map((x, i) => (
                <mesh key={i} position={[x, 0, 0]}>
                    <torusGeometry args={[0.6, 0.08, 16, 32]} />
                    <meshBasicMaterial
                        color={['#10b981', '#00f5ff', '#8b5cf6'][i]}
                        transparent
                        opacity={0.4}
                        wireframe
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function BlockchainCube3D() {
    return (
        <div className="w-full h-[250px]">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} intensity={0.5} color="#10b981" />
                <BlockchainCube />
                <ChainLinks />
            </Canvas>
        </div>
    );
}
