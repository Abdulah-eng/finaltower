'use client';

import { useGLTF, Octahedron, Html, Sparkles } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Mesh, Vector3, MeshStandardMaterial, DoubleSide, Color, PointLight, BoxGeometry, MeshBasicMaterial, Euler } from 'three';
import { useFrame } from '@react-three/fiber';
import { getCompanyByMesh, getCompanyById, Company, fetchCompanies } from '../data/companies';
import { useRouter, useSearchParams } from 'next/navigation';

interface TowerProps {
    onSelect: (name: string, position?: Vector3) => void;
    onHover: (hovered: boolean) => void;
    cameraStateRef?: React.MutableRefObject<{ pos: Vector3; lookAt: Vector3 } | null>;
    isMobile?: boolean;
}

export default function Tower({ onSelect, onHover, cameraStateRef, isMobile = false }: TowerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    // MEMORY OPT: Always use colleseum_final.glb — the mobile GLB was actually 37% LARGER
    // (10.76MB vs 7.83MB) so it offered no benefit. One model = less total RAM.
    const modelPath = '/models/colleseum_final.glb';
    const gltf = useGLTF(modelPath);
    // MEMORY OPTIMIZATION: Use gltf.scene directly instead of cloning (clone doubled all geometry in RAM)
    // We track modifications via refs and clean up on unmount instead.
    const scene = gltf.scene;
    // Track meshes we've hidden so we can restore them on unmount
    const hiddenMeshes = useRef<Set<Mesh>>(new Set());
    const addedObjects = useRef<any[]>([]);

    const [beacons, setBeacons] = useState<{ id: string; position: Vector3; rotation: [number, number, number]; meshName: string; hasVerticalPartner: boolean }[]>([]);
    const [companiesList, setCompaniesList] = useState<Company[]>([]);
    const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

    // Store meshes by company ID for efficient access
    const meshesByCompanyRef = useRef<Record<string, Mesh[]>>({});
    useEffect(() => {
        const loadCompanies = async () => {
            const data = await fetchCompanies();
            setCompaniesList(data);
        };
        loadCompanies();
    }, []);

    // Setup materials, interaction, and hotspots
    useEffect(() => {
        if (companiesList.length === 0) return;

        const companyMeshes: Mesh[] = [];
        const meshesByCompany: Record<string, Mesh[]> = {};
        const newBeacons: { id: string; position: Vector3; rotation: [number, number, number]; meshName: string; hasVerticalPartner: boolean }[] = [];

        let doorTemplate: Mesh | null = null;
        const allMeshes: Mesh[] = [];

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

                // PASS 1.1: Identify door meshes for template and hiding
                if (child.name.toLowerCase().includes('door')) {
                    if (!doorTemplate) {
                        doorTemplate = child;
                    }
                    // Hide original clustered doors
                    child.visible = false;
                    child.raycast = () => {};
                    hiddenMeshes.current.add(child);
                }

                allMeshes.push(child);

                const company = getCompanyByMesh(child.name);
                if (company) {
                    companyMeshes.push(child);
                    if (!meshesByCompany[company.id]) meshesByCompany[company.id] = [];
                    meshesByCompany[company.id].push(child);
                }
            }
        });

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

        // Pass 2: Create Beacons & Virtual Doors for ALL 17 companies based on beaconPosition
        companiesList.forEach(company => {
            if (!company.beaconPosition) return;
            
            const pos = new Vector3(company.beaconPosition[0], company.beaconPosition[1], company.beaconPosition[2]);
            // Calculate rotation to face OUTWARD from the tower center
            const angleY = Math.atan2(pos.x, pos.z);

            newBeacons.push({
                id: company.id,
                position: pos,
                rotation: [0, angleY, 0],
                meshName: company.meshNames[0],
                hasVerticalPartner: false
            });
        });

        setBeacons(newBeacons);
        
        // Expose the door template to the state so Beacons can use it
        if (doorTemplate) {
            (window as any)._doorTemplate = {
                geometry: (doorTemplate as Mesh).geometry,
                material: (doorTemplate as Mesh).material
            };
        }


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

    }, [scene, searchParams, companiesList]);

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
        const findByMesh = (name: string) => companiesList.find(c => c.meshNames.includes(name));
        const findById = (id: string) => companiesList.find(c => c.id === id);
        
        const company = findByMesh(meshName) || (e.object.userData?.companyId ? findById(e.object.userData.companyId) : null);

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
        const meshName = e.object.name;
        const findByMesh = (name: string) => companiesList.find(c => c.meshNames.includes(name));
        const findById = (id: string) => companiesList.find(c => c.id === id);
        
        const company = findByMesh(meshName) || (e.object.userData?.companyId ? findById(e.object.userData.companyId) : null);

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
            {/* Render 3D Glowing Beacons & Virtual Doors over virtual positions */}
            {beacons.map((beacon) => (
                <Beacon 
                    key={`beacon-${beacon.id}`} 
                    position={beacon.position} 
                    rotation={beacon.rotation as [number, number, number]}
                    company={companiesList.find(c => c.id === beacon.id)!} 
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
                    const company = companiesList.find(c => c.id === beacon.id);
                    if (company) {
                        // All companies now use the exact beacon.position for camera targeting
                        // Since we have Virtual Doors, this ensures the camera stays aligned with the logo
                        onSelect(company.meshNames[0], beacon.position);
                    }
                }} />
            ))}
        </group>
    );
}

