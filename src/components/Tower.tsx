'use client';

import { useGLTF, Octahedron, Html } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Mesh, Vector3, MeshStandardMaterial, DoubleSide, Color, PointLight, BoxGeometry, MeshBasicMaterial, Euler } from 'three';
import { useFrame } from '@react-three/fiber';
import { getCompanyByMesh, getCompanyById, companies } from '../data/companies';
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
    const modelPath = isMobile ? '/models/colleseum_mobile.glb' : '/models/colleseum_final.glb';
    const gltf = useGLTF(modelPath);
    // MEMORY OPTIMIZATION: Use gltf.scene directly instead of cloning (clone doubled all geometry in RAM)
    // We track modifications via refs and clean up on unmount instead.
    const scene = gltf.scene;
    // Track meshes we've hidden so we can restore them on unmount
    const hiddenMeshes = useRef<Set<Mesh>>(new Set());
    const addedObjects = useRef<any[]>([]);

    const [customDoors, setCustomDoors] = useState<{ id: string; modelId: string; position: Vector3; rotation: Euler; scale: Vector3 }[]>([]);
    const [beacons, setBeacons] = useState<{ id: string; position: Vector3; meshName: string; hasVerticalPartner: boolean }[]>([]);

    const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

    // Store meshes by company ID for efficient access
    const meshesByCompanyRef = useRef<Record<string, Mesh[]>>({});

    // Setup materials, interaction, and hotspots
    useEffect(() => {
        const allMeshes: Mesh[] = [];
        const companyMeshes: Mesh[] = [];
        const meshesByCompany: Record<string, Mesh[]> = {};
        const newCustomDoors: { id: string; modelId: string; position: Vector3; rotation: Euler; scale: Vector3 }[] = [];
        const newBeacons: { id: string; position: Vector3; meshName: string; hasVerticalPartner: boolean }[] = [];

        // Pass 1: Collect meshes and identify explicit doors
        scene.traverse((child) => {
            if (child instanceof Mesh) {
                // MEMORY OPT: Reduce anisotropy from 16->4 (saves significant VRAM)
                if (!isMobile && child.material) {
                    const applyAnisotropy = (mat: any) => {
                        if (mat.map) mat.map.anisotropy = 4;
                        if (mat.emissiveMap) mat.emissiveMap.anisotropy = 4;
                        if (mat.normalMap) mat.normalMap.anisotropy = 4;
                        if (mat.roughnessMap) mat.roughnessMap.anisotropy = 4;
                        if (mat.metalnessMap) mat.metalnessMap.anisotropy = 4;
                    };
                    if (Array.isArray(child.material)) {
                        child.material.forEach(applyAnisotropy);
                    } else {
                        applyAnisotropy(child.material);
                    }
                }

                // MEMORY OPT: Disable shadow casting - shadows generated from a mesh this dense
                // add large shadow map VRAM usage without proportional visual benefit.
                child.castShadow = false;
                child.receiveShadow = false;

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
        // Then use virtual beaconPosition (from companies.ts) for the label, not the mesh centroid.
        Object.entries(meshesByCompany).forEach(([companyId, meshes]) => {
            if (meshes.length === 0) return;
            const firstMesh = meshes[0]?.name || "";

            // Calculate Centroid (for hotspot click target)
            const center = new Vector3();
            meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
            center.divideScalar(meshes.length);

            // Create Hotspot
            const hotspotName = `hotspot_${companyId}`;
            if (!scene.getObjectByName(hotspotName)) {
                const geometry = new BoxGeometry(4, 5, 2);
                const material = new MeshBasicMaterial({ visible: false });
                const hotspot = new Mesh(geometry, material);
                hotspot.name = hotspotName;
                hotspot.position.copy(center);

                const light = new PointLight('#ffaa00', 1.5, 12);
                light.position.set(0, 0, 2);
                hotspot.add(light);
                scene.add(hotspot);
                addedObjects.current.push(hotspot); // Track for cleanup
                hotspot.userData.companyId = companyId;
                hotspot.userData.isHotspot = true;

                // Use virtual beaconPosition if defined, otherwise fall back to mesh centroid
                const company = getCompanyById(companyId);
                let beaconPos: Vector3;
                if (company?.beaconPosition) {
                    beaconPos = new Vector3(company.beaconPosition[0], company.beaconPosition[1], company.beaconPosition[2]);
                } else {
                    beaconPos = center.clone();
                    beaconPos.y += 2.0;
                }

                newBeacons.push({
                    id: companyId,
                    position: beaconPos,
                    meshName: firstMesh,
                    hasVerticalPartner: false
                });
            }
        });

        // Pass 4: Add virtual beacons for companies with beaconPosition but no matched meshes
        companies.forEach(company => {
            if (!company.beaconPosition) return;
            if (meshesByCompany[company.id]) return; // Already handled in Pass 3
            if (newBeacons.some(b => b.id === company.id)) return;

            newBeacons.push({
                id: company.id,
                position: new Vector3(company.beaconPosition[0], company.beaconPosition[1], company.beaconPosition[2]),
                meshName: '',
                hasVerticalPartner: false
            });
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

    // MEMORY: Cleanup added hotspots & restore hidden meshes when component unmounts
    useEffect(() => {
        return () => {
            // Remove hotspots we added to the gltf scene (they'd persist across route changes otherwise)
            addedObjects.current.forEach(obj => {
                if (obj.parent) obj.parent.remove(obj);
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
                    else obj.material.dispose();
                }
            });
            addedObjects.current = [];
            // Restore any hidden meshes
            hiddenMeshes.current.forEach(m => { m.visible = true; });
            hiddenMeshes.current.clear();
        };
    }, [scene]);

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
                <Beacon 
                    key={`beacon-${beacon.id}`} 
                    position={beacon.position} 
                    companyId={beacon.id} 
                    meshName={beacon.meshName}
                    hasVerticalPartner={beacon.hasVerticalPartner}
                    isMobile={isMobile} 
                    onHover={(hover) => {
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
function Beacon({ position, companyId, meshName, hasVerticalPartner, isMobile, onHover, onClick }: { 
    position: Vector3, 
    companyId: string, 
    meshName: string,
    hasVerticalPartner: boolean,
    isMobile: boolean, 
    onHover: (h: boolean) => void, 
    onClick: () => void 
}) {
    const meshRef = useRef<Mesh>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    // Performance: cache values to prevent DOM layout thrashing
    const lastOpacity = useRef<number>(-1);
    const lastZIndex = useRef<number>(-1);

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

                // MATHEMATICAL OCCLUSION (Replaces buggy occlude="blending")
                // Assess if the beacon is on the front side or back side of the tower relative to the camera
                // assessed if the beacon is on the front side or back side of the tower relative to the camera
                const beaconWorldDir = position.clone().normalize(); // Assuming tower is centered at origin [0,0,0]
                const cameraWorldDir = camera.position.clone().normalize();
                
                // STRICTER Front-facing check (acos(0.6)*2 ≈ 106 deg arc)
                const isFrontFacing = beaconWorldDir.dot(cameraWorldDir) > 0.5;

                let targetOpacity = 0;

                // STRICTER visibility threshold to eliminate overlaps
                const maxDist = isMobile ? 180 : 130;
                const dotThreshold = isMobile ? 0.75 : 0.85; 

                if (isFrontFacing && dist < maxDist && dot > dotThreshold) {
                    targetOpacity = 1;
                }

                // Give it a significant boost if hovered
                if (hovered) {
                    targetOpacity = Math.max(targetOpacity, 1.0);
                }

                // PERFORMANCE OPTIMIZATION: Only write to the DOM if the opacity change is visually significant
                const roundedTarget = Math.round(targetOpacity * 20) / 20; 
                if (Math.abs(lastOpacity.current - roundedTarget) > 0.01) {
                    labelRef.current.style.opacity = roundedTarget.toFixed(2);
                    labelRef.current.style.pointerEvents = roundedTarget > 0.1 ? 'auto' : 'none';
                    lastOpacity.current = roundedTarget;
                }

                // --- CONTINUOUS DEPTH SORTING (High Precision) ---
                const currentZIndex = Math.max(0, Math.round((2000 - dist) * 100));
                if (lastZIndex.current !== currentZIndex) {
                    labelRef.current.style.zIndex = currentZIndex.toString();
                    lastZIndex.current = currentZIndex;
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
                visible={false}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(false); }}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
                <meshBasicMaterial color={hovered ? "#ffffff" : "#d4af37"} />
            </Octahedron>

            {/* The Floating Context-Aware Label (Now using Logos instead of Names) */}
            {company && (
                <Html
                    position={[0, 1.2, 0]} // Exactly above the diamond
                    center
                    distanceFactor={40}
                    // REMOVED buggy occlude="blending" which was causing gray boxes and massive lag
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
                        {/* Premium Logo styling (Light frosted glass for original colors) */}
                        <div className="p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center min-w-[80px] min-h-[50px] relative overflow-hidden group hover:border-[#d4af37]/50 transition-colors">
                            {/* Subtle shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
                            
                            {/* Company Logo Image - Original Colors */}
                            <img 
                                src={company.logo} 
                                alt={company.name} 
                                loading="lazy"
                                decoding="async"
                                className="w-[120px] h-[50px] object-contain drop-shadow-md" 
                            />
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// Preload main model variants only
useGLTF.preload('/models/colleseum_final.glb');
useGLTF.preload('/models/colleseum_mobile.glb');
// MEMORY OPT: Door GLBs are loaded on-demand, not preloaded, to reduce peak memory.
