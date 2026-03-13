'use client';

// ... (imports remain the same)
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Sparkles, Stars, useProgress } from '@react-three/drei';
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
  cameraStateRef,
  bgRef
}: {
  targetPos: Vector3;
  lookAtPos: Vector3;
  isFocused: boolean;
  isHovered: boolean;
  isMobile: boolean;
  cameraStateRef: React.MutableRefObject<{ pos: Vector3; lookAt: Vector3 }>;
  bgRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { camera, gl } = useThree();

  // Scroll state
  const scrollY = useRef(90); // Start at MAX_HEIGHT (Top)
  const targetScrollY = useRef(90);

  // Rotation state
  const angle = useRef(0.5);
  const targetAngle = useRef(0.5);

  // Mouse drag state
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);

  // Base configuration
  const MAX_HEIGHT = 90;
  const MIN_HEIGHT = 5;
  const initialRadius = isMobile ? 150 : 110;
  const RADIUS = initialRadius;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isFocused) return; // Disable scroll nav when focused on a door

      // Update target scroll position - Inverted direction for natural feeling
      // Heavy 30-40% - Reduce sensitivity
      targetScrollY.current -= e.deltaY * 0.04;

      // Horizontal scrolling for Rotation (Trackpad horizontal scroll)
      targetAngle.current += e.deltaX * 0.003;

      // Clamp values
      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));
    };

    // Mouse drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (isFocused) return;
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      document.body.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || isFocused) return;

      const deltaX = e.clientX - lastMouseX.current;
      // Drag Horizontal -> Rotate camera around the tower
      // We use a negative multiplier so dragging RIGHT (positive deltaX) rotates camera LEFT 
      // Heavy 30-40% - Reduce sensitivity
      targetAngle.current -= deltaX * 0.005;
      lastMouseX.current = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'auto';
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
      if (e.cancelable) e.preventDefault();

      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;

      const deltaY = touchStartY - touchY;
      const deltaX = touchStartX - touchX;

      // Heavy 30-40% - Reduce sensitivity
      targetScrollY.current -= deltaY * 0.08;
      targetAngle.current += deltaX * 0.005;
      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));

      touchStartY = touchY;
      touchStartX = touchX;
    };

    // Attach to canvas element
    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: true });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isFocused, gl]);

  // Reusable vectors to prevent GC stutter
  const orbitPos = useRef(new Vector3());
  const orbitLookAt = useRef(new Vector3());

  useFrame((state, delta) => {
    // Heavy 30-40% - Reduce interpolation steps for more lag/inertia
    const step = isFocused ? 0.06 : 0.025;
    const currentPos = cameraStateRef.current.pos;
    const currentLookAt = cameraStateRef.current.lookAt;

    if (isFocused) {
      currentPos.lerp(targetPos, step);
      currentLookAt.lerp(lookAtPos, step);
    } else {
      // Heavy 30-40% - Increase damping by lowering lerp
      const scrollLerp = isMobile ? 0.06 : 0.15;
      scrollY.current += (targetScrollY.current - scrollY.current) * scrollLerp;

      const angleLerp = isMobile ? 0.03 : 0.06;
      angle.current += (targetAngle.current - angle.current) * angleLerp;

      const x = Math.sin(angle.current) * RADIUS;
      const z = Math.cos(angle.current) * RADIUS;

      orbitPos.current.set(x, scrollY.current, z);
      orbitLookAt.current.set(0, scrollY.current * 0.6, 0);

      currentPos.lerp(orbitPos.current, step);
      currentLookAt.lerp(orbitLookAt.current, step);
    }

    camera.position.copy(currentPos);
    camera.lookAt(currentLookAt);

    // Apply Vertical Parallax to CSS Background
    if (bgRef && bgRef.current) {
      // Create vertical parallax by reading the camera's actual Y position
      // camera.position.y scales from roughly 90 down to 5.
      // Parallax moves the background physically up and down as we scroll the tower
      const parallaxY = (currentPos.y - 90) * 3.5; 
      bgRef.current.style.transform = `translateY(${parallaxY}px)`;
    }
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

  // Reference to the CSS background container for scroll parallax
  const bgRef = useRef<HTMLDivElement>(null);

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

      {/* Animated Night Sky Background (Behind Canvas) */}
      <div className="absolute inset-0 z-0 bg-[#0a0f14] overflow-hidden">
        {/* Massive parallax container that moves up/down with scroll */}
        <div ref={bgRef} className="absolute inset-x-0 -top-[100vh] h-[300vh] will-change-transform">
          <div className="absolute inset-0 bg-stars hidden md:block"></div>
          <div className="absolute -inset-y-20 -inset-x-0 bg-clouds-1 mix-blend-screen pointer-events-none"></div>
          <div className="absolute -inset-y-10 -inset-x-0 bg-clouds-2 mix-blend-screen pointer-events-none"></div>
        </div>
        
        {/* Soft vignette/gradient to blend the edges of the sky into the viewport and hide parallax edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-[#0f0d0a]/20 to-[#0f0d0a] pointer-events-none"></div>
      </div>

      <Canvas
        className="z-10 relative"
        shadows={!isMobile} // Disable shadow map entirely on mobile
        dpr={isMobile ? 1 : [1, 2]} // Cap DPR at 1.0 for mobile (Battery/Performance saver)
        gl={{
          antialias: !isMobile, // Disable MSAA on mobile for slight perf boost
          alpha: true, // Allow the CSS animated background to show through
          powerPreference: "high-performance"
        }}
        style={{ touchAction: 'none' }}
      >
        {/* Fog color matched to the bottom CSS gradient color to blend seamlessly */}
        <fogExp2 attach="fog" args={['#05070a', 0.003]} />

        <CinematicCamera
          targetPos={cameraTarget}
          lookAtPos={lookTarget}
          isFocused={isFocused}
          isHovered={isHovered}
          isMobile={isMobile}
          cameraStateRef={cameraStateRef}
          bgRef={bgRef}
        />

        {/* Improved Lighting Setup - High Contrast Premium Look */}
        {/* Ambient: Darker, moody warm fill */}
        <ambientLight intensity={0.5} color="#d4c5b0" />

        {/* Spot: Sharp Warm Gold Key Light to highly accentuate the architecture */}
        <spotLight
          position={[60, 100, 60]}
          angle={0.4}
          penumbra={1}
          intensity={3.0}
          color="#ffedc2"
          castShadow={!isMobile}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />

        {/* Secondary Lights: Desktop Only */}
        {!isMobile && (
          <>
            {/* Rim Light: Sharp gold edge light */}
            <pointLight position={[-60, 40, -60]} intensity={2.0} color="#e0a96d" distance={150} />
            {/* Fill Light: Soft cinematic warmth to contrast the shadows */}
            <pointLight position={[50, -20, 50]} intensity={1.0} color="#4a3b2c" distance={150} />
          </>
        )}

        <Environment preset="city" blur={0.6} background={false} />

        {/* 3D Stars for parallax depth overlapping the CSS ambient sky and clouds */}
        {/* Heavy star count to make a deeply stary view as requested */}
        {!isMobile && (
          <Stars radius={250} depth={80} count={12000} factor={6} saturation={0} fade speed={1.5} />
        )}

        <Suspense fallback={null}>
          <Suspense fallback={null}>
            <Tower onSelect={handleSelect} onHover={setIsHovered} cameraStateRef={cameraStateRef} isMobile={isMobile} />
          </Suspense>
        </Suspense>

        {/* Post Processing: ONLY on Desktop. Too heavy for mobile web in some cases. */}
        {!isMobile && (
          <EffectComposer enableNormalPass={false} multisampling={0}>
            <SMAA />
            {/* Ethereal Glow: Smooth blooming for metals and hot spots */}
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur intensity={0.8} />
            {/* Dramatic Vignette to focus eyes toward the center tower */}
            <Vignette eskil={false} offset={0.25} darkness={0.6} />
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

