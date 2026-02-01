'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense, useState, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import Tower from './Tower';

import { getCompanyByMesh } from '../data/companies';

// Animated Camera System with Scroll Navigation
function CinematicCamera({
  targetPos,
  lookAtPos,
  isFocused,
  isHovered
}: {
  targetPos: Vector3;
  lookAtPos: Vector3;
  isFocused: boolean;
  isHovered: boolean;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  // Scroll state
  const scrollY = useRef(10); // Start higher up
  const targetScrollY = useRef(10);

  // Camera state
  const currentPos = useRef(new Vector3(110, 10, 110)); // Further back (Zoomed out)
  const currentLookAt = useRef(new Vector3(0, 5, 0));

  // Rotation state
  const angle = useRef(0.5);

  // Base configuration
  const MAX_HEIGHT = 90;
  const MIN_HEIGHT = -20;
  const RADIUS = 110; // Increased radius to zoom out

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isFocused) return; // Disable scroll nav when focused on a door

      // Update target scroll position - Faster scrolling
      targetScrollY.current += e.deltaY * 0.08;

      // Clamp values
      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));
    };

    // Attach to canvas element
    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: true });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [isFocused, gl]);

  useFrame((state, delta) => {
    const step = isFocused ? 0.06 : 0.04; // Slightly snappier

    if (isFocused) {
      // Zoom in to specific door
      currentPos.current.lerp(targetPos, step);
      currentLookAt.current.lerp(lookAtPos, step);
    } else {
      // Scroll Navigation Mode

      // Smoothly interpolate scroll
      scrollY.current += (targetScrollY.current - scrollY.current) * 0.08;

      // Calculate orbiting position based on accumulated angle and scroll height
      // Only rotate if not hovered and not focused
      if (!isHovered) {
        angle.current += delta * 0.05; // Slower rotation for less dizziness
      }

      const x = Math.sin(angle.current) * RADIUS;
      const z = Math.cos(angle.current) * RADIUS;

      const orbitPos = new Vector3(x, scrollY.current, z);
      const orbitLookAt = new Vector3(0, scrollY.current * 0.6, 0);

      currentPos.current.lerp(orbitPos, step);
      currentLookAt.current.lerp(orbitLookAt, step);
    }

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera makeDefault position={[110, 40, 110]} fov={32} />
  );
}

// ... imports
import { useRouter } from 'next/navigation';

export default function Scene() {
  const router = useRouter();

  const [cameraTarget, setCameraTarget] = useState(new Vector3(60, 30, 60));
  const [lookTarget, setLookTarget] = useState(new Vector3(0, 10, 0));
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Use a ref to track if we've already opened the website for the current selection
  const websiteOpened = useRef(false);

  const handleSelect = (meshName: string, worldPos?: Vector3) => {
    const company = getCompanyByMesh(meshName);
    websiteOpened.current = false;

    if (worldPos && company) {
      // CALCULATION FOR PORTAL PENETRATION
      // We move the camera TO the world position of the door and slightly PAST it
      const direction = worldPos.clone().normalize();

      // Portal entry point: Very close to or slightly through the door
      // We use a small scalar so it feels like it enters the gate
      const portalTarget = worldPos.clone().add(direction.multiplyScalar(2));

      setCameraTarget(portalTarget);
      setLookTarget(worldPos);
      setIsFocused(true);

      // REDIRECT LOGIC
      // after animation -> push to internal page
      if (company.id) {
        setTimeout(() => {
          if (!websiteOpened.current) {
            websiteOpened.current = true;
            router.push(`/company/${company.id}`);
          }
        }, 1500);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-[#020202] relative overflow-hidden">

      <Canvas
        shadows
        dpr={[1, 1.5]} // Optimize performance
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#020204']} />
        <fog attach="fog" args={['#020204', 80, 250]} />

        <CinematicCamera
          targetPos={cameraTarget}
          lookAtPos={lookTarget}
          isFocused={isFocused}
          isHovered={isHovered}
        />

        {/* Improved Lighting Setup */}
        <ambientLight intensity={0.4} /> {/* Increased from 0.2 */}
        <spotLight
          position={[50, 80, 50]}
          angle={0.2}
          penumbra={1}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]} // Reduced from 2048 for performance
          shadow-bias={-0.0001}
        />
        <pointLight position={[-40, 30, -40]} intensity={0.4} color="#d4af37" distance={100} />
        <pointLight position={[40, 0, 40]} intensity={0.8} color="#b0b0ff" distance={100} />

        <Environment preset="night" blur={0.8} background={false} />

        <Stars radius={300} depth={60} count={12000} factor={6} saturation={0} fade speed={1} />

        <Suspense fallback={null}>
          <Tower onSelect={handleSelect} onHover={setIsHovered} />
        </Suspense>

        <EffectComposer enableNormalPass={false}>
          <Bloom
            luminanceThreshold={1.5} // Higher threshold to only bloom very bright things
            mipmapBlur
            intensity={0.3}
            radius={0.4}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      {/* Modern Minimalist Overlay */}
      <div className={`absolute top-0 left-0 p-12 text-white pointer-events-none z-10 transition-all duration-1000 ${isFocused ? 'opacity-0 blur-sm translate-x-[-20px]' : 'opacity-100'}`}>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#d4af37] font-bold">
            Corporate Interactive Experience
          </p>
          <h1 className="text-6xl md:text-7xl font-serif font-black tracking-tighter">
            TOWER<span className="text-[#d4af37]">.</span>
          </h1>
        </div>
        <div className="mt-6 flex items-center space-x-4">
          <div className="h-[1px] w-12 bg-[#d4af37]/50"></div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-light">
            Select Company to Enter
          </p>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
    </div>
  );
}

