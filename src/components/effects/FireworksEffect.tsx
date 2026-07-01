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
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const MAX = 2800;

function createBurst(x: number, y: number, count: number, out: SimParticle[]) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.6;
    const color = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#ffffff');
    out.push({
      x,
      y,
      z: (Math.random() - 0.5) * 0.35,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: (Math.random() - 0.5) * 0.45,
      life: 0,
      maxLife: 1.5 + Math.random() * 1.4,
      r: color.r,
      g: color.g,
      b: color.b,
    });
  }
}

function FireworksSimulation({ paused }: { paused: boolean }) {
  const particles = useRef<SimParticle[]>([]);
  const rockets = useRef<Rocket[]>([]);
  const positions = useRef(new Float32Array(MAX * 3));
  const colors = useRef(new Float32Array(MAX * 3));
  const pointsRef = useRef<THREE.Points>(null);
  const spawnTimer = useRef(0);
  const visualGroupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions.current, 3);
    const colAttr = new THREE.BufferAttribute(colors.current, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    colAttr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', posAttr);
    g.setAttribute('color', colAttr);
    g.setDrawRange(0, 0);
    return g;
  }, []);

  useEffect(() => {
    const points = pointsRef.current;
    if (!points) return;
    points.raycast = () => {};
  }, []);

  const spawnRocket = useCallback(
    (x?: number) => {
      rockets.current.push({
        x: x ?? (Math.random() - 0.5) * viewport.width * 0.88,
        y: -viewport.height * 0.46,
        vx: (Math.random() - 0.5) * 0.18,
        vy: 2.9 + Math.random() * 1.3,
        life: 0,
      });
    },
    [viewport.height, viewport.width],
  );

  useEffect(() => {
    if (viewport.width < 0.01 || viewport.height < 0.01) return;
    spawnRocket();
    spawnRocket(0);
    spawnRocket(-viewport.width * 0.25);
    spawnRocket(viewport.width * 0.25);
  }, [spawnRocket, viewport.width, viewport.height]);

  useFrame(({ clock }, delta) => {
    if (paused) return;

    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();

    if (visualGroupRef.current) {
      visualGroupRef.current.rotation.y = Math.sin(t * 0.08) * 0.1;
    }

    spawnTimer.current += dt;
    if (spawnTimer.current > 0.95) {
      spawnTimer.current = 0;
      spawnRocket();
      if (Math.random() > 0.45) spawnRocket();
    }

    const nextParticles: SimParticle[] = [];
    const nextRockets: Rocket[] = [];

    for (const rocket of rockets.current) {
      rocket.life += dt;
      rocket.x += rocket.vx * dt * 60;
      rocket.y += rocket.vy * dt * 60;
      rocket.vy -= 0.018 * dt * 60;

      if (rocket.vy <= 0.35 || rocket.life > 2.6) {
        createBurst(rocket.x, rocket.y, 90 + Math.floor(Math.random() * 50), nextParticles);
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
          maxLife: 0.18,
          r: 1,
          g: 0.88,
          b: 0.55,
        });
      }
    }
    rockets.current = nextRockets;

    for (const p of particles.current) {
      p.life += dt;
      if (p.life >= p.maxLife) continue;

      p.vy -= 0.032 * dt * 60;
      p.vx *= 0.984;
      p.vy *= 0.984;
      p.vz *= 0.984;
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

    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geometry.setDrawRange(0, count);
  });

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (paused) return;
      event.stopPropagation();
      spawnRocket(event.point.x);
    },
    [paused, spawnRocket],
  );

  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.35} />

      {/* 交互层置于最前，不参与旋转，避免被粒子挡住射线 */}
      <mesh position={[0, 0, 1]} onPointerDown={onPointerDown}>
        <planeGeometry args={[viewport.width * 2.2, viewport.height * 2.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={visualGroupRef}>
        <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
          <pointsMaterial
            size={0.28}
            sizeAttenuation={false}
            vertexColors
            transparent
            opacity={0.96}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  );
}

interface FireworksEffectProps {
  paused?: boolean;
  className?: string;
}

export const FireworksEffect = ({ paused = false, className }: FireworksEffectProps) => {
  const reducedMotion = useReducedMotion();
  const dpr = useMemo(() => Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2), []);

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
      camera={{ position: [0, 0, 10], zoom: 50, near: 0.1, far: 100 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      className={className ?? 'h-full w-full touch-none'}
      style={{ touchAction: 'none' }}
    >
      <FireworksSimulation paused={paused} />
    </Canvas>
  );
};
