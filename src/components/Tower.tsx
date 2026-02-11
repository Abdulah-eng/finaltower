'use client';

import { useGLTF } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { Mesh, Vector3, MeshStandardMaterial, DoubleSide, Color, PointLight, BoxGeometry, MeshBasicMaterial } from 'three';
import { getCompanyByMesh, getCompanyById } from '../data/companies';

interface TowerProps {
    onSelect: (name: string, position?: Vector3) => void;
    onHover: (hovered: boolean) => void;
}

import { useRouter, useSearchParams } from 'next/navigation';

interface TowerProps {
    onSelect: (name: string, position?: Vector3) => void;
    onHover: (hovered: boolean) => void;
    cameraStateRef?: React.MutableRefObject<{ pos: Vector3; lookAt: Vector3 } | null>;
}

export default function Tower({ onSelect, onHover, cameraStateRef }: TowerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    // OPTIMIZED MODEL: ~8.2MB (Draco + 1024px Textures)
    const { scene } = useGLTF('/models/colleseum_final.glb');

    // Debug: Check distinct materials
    useEffect(() => {
        const uniqueMaterials = new Set();
        scene.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                const mat = Array.isArray(child.material) ? child.material[0] : child.material;
                uniqueMaterials.add(mat.name || mat.uuid);
            }
        });
        console.log("Unique Materials Found:", uniqueMaterials.size, uniqueMaterials);
    }, [scene]);

    const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

    // Setup materials, interaction, and hotspots
    // Store meshes by company ID for efficient access (avoids traversing scene on every hover)
    const meshesByCompanyRef = useRef<Record<string, Mesh[]>>({});

    // Setup materials, interaction, and hotspots
    useEffect(() => {
        const allMeshes: Mesh[] = [];
        const companyMeshes: Mesh[] = [];
        const meshesByCompany: Record<string, Mesh[]> = {};

        // Pass 1: Collect meshes and identify explicit doors
        scene.traverse((child) => {
            if (child instanceof Mesh) {
                // Fix "Dancing Pixels": Force Anisotropy
                if (child.material) {
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

                child.castShadow = true;
                child.receiveShadow = true;
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
            }
        });

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

                // Clear the param so it doesn't happen again on refresh? 
                // Actually, next/navigation router.replace might be good, but maybe overkill.
                // The animation will drift back anyway.
            }
        }

    }, [scene, searchParams]); // Add searchParams dependency

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

    return (
        <primitive
            object={scene}
            onPointerOver={(e: any) => {
                e.stopPropagation();
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
            }}
            onPointerOut={(e: any) => {
                e.stopPropagation();

                const meshName = e.object.name;
                const company = getCompanyByMesh(meshName) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);

                if (company) {
                    setHoveredMesh(null);
                    document.body.style.cursor = 'auto';
                    onHover(false);
                    setHighlight(company.id, false);
                }
            }}
            onClick={(e: any) => {
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
            }}
        />
    );
}

useGLTF.preload('/models/colleseum_final.glb');
