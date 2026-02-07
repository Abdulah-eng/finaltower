'use client';

// ... (imports remain the same)
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Stars, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense, useState, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import Tower from './Tower';

import { getCompanyByMesh } from '../data/companies';
import { useRouter } from 'next/navigation';

// Hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

// Animated Camera System with Scroll Navigation
function CinematicCamera({
  targetPos,
  lookAtPos,
  isFocused,
  isHovered,
  isMobile
}: {
  targetPos: Vector3;
  lookAtPos: Vector3;
  isFocused: boolean;
  isHovered: boolean;
  isMobile: boolean;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  // Scroll state
  const scrollY = useRef(90); // Start at MAX_HEIGHT (Top)
  const targetScrollY = useRef(90);

  // Camera state
  const initialRadius = isMobile ? 150 : 110; // Zoom out more on mobile
  const currentPos = useRef(new Vector3(initialRadius, 90, initialRadius));
  const currentLookAt = useRef(new Vector3(0, 5, 0));

  // Rotation state
  const angle = useRef(0.5);
  const targetAngle = useRef(0.5);

  // Base configuration
  const MAX_HEIGHT = 90;
  // Raised bottom limit from -20 to 5 to stop at the base of the tower
  const MIN_HEIGHT = 5;
  const RADIUS = initialRadius;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isFocused) return; // Disable scroll nav when focused on a door

      // Update target scroll position - Inverted direction for natural feeling
      // "Mirroring" fix: e.deltaY > 0 (scroll down) should move camera down? 
      // User said "Direction of scrolling vertical is mirroring". 
      // Previously: targetScrollY.current += e.deltaY * 0.08; (Scroll down -> Increase Y -> Camera goes UP)
      // New: targetScrollY.current -= e.deltaY * 0.08; (Scroll down -> Decrease Y -> Camera goes DOWN)
      targetScrollY.current -= e.deltaY * 0.08;

      // Horizontal scrolling for Rotation
      // deltaX is usually produced by trackpads or shift+wheel
      targetAngle.current += e.deltaX * 0.005;

      // Clamp values
      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));
    };

    // Touch handling for mobile
    let touchStartY = 0;
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isFocused) return;
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;

      const deltaY = touchStartY - touchY;
      const deltaX = touchStartX - touchX;

      // Invert deltaY effect to match wheel
      // Drag UP (deltaY positive) -> Scroll DOWN? Or Drag UP -> Scroll UP?
      // Usually Drag UP = Move Content UP = Camera moves DOWN.
      // Let's stick to standard "Unnatural" scroll for touch (Drag Up -> Go Down)
      targetScrollY.current -= deltaY * 0.2;

      // Horizontal Drag -> Rotate
      targetAngle.current += deltaX * 0.01;

      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));

      touchStartY = touchY;
      touchStartX = touchX;
    };

    // Attach to canvas element
    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
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
      // Smoothly interpolate scroll
      // Increased lerp factor to 0.5 for almost instant stop (very little drift)
      // Tuned to 0.25 to reduce stutter/steps while keeping it responsive
      scrollY.current += (targetScrollY.current - scrollY.current) * 0.25;

      // Smoothly interpolate angle for fluid rotation
      angle.current += (targetAngle.current - angle.current) * 0.1;

      // Calculate orbiting position based on accumulated angle and scroll height
      // Only rotate if not hovered and not focused
      // On mobile, maybe auto-rotate slowly even if hovered? No, keep consistent.
      // Automatic rotation ONLY if no user input? removed for now to give control.
      /* if (!isHovered) {
         angle.current += delta * 0.05; 
      } */

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
    <PerspectiveCamera makeDefault position={[110, 40, 110]} fov={isMobile ? 45 : 32} />
  );
}

