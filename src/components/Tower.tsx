'use client';

import { useGLTF } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { Mesh, Vector3, MeshStandardMaterial, DoubleSide, Color, PointLight, BoxGeometry, MeshBasicMaterial } from 'three';
import { getCompanyByMesh, getCompanyById } from '../data/companies';

interface TowerProps {
    onSelect: (name: string, position?: Vector3) => void;
    onHover: (hovered: boolean) => void;
}

export default function Tower({ onSelect, onHover }: TowerProps) {
    // OPTIMIZED MODEL: ~3MB (Draco Compressed)
    const { scene } = useGLTF('/models/colleseum_draco.glb');
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

                // Pass the interaction point (or centroid if it's a hotspot/gap click)
                const intersectionPoint = e.point;
                onSelect(company.meshNames[0], intersectionPoint);
            }}
        />
    );
}

useGLTF.preload('/models/colleseum_draco.glb');
