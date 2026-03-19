'use client';

import { useGLTF } from '@react-three/drei';
import { Vector3, Euler, Mesh } from 'three';
import { useMemo, useEffect } from 'react';

interface DoorProps {
    modelId: string; // e.g., "OP1", "PWR1"
    position: Vector3;
    rotation: Euler;
    scale?: Vector3;
}

export default function Door({ modelId, position, rotation, scale }: DoorProps) {
    const modelPath = `/models/doors/${modelId}.glb`;
    const { scene } = useGLTF(modelPath);

    // Clone the scene to allow multiple instances of the same door model
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // MEMORY OPT: Disable shadows on 17 moving door instances to save significant VRAM
    useMemo(() => {
        clonedScene.traverse((child) => {
            if ((child as any).isMesh) {
                child.castShadow = false;
                child.receiveShadow = false;

                // Ensure proper material rendering
                if ((child as any).material) {
                    (child as any).material.side = 2; // DoubleSide
                }
            }
        });
    }, [clonedScene]);

    // MEMORY OPT: Explicitly dispose of cloned geometries/materials on unmount
    useEffect(() => {
        return () => {
            clonedScene.traverse((child) => {
                if (child instanceof Mesh) {
                    child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
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
