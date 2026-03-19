'use client';

import { useGLTF, Octahedron, Html } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
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

const Tower = memo(function Tower({ onSelect, onHover, cameraStateRef, isMobile = false }: TowerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modelPath = isMobile ? '/models/colleseum_mobile.glb' : '/models/colleseum_final.glb';
    const gltf = useGLTF(modelPath);
    
    // MEMORY OPTIMIZATION: Use shared scene instance instead of cloning
    const scene = gltf.scene;

    // Persistent refs for cleanup
    const hiddenMeshesRef = useRef<Set<Mesh>>(new Set());
    const addedObjectsRef = useRef<any[]>([]);
    const highlightMaterialsRef = useRef<Map<Mesh, any>>(new Map());

    const [customDoors, setCustomDoors] = useState<{ id: string; modelId: string; position: Vector3; rotation: Euler; scale: Vector3 }[]>([]);
    const [beacons, setBeacons] = useState<{ id: string; position: Vector3; meshName: string; hasVerticalPartner: boolean }[]>([]);
    const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

    const meshesByCompanyRef = useRef<Record<string, Mesh[]>>({});

    // SETUP EFFECT: Runs once on mount or when scene changes
    useEffect(() => {
        const allMeshes: Mesh[] = [];
        const companyMeshes: Mesh[] = [];
        const meshesByCompany: Record<string, Mesh[]> = {};
        const newCustomDoors: any[] = [];
        const newBeacons: any[] = [];

        // Pass 1: Collect meshes and identify explicit doors
        scene.traverse((child) => {
            if (child instanceof Mesh) {
                // MEMORY OPT: Low anisotropy (4) saves VRAM
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach((m: any) => { if (m.map) m.map.anisotropy = 4; });
                }

                child.castShadow = false;
                child.receiveShadow = false;
                allMeshes.push(child);

                const company = getCompanyByMesh(child.name);
                if (company) {
                    companyMeshes.push(child);
                    if (!meshesByCompany[company.id]) meshesByCompany[company.id] = [];
                    meshesByCompany[company.id].push(child);

                    if (!isMobile && company.doorModel && company.meshNames.includes(child.name)) {
                        if (child.name === company.meshNames[0]) {
                            child.visible = false;
                            hiddenMeshesRef.current.add(child);
                            
                            const isDuplicate = newCustomDoors.some(d => d.id === company.id);
                            if (!isDuplicate) {
                                newCustomDoors.push({
                                    id: company.id,
                                    modelId: company.doorModel,
                                    position: child.getWorldPosition(new Vector3()),
                                    rotation: child.rotation.clone(),
                                    scale: child.scale.clone().multiplyScalar(1.15)
                                });
                            }
                        } else {
                            child.visible = false;
                            hiddenMeshesRef.current.add(child);
                        }
                    }
                }
            }
        });

        // Pass 2: Orphans
        allMeshes.forEach(child => {
            let company = getCompanyByMesh(child.name);
            if (!company) {
                for (const door of companyMeshes) {
                    if (child.getWorldPosition(new Vector3()).distanceTo(door.getWorldPosition(new Vector3())) < 3.0) {
                        company = getCompanyByMesh(door.name);
                        if (company) {
                            if (!meshesByCompany[company.id]) meshesByCompany[company.id] = [];
                            meshesByCompany[company.id].push(child);
                            child.name = door.name;
                        }
                        break;
                    }
                }
            }
            if (!company) child.raycast = () => { };
        });

        // Pass 3: Hotspots & Beacons
        Object.entries(meshesByCompany).forEach(([companyId, meshes]) => {
            const firstMesh = meshes[0]?.name || "";
            const center = new Vector3();
            meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
            center.divideScalar(meshes.length);

            const hotspotName = `hotspot_${companyId}`;
            if (!scene.getObjectByName(hotspotName)) {
                const geometry = new BoxGeometry(4, 5, 2);
                const material = new MeshBasicMaterial({ visible: false });
                const hotspot = new Mesh(geometry, material);
                hotspot.name = hotspotName;
                hotspot.position.copy(center);

                const light = new PointLight('#ffaa00', 1.0, 10);
                light.position.set(0, 0, 1.5);
                hotspot.add(light);
                scene.add(hotspot);
                addedObjectsRef.current.push(hotspot);
                hotspot.userData.companyId = companyId;
                hotspot.userData.isHotspot = true;
            }

            const company = getCompanyById(companyId);
            if (company?.beaconPosition) {
                newBeacons.push({
                    id: companyId,
                    position: new Vector3(...company.beaconPosition),
                    meshName: firstMesh,
                    hasVerticalPartner: false
                });
            }
        });

        // Beacons for companies without physical meshes
        companies.forEach(company => {
            if (company.beaconPosition && !meshesByCompany[company.id] && !newBeacons.some(b => b.id === company.id)) {
                newBeacons.push({
                    id: company.id,
                    position: new Vector3(...company.beaconPosition),
                    meshName: '',
                    hasVerticalPartner: false
                });
            }
        });

        setCustomDoors(newCustomDoors);
        setBeacons(newBeacons);
        meshesByCompanyRef.current = meshesByCompany;

        // Camera Exit Snap
        const exitId = searchParams.get('exit');
        if (exitId && meshesByCompany[exitId] && cameraStateRef?.current) {
            const meshes = meshesByCompany[exitId];
            if (meshes.length > 0) {
                const center = new Vector3();
                meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
                center.divideScalar(meshes.length);
                const startPos = center.clone().add(center.clone().normalize().multiplyScalar(-8.0));
                cameraStateRef.current.pos.copy(startPos);
                cameraStateRef.current.lookAt.copy(center);
            }
        }

        // CLEANUP: restore visibility and dispose additive objects
        return () => {
            hiddenMeshesRef.current.forEach(m => { m.visible = true; });
            hiddenMeshesRef.current.clear();

            addedObjectsRef.current.forEach(obj => {
                if (obj.parent) obj.parent.remove(obj);
                obj.traverse((node: any) => {
                    if (node.geometry) node.geometry.dispose();
                    if (node.material) {
                        const mats = Array.isArray(node.material) ? node.material : [node.material];
                        mats.forEach((m: any) => m.dispose());
                    }
                });
            });
            addedObjectsRef.current = [];

            highlightMaterialsRef.current.forEach((mat: any) => {
                if (Array.isArray(mat)) mat.forEach((m: any) => m.dispose());
                else mat.dispose();
            });
            highlightMaterialsRef.current.clear();

            scene.traverse((node: any) => {
                if (node instanceof Mesh && node.userData.originalMaterial) {
                    node.material = node.userData.originalMaterial;
                    node.userData.highlightMaterial = null;
                }
            });
        };
    }, [scene, searchParams, isMobile, cameraStateRef]);

    const setHighlight = (companyId: string, active: boolean) => {
        const meshes = meshesByCompanyRef.current[companyId];
        if (!meshes) return;

        meshes.forEach((obj) => {
            if (obj.userData.isHotspot) return;
            if (!obj.userData.originalMaterial) obj.userData.originalMaterial = obj.material;

            if (active) {
                if (!obj.userData.highlightMaterial) {
                    const original = obj.userData.originalMaterial;
                    const baseMat = Array.isArray(original) ? original[0] : original;
                    const clone = baseMat.clone();
                    if (clone.emissive !== undefined) {
                        clone.emissive = new Color('#ffeebb');
                        clone.emissiveIntensity = 2.0;
                    }
                    obj.userData.highlightMaterial = clone;
                    highlightMaterialsRef.current.set(obj, clone);
                }
                obj.material = obj.userData.highlightMaterial;
            } else {
                obj.material = obj.userData.originalMaterial;
            }
        });
    };

    return (
        <group>
            <primitive
                object={scene}
                onPointerOver={(e: any) => {
                    e.stopPropagation();
                    if (isMobile) return;
                    const company = getCompanyByMesh(e.object.name) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);
                    if (company) {
                        setHoveredMesh(company.id);
                        document.body.style.cursor = 'pointer';
                        onHover(true);
                        setHighlight(company.id, true);
                        router.prefetch(`/company/${company.id}`);
                    }
                }}
                onPointerOut={(e: any) => {
                    e.stopPropagation();
                    if (isMobile) return;
                    const company = getCompanyByMesh(e.object.name) || (e.object.userData?.companyId ? getCompanyById(e.object.userData.companyId) : null);
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
                    const meshes = meshesByCompanyRef.current[company.id];
                    let targetPoint = e.point;
                    if (meshes?.length > 0) {
                        const center = new Vector3();
                        meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
                        center.divideScalar(meshes.length);
                        targetPoint = center;
                    }
                    onSelect(company.meshNames[0], targetPoint);
                }}
            />
            {customDoors.map((door) => (
                <Door key={door.id} modelId={door.modelId} position={door.position} rotation={door.rotation} scale={door.scale} />
            ))}
            {beacons.map((beacon) => (
                <Beacon 
                    key={`beacon-${beacon.id}`} 
                    position={beacon.position} 
                    companyId={beacon.id} 
                    isMobile={isMobile}
                    onHover={(h) => {
                        if (h) {
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
                    }}
                    onClick={() => {
                        const company = getCompanyById(beacon.id);
                        if (company) {
                            const meshes = meshesByCompanyRef.current[company.id];
                            let targetPoint = beacon.position;
                            if (meshes?.length > 0) {
                                const center = new Vector3();
                                meshes.forEach(m => center.add(m.getWorldPosition(new Vector3())));
                                center.divideScalar(meshes.length);
                                targetPoint = center;
                            }
                            onSelect(company.meshNames[0], targetPoint);
                        }
                    }}
                />
            ))}
        </group>
    );
});

