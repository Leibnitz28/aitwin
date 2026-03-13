'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   ULTRON-STYLE NEURAL BRAIN
   Inspired by the chaotic, organic, electric-blue
   neural network visualization from Avengers.
   ───────────────────────────────────────────── */

// ── Utility: generate random points on a sphere surface
function randomOnSphere(radius: number): THREE.Vector3 {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
    );
}

// ── Utility: generate random point INSIDE a sphere
function randomInSphere(radius: number): THREE.Vector3 {
    const r = radius * Math.cbrt(Math.random());
    return randomOnSphere(r);
}

/* ─── THE NEURAL CORE ───
   A bright, pulsing, white-hot center that emits light outward.
   Multiple layered spheres create a convincing glow effect.
*/
function NeuralCore() {
    const coreRef = useRef<THREE.Mesh>(null!);
    const glowRef = useRef<THREE.Mesh>(null!);
    const outerGlowRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const pulse = 1 + Math.sin(t * 3) * 0.15 + Math.sin(t * 7) * 0.05;
        if (coreRef.current) {
            coreRef.current.scale.setScalar(pulse);
        }
        if (glowRef.current) {
            glowRef.current.scale.setScalar(pulse * 1.8);
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * 4) * 0.1;
        }
        if (outerGlowRef.current) {
            outerGlowRef.current.scale.setScalar(pulse * 3.5);
            (outerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 2) * 0.04;
        }
    });

    return (
        <>
            {/* White-hot inner core */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Cyan inner glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
            </mesh>
            {/* Outer atmospheric glow */}
            <mesh ref={outerGlowRef}>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshBasicMaterial color="#0ea5e9" transparent opacity={0.1} />
            </mesh>
        </>
    );
}

/* ─── NEURAL TENDRILS (Energy Arcs) ───
   Organic, branching energy paths that shoot outward from the core.
   Each tendril is a series of connected line segments that wiggle
   and pulse with electricity, like Ultron's neural pathways.
*/
function NeuralTendrils() {
    const groupRef = useRef<THREE.Group>(null!);

    const tendrils = useMemo(() => {
        const count = 40;
        const result: { points: THREE.Vector3[]; width: number; speed: number; phase: number }[] = [];

        for (let t = 0; t < count; t++) {
            const points: THREE.Vector3[] = [];
            const dir = randomOnSphere(1).normalize();
            const segments = 8 + Math.floor(Math.random() * 12);
            const maxLen = 1.0 + Math.random() * 1.2;

            // Create organic branching path
            let current = new THREE.Vector3(0, 0, 0);
            for (let s = 0; s < segments; s++) {
                const progress = s / segments;
                const deviation = 0.15 + progress * 0.3;
                const step = (maxLen / segments);

                const next = current.clone().add(
                    dir.clone()
                        .multiplyScalar(step)
                        .add(new THREE.Vector3(
                            (Math.random() - 0.5) * deviation,
                            (Math.random() - 0.5) * deviation,
                            (Math.random() - 0.5) * deviation
                        ))
                );
                points.push(next.clone());
                current = next;
            }

            result.push({
                points,
                width: 0.5 + Math.random() * 1.5,
                speed: 1 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2,
            });
        }
        return result;
    }, []);

    // Create geometries for each tendril
    const lineObjects = useMemo(() => {
        return tendrils.map((tendril) => {
            const geometry = new THREE.BufferGeometry().setFromPoints(tendril.points);
            const material = new THREE.LineBasicMaterial({
                color: new THREE.Color('#22d3ee'),
                transparent: true,
                opacity: 0.6,
            });
            return new THREE.Line(geometry, material);
        });
    }, [tendrils]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        lineObjects.forEach((line, i) => {
            const tendril = tendrils[i];
            const mat = line.material as THREE.LineBasicMaterial;
            // Pulsing opacity to simulate electrical surges
            const surge = Math.sin(t * tendril.speed + tendril.phase);
            mat.opacity = 0.15 + Math.max(0, surge) * 0.65;

            // Color shift between cyan and white during surges
            const intensity = Math.max(0, surge);
            mat.color.setRGB(
                0.13 + intensity * 0.87,
                0.83 + intensity * 0.17,
                0.93 + intensity * 0.07
            );
        });

        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {lineObjects.map((obj, i) => (
                <primitive key={i} object={obj} />
            ))}
        </group>
    );
}

