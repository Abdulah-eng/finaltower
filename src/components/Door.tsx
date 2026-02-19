'use client';

import { useGLTF } from '@react-three/drei';
import { Vector3, Euler, Group } from 'three';
import { useMemo } from 'react';

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

    // Optimize materials - ensure they cast/receive shadows (Desktop only feature)
    useMemo(() => {
        clonedScene.traverse((child) => {
            if ((child as any).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Ensure proper material rendering
                if (child.userData.material) {
                    child.userData.material.side = 2; // DoubleSide
                }
            }
        });
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