function Beacon({ position, companyId, isMobile, onHover, onClick }: { 
    position: Vector3, companyId: string, isMobile: boolean, onHover: (h: boolean) => void, onClick: () => void 
}) {
    const meshRef = useRef<Mesh>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const lastOpacity = useRef<number>(-1);
    const lastZIndex = useRef<number>(-1);
    const company = getCompanyById(companyId);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.02;
            meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2;
            if (labelRef.current) {
                const dist = state.camera.position.distanceTo(meshRef.current.position);
                const toBeacon = meshRef.current.position.clone().sub(state.camera.position).normalize();
                const cameraForward = new Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
                const dot = cameraForward.dot(toBeacon);
                const isFront = position.clone().normalize().dot(state.camera.position.clone().normalize()) > 0.5;
                
                let opacity = 0;
                if (isFront && dist < (isMobile ? 180 : 130) && dot > (isMobile ? 0.75 : 0.85)) opacity = 1;
                if (hovered) opacity = 1;

                const rounded = Math.round(opacity * 20) / 20;
                if (Math.abs(lastOpacity.current - rounded) > 0.01) {
                    labelRef.current.style.opacity = rounded.toFixed(2);
                    labelRef.current.style.pointerEvents = rounded > 0.1 ? 'auto' : 'none';
                    lastOpacity.current = rounded;
                }
                const zi = Math.max(0, Math.round((2000 - dist) * 100));
                if (lastZIndex.current !== zi) {
                    labelRef.current.style.zIndex = zi.toString();
                    lastZIndex.current = zi;
                }
            }
        }
    });

    if (!company) return null;

    return (
        <group position={position}>
            <Octahedron ref={meshRef as any} args={[0.6, 0]} visible={false}>
                <meshBasicMaterial color="#d4af37" />
            </Octahedron>
            <Html position={[0, 1.2, 0]} center distanceFactor={40} className="beacon-label-container">
                <div 
                    ref={labelRef} 
                    className="flex flex-col items-center justify-center transition-opacity duration-100 cursor-pointer"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(false); }}
                >
                    <div className="p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl flex items-center justify-center min-w-[80px] min-h-[50px] relative overflow-hidden group hover:border-[#d4af37]/50 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-pulse"></div>
                        <img src={company.logo} alt={company.name} className="w-[120px] h-[50px] object-contain drop-shadow-md" />
                    </div>
                </div>
            </Html>
        </group>
    );
}

export default Tower;

// Preloads
useGLTF.preload('/models/colleseum_final.glb');
useGLTF.preload('/models/colleseum_mobile.glb');
['OP1','OP3','OP4','PWR1','PWR3','PWR4','SP1','SP3','SP4'].forEach(id => useGLTF.preload(`/models/doors/${id}.glb`));
