'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Cloud, Clouds, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import { Vector3, MeshLambertMaterial } from 'three';
import Tower from './Tower';
import Loader from './Loader';
import Onboarding from './Onboarding';
import CompanyDirectory from './CompanyDirectory';

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
    // Higher interpolation steps to eliminate lag/inertia
    const step = isFocused ? 0.12 : 0.8;
    const currentPos = cameraStateRef.current.pos;
    const currentLookAt = cameraStateRef.current.lookAt;

    if (isFocused) {
      currentPos.lerp(targetPos, step);
      currentLookAt.lerp(lookAtPos, step);
    } else {
      // SLOW IDLE ROTATION
      // Increment angle slowly when the user is not actively dragging or focused
      if (!isDragging.current) {
        targetAngle.current += delta * 0.05; 
      }

      // Higher lerp for immediate response
      const scrollLerp = 0.95;
      scrollY.current += (targetScrollY.current - scrollY.current) * scrollLerp;

      const angleLerp = 0.95;
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Reference to the CSS background container for scroll parallax
  const bgRef = useRef<HTMLDivElement>(null);

  // Use a ref to track if we've already opened the website for the current selection
  // Also using a state to force re-render for the overlay since ref changes don't trigger render
  const websiteOpened = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // isExiting: true when returning from company page – drives fade-in and reverse camera animation
  const [isExiting, setIsExiting] = useState(false);

  // Shared Camera State for smooth transitions & exit animations
  const initialRadius = isMobile ? 150 : 110;
  const cameraStateRef = useRef({
    pos: new Vector3(initialRadius, 90, initialRadius),
    lookAt: new Vector3(0, 5, 0)
  });

  // Detect ?exit=ID → trigger exit animation (fade from black, camera push outward)
  useEffect(() => {
    // Also trigger onboarding check on mount
    if (!localStorage.getItem('hasSeenTowerGuide')) {
      setShowOnboarding(true);
    }

    const url = new URL(window.location.href);
    const exitId = url.searchParams.get('exit');
    if (exitId) {
      // Start fully black, then fade out
      setIsExiting(true);
      // After a brief moment let the scene mount, then fade to transparent
      const fadeTimer = setTimeout(() => setIsExiting(false), 1200);
      return () => clearTimeout(fadeTimer);
    }
  }, []);

  const handleSelect = (meshName: string, worldPos?: Vector3) => {
    const company = getCompanyByMesh(meshName);
    websiteOpened.current = false; // Reset on new selection attempt
    setIsTransitioning(false);

    if (worldPos && company) {
      // CALCULATION FOR PORTAL PENETRATION
      // Use purely horizontal direction towards the tower axis for a better "door entry" feel
      const horizontalDir = new Vector3(worldPos.x, 0, worldPos.z).normalize();
      
      // Move 10 units "inward" towards the central axis
      const portalTarget = worldPos.clone().add(horizontalDir.multiplyScalar(-10.0));

      setCameraTarget(portalTarget);

      // Look EXACTLY at the center
      setLookTarget(worldPos);
      setIsFocused(true);

      // REDIRECT LOGIC
      if (company.id) {
        // Trigger fade out slightly before arrival
        setTimeout(() => {
          setIsTransitioning(true); // Trigger fade to black
        }, 700);

        setTimeout(() => {
          router.push(`/company/${company.id}`);
        }, 1100); 
      }
    }
  };

  return (
    <div className="w-full h-screen bg-[#333] relative overflow-hidden">

      {/* Interactive User Guide (Appears on first visit after loading completes) */}
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      {/* Transition Overlay (Fade to Black on Entry, Fade from Black on Exit) */}
      <div
        className={`absolute inset-0 z-40 bg-black pointer-events-none transition-opacity duration-700 ease-in-out ${
          isTransitioning ? 'opacity-100' : isExiting ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Animated Night Sky Background (Behind Canvas) */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-slate-400 overflow-hidden pointer-events-none"
      >
        {/* Layer 1: Atmospheric Slate Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#64748b] via-[#94a3b8] to-[#cbd5e1]" />
        
        {/* Layer 2: Moving Clouds (Back) */}
        <div className="absolute inset-0 bg-clouds-1 opacity-60 mix-blend-multiply" />
        
        {/* Layer 3: Removed Stars Overlay */}

        {/* Layer 4: Moving Clouds (Front) */}
        <div className="absolute inset-0 bg-clouds-2 opacity-50 mix-blend-multiply" />
      </div>

      <Canvas
        className="z-10 relative"
        shadows={false} 
        dpr={[1, 2]} // Support high-resolution screens for significantly smoother edges
        gl={{
          antialias: true, // Enable antialiasing for smoother volumetric cloud transitions
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ touchAction: 'none' }}
      >
        {/* Fog color matched to the atmospheric slate sky color to blend seamlessly */}
        <fogExp2 attach="fog" args={['#94a3b8', 0.003]} />

        <CinematicCamera
          targetPos={cameraTarget}
          lookAtPos={lookTarget}
          isFocused={isFocused}
          isHovered={isHovered}
          isMobile={isMobile}
          cameraStateRef={cameraStateRef}
          bgRef={bgRef}
        />

        {/* Daylight Lighting Setup - Clean and Misty */}
        <ambientLight intensity={1.2} color="#ffffff" />

        <spotLight
          position={[60, 100, 60]}
          angle={0.4}
          penumbra={1}
          intensity={2.0}
          color="#ffffff"
          castShadow={false}
        />

        {/* Secondary Fill Lights */}
        {!isMobile && (
          <>
            <pointLight position={[-60, 40, -60]} intensity={1.5} color="#e2e8f0" distance={150} />
            <pointLight position={[50, -20, 50]} intensity={1.0} color="#cbd5e1" distance={150} />
          </>
        )}

        {/* Restore Environment using LOCAL asset to prevent 'Failed to fetch' runtime errors */}
        <Environment files="/potsdamer_platz_1k.hdr" blur={0.6} background={false} resolution={256} />

        {/* Volumetric Clouds (Realistic Mixed White/Gray Cloud Blanket) */}
        <Clouds material={MeshLambertMaterial}>
          {/* Layer 1: Massive Background Misty Blanket (Pure White for light source) */}
          <Cloud 
            segments={isMobile ? 80 : 150} 
            bounds={[400, 40, 400]} 
            volume={350} 
            color="#ffffff" 
            opacity={0.8} 
            speed={0.03} // Slowed down for smooth majestic drift
            position={[0, 40, -180]} 
          />
          
          {/* Layer 2: Mid-range Darker Cloud Masses (Dark Gray) */}
          <Cloud 
            segments={isMobile ? 60 : 120} 
            bounds={[300, 30, 300]} 
            volume={250} 
            color="#999999" 
            opacity={0.7} 
            speed={0.04} 
            position={[-50, 60, -80]} 
          />

          {/* Layer 3: Massive Foreground Misty Drift (Light Gray - Moving in front) */}
          <Cloud 
            segments={isMobile ? 100 : 200} 
            bounds={[300, 50, 300]} 
            volume={300} 
            color="#cccccc" 
            opacity={0.75} 
            speed={0.1} // Slowed down for smooth majestic drift
            position={[0, -20, 100]} 
          />
        </Clouds>


        <Suspense fallback={null}>
            <Tower onSelect={handleSelect} onHover={setIsHovered} cameraStateRef={cameraStateRef} isMobile={isMobile} />
        </Suspense>

      </Canvas>
      <div className={`absolute top-0 left-0 p-6 md:p-12 text-slate-800 pointer-events-none z-10 transition-all duration-1000 ${isFocused ? 'opacity-0 blur-sm translate-x-[-20px]' : 'opacity-100'}`}>
        <div className="space-y-1">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-[#b48a04] font-bold">
            Corporate Interactive Experience
          </p>
          <div className="py-2 animate-fade-in">
            <img 
              src="/logos/Arabian Holding Group - Iraq.png" 
              alt="Arabian Holding Group" 
              className="h-10 md:h-14 lg:h-16 w-auto object-contain filter grayscale brightness-50 contrast-150 drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
            />
          </div>
        </div>
        <div className="mt-4 md:mt-6 flex items-center space-x-4">
          <div className="h-[1px] w-8 md:w-12 bg-slate-400"></div>
          <p className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 font-light">
            {isMobile ? 'Tap Company to Enter' : 'Select Company to Enter'}
          </p>
        </div>
      </div>
      {/* HUD: Directory Toggle Button and List */}
      <CompanyDirectory />
    </div>
  );
}

