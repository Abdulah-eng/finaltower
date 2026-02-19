'use client';

// ... (imports remain the same)
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Stars, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';
import { Suspense, useState, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import Tower from './Tower';
import Loader from './Loader';

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
  isMobile,
  cameraStateRef
}: {
  targetPos: Vector3;
  lookAtPos: Vector3;
  isFocused: boolean;
  isHovered: boolean;
  isMobile: boolean;
  cameraStateRef: React.MutableRefObject<{ pos: Vector3; lookAt: Vector3 }>;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  // Scroll state
  const scrollY = useRef(90); // Start at MAX_HEIGHT (Top)
  const targetScrollY = useRef(90);

  // Rotation state
  const angle = useRef(0.5);
  const targetAngle = useRef(0.5);

  // Base configuration
  const MAX_HEIGHT = 90;
  // Raised bottom limit from -20 to 5 to stop at the base of the tower
  const MIN_HEIGHT = 5;
  const initialRadius = isMobile ? 150 : 110;
  const RADIUS = initialRadius;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isFocused) return; // Disable scroll nav when focused on a door

      // Update target scroll position - Inverted direction for natural feeling
      targetScrollY.current -= e.deltaY * 0.08;

      // Horizontal scrolling for Rotation
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
      // Prevent default to stop browser overscroll/refresh effects which cause "glitchy" feeling
      if (e.cancelable) e.preventDefault();

      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;

      const deltaY = touchStartY - touchY;
      const deltaX = touchStartX - touchX;

      // Invert deltaY effect to match wheel
      // Drag UP (deltaY positive) -> Scroll DOWN? Or Drag UP -> Scroll UP?
      // Usually Drag UP = Move Content UP = Camera moves DOWN.
      // Let's stick to standard "Unnatural" scroll for touch (Drag Up -> Go Down)
      // REDUCED SENSITIVITY for Mobile (0.2 -> 0.15)
      targetScrollY.current -= deltaY * 0.15;

      // Horizontal Drag -> Rotate
      // REDUCED SENSITIVITY (0.01 -> 0.008)
      targetAngle.current += deltaX * 0.008;

      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));

      touchStartY = touchY;
      touchStartX = touchX;
    };

    // Attach to canvas element
    const canvas = gl.domElement;
    // Mobile Chrome often treats passive: true as default, but we need preventDefault to stop scroll
    // So we must set passive: false for touchmove
    canvas.addEventListener('wheel', handleWheel, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isFocused, gl]);

  // Reusable vectors to prevent GC stutter
  const orbitPos = useRef(new Vector3());
  const orbitLookAt = useRef(new Vector3());

  useFrame((state, delta) => {
    // Speed up entry animation (0.06 -> 0.1) to ensure we reach the 'inside' position before fade out
    const step = isFocused ? 0.1 : 0.04;
    const currentPos = cameraStateRef.current.pos;
    const currentLookAt = cameraStateRef.current.lookAt;

    if (isFocused) {
      // Zoom in to specific door
      currentPos.lerp(targetPos, step);
      currentLookAt.lerp(lookAtPos, step);
    } else {
      // Scroll Navigation Mode

      // Smoothly interpolate scroll
      // MOBILE: Lower lerp (0.1) for "heavier"/smoother feeling to hide micro-jitters
      const scrollLerp = isMobile ? 0.1 : 0.25;
      scrollY.current += (targetScrollY.current - scrollY.current) * scrollLerp;

      // Smoothly interpolate angle for fluid rotation
      // MOBILE: Lower lerp (0.05) for smoother rotation
      const angleLerp = isMobile ? 0.05 : 0.1;
      angle.current += (targetAngle.current - angle.current) * angleLerp;

      const x = Math.sin(angle.current) * RADIUS;
      const z = Math.cos(angle.current) * RADIUS;

      // Update reusable vectors instead of creating new ones
      orbitPos.current.set(x, scrollY.current, z);
      orbitLookAt.current.set(0, scrollY.current * 0.6, 0);

      currentPos.lerp(orbitPos.current, step);
      currentLookAt.lerp(orbitLookAt.current, step);
    }

    camera.position.copy(currentPos);
    camera.lookAt(currentLookAt);
  });

  return (
    <PerspectiveCamera makeDefault position={[110, 40, 110]} fov={isMobile ? 45 : 32} />
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
  // Also using a state to force re-render for the overlay since ref changes don't trigger render
  const websiteOpened = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Shared Camera State for smooth transitions & exit animations
  const initialRadius = isMobile ? 150 : 110;
  const cameraStateRef = useRef({
    pos: new Vector3(initialRadius, 90, initialRadius),
    lookAt: new Vector3(0, 5, 0)
  });

  const handleSelect = (meshName: string, worldPos?: Vector3) => {
    const company = getCompanyByMesh(meshName);
    websiteOpened.current = false; // Reset on new selection attempt
    setIsTransitioning(false);

    if (worldPos && company) {
      // CALCULATION FOR PORTAL PENETRATION
      // Use the precise centroid (worldPos) from Tower.tsx
      const direction = worldPos.clone().normalize();

      // Portal entry point: Move DEEP inside
      // User Req: "move camera toward and even little inside door" -> Big negative scalar
      // -8.0 ensures we definitely clip through the door frame before fading
      const portalTarget = worldPos.clone().add(direction.multiplyScalar(-8.0));

      setCameraTarget(portalTarget);

      // Look EXACTLY at the center
      setLookTarget(worldPos);
      setIsFocused(true);

      // REDIRECT LOGIC
      // Wait for camera to actually get close before pushing
      // We'll use a timeout as a fail-safe, but usually the animation takes ~1-1.5s
      if (company.id) {
        // Trigger fade out slightly before push
        setTimeout(() => {
          setIsTransitioning(true); // Trigger fade to black
        }, 800);

        setTimeout(() => {
          router.push(`/company/${company.id}`);
        }, 1200); // Tuned for arrival
      }
    }
  };

  return (
    <div className="w-full h-screen bg-[#333] relative overflow-hidden">

      {/* Loading Screen Overlay */}
      <Loader />

      {/* Transition Overlay (Fade to Black on Exit) */}
      <div
        className={`absolute inset-0 z-40 bg-black pointer-events-none transition-opacity duration-700 ease-in ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
      />

      <Canvas
        shadows={!isMobile} // Disable shadow map entirely on mobile
        dpr={isMobile ? 1 : [1, 2]} // Cap DPR at 1.0 for mobile (Battery/Performance saver)
        gl={{
          antialias: !isMobile, // Disable MSAA on mobile for slight perf boost
          alpha: false,
          powerPreference: "high-performance"
        }}
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
          cameraStateRef={cameraStateRef}
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

        {/* Secondary Lights: Desktop Only */}
        {!isMobile && (
          <>
            {/* Rim Light: Subtle warm glow from opposite side */}
            <pointLight position={[-40, 30, -40]} intensity={1.0} color="#ffaa00" distance={100} />
            {/* Fill Light: Stronger Cool blue to fill shadows on the dark side */}
            <pointLight position={[40, 0, 40]} intensity={0.8} color="#4682b4" distance={100} />
          </>
        )}

        <Environment preset="city" blur={0.6} background={false} />

        {/* Optimization: Reduce star count significantly */}
        {/* Optimization: Disable Stars on mobile completely to save draw calls */}
        {!isMobile && <Stars radius={300} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />}

        <Suspense fallback={null}>
          <Suspense fallback={null}>
            <Tower onSelect={handleSelect} onHover={setIsHovered} cameraStateRef={cameraStateRef} isMobile={isMobile} />
          </Suspense>
        </Suspense>

        {/* Post Processing: ONLY on Desktop. Too heavy for mobile web in some cases. */}
        {!isMobile && (
          <EffectComposer enableNormalPass={false} multisampling={0}>
            <SMAA />
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