// Custom Loading Screen
function LoadingScreen() {
  const { progress } = useProgress();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      // Delay slightly to ensure smooth fade out
      const timer = setTimeout(() => setFinished(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // If finished and transitioned out, we can return null (or keep it purely visually hidden)
  // But keeping it with opacity 0 allows smooth transition.

  return (
    <div
      className={`absolute inset-0 z-50 bg-[#020202] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out pointer-events-none ${finished || progress === 100 ? 'opacity-0' : 'opacity-100'}`}
      style={{ pointerEvents: finished ? 'none' : 'auto' }}
    >
      <div className="space-y-4 text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-white">
          TOWER<span className="text-[#d4af37]">.</span>
        </h1>
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-[#d4af37] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[#d4af37] text-xs tracking-widest uppercase font-bold">
          {progress.toFixed(0)}% Loaded
        </p>
      </div>
    </div>
  );
}

export default function Scene() {
  const router = useRouter();
  const isMobile = useIsMobile();

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
      // Use the precise centroid (worldPos) from Tower.tsx
      const direction = worldPos.clone().normalize();

      // Portal entry point: Perfectly in front of the gate (slightly outside to avoid clipping)
      const portalTarget = worldPos.clone().add(direction.multiplyScalar(0.5)); // 0.5m setback

      setCameraTarget(portalTarget);

      // Look EXACTLY at the center
      setLookTarget(worldPos);
      setIsFocused(true);

      // REDIRECT LOGIC
      // Wait for camera to actually get close before pushing
      // We'll use a timeout as a fail-safe, but usually the animation takes ~1-1.5s
      if (company.id) {
        setTimeout(() => {
          if (!websiteOpened.current) {
            websiteOpened.current = true;
            router.push(`/company/${company.id}`);

            // Optional: Reset state after push so if they come back it's clean??
            // Actually, next/navigation usually remounts components or preserves state.
            // If they click "Back", component might mount freshly.
          }
        }, 1200); // Tuned for arrival
      }
    }
  };

  return (
    <div className="w-full h-screen bg-[#333] relative overflow-hidden">

      {/* Loading Screen Overlay */}
      <LoadingScreen />

      <Canvas
        shadows={false} // Mont-Fort Style: No real-time shadows for max FPS
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        {/* Skybox-ish background instead of black void */}
        {/* Premium Dusk: Deep Slate Blue used for a cohesive, rich night look */}
        <color attach="background" args={['#0b1015']} />

        {/* Adjusted fog for a more dramatic, premium depth */}
        <fog attach="fog" args={['#0b1015', 50, 350]} />

        <CinematicCamera
          targetPos={cameraTarget}
          lookAtPos={lookTarget}
          isFocused={isFocused}
          isHovered={isHovered}
          isMobile={isMobile}
        />

        {/* Improved Lighting Setup - Premium Contrast & Balance */}
        {/* Ambient: Increased intensity to fill "Dark" spots. Cool Moonlight. */}
        <ambientLight intensity={0.7} color="#b0c4de" />

        {/* Spot: Warm Gold Key Light to highlight the structure */}
        {/* Reduced mapSize to 512 for performance */}
        <spotLight
          position={[50, 80, 50]}
          angle={0.25}
          penumbra={1}
          intensity={1.8}
          color="#ffd700"
          castShadow={!isMobile} // Disable shadow casting on mobile
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0001}
        />
        {/* Rim Light: Subtle warm glow from opposite side */}
        <pointLight position={[-40, 30, -40]} intensity={1.0} color="#ffaa00" distance={100} />
        {/* Fill Light: Stronger Cool blue to fill shadows on the dark side */}
        <pointLight position={[40, 0, 40]} intensity={0.8} color="#4682b4" distance={100} />

        <Environment preset="city" blur={0.6} background={false} />

        {/* Optimization: Reduce star count significantly */}
        <Stars radius={300} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />

        <Suspense fallback={null}>
          <Tower onSelect={handleSelect} onHover={setIsHovered} />
        </Suspense>

        {/* Post Processing: ONLY on Desktop. Too heavy for mobile web in some cases. */}
        {!isMobile && (
          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
          </EffectComposer>
        )}

      </Canvas>
      <div className={`absolute top-0 left-0 p-6 md:p-12 text-white pointer-events-none z-10 transition-all duration-1000 ${isFocused ? 'opacity-0 blur-sm translate-x-[-20px]' : 'opacity-100'}`}>
        <div className="space-y-1">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-[#d4af37] font-bold">
            Corporate Interactive Experience
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black tracking-tighter">
            TOWER<span className="text-[#d4af37]">.</span>
          </h1>
        </div>
        <div className="mt-4 md:mt-6 flex items-center space-x-4">
          <div className="h-[1px] w-8 md:w-12 bg-[#d4af37]/50"></div>
          <p className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 font-light">
            {isMobile ? 'Tap Company to Enter' : 'Select Company to Enter'}
          </p>
        </div>
      </div>
    </div>
  );
}

