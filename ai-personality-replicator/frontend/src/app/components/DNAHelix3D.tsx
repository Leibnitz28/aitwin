'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function DNAStrand() {
    const groupRef = useRef<THREE.Group>(null!);
    const count = 30;

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    const pairs = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            y: (i - count / 2) * 0.25,
            angle: (i / count) * Math.PI * 4,
        }));
    }, []);

    return (
        <group ref={groupRef}>
            {pairs.map((pair, i) => (
                <DNAPair key={i} y={pair.y} angle={pair.angle} index={i} />
            ))}
        </group>
    );
}

function DNAPair({ y, angle, index }: { y: number; angle: number; index: number }) {
    const leftRef = useRef<THREE.Mesh>(null!);
    const rightRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime * 0.5 + angle;
        const radius = 0.8;
        if (leftRef.current) {
            leftRef.current.position.x = Math.cos(t) * radius;
            leftRef.current.position.z = Math.sin(t) * radius;
        }
        if (rightRef.current) {
            rightRef.current.position.x = Math.cos(t + Math.PI) * radius;
            rightRef.current.position.z = Math.sin(t + Math.PI) * radius;
        }
    });

    return (
        <group position={[0, y, 0]}>
            <mesh ref={leftRef}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshBasicMaterial color="#00f5ff" />
            </mesh>
            <mesh ref={rightRef}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshBasicMaterial color="#8b5cf6" />
            </mesh>
        </group>
    );
}

export default function DNAHelix3D() {
    return (
        <div className="w-full h-[300px]">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f5ff" />
                <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
                    <DNAStrand />
                </Float>
            </Canvas>
        </div>
    );
}
