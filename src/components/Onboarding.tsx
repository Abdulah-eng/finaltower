'use client';

import { useState, useEffect } from 'react';

// SVG Icons for the guide
const MouseIcon = () => (
  <svg className="w-12 h-12 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.573l-1.59-1.59" />
  </svg>
);

const HandIcon = () => (
  <svg className="w-12 h-12 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.573l-1.59-1.59" />
  </svg>
);

const DragIcon = () => (
  <svg className="w-12 h-12 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" />
  </svg>
);

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Step sequence timing
        const timings = [
            4000, // Step 0: Scroll
            4000, // Step 1: Drag
            4000  // Step 2: Click
        ];

        if (step < 3 && visible) {
            const timer = setTimeout(() => {
                setStep(s => s + 1);
            }, timings[step]);
            return () => clearTimeout(timer);
        } else if (step >= 3 && visible) {
            handleComplete();
        }
    }, [step, visible]);

    const handleComplete = () => {
        setIsFading(true);
        // Persist fact that user saw the guide
        try {
            localStorage.setItem('hasSeenTowerGuide', 'true');
        } catch (e) {
            // Ignore (e.g., incognito)
        }
        setTimeout(() => {
            setVisible(false);
            onComplete();
        }, 800);
    };

    if (!visible) return null;

    return (
        <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-700 pointer-events-auto ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute top-8 right-8 z-50">
                <button
                    onClick={handleComplete}
                    className="px-6 py-2 rounded-full border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/40 backdrop-blur-md transition-all uppercase tracking-wider"
                >
                    Skip Guide
                </button>
            </div>

            <div className="max-w-md w-full px-6 flex flex-col items-center justify-center min-h-[400px]">
                
                {/* Step 0: Scroll */}
                <div className={`absolute flex flex-col items-center transition-all duration-700 transform ${step === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'}`}>
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-12 animate-pulse-gold relative">
                        <div className="absolute animate-hand-scroll">
                            <DragIcon />
                        </div>
                    </div>
                    <h2 className="text-3xl font-serif text-white mb-3 text-center">Navigate the Tower</h2>
                    <p className="text-gray-400 text-center text-lg font-light leading-relaxed">
                        <span className="text-[#d4af37] font-medium block mb-1">SCROLL UP / DOWN</span>
                        to ascend and descend between company tiers.
                    </p>
                </div>

                {/* Step 1: Drag */}
                <div className={`absolute flex flex-col items-center transition-all duration-700 transform ${step === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
                    <div className="w-24 h-24 flex items-center justify-center mb-12 relative">
                        <div className="absolute animate-hand-drag drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                            <DragIcon />
                        </div>
                    </div>
                    <h2 className="text-3xl font-serif text-white mb-3 text-center">Look Around</h2>
                    <p className="text-gray-400 text-center text-lg font-light leading-relaxed">
                        <span className="text-[#d4af37] font-medium block mb-1">CLICK & DRAG</span>
                        horizontally to rotate the tower and discover more.
                    </p>
                </div>

                {/* Step 2: Click */}
                <div className={`absolute flex flex-col items-center transition-all duration-700 transform ${step === 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
                    <div className="w-24 h-24 rounded-full border border-[#d4af37]/50 flex items-center justify-center mb-12 relative overflow-visible">
                        <div className="absolute animate-pulse-gold w-full h-full rounded-full" />
                        <div className="absolute animate-hand-click ml-6 mt-6 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                            <MouseIcon />
                        </div>
                    </div>
                    <h2 className="text-3xl font-serif text-white mb-3 text-center">Enter a Profile</h2>
                    <p className="text-gray-400 text-center text-lg font-light leading-relaxed">
                        <span className="text-[#d4af37] font-medium block mb-1">CLICK A LOGO</span>
                        to view the interactive corporate showcase.
                    </p>
                </div>

            </div>

            {/* Pagination Indicators */}
            <div className={`absolute bottom-16 flex gap-3 transition-opacity ${step < 3 ? 'opacity-100' : 'opacity-0'}`}>
                {[0, 1, 2].map((i) => (
                    <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${step === i ? 'bg-[#d4af37] w-8' : 'bg-white/20'}`} 
                    />
                ))}
            </div>
        </div>
    );
}