/* ─── SECONDARY TENDRILS (Outer chaotic web) ───
   A second layer of longer, more chaotic tendrils
   that extend further and create the "brain mass" silhouette.
*/
function OuterNeuralWeb() {
    const groupRef = useRef<THREE.Group>(null!);

    const webLines = useMemo(() => {
        const lines: THREE.Line[] = [];
        const nodeCount = 80;
        const nodes: THREE.Vector3[] = [];

        // Generate neural nodes in a brain-like ellipsoid
        for (let i = 0; i < nodeCount; i++) {
            const p = randomInSphere(1.8);
            // Flatten slightly to create brain-like shape
            p.y *= 0.7;
            // Stretch horizontally
            p.x *= 1.2;
            nodes.push(p);
        }

        // Connect nearby nodes with lines (neural connections)
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dist = nodes[i].distanceTo(nodes[j]);
                if (dist < 0.9 && Math.random() > 0.3) {
                    // Add a midpoint with offset for organic curves
                    const mid = nodes[i].clone().lerp(nodes[j], 0.5);
                    mid.add(new THREE.Vector3(
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2
                    ));

                    const curve = new THREE.QuadraticBezierCurve3(nodes[i], mid, nodes[j]);
                    const points = curve.getPoints(8);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: '#06b6d4',
                        transparent: true,
                        opacity: 0.12,
                    });
                    lines.push(new THREE.Line(geometry, material));
                }
            }
        }
        return lines;
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.03;
            groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
        }
        // Random flicker effect on web connections
        webLines.forEach((line, i) => {
            const mat = line.material as THREE.LineBasicMaterial;
            const flicker = Math.sin(t * 2 + i * 0.5) * 0.5 + 0.5;
            mat.opacity = 0.05 + flicker * 0.15;
        });
    });

    return (
        <group ref={groupRef}>
            {webLines.map((obj, i) => (
                <primitive key={i} object={obj} />
            ))}
        </group>
    );
}

/* ─── SYNAPSE SPARKS ───
   Tiny bright points that flash and travel along neural pathways,
   simulating synaptic firing / electrical impulses.
*/
function SynapseSparks() {
    const COUNT = 120;
    const ref = useRef<THREE.Points>(null!);

    const { positions, velocities, lifetimes, maxLifetimes } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3);
        const velocities: THREE.Vector3[] = [];
        const lifetimes = new Float32Array(COUNT);
        const maxLifetimes = new Float32Array(COUNT);

        for (let i = 0; i < COUNT; i++) {
            const p = randomInSphere(0.2);
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;

            const dir = randomOnSphere(1).normalize();
            const speed = 0.3 + Math.random() * 0.8;
            velocities.push(dir.multiplyScalar(speed));

            lifetimes[i] = Math.random();
            maxLifetimes[i] = 1 + Math.random() * 2;
        }
        return { positions, velocities, lifetimes, maxLifetimes };
    }, []);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < COUNT; i++) {
            lifetimes[i] += delta;

            if (lifetimes[i] > maxLifetimes[i]) {
                // Reset spark to center
                lifetimes[i] = 0;
                maxLifetimes[i] = 1 + Math.random() * 2;
                const p = randomInSphere(0.15);
                posAttr.setXYZ(i, p.x, p.y, p.z);

                const newDir = randomOnSphere(1).normalize();
                const speed = 0.3 + Math.random() * 0.8;
                velocities[i] = newDir.multiplyScalar(speed);
            } else {
                // Move outward
                const x = posAttr.getX(i) + velocities[i].x * delta;
                const y = posAttr.getY(i) + velocities[i].y * delta;
                const z = posAttr.getZ(i) + velocities[i].z * delta;
                posAttr.setXYZ(i, x, y, z);
            }
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={COUNT}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#67e8f9"
                size={0.025}
                transparent
                opacity={0.8}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ─── ENERGY FIELD PARTICLES ───
   Background ambient particles swirling around the brain,
   creating the atmospheric haze/fog effect.
*/
function EnergyField() {
    const ref = useRef<THREE.Points>(null!);

    const particles = useMemo(() => {
        const count = 600;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const p = randomInSphere(3.5);
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
            sizes[i] = 0.005 + Math.random() * 0.02;
        }
        return { positions, sizes };
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.02;
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles.positions, 3]}
                    count={600}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#0891b2"
                size={0.015}
                transparent
                opacity={0.4}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ─── ELECTRIC ARCS ───
   Dramatic lightning-like arcs that appear randomly,
   flash intensely, then disappear — like Ultron's energy surges.
*/
function ElectricArcs() {
    const groupRef = useRef<THREE.Group>(null!);
    const arcsRef = useRef<{ line: THREE.Line; birth: number; duration: number }[]>([]);
    const lastSpawn = useRef(0);

    const spawnArc = useCallback(() => {
        const start = randomInSphere(0.4);
        const end = randomOnSphere(1.5 + Math.random() * 0.8);
        // Create jagged lightning path
        const segments = 6 + Math.floor(Math.random() * 6);
        const points: THREE.Vector3[] = [start];

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const lerped = start.clone().lerp(end, t);
            lerped.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.3 * (1 - Math.abs(t - 0.5) * 2),
                (Math.random() - 0.5) * 0.3 * (1 - Math.abs(t - 0.5) * 2),
                (Math.random() - 0.5) * 0.3 * (1 - Math.abs(t - 0.5) * 2),
            ));
            points.push(lerped);
        }
        points.push(end);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: '#ffffff',
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(geometry, material);
        return { line, birth: 0, duration: 0.1 + Math.random() * 0.2 };
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Spawn new arcs at random intervals
        if (t - lastSpawn.current > 0.08 + Math.random() * 0.15) {
            lastSpawn.current = t;
            if (arcsRef.current.length < 6) {
                const arc = spawnArc();
                arcsRef.current.push(arc);
                groupRef.current.add(arc.line);
            }
        }

        // Update existing arcs
        arcsRef.current = arcsRef.current.filter((arc) => {
            arc.birth += delta;
            const progress = arc.birth / arc.duration;
            const mat = arc.line.material as THREE.LineBasicMaterial;

            if (progress > 1) {
                groupRef.current.remove(arc.line);
                arc.line.geometry.dispose();
                mat.dispose();
                return false;
            }

            // Flash: bright start, quick fade
            mat.opacity = Math.max(0, 1 - progress * progress);
            // Shift from white to cyan as it fades
            const fade = progress;
            mat.color.setRGB(1 - fade * 0.7, 1 - fade * 0.1, 1);

            return true;
        });
    });

    return <group ref={groupRef} />;
}

