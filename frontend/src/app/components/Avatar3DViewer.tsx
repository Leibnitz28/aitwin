'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DViewerProps {
    modelUrl: string | null;
    isSpeaking?: boolean;
}

// Separate component for the loaded model to use hooks
function Model({ url, isSpeaking }: { url: string, isSpeaking: boolean }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null);

    // Apply scale animation when speaking
    useFrame((state, delta) => {
        if (!modelRef.current) return;
        
        // Auto rotate slowly
        modelRef.current.rotation.y += delta * 0.2;

        // "Speaking" effect - subtle pulsing scale
        if (isSpeaking) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.02;
            modelRef.current.scale.setScalar(scale);
        } else {
            // Smoothly return to normal scale
            modelRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
    });

    return <primitive ref={modelRef} object={scene} position={[0, -1, 0]} />;
}

// Fallback sphere when no model is provided
function PlaceholderAvatar({ isSpeaking }: { isSpeaking: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        if (isSpeaking) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.05;
            meshRef.current.scale.setScalar(scale);
            // Pulse emissive intensity
            materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
        } else {
            meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            materialRef.current.emissiveIntensity = 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial 
                    ref={materialRef}
                    color="#22d3ee" 
                    emissive="#06b6d4"
                    emissiveIntensity={0.2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    );
}

export default function Avatar3DViewer({ modelUrl, isSpeaking = false }: Avatar3DViewerProps) {
    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#020617] border border-white/5">
            {/* Ambient glow effect when speaking */}
            <div 
                className={`absolute inset-0 bg-cyan-500/10 blur-3xl transition-opacity duration-300 pointer-events-none ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}
            />
            
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
                
                <Suspense fallback={<PlaceholderAvatar isSpeaking={isSpeaking} />}>
                    {modelUrl ? (
                        <Model url={modelUrl} isSpeaking={isSpeaking} />
                    ) : (
                        <PlaceholderAvatar isSpeaking={isSpeaking} />
                    )}
                </Suspense>
                
                <Environment preset="city" />
                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} far={4} />
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
}
