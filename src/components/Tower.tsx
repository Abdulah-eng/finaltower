'use client';

import { useGLTF, Octahedron, Html } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Mesh, Vector3, MeshStandardMaterial, DoubleSide, Color, PointLight, BoxGeometry, MeshBasicMaterial, Euler } from 'three';
import { useFrame } from '@react-three/fiber';
import { getCompanyByMesh, getCompanyById } from '../data/companies';
import { useRouter, useSearchParams } from 'next/navigation';
import Door from './Door';

interface TowerProps {
    onSelect: (name: string, position?: Vector3) => void;
    onHover: (hovered: boolean) => void;
    cameraStateRef?: React.MutableRefObject<{ pos: Vector3; lookAt: Vector3 } | null>;
    isMobile?: boolean;
}

export default function Tower({ onSelect, onHover, cameraStateRef, isMobile = false }: TowerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    // OPTIMIZED MODEL LOAD:
    // Mobile: Load 512px textured, simplified model
    // Desktop: Load full quality
    const modelPath = isMobile ? '/models/colleseum_mobile.glb' : '/models/colleseum_final.glb';
    const gltf = useGLTF(modelPath);
    // CLONE SCENE to avoid polluting the global cache with our modifications (hotspots, hidden meshes)
    // This ensures every visit starts fresh.
    const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

    const [customDoors, setCustomDoors] = useState<{ id: string; modelId: string; position: Vector3; rotation: Euler; scale: Vector3 }[]>([]);
    const [beacons, setBeacons] = useState<{ id: string; position: Vector3 }[]>([]);

    // Debug: Check distinct materials
    useEffect(() => {
        // ... (keep existing debug log if needed, or remove) ...
    }, [scene]);

    const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

    // Setup materials, interaction, and hotspots
    // Store meshes by company ID for efficient access
    const meshesByCompanyRef = useRef<Record<string, Mesh[]>>({});

    // Setup materials, interaction, and hotspots
    useEffect(() => {
        const allMeshes: Mesh[] = [];
        const companyMeshes: Mesh[] = [];
        const meshesByCompany: Record<string, Mesh[]> = {};
        const newCustomDoors: { id: string; modelId: string; position: Vector3; rotation: Euler; scale: Vector3 }[] = [];
        const newBeacons: { id: string; position: Vector3 }[] = [];

        // Pass 1: Collect meshes and identify explicit doors
        scene.traverse((child) => {
            if (child instanceof Mesh) {
                // Fix "Dancing Pixels": Force Anisotropy
                if (!isMobile && child.material) {
                    const applyAnisotropy = (mat: any) => {
                        if (mat.map) mat.map.anisotropy = 16;
                        if (mat.emissiveMap) mat.emissiveMap.anisotropy = 16;
                        if (mat.normalMap) mat.normalMap.anisotropy = 16;
                        if (mat.roughnessMap) mat.roughnessMap.anisotropy = 16;
                        if (mat.metalnessMap) mat.metalnessMap.anisotropy = 16;
                    };
                    if (Array.isArray(child.material)) {
                        child.material.forEach(applyAnisotropy);
                    } else {
                        applyAnisotropy(child.material);
                    }
                }

                if (!isMobile) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                allMeshes.push(child);

                const company = getCompanyByMesh(child.name);
                if (company) {
                    companyMeshes.push(child);
                    if (!meshesByCompany[company.id]) meshesByCompany[company.id] = [];
                    meshesByCompany[company.id].push(child);

                    // CUSTOM DOOR LOGIC (Desktop Only)
                    if (!isMobile && company.doorModel && company.meshNames.includes(child.name)) {
                        if (child.name === company.meshNames[0]) {
                            child.visible = false; // Hide original

                            // Prevent duplicates: Only add one door per company
                            // (In case multiple meshes share the same name or logic triggers twice)
                            const isDuplicate = newCustomDoors.some(d => d.id === company.id);
                            if (!isDuplicate) {
                                // INCREASE GEOMETRY: Multiply the scale so the door pops out of the archway
                                const enlargedScale = child.scale.clone().multiplyScalar(1.15); // 15% larger

                                newCustomDoors.push({
                                    id: company.id,
                                    modelId: company.doorModel,
                                    position: child.getWorldPosition(new Vector3()), // Use World Position
                                    rotation: child.rotation.clone(),
                                    scale: enlargedScale
                                });
                            }
                        } else {
                            child.visible = false;
                        }
                    }
                }
            }
        });

        setCustomDoors(newCustomDoors);

        // Pass 2: Proximity check for orphans
        allMeshes.forEach(child => {
            let company = getCompanyByMesh(child.name);

            if (!company) {
                // Check if close to any known door
                for (const door of companyMeshes) {
                    if (child.getWorldPosition(new Vector3()).distanceTo(door.getWorldPosition(new Vector3())) < 3.0) {
                        company = getCompanyByMesh(door.name);
                        if (company) {
                            // It's an orphan part of this company
                            if (!meshesByCompany[company.id]) meshesByCompany[company.id] = [];
                            meshesByCompany[company.id].push(child);

                            // Hack: Assign name so getCompanyByMesh works on it later (for click handlers)
                            child.name = door.name;
                        }
                        break;
                    }
                }
            }

            // Interaction optimization: disable raycast for non-company meshes
            if (!company) {
                child.raycast = () => { };
            }
        });

        // Pass 3: Create Invisible Hotspots & Lights centered on the door group
        Object.entries(meshesByCompany).forEach(([companyId, meshes]) => {
            if (meshes.length === 0) return;

            // Calculate Centroid
            const center = new Vector3();
            meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
            center.divideScalar(meshes.length);

            // Create Hotspot
            const hotspotName = `hotspot_${companyId}`;
            // Check if already exists (safeguard for React strict mode / re-renders)
            if (!scene.getObjectByName(hotspotName)) {
                // Invisible Box for clicking the gap
                const geometry = new BoxGeometry(4, 5, 2); // W:4, H:5, D:2 (covers door + gap)
                const material = new MeshBasicMaterial({ visible: false }); // Invisible
                const hotspot = new Mesh(geometry, material);

                hotspot.name = hotspotName;
                hotspot.position.copy(center);

                // Also give it a 'DoorGlow' light
                const light = new PointLight('#ffaa00', 1.5, 12);
                light.position.set(0, 0, 2); // Offset relative to hotspot center
                hotspot.add(light);

                scene.add(hotspot);

                hotspot.userData.companyId = companyId;
                hotspot.userData.isHotspot = true;

                // Beacon Position: above the centroid / door
                const beaconPos = center.clone();
                beaconPos.y += 2.0; // adjust height above door
                newBeacons.push({
                    id: companyId,
                    position: beaconPos
                });
            }
        });

        setBeacons(newBeacons);

        // Update ref
        meshesByCompanyRef.current = meshesByCompany;

        // EXIT ANIMATION LOGIC
        // If we returned from a company page (?exit=ID), snap camera to that door
        const exitId = searchParams.get('exit');
        if (exitId && meshesByCompany[exitId] && cameraStateRef && cameraStateRef.current) {
            const meshes = meshesByCompany[exitId];
            if (meshes.length > 0) {
                // Calculate Centroid (Door Position)
                const center = new Vector3();
                meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
                center.divideScalar(meshes.length);

                // Calculate "Portal" Position (Camera Start)
                // Same logic as entry: Move INSIDE (-8.0)
                const direction = center.clone().normalize();
                const startPos = center.clone().add(direction.multiplyScalar(-8.0));

                // SNAP CAMERA
                cameraStateRef.current.pos.copy(startPos);
                cameraStateRef.current.lookAt.copy(center);
            }
        }

    }, [scene, searchParams]);

    // Helper to Apply Highlight to ALL meshes of a company
    const setHighlight = (companyId: string, active: boolean) => {
        const meshes = meshesByCompanyRef.current[companyId];
        if (!meshes) return;

        meshes.forEach((obj) => {
            // Skip hotspots
            if (obj.userData.isHotspot) return;

            // Ensure we have stored the original material
            if (!obj.userData.originalMaterial) {
                obj.userData.originalMaterial = obj.material;
            }

            if (active) {
                // Create clone if not exists
                if (!obj.userData.highlightMaterial) {
                    const original = obj.userData.originalMaterial;
                    // Handle array materials (rare but possible) or single
                    const baseMat = Array.isArray(original) ? original[0] : original;

                    const clone = baseMat.clone();
                    // Customize the clone for highlight
                    if (clone.emissive !== undefined) {
                        clone.emissive = new Color('#ffeebb');
                        clone.emissiveIntensity = 2.5;
                    }
                    obj.userData.highlightMaterial = clone;
                }

                // Apply the clone
                obj.material = obj.userData.highlightMaterial;
            } else {
                // Revert to original shared material
                obj.material = obj.userData.originalMaterial;
            }
        });
    };

    const handlePointerOver = (e: any) => {
        e.stopPropagation();
        // EXPENSIVE OPERATION: Disable hover on mobile to prevent re-renders during scroll
        if (isMobile) return;

        // Check name OR userData for hotspot
        const meshName = e.object.name;
        const company = getCompanyByMesh(meshName) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);

        if (company) {
            setHoveredMesh(company.id); // Use ID for stability
            document.body.style.cursor = 'pointer';
            onHover(true);
            setHighlight(company.id, true);

            // PREFETCH for smoother transmission
            router.prefetch(`/company/${company.id}`);
        }
    };

    const handlePointerOut = (e: any) => {
        e.stopPropagation();
        if (isMobile) return;

        const meshName = e.object.name;
        const company = getCompanyByMesh(meshName) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);

        if (company) {
            setHoveredMesh(null);
            document.body.style.cursor = 'auto';
            onHover(false);
            setHighlight(company.id, false);
        }
    };

    const handleClick = (e: any) => {
        e.stopPropagation();
        const company = getCompanyByMesh(e.object.name) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);

        if (!company) return;

        // FIX: Use Centroid instead of e.point to avoid Hotspot Offset Issues
        const meshes = meshesByCompanyRef.current[company.id];
        let targetPoint = e.point;

        if (meshes && meshes.length > 0) {
            const center = new Vector3();
            meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
            center.divideScalar(meshes.length);
            targetPoint = center;
        }

        onSelect(company.meshNames[0], targetPoint);
    };

    return (
        <group>
            <primitive
                object={scene}
                scale={[1, 1, 1]}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            />
            {/* Render Custom Doors (Desktop Only) */}
            {customDoors.map((door) => (
                <Door
                    key={door.id}
                    modelId={door.modelId}
                    position={door.position}
                    rotation={door.rotation}
                    scale={door.scale}
                />
            ))}
            {/* Render 3D Glowing Beacons over doors */}
            {beacons.map((beacon) => (
                <Beacon key={`beacon-${beacon.id}`} position={beacon.position} companyId={beacon.id} onHover={(hover) => {
                    if (hover) {
                        setHoveredMesh(beacon.id);
                        document.body.style.cursor = 'pointer';
                        onHover(true);
                        setHighlight(beacon.id, true);
                    } else {
                        setHoveredMesh(null);
                        document.body.style.cursor = 'auto';
                        onHover(false);
                        setHighlight(beacon.id, false);
                    }
                }} onClick={() => {
                    const company = getCompanyById(beacon.id);
                    if (company) {
                        const meshes = meshesByCompanyRef.current[company.id];
                        let targetPoint = beacon.position;
                        if (meshes && meshes.length > 0) {
                            const center = new Vector3();
                            meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
                            center.divideScalar(meshes.length);
                            targetPoint = center;
                        }
                        onSelect(company.meshNames[0], targetPoint);
                    }
                }} />
            ))}
        </group>
    );
}

