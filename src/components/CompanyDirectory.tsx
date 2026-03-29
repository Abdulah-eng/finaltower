'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { companies } from '../data/companies';

export default function CompanyDirectory() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleSelect = (id: string) => {
        setIsOpen(false);
        // Add a small delay for the closing animation to feel smooth
        setTimeout(() => {
            router.push(`/company/${id}`);
        }, 300);
    };

    return (
        <>
            {/* Directory Toggle Button - Fixed Top Right */}
            <div className="fixed top-0 right-0 z-[60] p-6 md:p-12">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group flex items-center gap-3 bg-black/20 hover:bg-[#d4af37]/10 backdrop-blur-md border border-white/10 hover:border-[#d4af37]/50 px-5 py-2.5 rounded-full transition-all duration-300 pointer-events-auto"
                >
                    <div className="flex flex-col gap-1">
                        <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                        <span className={`w-3 h-0.5 bg-[#d4af37] transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white font-bold group-hover:text-[#d4af37] transition-colors">
                        {isOpen ? 'Close' : 'Companies'}
                    </span>
                </button>
            </div>

            {/* Backdrop Overlay */}
            <div
                className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Directory Panel */}
            <aside
                className={`fixed top-0 right-0 h-full z-[56] w-full md:w-[450px] bg-[#050505]/95 backdrop-blur-2xl border-l border-white/5 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col p-8 md:p-12 overflow-hidden">
                    <div className="mb-12">
                        <h2 className="text-3xl font-serif text-white mb-2">Corporate Directory</h2>
                        <div className="h-1 w-12 bg-[#d4af37]"></div>
                        <p className="text-gray-500 text-xs uppercase tracking-widest mt-6">Select a Company</p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 -mr-4 custom-scrollbar">
                        <div className="space-y-4 pb-12">
                            {companies.map((company, index) => (
                                <div
                                    key={company.id}
                                    onClick={() => handleSelect(company.id)}
                                    className="group relative flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-500 cursor-pointer"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-500">
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            className="w-full h-full object-contain filter brightness-110 group-hover:brightness-125"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium text-sm group-hover:text-[#d4af37] transition-colors duration-300">
                                            {company.name}
                                        </h3>
                                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1 line-clamp-1 italic">
                                            {company.description}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                        <span className="text-[#d4af37] text-xl">→</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/5">
                        <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em]">
                            TOWER Interactive Directory
                        </p>
                    </div>
                </div>
            </aside>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.5);
                }
            `}</style>
        </>
    );
}
