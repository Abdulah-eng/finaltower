'use client';

import { useParams, useRouter } from 'next/navigation';
import { getCompanyById } from '../../../data/companies';
import { useEffect, useState } from 'react';

export default function CompanyPage() {
    const params = useParams();
    const router = useRouter();
    const [company, setCompany] = useState<any>(null);
    const [isLeaving, setIsLeaving] = useState(false);
    const [bgImage, setBgImage] = useState('/logos/oldroom.jpg');

    const handleBack = () => {
        setIsLeaving(true);
        setTimeout(() => {
            router.push(`/?exit=${company.id}`);
        }, 700); // Wait for fade-to-black to complete
    };

    useEffect(() => {
        // List of available background images
        const BACKGROUNDS = [
            '/logos/backgroundimage.jpg',
            '/logos/backgroundimage2.jpg',
            '/logos/backgroundimage3.webp',
            '/logos/backgroundimage4.jpeg'
        ];
        
        // Select a random background on mount (client-side only to avoid hydration mismatch)
        const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
        setBgImage(randomBg);

        if (params.id) {
            const data = getCompanyById(params.id as string);
            if (data) {
                setCompany(data);
            } else {
                router.push('/');
            }
        }
    }, [params, router]);

    if (!company) return (
        <div className="w-full h-screen bg-[#050505] flex items-center justify-center text-white">
            <div className="animate-pulse">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-[#d4af37] selection:text-black font-sans relative overflow-x-hidden">
            {/* Background Image Layer */}
            <div className="fixed inset-0 z-0 overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={bgImage}
                    alt="Background"
                    className="w-full h-full object-cover object-bottom transition-opacity duration-1000"
                    style={{ imageRendering: 'auto' }}
                />
                {/* Dramatic cinematic overlays matching reference contrast */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,0,0,0.5)_40%,rgba(0,0,0,0.95)_100%)]" />
            </div>

            {/* Exit fade overlay */}
            <div className={`fixed inset-0 z-[999] bg-black pointer-events-none transition-opacity duration-700 ease-in ${isLeaving ? 'opacity-100' : 'opacity-0'}`} />
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div
                        onClick={handleBack}
                        className="cursor-pointer group flex items-center gap-4"
                    >
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#d4af37] transition-colors">
                            <span className="text-sm">←</span>
                        </div>
                        <span className="text-xs uppercase tracking-[0.2em] group-hover:text-[#d4af37] transition-colors">Return to Tower</span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative z-10 pt-32 pb-20 px-6 border-b border-white/5 bg-transparent">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block mb-6 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={company.logo}
                            alt={company.name}
                            className="h-24 md:h-32 object-contain filter drop-shadow-lg"
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-medium text-white mb-6 tracking-tight">
                        {company.name}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                        {company.description}
                    </p>
                    {company.website && (
                        <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-8 px-8 py-3 bg-[#d4af37] text-black text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
                        >
                            Visit Website
                        </a>
                    )}
                    
                    {company.introduction && (
                        <div className="mt-16 max-w-4xl mx-auto border-t border-white/10 pt-16 px-4">
                            <div className="bg-white/2 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/5">
                                <p className="text-gray-200 text-lg md:text-xl font-light leading-relaxed whitespace-pre-line text-left md:text-center italic tracking-wide opacity-95">
                                    {company.introduction}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Content Sections */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-20 pb-32">
                <div className="space-y-24">
                    {company.content?.map((section: any, index: number) => (
                        <section key={index} className="relative group">
                            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                                {section.title && (
                                    <div className="md:w-1/4">
                                        <h2 className="text-xl md:text-2xl font-serif text-[#d4af37] leading-tight md:sticky md:top-32 transition-colors duration-500">
                                            {section.title}
                                        </h2>
                                    </div>
                                )}
                                <div className={section.title ? "md:w-3/4 space-y-8" : "w-full space-y-8"}>
                                    {section.body && (
                                        <div className="text-gray-400 font-light leading-relaxed whitespace-pre-line text-base md:text-lg">
                                            {section.body}
                                        </div>
                                    )}

                                    {section.list && section.list.length > 0 && (
                                        <ul className="space-y-4">
                                            {section.list.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-[#d4af37]/20 transition-all duration-300 group/item">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-2.5 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.4)] group-hover/item:scale-125 transition-transform duration-300"></span>
                                                    <span className="text-gray-300 font-light text-sm md:text-base leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {(!company.content || company.content.length === 0) && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-gray-500 italic font-light">
                            Detailed corporate information for this entity is currently being updated.
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-white/5 text-center">
                <p className="text-[#d4af37] text-xs uppercase tracking-[0.3em]">
                    Corporate Interactive Experience
                </p>
            </footer>
        </div>
    );
}
