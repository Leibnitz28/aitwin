'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
    const ref = useRef<THREE.Points>(null!);

    const particles = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }
        return positions;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.02;
            ref.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#00f5ff"
                size={0.02}
                sizeAttenuation
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

function FloatingConnections() {
    const linesRef = useRef<THREE.Group>(null!);

    const lines = useMemo(() => {
        const lineData: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
        for (let i = 0; i < 30; i++) {
            lineData.push({
                start: new THREE.Vector3(
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 12
                ),
                end: new THREE.Vector3(
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 12
                ),
            });
        }
        return lineData;
    }, []);

    useFrame((state) => {
        if (linesRef.current) {
            linesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
        }
    });

    return (
        <group ref={linesRef}>
            {lines.map((line, i) => {
                const geometry = new THREE.BufferGeometry().setFromPoints([line.start, line.end]);
                return (
                    <primitive
                        key={i}
                        object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.08 }))}
                    />
                );
            })}
        </group>
    );
}

export default function Scene3DBackground() {
    return (
        <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.3} />
                <ParticleField />
                <FloatingConnections />
            </Canvas>
        </div>
    );
}
