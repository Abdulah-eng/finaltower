'use client';

import { useGLTF } from '@react-three/drei';
import { Vector3, Euler, Mesh } from 'three';
import { useMemo, useEffect } from 'react';

interface DoorProps {
    modelId: string;
    position: Vector3;
    rotation: Euler;
    scale?: Vector3;
}

export default function Door({ modelId, position, rotation, scale }: DoorProps) {
    const modelPath = `/models/doors/${modelId}.glb`;
    const { scene } = useGLTF(modelPath);

    // MEMORY OPT: Clone individual instances but ENSURE DISPOSAL
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child instanceof Mesh) {
                // Disable shadows for memory/perf
                child.castShadow = false;
                child.receiveShadow = false;
                
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => { m.side = 2; }); // DoubleSide
                }
            }
        });

        // Cleanup function for strict disposal
        return () => {
            clonedScene.traverse((child) => {
                if (child instanceof Mesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(m => m.dispose());
                    }
                }
            });
        };
    }, [clonedScene]);

    return (
        <primitive
            object={clonedScene}
            position={position}
            rotation={rotation}
            scale={scale || [1, 1, 1]}
        />
    );
}
