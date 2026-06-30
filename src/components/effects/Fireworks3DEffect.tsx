import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Seed {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  maxAge: number;
}

interface Spark {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  hue: number;
}

const MAX_SPARKS = 1800;

function splode(x: number, y: number, z: number, out: Spark[]) {
  const count = 60 + Math.floor(Math.random() * 80);
  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.04 + Math.random() * 0.12;
    out.push({
      x,
      y,
      z,
      vx: Math.sin(phi) * Math.cos(theta) * speed,
      vy: Math.cos(phi) * speed,
      vz: Math.sin(phi) * Math.sin(theta) * speed,
      life: 0,
      maxLife: 1.5 + Math.random() * 1.5,
      hue: Math.random(),
    });
  }
}

function Fireworks3DSimulation() {
  const seeds = useRef<Seed[]>([]);
  const sparks = useRef<Spark[]>([]);
  const positions = useRef(new Float32Array(MAX_SPARKS * 3));
  const colors = useRef(new Float32Array(MAX_SPARKS * 3));
  const pointsRef = useRef<THREE.Points>(null);
  const spawnTimer = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const spawnSeed = useCallback(() => {
    seeds.current.push({
      x: (Math.random() - 0.5) * 8,
      y: -3.5,
      z: (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 0.02,
      vy: 0.06 + Math.random() * 0.03,
      vz: (Math.random() - 0.5) * 0.02,
      age: 0,
      maxAge: 1.8 + Math.random() * 0.8,
    });
  }, []);

  useEffect(() => {
    spawnSeed();
    spawnSeed();
  }, [spawnSeed]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    spawnTimer.current += dt;
    if (spawnTimer.current > 1.4) {
      spawnTimer.current = 0;
      spawnSeed();
    }

    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
    }
    camera.position.x = Math.sin(t * 0.15) * 0.8;
    camera.position.z = 8 + Math.cos(t * 0.15) * 0.5;
    camera.lookAt(0, 0, 0);

    const nextSeeds: Seed[] = [];
    const nextSparks: Spark[] = [];

    for (const seed of seeds.current) {
      seed.age += dt;
      seed.vy -= 0.0015;
      seed.x += seed.vx;
      seed.y += seed.vy;
      seed.z += seed.vz;

      if (seed.age >= seed.maxAge || seed.vy <= 0) {
        splode(seed.x, seed.y, seed.z, nextSparks);
      } else {
        nextSeeds.push(seed);
        nextSparks.push({
          x: seed.x,
          y: seed.y,
          z: seed.z,
          vx: 0,
          vy: 0,
          vz: 0,
          life: 0,
          maxLife: 0.2,
          hue: 0.12,
        });
      }
    }
    seeds.current = nextSeeds;

    for (const spark of sparks.current) {
      spark.life += dt;
      if (spark.life >= spark.maxLife) continue;
      spark.vy -= 0.0012;
      spark.vx *= 0.985;
      spark.vy *= 0.985;
      spark.vz *= 0.985;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.z += spark.vz;
      nextSparks.push(spark);
    }
    sparks.current = nextSparks.slice(0, MAX_SPARKS);

    const pos = positions.current;
    const col = colors.current;
    const count = sparks.current.length;
    const tmp = new THREE.Color();

    for (let i = 0; i < MAX_SPARKS; i += 1) {
      if (i < count) {
        const s = sparks.current[i];
        const fade = 1 - s.life / s.maxLife;
        pos[i * 3] = s.x;
        pos[i * 3 + 1] = s.y;
        pos[i * 3 + 2] = s.z;
        tmp.setHSL(s.hue * 0.15 + 0.02, 0.85, 0.55 + fade * 0.2);
        col[i * 3] = tmp.r * fade;
        col[i * 3 + 1] = tmp.g * fade;
        col[i * 3 + 2] = tmp.b * fade;
      }
    }

    const geom = pointsRef.current?.geometry;
    if (geom) {
      geom.attributes.position.needsUpdate = true;
      geom.attributes.color.needsUpdate = true;
      geom.setDrawRange(0, count);
    }
  });

  return (
    <group ref={groupRef}>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.25} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors.current, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.92}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <gridHelper args={[16, 16, '#1a1816', '#121010']} position={[0, -3.6, 0]} />
    </group>
  );
}

export const Fireworks3DEffect = () => {
  const reducedMotion = useReducedMotion();
  const dpr = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 1.5), []);

  if (reducedMotion) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-foreground/50">
        已启用减少动效，3D 烟花预览已禁用
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0.5, 8], fov: 55 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: false }}
      className="h-full w-full"
    >
      <Fireworks3DSimulation />
    </Canvas>
  );
};
