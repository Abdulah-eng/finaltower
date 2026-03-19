'use client';

import { useGLTF } from '@react-three/drei';
import { Vector3, Euler } from 'three';

interface DoorProps {
    modelId: string; // e.g., "OP1", "PWR1"
    position: Vector3;
    rotation: Euler;
    scale?: Vector3;
}

export default function Door({ modelId, position, rotation, scale }: DoorProps) {
    const modelPath = `/models/doors/${modelId}.glb`;
    // MEMORY OPT: Use scene directly (no clone). Since each door model ID is unique
    // per company, there is only ever 1 instance of each model, so cloning is wasteful.
    const { scene } = useGLTF(modelPath);

    return (
        <primitive
            object={scene}
            position={position}
            rotation={rotation}
            scale={scale || [1, 1, 1]}
        />
    );
}
