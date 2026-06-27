import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

type ShapeKind = 'icosahedron' | 'torus' | 'octahedron';

interface ShapeConfig {
  position: [number, number, number];
  color: string;
  kind: ShapeKind;
  scale: number;
  floatSpeed: number;
  distort: number;
  depth: number;
}

function FloatingShape({
  position,
  color,
  kind,
  scale,
  floatSpeed,
  distort,
  depth,
}: ShapeConfig) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.25 + position[0]) * 0.25;
    meshRef.current.rotation.y = Math.sin(t * 0.18 + position[1]) * 0.35;
    meshRef.current.rotation.z = Math.cos(t * 0.12 + depth) * 0.1;
  });

  const geometry = useMemo(() => {
    switch (kind) {
      case 'torus':
        return <torusGeometry args={[0.7, 0.22, 12, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      default:
        return <icosahedronGeometry args={[1, 1]} />;
    }
  }, [kind]);

  return (
    <Float speed={floatSpeed} rotationIntensity={0.35} floatIntensity={0.65}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.14}
          roughness={0.65}
          metalness={0.25}
          distort={distort}
          speed={1.2}
        />
      </mesh>
    </Float>
  );
}

function SceneRig({ shapes }: { shapes: ShapeConfig[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onScroll = () => {
      scroll.current = window.scrollY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.current.x * 0.12,
      0.04
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.current.y * 0.07,
      0.04
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      scroll.current * 0.0015,
      0.06
    );

    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      10 + scroll.current * 0.001,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.45} />
      <pointLight position={[8, 6, 10]} intensity={0.6} color="#D4C5B5" />
      <pointLight position={[-6, -4, 6]} intensity={0.35} color="#9A8B7A" />
      <fog attach="fog" args={['#FAF8F5', 12, 28]} />

      <Stars
        radius={40}
        depth={50}
        count={1200}
        factor={2.5}
        saturation={0}
        fade
        speed={0.4}
      />
      <Sparkles
        count={60}
        scale={[14, 10, 8]}
        size={1.2}
        speed={0.25}
        opacity={0.35}
        color="#C4B5A5"
      />

      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
    </group>
  );
}

const SHAPES: ShapeConfig[] = [
  { position: [-5, 2.5, -4], color: '#B8A99A', kind: 'icosahedron', scale: 0.9, floatSpeed: 0.45, distort: 0.35, depth: 1 },
  { position: [5.5, -0.5, -5], color: '#C4B5A5', kind: 'torus', scale: 1.1, floatSpeed: 0.55, distort: 0.2, depth: 2 },
  { position: [-3.5, -2.5, -7], color: '#A89888', kind: 'octahedron', scale: 0.75, floatSpeed: 0.4, distort: 0.4, depth: 3 },
  { position: [4, 3.5, -8], color: '#D4C5B5', kind: 'icosahedron', scale: 1.3, floatSpeed: 0.35, distort: 0.28, depth: 4 },
  { position: [0, -3.5, -9], color: '#C0B0A0', kind: 'torus', scale: 0.85, floatSpeed: 0.5, distort: 0.22, depth: 5 },
  { position: [-6, 0, -10], color: '#B8A99A', kind: 'octahedron', scale: 0.6, floatSpeed: 0.38, distort: 0.45, depth: 6 },
  { position: [2, 1, -6], color: '#D9CFC4', kind: 'icosahedron', scale: 0.5, floatSpeed: 0.6, distort: 0.3, depth: 7 },
];

export const HeroScene = () => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(196,181,165,0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(154,139,122,0.15) 0%, transparent 45%)',
        }}
      />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <SceneRig shapes={SHAPES} />
      </Canvas>
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, transparent 0%, var(--color-background) 75%)',
        }}
      />
    </div>
  );
};
