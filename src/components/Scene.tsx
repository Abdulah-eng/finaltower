'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';

import Tower from './Tower';
import Loader from './Loader';
import { Vector3, MathUtils } from 'three';
import { useRouter } from 'next/navigation';
import { getCompanyByMesh } from '../data/companies';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';

function CinematicCamera({
  targetPos,
  lookAtPos,
  isFocused,
  isHovered,
  isMobile,
  cameraStateRef,
  onArrive
}: {
  targetPos: Vector3;
  lookAtPos: Vector3;
  isFocused: boolean;
  isHovered: boolean;
  isMobile: boolean;
  cameraStateRef: React.MutableRefObject<{ pos: Vector3; lookAt: Vector3 }>;
  onArrive?: () => void;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  // Scroll state
  const scrollY = useRef(90); // Start at MAX_HEIGHT (Top)
  const targetScrollY = useRef(90);

  // Rotation state
  const angle = useRef(0.5);
  const targetAngle = useRef(0.5);

  // Touch/Mouse state
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  // Base configuration
  const MAX_HEIGHT = 90;
  // Raised bottom limit from -20 to 5 to stop at the base of the tower
  const MIN_HEIGHT = 5;
  const initialRadius = isMobile ? 150 : 110;
  const RADIUS = initialRadius;

  useEffect(() => {
    // Wheel event handler
    const handleWheel = (e: WheelEvent) => {
      // e.deltaY > 0 means scrolling DOWN -> decrease height
      // e.deltaY < 0 means scrolling UP -> increase height
      // Divider controls sensitivity
      const delta = e.deltaY * 0.05;
      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current - delta));
    };

    // Touch event vars
    // Refs moved to component scope

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = (touchY - touchStartY.current) * 0.15; // Vertical sensitivity
      const deltaX = (touchX - touchStartX.current); // Raw delta

      // Vertical Drag -> Scroll
      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current + deltaY));

      // Horizontal Drag -> Rotate
      targetAngle.current += deltaX * 0.003;

      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));

      touchStartY.current = touchY;
      touchStartX.current = touchX;
    };

    // MOUSE EVENTS (Desktop Support)
    const handleMouseDown = (e: MouseEvent) => {
      // Allow clicking on interactive elements (e.g. companies)
      // Only prevent default if we're clicking background
      // e.preventDefault(); 

      console.log("Scene: Mouse Down");
      isDragging.current = true;
      touchStartY.current = e.clientY;
      touchStartX.current = e.clientX;

      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const deltaY = (e.clientY - touchStartY.current) * 0.15;
      const deltaX = (e.clientX - touchStartX.current); // Raw delta

      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current + deltaY));

      // Increased sensitivity (User reported "too slow")
      // 0.003 -> 0.01 (Approx 3x faster)
      targetAngle.current += deltaX * 0.01;

      targetScrollY.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetScrollY.current));

      touchStartY.current = e.clientY;
      touchStartX.current = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvas.style.cursor = 'grab';
    };

    // Attach to canvas element
    const canvas = gl.domElement;
    canvas.style.cursor = 'grab'; // Default cursor
    canvas.style.touchAction = 'none'; // Prevent browser scrolling on mobile

    canvas.addEventListener('wheel', handleWheel, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false }); // non-passive for preventDefault if needed
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Add Mouse Listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);

      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isFocused, gl]);

  useFrame((state, delta) => {
    // Speed up entry animation (0.06 -> 0.1) to ensure we reach the 'inside' position before fade out
    // Tuned: 0.1 is fast.
    const step = isFocused ? 0.08 : 0.04; // Slightly lower than 0.1 for smoother final approach
    const currentPos = cameraStateRef.current.pos;
    const currentLookAt = cameraStateRef.current.lookAt;

    if (isFocused) {
      // Zoom in to specific door
      currentPos.lerp(targetPos, step);
      currentLookAt.lerp(lookAtPos, step);

      // PROXIMITY CHECK (User Req: "Open only when arrived")
      // Check distance to target. If very close (< 1.5m), trigger arrival.
      if (currentPos.distanceTo(targetPos) < 1.5) {
        if (onArrive) onArrive();
      }
    } else {
      // Scroll Navigation Mode

      // Smoothly interpolate scroll
      // FIX: Lowered lerp from 0.25 to 0.1 to match horizontal smoothness (User Req: "screw right/left is smoothing, up/down not")
      scrollY.current += (targetScrollY.current - scrollY.current) * 0.08;

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

      currentPos.lerp(orbitPos, step);
      currentLookAt.lerp(orbitLookAt, step);
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
  const websiteOpened = useRef(false);

  // Transition State for Overlay
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [cameraTarget, setCameraTarget] = useState(new Vector3(0, 0, 0));
  const [lookTarget, setLookTarget] = useState(new Vector3(0, 0, 0));
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      // Handled by onArrive callback in CinematicCamera
      if (company.id) {
        setPendingRedirect(company.id);
      }
    }
  };

  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const handleArrival = () => {
    if (pendingRedirect && !websiteOpened.current) {
      websiteOpened.current = true;
      setIsTransitioning(true); // Fade out

      // Wait for fade (700ms) then push
      setTimeout(() => {
        router.push(`/company/${pendingRedirect}`);
      }, 700);
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
        shadows={false} // Mont-Fort Style: No real-time shadows for max FPS
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Use reasonable DPR limits
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
          cameraStateRef={cameraStateRef}
          onArrive={handleArrival}
        />

        {/* Improved Lighting Setup - Premium Contrast & Balance */}
        {/* Ambient: Increased intensity to fill "Dark" spots. Cool Moonlight. */}
        <ambientLight intensity={0.7} color="#b0c4de" />

        {/* Main Directional Light (Moonlight/City Light) */}
        {/* Repositioned for more dramatic shadows (side lighting) */}
        <directionalLight
          position={[50, 80, 40]}
          intensity={1.2}
          color="#ffffff"
          castShadow={false}
        />

        {/* Rim Light for edge definition on the tower */}
        <spotLight
          position={[-50, 60, -50]}
          intensity={2.0}
          color="#a0c0ff"
          angle={0.5}
          penumbra={1}
          castShadow={false}
        />

        {/* Model */}
        <Tower
          onSelect={handleSelect}
          onHover={setIsHovered}
          cameraStateRef={cameraStateRef}
        />

        <Environment preset="night" blur={0.8} background={false} />

        {/* Post Processing: SMAA for Anti-Aliasing (Fix Dancing Pixels) */}
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <SMAA />
          <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay for Back/Instructions can go here */}
    </div>
  );
}