// Beacon Component for Animation & Context-Aware Labels
function Beacon({ position, companyId, onHover, onClick }: { position: Vector3, companyId: string, onHover: (h: boolean) => void, onClick: () => void }) {
    const meshRef = useRef<Mesh>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    // Performance: cache the last applied opacity to prevent DOM layout thrashing on mobile
    const lastOpacity = useRef<number>(-1);

    // Get company name safely
    const company = getCompanyById(companyId);

    useFrame((state) => {
        if (meshRef.current) {
            // Spin
            meshRef.current.rotation.y += 0.02;
            // Hover up and down
            const floatingY = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2;
            meshRef.current.position.y = floatingY;

            // --- CONTEXT-AWARE LABEL LOGIC ---
            if (labelRef.current) {
                const camera = state.camera;

                // 1. Calculate Distance
                const dist = camera.position.distanceTo(meshRef.current.position);

                // 2. Calculate Angle (Are we looking at it?)
                // Vector from camera to beacon
                const toBeacon = meshRef.current.position.clone().sub(camera.position).normalize();

                // Camera's forward vector
                const cameraForward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

                // Dot product: 1 means looking directly at it, < 0 means it's behind us
                const dot = cameraForward.dot(toBeacon);

                // Opacity Logic:
                // Full opacity if we are within range (< 180 units to support mobile's wider 150 radius) AND looking loosely towards it (dot > 0.0)
                let targetOpacity = 0;

                // Base visibility threshold - very loose now so it appears sooner
                if (dist < 180 && dot > 0.1) {
                    // Fade in smoothly as we get closer from 180 to 100 units
                    const distFactor = 1.0 - Math.max(0, Math.min(1, (dist - 100) / 80));

                    // Fade in as we look loosely at it (from 0.1 to 0.4 dot product)
                    const angleFactor = Math.max(0, Math.min(1, (dot - 0.1) / 0.3));

                    targetOpacity = distFactor * angleFactor;
                }

                // Give it a significant boost if hovered
                if (hovered) {
                    targetOpacity = Math.max(targetOpacity, 1.0);
                }

                // PERFORMANCE OPTIMIZATION (Fixes Mobile Safari frame drops):
                // Only write to the DOM if the opacity change is visually significant (> 5%) or hitting boundaries (0 or 1)
                const roundedTarget = Math.round(targetOpacity * 20) / 20; // steps of 0.05
                if (Math.abs(lastOpacity.current - roundedTarget) > 0.02) {
                    labelRef.current.style.opacity = roundedTarget.toFixed(2);
                    labelRef.current.style.pointerEvents = roundedTarget > 0.1 ? 'auto' : 'none';
                    lastOpacity.current = roundedTarget;
                }
            }
        }
    });

    return (
        <group position={position}>
            <Octahedron
                ref={meshRef as any}
                args={[0.6, 0]} // Small diamond
                position={[0, 0, 0]} // Local 0, managed by group + useFrame
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(false); }}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
                <meshBasicMaterial color={hovered ? "#ffffff" : "#d4af37"} />
            </Octahedron>

            {/* The Floating Context-Aware Label */}
            {company && (
                <Html
                    position={[0, 1.2, 0]} // Exactly above the diamond
                    center
                    distanceFactor={40}
                    zIndexRange={[100, 0]}
                    className="beacon-label-container"
                >
                    <div
                        ref={labelRef}
                        className="flex flex-col items-center justify-center transition-opacity duration-100 cursor-pointer"
                        style={{ opacity: 0, pointerEvents: 'none' }} // Starts hidden
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); }}
                        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(false); }}
                    >
                        {/* Premium label styling */}
                        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded border-b-2 border-[#d4af37] text-[12px] sm:text-[14px] text-white/90 whitespace-nowrap font-serif tracking-widest shadow-2xl relative overflow-hidden">
                            {/* Subtle shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                            {company.name}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// Preload both variants
useGLTF.preload('/models/colleseum_final.glb');
useGLTF.preload('/models/colleseum_mobile.glb');

// Preload all custom door models to fix load times
useGLTF.preload('/models/doors/OP1.glb');
useGLTF.preload('/models/doors/OP3.glb');
useGLTF.preload('/models/doors/OP4.glb');
useGLTF.preload('/models/doors/PWR1.glb');
useGLTF.preload('/models/doors/PWR3.glb');
useGLTF.preload('/models/doors/PWR4.glb');
useGLTF.preload('/models/doors/SP1.glb');
useGLTF.preload('/models/doors/SP3.glb');
useGLTF.preload('/models/doors/SP4.glb');