// Beacon Component for Animation & Context-Aware Labels
function Beacon({ position, rotation, company, meshName, hasVerticalPartner, isMobile, onHover, onClick }: { 
    position: Vector3, 
    rotation: [number, number, number],
    company: Company, 
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
    const isMother = company.id === 'arabian_holding_group';

    useFrame((state) => {
        if (meshRef.current) {
            // Hover up and down
            const floatingY = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2;
            // Only move the label/hotspot group, keep the door static or slightly moving?
            // User said "logos exactly on doors", so if the logo moves, the door should too?
            // Actually, keep the door static for a more solid feel.
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;

            // --- CONTEXT-AWARE LABEL LOGIC ---
            if (labelRef.current) {
                const camera = state.camera;

                // 1. Calculate Distance (Use world position prop)
                const dist = camera.position.distanceTo(position);

                // 2. Calculate Angle (Are we looking at it?)
                // Vector from camera to beacon
                const toBeacon = position.clone().sub(camera.position).normalize();

                // Camera's forward vector
                const cameraForward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

                // Dot product: 1 means looking directly at it, < 0 means it's behind us
                const dot = cameraForward.dot(toBeacon);

                // MATHEMATICAL OCCLUSION
                const beaconWorldDir = new Vector3(position.x, 0, position.z).normalize();
                const cameraWorldDir = new Vector3(camera.position.x, 0, camera.position.z).normalize();
                
                // Front-facing check: Is the beacon on the half-cylinder facing the camera?
                const isFrontFacing = beaconWorldDir.dot(cameraWorldDir) > 0.0;

                // SPECIAL EXCEPTION: Logos on the ROOF (y > 75) should be visible from more angles 
                // because they aren't occluded by the tower walls at the same level.
                const isRoofLogo = position.y > 75;

                let targetOpacity = 0;

                // STRICTER visibility threshold to eliminate overlaps
                const maxDist = isMobile ? 180 : 150;
                const dotThreshold = isMobile ? 0.6 : 0.7; // Relaxed from 0.85

                if ((isFrontFacing || isRoofLogo) && dist < maxDist && dot > dotThreshold) {
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
                    // Prevent black artifacts by hiding completely when target is 0
                    labelRef.current.style.visibility = roundedTarget > 0.05 ? 'visible' : 'hidden';
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

    // Access door template from window (hack to avoid passing props through many layers)
    const doorTemplate = (window as any)._doorTemplate;

    return (
        <group position={position} rotation={rotation}>
            {/* Virtual Door Mesh */}
            {doorTemplate && (
                <mesh 
                    geometry={doorTemplate.geometry} 
                    material={doorTemplate.material}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(false); }}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                />
            )}

            <group ref={meshRef as any}>
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
            {isMother && (
                <Sparkles count={40} scale={5} size={6} speed={0.4} opacity={0.8} color="#d4af37" />
            )}
            </group>

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
                        <div className={`p-2 bg-white/10 backdrop-blur-xl rounded-xl border ${isMother ? 'border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.6)]' : 'border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'} flex flex-col items-center justify-center ${isMother ? 'min-w-[140px] min-h-[80px]' : 'min-w-[80px] min-h-[50px]'} relative overflow-hidden group hover:border-[#d4af37]/50 transition-all duration-300`}>
                            {/* Subtle shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
                            
                            {isMother && (
                                <div className="flex flex-col items-center mb-1">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(212,175,55,1)]">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#d4af37" fillOpacity="0.5"/>
                                    </svg>
                                    <span className="text-[#d4af37] text-[11px] font-bold tracking-widest uppercase mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Mother Company</span>
                                </div>
                            )}

                            {/* Company Logo Image - Original Colors */}
                            <img 
                                src={company.logo} 
                                alt={company.name} 
                                loading="lazy"
                                decoding="async"
                                className={`${isMother ? 'w-[160px] h-[70px]' : 'w-[120px] h-[50px]'} object-contain drop-shadow-md transition-all duration-300`} 
                            />
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// Preload the main model
useGLTF.preload('/models/colleseum_final.glb');
// MEMORY OPT: Door GLBs are loaded on-demand, not preloaded, to reduce peak memory.
