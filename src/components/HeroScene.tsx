import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, ...props }: {
  position: [number, number, number];
  color: string;
  [key: string]: unknown;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3 + position[0]) * 0.2;
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2 + position[1]) * 0.3;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} {...props}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.12}
          roughness={0.8}
          metalness={0.1}
          distort={0.3}
          speed={0.5}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const shapes = useMemo(() => [
    { position: [-4, 2, -5] as [number, number, number], color: '#B8A99A' },
    { position: [5, -1, -4] as [number, number, number], color: '#C4B5A5' },
    { position: [-3, -2, -6] as [number, number, number], color: '#A89888' },
    { position: [3.5, 3, -7] as [number, number, number], color: '#D4C5B5' },
    { position: [0, -3, -8] as [number, number, number], color: '#C0B0A0' },
  ], []);

  return (
    <>
      <ambientLight intensity={0.5} />
      {shapes.map((shape, i) => (
        <FloatingShape
          key={i}
          position={shape.position}
          color={shape.color}
          scale={[0.8 + i * 0.3, 0.8 + i * 0.3, 0.8 + i * 0.3]}
        />
      ))}
    </>
  );
}

export const HeroScene = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
