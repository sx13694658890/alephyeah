import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import {
  buildRainWindowFragmentShader,
  rainWindowVertexShader,
} from '../../lib/rain/buildRainWindowShader';
import { createRainWindowBackgroundTexture } from '../../lib/rain/rainWindowBackgroundTexture';

function RainWindowOrthographicCamera() {
  const { set } = useThree();
  useLayoutEffect(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    cam.position.set(0, 0, 1);
    cam.updateProjectionMatrix();
    set({ camera: cam });
  }, [set]);
  return null;
}

interface RainWindowSceneProps {
  paused?: boolean;
}

/** BigWings rain.glsl 窗户版：全屏折射 + 雾面水痕；按住拖动用 Y 控制雨量。 */
export function RainWindowScene({ paused = false }: RainWindowSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport, gl } = useThree();
  const pointerDownRef = useRef(false);

  const channel0 = useMemo(() => createRainWindowBackgroundTexture(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  const material = useMemo(() => {
    return new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: rainWindowVertexShader,
      fragmentShader: buildRainWindowFragmentShader(),
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        iChannel0: { value: channel0 },
        uUseManualRain: { value: 0 },
        uManualRain: { value: 0.75 },
      },
      depthTest: false,
      depthWrite: false,
    });
  }, [channel0]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      channel0.dispose();
    };
  }, [geometry, material, channel0]);

  const setPointerPixel = useCallback(
    (clientX: number, clientY: number) => {
      const el = gl.domElement;
      const rect = el.getBoundingClientRect();
      const dpr = viewport.dpr;
      const x = ((clientX - rect.left) / rect.width) * size.width * dpr;
      const y = (1 - (clientY - rect.top) / rect.height) * size.height * dpr;
      const m = meshRef.current?.material as THREE.ShaderMaterial | undefined;
      if (!m) return;
      m.uniforms.iMouse.value.x = x;
      m.uniforms.iMouse.value.y = y;
    },
    [gl.domElement, viewport.dpr, size.width, size.height],
  );

  useFrame((state) => {
    if (paused) return;
    const m = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (!m) return;
    const w = size.width * viewport.dpr;
    const h = size.height * viewport.dpr;
    m.uniforms.iTime.value = state.clock.elapsedTime;
    m.uniforms.iResolution.value.set(w, h, 1);
    m.uniforms.uUseManualRain.value = 0;
    m.uniforms.uManualRain.value = 0.75;
    m.uniforms.iMouse.value.z = pointerDownRef.current ? 1 : 0;
    if (!pointerDownRef.current) {
      m.uniforms.iMouse.value.w = 0;
    }
  });

  return (
    <>
      <RainWindowOrthographicCamera />
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        frustumCulled={false}
        onPointerDown={(e) => {
          e.stopPropagation();
          pointerDownRef.current = true;
          (meshRef.current?.material as THREE.ShaderMaterial).uniforms.iMouse.value.z = 1;
          setPointerPixel(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          pointerDownRef.current = false;
        }}
        onPointerLeave={() => {
          pointerDownRef.current = false;
        }}
        onPointerMove={(e) => {
          if (pointerDownRef.current) setPointerPixel(e.clientX, e.clientY);
        }}
      />
    </>
  );
}