/* ─── NEURAL NODES (Bright synapse endpoints) ───
   Glowing dots scattered throughout the brain volume
   that pulse rhythmically.
*/
function NeuralNodes() {
    const COUNT = 60;
    const ref = useRef<THREE.Points>(null!);

    const { positions, phases } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3);
        const phases = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
            const p = randomInSphere(1.6);
            p.y *= 0.7;
            p.x *= 1.2;
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
            phases[i] = Math.random() * Math.PI * 2;
        }
        return { positions, phases };
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;
        const mat = ref.current.material as THREE.PointsMaterial;
        // Global gentle pulse
        mat.opacity = 0.5 + Math.sin(t * 2) * 0.2;
        ref.current.rotation.y = t * 0.04;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={COUNT}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#a5f3fc"
                size={0.04}
                transparent
                opacity={0.7}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ─── MAIN EXPORT ─── */
export default function HeroBrain3D() {
    return (
        <div className="w-full h-[350px] sm:h-[450px]">
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                {/* Lighting: dramatic cyan/blue */}
                <ambientLight intensity={0.15} />
                <pointLight position={[3, 3, 3]} intensity={1.5} color="#22d3ee" distance={15} />
                <pointLight position={[-3, -2, -3]} intensity={0.8} color="#0ea5e9" distance={15} />
                <pointLight position={[0, 0, 0]} intensity={2} color="#67e8f9" distance={5} />

                {/* Core: the bright pulsing center */}
                <NeuralCore />

                {/* Inner tendrils: energy paths radiating from core */}
                <NeuralTendrils />

                {/* Outer web: chaotic neural connections forming brain shape */}
                <OuterNeuralWeb />

                {/* Synapse sparks: flying outward from center */}
                <SynapseSparks />

                {/* Neural nodes: glowing dots at connection points */}
                <NeuralNodes />

                {/* Electric arcs: random lightning flashes */}
                <ElectricArcs />

                {/* Ambient energy particles */}
                <EnergyField />
            </Canvas>
        </div>
    );
}
