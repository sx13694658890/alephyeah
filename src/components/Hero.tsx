import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Gentle floating particles
    const particlesCount = 80;
    const positions = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0xb8a99a,
      size: 0.08,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // A few subtle abstract shapes
    const shapes: THREE.Mesh[] = [];
    const shapeCount = 5;
    for (let i = 0; i < shapeCount; i++) {
      const size = Math.random() * 0.3 + 0.1;
      const geometry2 = new THREE.IcosahedronGeometry(size, 0);
      const material2 = new THREE.MeshBasicMaterial({
        color: 0xb8a99a,
        transparent: true,
        opacity: Math.random() * 0.08 + 0.03,
        wireframe: Math.random() > 0.5,
      });
      const mesh = new THREE.Mesh(geometry2, material2);
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 3,
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      shapes.push(mesh);
    }

    camera.position.z = 6;

    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Gentle parallax on mouse
      particles.rotation.x += (mouseY * 0.02 - particles.rotation.x) * 0.02;
      particles.rotation.y += (mouseX * 0.02 - particles.rotation.y) * 0.02;

      // Subtle rotation of shapes
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.002 * (i + 1);
        shape.rotation.y += 0.003 * (i + 1);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Three.js background */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="text-sm font-medium text-foreground/50 tracking-widest uppercase mb-4 animate__animated animate__fadeIn animate__duration-1s">
          Welcome to
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6 animate__animated animate__fadeInUp animate__duration-1s">
          AlephYeah
        </h1>
        <p className="text-lg md:text-xl text-foreground/60 leading-relaxed mb-10 max-w-xl mx-auto animate__animated animate__fadeInUp animate__delay-1s animate__duration-1s">
          A space for projects, documentation, and ideas — built with care and curiosity.
        </p>
        <div className="flex items-center justify-center gap-4 animate__animated animate__fadeInUp animate__delay-2s animate__duration-1s">
          <Link
            to="/projects"
            className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            View Projects
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 rounded-xl border border-border text-primary text-sm font-medium hover:bg-muted transition-all duration-300 hover:-translate-y-0.5"
          >
            About Me
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate__animated animate__fadeIn animate__delay-3s animate__duration-2s animate__infinite animate__slow">
        <div className="w-5 h-8 rounded-full border-2 border-border flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-accent animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
