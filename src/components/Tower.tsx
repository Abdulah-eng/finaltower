'use client';

import { useGLTF, Gltf } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Mesh, Vector3, Euler, Color, Group, Object3D, Quaternion } from 'three';
import { getCompanyByMesh, getCompanyById, companies } from '../data/companies';
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

    const [anchors, setAnchors] = useState<Record<string, { position: Vector3, rotation: Euler, scale: Vector3 }>>({});
    const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);
    const meshesByCompanyRef = useRef<Record<string, Mesh[]>>({});

    // Setup: Find anchors, hide originals, and prepare interactions
    useEffect(() => {
        const newAnchors: Record<string, { position: Vector3, rotation: Euler, scale: Vector3 }> = {};
        const meshesByCompany: Record<string, Mesh[]> = {};
        const uniqueMaterials = new Set();

        scene.traverse((child) => {
            // 1. Material & Shadow Setup (Only for Meshes)
            if (child instanceof Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    const mat = Array.isArray(child.material) ? child.material[0] : child.material;
                    uniqueMaterials.add(mat.name || mat.uuid);
                    // Fix "Dancing Pixels": Force Anisotropy
                    if (mat.map) mat.map.anisotropy = 16;
                    if (mat.emissiveMap) mat.emissiveMap.anisotropy = 16;
                    if (mat.normalMap) mat.normalMap.anisotropy = 16;
                    if (mat.roughnessMap) mat.roughnessMap.anisotropy = 16;
                    if (mat.metalnessMap) mat.metalnessMap.anisotropy = 16;
                }
            }

            // 2. Identification (Check ALL Nodes, e.g. Groups or Meshes)
            // Debug: Log ANY node with "door" in the name to find missing ones
            if (child.name.toLowerCase().includes("door")) {
                console.log("Found Door-like Node:", child.name, child.type);
            }

            const company = getCompanyByMesh(child.name);
            if (company) {
                // Determine if we should treat this node as the visual root for the company
                // If it's a Mesh, include it in the mesh list for hover/click
                if (child instanceof Mesh) {
                    if (!meshesByCompany[company.id]) meshesByCompany[company.id] = [];
                    meshesByCompany[company.id].push(child);

                    // Save original material for highlight logic
                    if (!child.userData.originalMaterial) {
                        child.userData.originalMaterial = child.material;
                    }
                }
                child.userData.companyId = company.id;

                // 3. Anchor Extraction & Hiding
                // If this node matches the company name, use IT as the anchor.
                // This covers cases where the "door" is a Group node.
                if (company.modelFile && !newAnchors[company.id]) {
                    // Hide this node (and its children)
                    child.visible = false;

                    // Capture World Transform to be safe against nesting
                    const worldPos = new Vector3();
                    child.getWorldPosition(worldPos);

                    const quat = new Quaternion();
                    child.getWorldQuaternion(quat);
                    const euler = new Euler().setFromQuaternion(quat);

                    const worldScale = new Vector3();
                    child.getWorldScale(worldScale);

                    newAnchors[company.id] = {
                        position: worldPos,
                        rotation: euler,
                        scale: worldScale
                    };
                    console.log(`Phase 2: Found Anchor for ${company.id} on Node "${child.name}"`);
                } else if (company.modelFile) {
                    // Already found anchor, just hide this part too if it matches
                    child.visible = false;
                }
            }
        });

        setAnchors(newAnchors);
        meshesByCompanyRef.current = meshesByCompany;

        console.log("Phase 2: Loaded Anchors", Object.keys(newAnchors).length);
        if (Object.keys(newAnchors).length === 0) {
            console.warn("Phase 2: NO ANCHORS FOUND. Sample Names:", Object.keys(meshesByCompany));
        }

    }, [scene]);

    // Exit Animation Logic (Snap Camera)
    useEffect(() => {
        const exitId = searchParams.get('exit');
        if (exitId && cameraStateRef?.current && meshesByCompanyRef.current[exitId]) {
            const meshes = meshesByCompanyRef.current[exitId];
            if (meshes.length > 0) {
                // Calculate centroid logic...
                const center = new Vector3();
                meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
                center.divideScalar(meshes.length);

                // Snap camera near it
                const offset = center.clone().normalize().multiplyScalar(40);
                const startPos = center.clone().add(offset);
                startPos.y = Math.max(startPos.y, 10);

                cameraStateRef.current.pos.copy(startPos);
                cameraStateRef.current.lookAt.copy(center);
            }
        }
    }, [searchParams, cameraStateRef]);


    // Interaction Handlers (Shared)
    const handleCompanyClick = (e: any, companyId: string) => {
        e.stopPropagation();
        const company = getCompanyById(companyId);
        if (!company) return;

        // Target Calculation: Centroid of Anchor or Click Point
        // For new models, e.point on the new model is accurate.
        // For legacy, we used centroid.
        // Let's use e.point for precision on the new detailed models.
        onSelect(company.meshNames[0], e.point);
    };

    const handleCompanyHover = (e: any, companyId: string, hovering: boolean) => {
        e.stopPropagation();
        if (hovering) {
            setHoveredMesh(companyId);
            document.body.style.cursor = 'pointer';
            onHover(true);
            router.prefetch(`/company/${companyId}`);
        } else {
            setHoveredMesh(null);
            document.body.style.cursor = 'auto';
            onHover(false);
        }
    };

    return (
        <group>
            {/* The Main Tower Structure (with original doors hidden) */}
            <primitive
                object={scene}
                onClick={(e: any) => {
                    e.stopPropagation();
                    const company = getCompanyByMesh(e.object.name) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);
                    if (company) handleCompanyClick(e, company.id);
                }}
                onPointerOver={(e: any) => {
                    e.stopPropagation();
                    const company = getCompanyByMesh(e.object.name) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);
                    if (company) handleCompanyHover(e, company.id, true);
                }}
                onPointerOut={(e: any) => {
                    e.stopPropagation();
                    const company = getCompanyByMesh(e.object.name) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);
                    if (company) handleCompanyHover(e, company.id, false);
                }}
            />

            {/* Dynamic Phase 2 Door Models */}
            {companies.map(company => {
                const anchor = anchors[company.id];
                if (!anchor || !company.modelFile) return null;

                // Debug: Log scale to see if it's crazy small
                // console.log(`Rendering ${company.id} at`, anchor.position, `Scale:`, anchor.scale);

                return (
                    <group
                        key={company.id}
                        position={anchor.position}
                        rotation={anchor.rotation}
                        // FORCE SCALE 1.0 if the original was weird, or multiply. 
                        // If original was 0.01 (common in blender), and we use that, new model might be tiny.
                        // Let's force [1, 1, 1] for now to verify they physically exist.
                        scale={[1, 1, 1]}
                        onClick={(e) => handleCompanyClick(e, company.id)}
                        onPointerOver={(e) => handleCompanyHover(e, company.id, true)}
                        onPointerOut={(e) => handleCompanyHover(e, company.id, false)}
                    >
                        {/* Render the specific optimized GLB for this company */}
                        <Gltf src={company.modelFile} receiveShadow castShadow />
                    </group>
                );
            })}
        </group>
    );
}
