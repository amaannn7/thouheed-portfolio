'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

/* ─── Scroll-reveal hook ─────────────────────────────────────────── */
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('in-view'); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useScrollReveal();
    return (
        <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

/* ─── Tag pill ───────────────────────────────────────────────────── */
function Tag({ label }: { label: string }) {
    return (
        <span className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-gray-100 text-gray-500">
            {label}
        </span>
    );
}

/* ─── Image gallery (masonry-style grid) ───────────────────────── */
function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
    if (images.length === 1) {
        return (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
                <Image src={images[0]} alt={alt} fill sizes="100vw" className="object-cover" />
            </div>
        );
    }
    if (images.length === 2) {
        return (
            <div className="grid grid-cols-2 gap-3">
                {images.map((src, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="50vw" className="object-cover" />
                    </div>
                ))}
            </div>
        );
    }
    // 3 images: 1 big left + 2 stacked right
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="relative row-span-2 rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <Image src={images[0]} alt={`${alt} 1`} fill sizes="50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image src={images[1]} alt={`${alt} 2`} fill sizes="50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image src={images[2]} alt={`${alt} 3`} fill sizes="50vw" className="object-cover" />
            </div>
        </div>
    );
}

/* ─── Video project hero ─────────────────────────────────────────── */
function VideoHero({ video, title, label }: { video: string; title: string; label: string }) {
    const vidRef = useRef<HTMLVideoElement>(null);
    return (
        <div
            className="group relative w-full aspect-video rounded-3xl overflow-hidden cursor-pointer"
            onMouseEnter={() => vidRef.current?.play()}
            onMouseLeave={() => { if (vidRef.current) { vidRef.current.pause(); vidRef.current.currentTime = 0; } }}
        >
            <video
                ref={vidRef}
                src={video}
                muted
                playsInline
                loop
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute top-5 left-5">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white/80 border border-white/15 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Video
                </span>
            </div>
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white ml-1"><path d="M8 5v14l11-7z" /></svg>
                </div>
            </div>
            <div className="absolute bottom-6 left-7">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">{label}</p>
                <h3 className="text-white text-xl font-semibold mt-1">{title}</h3>
            </div>
        </div>
    );
}

