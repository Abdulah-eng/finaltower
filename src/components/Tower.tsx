'use client';

import { useGLTF } from '@react-three/drei';
import { useState, useEffect } from 'react';
import { Mesh, Vector3, MeshStandardMaterial, DoubleSide, Color, PointLight, BoxGeometry, MeshBasicMaterial } from 'three';
import { getCompanyByMesh, getCompanyById } from '../data/companies';

interface TowerProps {
    onSelect: (name: string, position?: Vector3) => void;
    onHover: (hovered: boolean) => void;
}

export default function Tower({ onSelect, onHover }: TowerProps) {
    // OPTIMIZED MODEL: 11.5MB (vs 140MB+)
    const { scene } = useGLTF('/models/colleseum_optimized.glb');
    const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

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

            // Apply Materials
            if (child.material) {
                const originalMaterial = Array.isArray(child.material) ? child.material[0] : child.material;
                const material = originalMaterial.clone();
                child.material = material;

                if ((material as any).isMeshStandardMaterial) {
                    const standardMat = material as MeshStandardMaterial;
                    standardMat.side = DoubleSide;

                    if (company) {
                        // DOOR MATERIAL
                        standardMat.metalness = 0.8;
                        standardMat.roughness = 0.2;
                        standardMat.emissive = new Color('#d4af37');
                        standardMat.emissiveIntensity = 0.6;
                        standardMat.color = new Color('#1a1a1a');
                    } else {
                        // STRUCTURE MATERIAL
                        standardMat.map = null;
                        standardMat.color = new Color('#444444');
                        standardMat.metalness = 0.1;
                        standardMat.roughness = 0.8;
                        standardMat.envMapIntensity = 0.5;
                        standardMat.emissive = new Color('#000000');
                        standardMat.emissiveIntensity = 0;
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
                // Position at centroid. 
                // Note: The centroid is world pos. If scene is at 0,0,0, this works. 
                // If scene is transformed, might need local conversion. Assuming scene root identity.
                hotspot.position.copy(center);

                // Also give it a 'DoorGlow' light
                const light = new PointLight('#ffaa00', 1.5, 12);
                light.position.set(0, 0, 2); // Offset relative to hotspot center
                hotspot.add(light);

                scene.add(hotspot);

                // IMPORTANT: Make sure getCompanyByMesh finds this hotspot too!
                // We can't easily change getCompanyByMesh logic since it relies on static list.
                // We will rely on Event Handler logic to look up company by ID if name matches special pattern?
                // OR: We give it a name that getCompanyByMesh recognizes?
                // Example: Pick the first mesh name from the group.
                hotspot.name = meshes[0].name;
                // WARNING: This might confuse 'meshesByCompany' loop if we run this multiple times? 
                // But we check getObjectByName(hotspotName) ... wait, if we name it meshes[0].name, we can't find it by hotspotName.
                // Use a userData field instead?
                hotspot.userData.companyId = companyId;
                hotspot.userData.isHotspot = true;
            }
        });

    }, [scene]);

    // Helper to Apply Highlight to ALL meshes of a company
    const setHighlight = (companyId: string, active: boolean) => {
        scene.traverse((obj) => {
            if (obj instanceof Mesh) {
                const c = getCompanyByMesh(obj.name) || (obj.userData.companyId ? getCompanyById(obj.userData.companyId) : null);
                if (c && c.id === companyId) {
                    // It's part of the company. Highlight it (unless it's the invisible hotspot)
                    if (obj.userData.isHotspot) return;

                    const mat = obj.material as MeshStandardMaterial;
                    if (mat && mat.emissiveIntensity !== undefined) {
                        if (active) {
                            mat.emissiveIntensity = 2.5;
                            mat.emissive = new Color('#ffeebb');
                        } else {
                            mat.emissiveIntensity = 0.6;
                            mat.emissive = new Color('#d4af37');
                        }
                    }
                }
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

useGLTF.preload('/models/colleseum_optimized.glb');
