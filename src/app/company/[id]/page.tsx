'use client';

import { useParams, useRouter } from 'next/navigation';
import { getCompanyById } from '../../../data/companies';
import { useEffect, useState } from 'react';

export default function CompanyPage() {
    const params = useParams();
    const router = useRouter();
    const [company, setCompany] = useState<any>(null);

    useEffect(() => {
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
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 selection:bg-[#d4af37] selection:text-black font-sans">
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div
                        onClick={() => router.push('/')}
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
            <header className="relative pt-32 pb-20 px-6 border-b border-white/5 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
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
                </div>
            </header>

            {/* Content Sections */}
            <main className="max-w-4xl mx-auto px-6 py-20 space-y-24">
                {company.content?.map((section: any, index: number) => (
                    <section key={index} className="space-y-6 group">
                        {section.title && (
                            <h2 className="text-2xl md:text-3xl font-serif text-[#d4af37] flex items-center gap-4">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity -ml-8 text-sm hidden md:block">0{index + 1}</span>
                                {section.title}
                            </h2>
                        )}

                        {section.body && (
                            <div className="prose prose-invert prose-lg text-gray-400 font-light leading-relaxed whitespace-pre-line">
                                {section.body}
                            </div>
                        )}

                        {section.list && section.list.length > 0 && (
                            <ul className="grid gap-4 mt-6">
                                {section.list.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-[#d4af37]/30 transition-colors">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-2.5 shrink-0"></span>
                                        <span className="text-gray-300 font-light">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}

                {(!company.content || company.content.length === 0) && (
                    <div className="text-center text-gray-500 italic">
                        No additional details available for this entity.
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center">
                <p className="text-[#d4af37] text-xs uppercase tracking-[0.3em]">
                    Corporate Interactive Experience
                </p>
            </footer>
        </div>
    );
}