/* ─── Project section ────────────────────────────────────────────── */
function ProjectSection({
    index, label, title, year, client, role, overview, deliverables, tags, images,
}: {
    index: number;
    label: string;
    title: string;
    year: string;
    client: string;
    role: string;
    overview: string;
    deliverables: string[];
    tags: string[];
    images: string[];
}) {
    return (
        <Reveal>
            <div className="border-t border-gray-100 pt-16 pb-16">
                <div className="flex items-start gap-4 mb-10">
                    <span className="text-[11px] font-semibold text-gray-300 tabular-nums mt-0.5">
                        {String(index).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                        <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-[#1a1a1a]">{title}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
                    {/* Images */}
                    <ImageGallery images={images} alt={title} />

                    {/* Details */}
                    <div className="flex flex-col gap-8">
                        {/* Meta */}
                        <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                            {[['Client', client], ['Year', year], ['Role', role]].map(([k, v]) => (
                                <div key={k} className="bg-white rounded-2xl p-3 md:p-4 border border-gray-100">
                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{k}</p>
                                    <p className="text-[11px] md:text-[13px] font-semibold text-[#1a1a1a] leading-snug">{v}</p>
                                </div>
                            ))}
                        </div>

                        {/* Overview */}
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Overview</p>
                            <p className="text-[14px] text-gray-600 leading-relaxed">{overview}</p>
                        </div>

                        {/* Deliverables */}
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Deliverables</p>
                            <ul className="flex flex-col gap-2">
                                {deliverables.map(d => (
                                    <li key={d} className="flex items-start gap-2 text-[13px] text-gray-600">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {tags.map(t => <Tag key={t} label={t} />)}
                        </div>
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function WorkPage() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans">

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#f8f9fa]/90 backdrop-blur-md border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Home</span>
                </Link>
                <div className="flex items-center gap-3">
                    <span className="hidden md:inline font-semibold text-sm tracking-tight">Thawheed De Alwis</span>
                </div>
                <a
                    href="mailto:thouheedshereef@gmail.com"
                    className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-black text-white rounded-full text-[13px] font-medium hover:bg-gray-800 active:scale-95 transition-all duration-200"
                >
                    Contact <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
            </nav>

            <main className="max-w-6xl mx-auto px-6 md:px-12 pt-32 pb-24">

                {/* Page header */}
                <Reveal>
                    <div className="mb-20">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> All Work
                        </p>
                        <h1 className="text-5xl md:text-7xl font-light leading-none tracking-tight mb-6">
                            Selected<br />
                            <span className="font-semibold">Projects</span>
                        </h1>
                        <p className="text-gray-500 text-base max-w-xl leading-relaxed">
                            A curated collection of brand, packaging, editorial and motion projects — built across a decade of creative direction and design.
                        </p>
                    </div>
                </Reveal>

                {/* ── Featured: Ford Bronco video ── */}
                <Reveal>
                    <div className="mb-16 border-t border-gray-100 pt-16">
                        <div className="flex items-start gap-4 mb-10">
                            <span className="text-[11px] font-semibold text-gray-300 tabular-nums mt-0.5">01</span>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Commercial Video — Tavisgo Motors</p>
                                <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Ford Bronco – Outer Banks Commercial</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
                            <VideoHero
                                video="/Ford_Outer_Banks_Commercial.mp4"
                                label="Commercial Video — Tavisgo Motors"
                                title="Ford Bronco – Outer Banks Commercial"
                            />

                            <div className="flex flex-col gap-8">
                                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                                    {[['Client', 'Ford'], ['Year', '2024'], ['Role', 'Motion Director']].map(([k, v]) => (
                                        <div key={k} className="bg-white rounded-2xl p-3 md:p-4 border border-gray-100">
                                            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{k}</p>
                                            <p className="text-[11px] md:text-[13px] font-semibold text-[#1a1a1a] leading-snug">{v}</p>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Overview</p>
                                    <p className="text-[14px] text-gray-600 leading-relaxed">
                                        A high-impact cinematic commercial conceived for large-format display. The narrative follows a journey from urban confinement to untamed wilderness — visually representing freedom, power, and self-discovery. Every frame was crafted to amplify the Ford Bronco's Outer Banks identity.
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Deliverables</p>
                                    <ul className="flex flex-col gap-2">
                                        {[
                                            'Full-length 60s cinematic commercial',
                                            'Motion graphics & title cards',
                                            '15s & 30s social edits',
                                            'Color grading & sound design supervision',
                                        ].map(d => (
                                            <li key={d} className="flex items-start gap-2 text-[13px] text-gray-600">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />{d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {['After Effects', 'Premiere Pro', 'Motion Design', 'Cinematic', 'Color Grading'].map(t => <Tag key={t} label={t} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* ── Prevense Facewash ── */}
                <ProjectSection
                    index={2}
                    label="Product Design — British Cosmetics"
                    title="Prevense Facewash"
                    year="2023"
                    client="British Cosmetics"
                    role="Packaging Designer"
                    overview="Pure science meets everyday care. A premium label and product identity for Prevense Facewash — combining clinical credibility with minimal elegance. The design language ensures shelf standout while maintaining a trusted, professional tone expected from a cosmeceutical brand."
                    deliverables={[
                        'Primary & secondary label design',
                        'Regulatory-compliant layout',
                        'Print-ready artwork (all SKUs)',
                        'Brand colour system & typography guide',
                    ]}
                    tags={['Packaging Design', 'Label Design', 'Brand Identity', 'Cosmeceutical']}
                    images={['/britishcosmetics-1.jpg', '/britishcosmetics-2.jpg']}
                />

                {/* ── Prevense Gold Range ── */}
                <ProjectSection
                    index={3}
                    label="Luxury Campaign — British Cosmetics"
                    title="Prevense Gold Range"
                    year="2024"
                    client="British Cosmetics"
                    role="Creative Director"
                    overview="Radiance Redefined. Luxury branding, packaging and campaign development for the Prevense Gold Range — gold accents, premium finishes, and a coherent brand story that elevates the line into the prestige skincare tier. The campaign spanning print, digital and point-of-sale unified the product family with a distinctive visual language."
                    deliverables={[
                        'Full product line packaging design',
                        'Campaign key visuals (print & digital)',
                        'Point-of-sale materials',
                        'Brand guidelines update',
                        'Social media content templates',
                    ]}
                    tags={['Luxury Branding', 'Packaging', 'Campaign', 'Art Direction']}
                    images={['/prevense-1.jpg', '/prevense-2.jpg', '/prevense-3.jpg']}
                />

                {/* ── UN Report ── */}
                <ProjectSection
                    index={4}
                    label="Publication Design — United Nations"
                    title="UN Report Cover & Template"
                    year="2023"
                    client="United Nations"
                    role="Publication Designer"
                    overview="Global Unity & Impact. A clean, modern and globally aligned report identity system for UN publications — balancing clarity, authority, and inclusivity. The template system was designed for scalability across multiple reports and language editions, ensuring visual coherence across the UN's communications portfolio."
                    deliverables={[
                        'Report cover design system',
                        'Interior page templates (50+ layouts)',
                        'Infographic style guide',
                        'Multi-language layout adaptations',
                        'Print & digital PDF versions',
                    ]}
                    tags={['Publication Design', 'Template', 'Editorial', 'InDesign', 'Typography']}
                    images={['/UN-1.jpg', '/UN-2.jpg', '/UN-3.jpg']}
                />

                {/* ── CTA ── */}
                <Reveal>
                    <div className="mt-8 border-t border-gray-100 pt-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Let&apos;s work together</p>
                            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Have a project in mind?</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="mailto:thouheedshereef@gmail.com"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-[13px] font-medium hover:bg-gray-800 transition-colors"
                            >
                                Get In Touch <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-[13px] font-medium text-gray-600 hover:border-gray-400 transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </Reveal>

            </main>
        </div>
    );
}
