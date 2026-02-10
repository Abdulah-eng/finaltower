import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function Loader() {
    const { progress } = useProgress();
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => setFinished(true), 500);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (finished) return null;

    return (
        <div
            className={`absolute inset-0 z-50 bg-[#020202] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${progress === 100 ? 'opacity-0' : 'opacity-100'}`}
            style={{ pointerEvents: finished ? 'none' : 'auto' }}
        >
            <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-white">
                    TOWER<span className="text-[#d4af37]">.</span>
                </h1>
                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                    <div
                        className="h-full bg-[#d4af37] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-[#d4af37] text-xs tracking-widest uppercase font-bold">
                    {progress.toFixed(0)}% Loaded
                </p>
            </div>
        </div>
    );
}
