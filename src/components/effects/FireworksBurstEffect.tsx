import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { useReducedMotion } from '../../hooks/useReducedMotion';

const COLORS = ['#ff0043', '#14fc56', '#1e7fff', '#e60aff', '#ffbf36', '#ffffff'];

interface SimParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
  size: number;
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  life: number;
}

const MAX = 2400;

function createBurst(x: number, y: number, hue: number, count: number, out: SimParticle[]) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.4;
    const color = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#ffffff');
    out.push({
      x,
      y,
      z: (Math.random() - 0.5) * 0.3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: (Math.random() - 0.5) * 0.4,
      life: 0,
      maxLife: 1.4 + Math.random() * 1.2,
      r: color.r,
      g: color.g,
      b: color.b,
      size: 0.04 + Math.random() * 0.06,
    });
    void hue;
  }
}

function FireworksSimulation() {
  const particles = useRef<SimParticle[]>([]);
  const rockets = useRef<Rocket[]>([]);
  const positions = useRef(new Float32Array(MAX * 3));
  const colors = useRef(new Float32Array(MAX * 3));
  const pointsRef = useRef<THREE.Points>(null);
  const spawnTimer = useRef(0);
  const { viewport } = useThree();

  const spawnRocket = useCallback((x?: number) => {
    const nx = x ?? (Math.random() - 0.5) * viewport.width * 0.85;
    rockets.current.push({
      x: nx,
      y: -viewport.height * 0.45,
      vx: (Math.random() - 0.5) * 0.15,
      vy: 2.8 + Math.random() * 1.2,
      hue: Math.random(),
      life: 0,
    });
  }, [viewport.height, viewport.width]);

  useEffect(() => {
    spawnRocket();
    spawnRocket();
  }, [spawnRocket]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    spawnTimer.current += dt;
    if (spawnTimer.current > 1.1) {
      spawnTimer.current = 0;
      if (Math.random() > 0.35) spawnRocket();
    }

    const nextParticles: SimParticle[] = [];
    const nextRockets: Rocket[] = [];

    for (const rocket of rockets.current) {
      rocket.life += dt;
      rocket.x += rocket.vx * dt * 60;
      rocket.y += rocket.vy * dt * 60;
      rocket.vy -= 0.018 * dt * 60;

      if (rocket.vy <= 0.4 || rocket.life > 2.5) {
        createBurst(rocket.x, rocket.y, rocket.hue, 80 + Math.floor(Math.random() * 40), nextParticles);
      } else {
        nextRockets.push(rocket);
        nextParticles.push({
          x: rocket.x,
          y: rocket.y,
          z: 0,
          vx: 0,
          vy: 0,
          vz: 0,
          life: 0,
          maxLife: 0.15,
          r: 1,
          g: 0.85,
          b: 0.5,
          size: 0.07,
        });
      }
    }
    rockets.current = nextRockets;

    for (const p of particles.current) {
      p.life += dt;
      if (p.life >= p.maxLife) continue;

      p.vy -= 0.035 * dt * 60;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vz *= 0.985;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.z += p.vz * dt * 60;
      nextParticles.push(p);
    }

    particles.current = nextParticles.slice(0, MAX);

    const pos = positions.current;
    const col = colors.current;
    const count = particles.current.length;

    for (let i = 0; i < MAX; i += 1) {
      if (i < count) {
        const p = particles.current[i];
        const fade = 1 - p.life / p.maxLife;
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        col[i * 3] = p.r * fade;
        col[i * 3 + 1] = p.g * fade;
        col[i * 3 + 2] = p.b * fade;
      }
    }

    const geom = pointsRef.current?.geometry;
    if (geom) {
      geom.attributes.position.needsUpdate = true;
      geom.attributes.color.needsUpdate = true;
      geom.setDrawRange(0, count);
    }
  });

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      spawnRocket(event.point.x);
    },
    [spawnRocket],
  );

  return (
    <>
      <color attach="background" args={['#0c0b0a']} />
      <ambientLight intensity={0.4} />
      <mesh position={[0, 0, -1]} onPointerDown={onPointerDown}>
        <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors.current, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export const FireworksBurstEffect = () => {
  const reducedMotion = useReducedMotion();

  const dpr = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 1.5), []);

  if (reducedMotion) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-foreground/50">
        已启用减少动效，烟花预览已禁用
      </div>
    );
  }

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 50 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: false }}
      className="h-full w-full touch-none"
    >
      <FireworksSimulation />
    </Canvas>
  );
};
