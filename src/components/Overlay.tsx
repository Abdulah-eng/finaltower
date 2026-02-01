'use client';

import { Company } from '../data/companies';

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    data: Company | (Company & { isUnknown?: boolean; meshName?: string }) | null;
}

export default function Overlay({ isOpen, onClose, data }: OverlayProps) {
    if (!data) return null;

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-black/90 backdrop-blur-xl z-50 transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-[#d4af37]/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
        >
            {/* Interaction Layer */}
            <div className="h-full flex flex-col text-white font-sans overflow-y-auto">

                {/* Top Navigation */}
                <div className="p-6 flex justify-between items-center border-b border-[#d4af37]/10">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]/60 font-light">
                        Company Profile
                    </span>
                    <button
                        onClick={onClose}
                        className="group p-2 -mr-2 text-[#d4af37] hover:text-white transition-colors"
                    >
                        <span className="text-2xl font-light transform group-hover:scale-125 block transition-transform">✕</span>
                    </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col p-8 md:p-12">

                    {/* Logo Container */}
                    {data.logo && !(data as any).isUnknown && (
                        <div className="mb-12 animate-fade-in">
                            <div className="w-24 h-24 bg-white/5 p-4 rounded-full border border-[#d4af37]/20 backdrop-blur-sm flex items-center justify-center group overflow-hidden">
                                <img
                                    src={data.logo}
                                    alt={data.name}
                                    className="max-w-full max-h-full object-contain filter brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </div>
                    )}

                    {/* Identity */}
                    <div className="space-y-4 mb-10">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#d4af37] leading-tight tracking-tight">
                            {data.name}
                        </h2>
                        <div className="h-1 w-12 bg-[#d4af37]"></div>
                    </div>

                    {/* Description */}
                    <div className="space-y-8 flex-1">
                        <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed italic">
                            {data.description}
                        </p>

                        {data.fullDescription && !(data as any).isUnknown && (
                            <div className="pt-8 border-t border-[#d4af37]/10">
                                <h3 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-6 font-bold">Strategy & Vision</h3>
                                <p className="text-base text-gray-400 leading-relaxed font-light">
                                    {data.fullDescription}
                                </p>
                            </div>
                        )}

                        {/* Mesh Info for Debug */}
                        {(data as any).isUnknown && (
                            <div className="p-4 bg-red-900/10 border border-red-900/30 rounded">
                                <p className="text-xs text-red-400 font-mono italic">
                                    Unlinked Component: {(data as any).meshName}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-12 space-y-4">
                        {data.website && (
                            <button
                                onClick={() => window.open(data.website, '_blank', 'noopener,noreferrer')}
                                className="w-full py-5 bg-[#d4af37] text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all duration-300 flex items-center justify-center group"
                            >
                                Explore Website
                                <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-5 border border-white/10 text-white/40 font-bold uppercase tracking-[0.2em] text-xs hover:text-white hover:border-white/40 transition-all duration-300"
                        >
                            Back to Tower
                        </button>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="p-6 border-t border-[#d4af37]/10 flex justify-between items-center bg-black/50">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600">
                        © 2024 Tower of Companies
                    </span>
                    <div className="flex space-x-2">
                        <div className="w-1 h-1 rounded-full bg-[#d4af37]/30"></div>
                        <div className="w-1 h-1 rounded-full bg-[#d4af37]/30"></div>
                        <div className="w-1 h-1 rounded-full bg-[#d4af37]"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
