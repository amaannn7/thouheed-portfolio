'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, createContext, useContext } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import {
  ArrowUpRight,
  ArrowRight,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';

/* ─── Sparkles ──────────────────────────────────────────────────── */
function Sparkles({
  className = '',
  size = 1,
  minSize = null,
  density = 600,
  speed = 0.6,
  minSpeed = null,
  opacity = 0.6,
  opacitySpeed = 2,
  minOpacity = null,
  color = '#ffffff',
  background = 'transparent',
}: {
  className?: string;
  size?: number;
  minSize?: number | null;
  density?: number;
  speed?: number;
  minSpeed?: number | null;
  opacity?: number;
  opacitySpeed?: number;
  minOpacity?: number | null;
  color?: string;
  background?: string;
}) {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => setIsReady(true));
  }, []);
  const id = useId();
  const options = {
    background: { color: { value: background } },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 120,
    particles: {
      color: { value: color },
      move: { enable: true, direction: 'none' as const, speed: { min: minSpeed ?? speed / 10, max: speed }, straight: false },
      number: { value: density },
      opacity: { value: { min: minOpacity ?? opacity / 10, max: opacity }, animation: { enable: true, sync: false, speed: opacitySpeed } },
      size: { value: { min: minSize ?? size / 2.5, max: size } },
    },
    detectRetina: true,
  };
  if (!isReady) return null;
  return <Particles id={id} options={options} className={className} />;
}

/* ─── Typewriter hook ───────────────────────────────────────────── */
const TYPEWRITER_PHRASES = [
  'a design & strategy wizard',
  'a Creative Director',
  'a Brand Storyteller',
  'a Motion Designer',
  'a Packaging Specialist',
];

function useTypewriter(phrases: string[], typingSpeed = 70, deletingSpeed = 40, pauseMs = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setPhraseIndex(i => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(() => {
        setDisplayed(isDeleting
          ? current.slice(0, displayed.length - 1)
          : current.slice(0, displayed.length + 1)
        );
      }, isDeleting ? deletingSpeed : typingSpeed);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

/* ─── Count-up hook ─────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1600) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        let start: number | null = null;
        const step = (ts: number) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
          else setCount(target);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { ref, count };
}

/* ─── Scroll-reveal hook ─────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in-view'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Sticky-nav hook ────────────────────────────────────────────── */
function useStickyNav() {
  useEffect(() => {
    const nav = document.getElementById('main-nav');
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle('nav-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/* ─── Reusable reveal wrapper ────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Stat item ──────────────────────────────────────────────────── */
function StatItem({ target, label, badge }: { target: number; label: string; badge: string }) {
  const { ref, count } = useCountUp(target);
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <p className="text-4xl font-light tabular-nums">{count}<span className="text-2xl">+</span></p>
        <span className="mb-1.5 flex items-center gap-0.5 text-emerald-500 text-[11px] font-semibold">
          <svg viewBox="0 0 10 10" className="w-3 h-3 fill-emerald-500"><path d="M5 1l4 8H1z" /></svg>
          {badge}
        </span>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  );
}

function StatRow() {
  return (
    <div className="flex gap-10 animate-fade-up">
      <StatItem target={20} label="Clients Served" badge="Growing" />
      <div className="w-px bg-gray-200 self-stretch mx-2" />
      <StatItem target={30} label="Projects Done" badge="Rising" />
      <div className="w-px bg-gray-200 self-stretch mx-2" />
      <StatItem target={10} label="Years Experience" badge="Active" />
    </div>
  );
}

/* ─── Typewriter tagline ─────────────────────────────────────────── */
function TypewriterTagline() {
  const text = useTypewriter(TYPEWRITER_PHRASES);
  return (
    <p className="text-lg md:text-xl font-medium text-gray-700 mt-4 max-w-md">
      I&apos;m Thawheed,{' '}
      <span className="inline-block min-w-[2px]">
        {text}
        <span className="inline-block w-[2px] h-[1.1em] bg-gray-700 ml-[1px] align-middle animate-pulse" />
      </span>
    </p>
  );
}

/* ─── Timeline row (self-revealing) ─────────────────────────────── */
function TimelineRow({
  company, location, period, role, description, tags, featured = false, delay = 0,
}: {
  company: string; location: string; period: string; role: string;
  description: string; tags: string[]; featured?: boolean; delay?: number;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal group relative rounded-2xl p-7 md:p-8 transition-all duration-300 ${featured
        ? 'bg-[#1a1a1a] text-white'
        : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md'
        }`}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Left: period + location */}
        <div className="md:w-44 shrink-0">
          <span className={`text-[11px] font-semibold tracking-widest uppercase ${featured ? 'text-white/50' : 'text-gray-400'
            }`}>{period}</span>
          <p className={`text-[11px] mt-1 ${featured ? 'text-white/30' : 'text-gray-300'}`}>{location}</p>
        </div>

        {/* Right: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h4 className={`text-[17px] font-semibold leading-snug ${featured ? 'text-white' : 'text-[#1a1a1a]'
              }`}>{company}</h4>
            {featured && (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest bg-white/10 text-white/60 border border-white/10 px-2.5 py-1 rounded-full">
                Current
              </span>
            )}
          </div>
          <p className={`text-[12px] font-medium mb-3 ${featured ? 'text-white/50' : 'text-gray-400'
            }`}>{role}</p>
          <p className={`text-[13px] leading-relaxed ${featured ? 'text-white/60' : 'text-gray-500'
            }`}>{description}</p>
          <div className="flex flex-wrap gap-2 mt-5">
            {tags.map(t => (
              <span
                key={t}
                className={`text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${featured
                  ? 'bg-white/10 text-white/60 border border-white/10'
                  : 'bg-gray-100 text-gray-500'
                  }`}
              >{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Project card (image) ──────────────────────────────────────── */
function ProjectCard({ label, title, desc, tags, image }: {
  label: string; title: string; desc: string; tags: string[]; image: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl aspect-[4/3] cursor-pointer">
      <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
        <h5 className="text-white font-semibold text-base mt-1 leading-snug">{title}</h5>
        <p className="text-white/60 text-xs mt-2 leading-relaxed opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">{desc}</p>
        <div className="flex flex-wrap gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          {tags.map(t => <span key={t} className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">{t}</span>)}
        </div>
      </div>
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-md">
        <ArrowUpRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

/* ─── Featured video card ───────────────────────────────────────── */
function VideoProjectCard({ label, title, desc, tags, video }: {
  label: string; title: string; desc: string; tags: string[]; video: string;
}) {
  const vidRef = useRef<HTMLVideoElement>(null);
  return (
    <div
      className="group relative overflow-hidden rounded-3xl aspect-video cursor-pointer"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      {/* Badge */}
      <div className="absolute top-5 left-5">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white/80 border border-white/15 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Video
        </span>
      </div>
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white ml-1"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-7">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
        <h5 className="text-white font-semibold text-xl mt-1.5 leading-snug">{title}</h5>
        <p className="text-white/55 text-sm mt-2 leading-relaxed max-w-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400">{desc}</p>
        <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {tags.map(t => <span key={t} className="text-[9px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">{t}</span>)}
        </div>
      </div>
      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-md">
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </div>
  );
}

/* ─── Mobile nav context ─────────────────────────────────────────── */
const MobileMenuCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => { } });

function MobileMenuButton() {
  const { open, setOpen } = useContext(MobileMenuCtx);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-full border border-gray-200 bg-white shadow-sm"
      aria-label="Toggle menu"
    >
      <span className={`block w-4 h-[1.5px] bg-[#1a1a1a] transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
      <span className={`block w-4 h-[1.5px] bg-[#1a1a1a] transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
      <span className={`block w-4 h-[1.5px] bg-[#1a1a1a] transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
    </button>
  );
}

function MobileDrawer() {
  const { open, setOpen } = useContext(MobileMenuCtx);
  if (!open) return null;
  return (
    <div className="md:hidden border-t border-gray-100 bg-[#f8f9fa]/95 backdrop-blur-md px-6 py-6 flex flex-col gap-4">
      {['About Me', 'Experience', 'Toolkit', 'Portfolio', 'Contact'].map(link => (
        <a
          key={link}
          href={`#${link.toLowerCase().replace(' ', '-')}`}
          onClick={() => setOpen(false)}
          className="text-[15px] font-medium text-gray-700 hover:text-black transition-colors py-1 border-b border-gray-100 last:border-0"
        >
          {link}
        </a>
      ))}
      <div className="pt-2 flex flex-col gap-3">
        <a href="tel:+94779081798" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a]">
          <Phone className="w-4 h-4" /> (+94) 77 908 1798
        </a>
        <a href="mailto:thouheedshereef@gmail.com" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a]">
          <Mail className="w-4 h-4" /> thouheedshereef@gmail.com
        </a>
        <a href="https://www.behance.net/thouheeddealwis" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.051-1.598-5.051-5.355 0-3.590 1.925-5.744 5.051-5.744 3.074 0 4.814 1.867 5.101 4.996.047.437.069.885.069 1.353H15.5c.13 2.002 1.182 2.418 2.368 2.418 1.187 0 1.817-.694 2.063-1.667h3.795zm-7.44-3.667h3.569c-.051-1.453-.9-2.22-1.784-2.22-.929 0-1.645.748-1.785 2.22zM9.5 12.4c0 1.97-1.066 3.21-2.79 3.21-1.12 0-1.893-.453-2.21-1.193V15.5H1V5h3.5v3.827c.317-.693 1.007-1.127 2.21-1.127C8.434 7.7 9.5 8.957 9.5 12.4zm-3.414 0c0-1.518-.513-2.4-1.42-2.4-.907 0-1.416.882-1.416 2.4 0 1.516.51 2.4 1.416 2.4.907 0 1.42-.884 1.42-2.4z" /></svg> Behance Portfolio
        </a>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function Home() {
  useStickyNav();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MobileMenuCtx.Provider value={{ open: mobileOpen, setOpen: setMobileOpen }}>
      <div className="min-h-screen bg-[#f8f9fa] text-[#1A1A1A] font-sans">

        {/* ── NAVIGATION ── */}
        <nav id="main-nav" className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-[#f8f9fa]/90 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-6 md:px-12 py-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm tracking-tight">Thawheed De Alwis</span>
            </div>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-gray-500">
              {['About Me', 'Experience', 'Toolkit', 'Portfolio', 'Contact'].map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="hover-underline hover:text-black transition-colors duration-200">{link}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:+94779081798"
                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-[13px] font-medium hover:bg-gray-800 active:scale-95 transition-all duration-200">
                Book A Call <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              {/* Hamburger — mobile only */}
              <MobileMenuButton />
            </div>
          </div>
          {/* Mobile drawer */}
          <MobileDrawer />
        </nav>

        <main className="w-full pt-20">

          {/* ── HERO ── */}
          <section className="min-h-screen flex relative overflow-hidden">

            {/* ── Left content column ── */}
            <div className="relative z-10 flex flex-col justify-between w-full md:w-[58%] px-6 md:px-12 pt-28 pb-12">

              {/* Stats row */}
              <StatRow />

              {/* Hello + tagline */}
              <div className="animate-fade-up delay-200">
                <h1 className="text-[8rem] sm:text-[11rem] md:text-[13rem] font-light leading-none tracking-tighter text-[#1A1A1A]">
                  Hello
                </h1>
                <TypewriterTagline />
              </div>

              {/* Mobile-only profile image */}
              <div className="block md:hidden relative w-full h-72 rounded-3xl overflow-hidden mt-6 animate-fade-up delay-300">
                <Image
                  src="/profile-picture.png"
                  alt="Thawheed De Alwis"
                  fill
                  sizes="100vw"
                  className="object-cover object-top grayscale"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8f9fa] to-transparent pointer-events-none" />
              </div>

              {/* Social links + scroll hint */}
              <div className="flex flex-col gap-4 animate-fade-up delay-400 mt-6">
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.behance.net/thouheeddealwis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500 border border-gray-200 rounded-full px-4 py-2 hover:border-gray-900 hover:text-gray-900 transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.051-1.598-5.051-5.355 0-3.590 1.925-5.744 5.051-5.744 3.074 0 4.814 1.867 5.101 4.996.047.437.069.885.069 1.353H15.5c.13 2.002 1.182 2.418 2.368 2.418 1.187 0 1.817-.694 2.063-1.667h3.795zm-7.44-3.667h3.569c-.051-1.453-.9-2.22-1.784-2.22-.929 0-1.645.748-1.785 2.22zM9.5 12.4c0 1.97-1.066 3.21-2.79 3.21-1.12 0-1.893-.453-2.21-1.193V15.5H1V5h3.5v3.827c.317-.693 1.007-1.127 2.21-1.127C8.434 7.7 9.5 8.957 9.5 12.4zm-3.414 0c0-1.518-.513-2.4-1.42-2.4-.907 0-1.416.882-1.416 2.4 0 1.516.51 2.4 1.416 2.4.907 0 1.42-.884 1.42-2.4z" /></svg>
                    Behance Portfolio
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-px bg-gray-400"></div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Scroll down</p>
                </div>
              </div>
            </div>

            {/* ── Right — profile image filling full height ── */}
            <div className="hidden md:block absolute right-0 top-0 w-[46%] h-full animate-fade-up delay-300">
              <Image
                src="/profile-picture.png"
                alt="Thawheed De Alwis — Creative Director"
                fill
                sizes="46vw"
                className="object-cover object-top grayscale"
                priority
              />
              {/* Fade gradient on left edge so image blends into page bg */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f8f9fa] to-transparent pointer-events-none"></div>
            </div>

          </section>

          {/* ── ABOUT ME ── */}
          <section id="about-me" className="py-28 px-6 md:px-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">

              {/* Column 1 — bio */}
              <Reveal className="md:col-span-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span> About Me
                </p>
                <h2 className="text-3xl font-semibold mb-6 leading-tight">Crafting brands that<br />mean something.</h2>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                  I&apos;m Thawheed De Alwis,a Creative Director and Graphic Designer with over a decade of experience turning brand challenges into visual solutions. From automotive showrooms in Sri Lanka to luxury cosmetics campaigns, I lead with strategy and finish with craft.
                </p>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                  My foundation in multimedia and advanced graphic design has evolved into a leadership role where I drive integrated marketing strategies, oversee creative direction, and manage cross-functional teams,currently at Tavisgo Motors.
                </p>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  I&apos;m also currently pursuing an MBA at London Metropolitan University (UK) / Esoft, deepening my understanding of the business side of creativity.
                </p>
              </Reveal>

              {/* Column 2 — metric card + secondary image */}
              <Reveal delay={150} className="md:col-span-1 flex flex-col gap-6">
                <div className="relative border border-gray-100 rounded-3xl p-8 bg-[#f8f9fa] text-center shadow-sm">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-6xl font-light mt-3 mb-2 tabular-nums">120%</p>
                  <p className="text-[11px] text-gray-400 max-w-[160px] mx-auto leading-relaxed">Average increase in brand engagement across client campaigns.</p>
                </div>
                <div className="h-64 rounded-2xl overflow-hidden relative">
                  <Image src="/profile-picture.png" alt="At work" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top grayscale" />
                </div>
              </Reveal>

              {/* Column 3 — highlights */}
              <Reveal delay={300} className="md:col-span-1 flex flex-col gap-8">
                <div className="w-full h-56 rounded-2xl overflow-hidden relative">
                  <Image src="/profile-picture-2.jpg" alt="Thawheed De Alwis" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-center grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="space-y-5">
                  {[
                    'Over 10 years spanning graphic design, brand identity, digital campaigns, and creative direction across Sri Lanka and Saudi Arabia.',
                    'Led end-to-end creative projects, from regulatory-compliant packaging to multi-channel digital campaigns for 50+ brand clients.',
                    'Currently pursuing an MBA to fuse creative leadership with strategic business acumen.',
                  ].map((point, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-[12px] text-gray-500 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

            </div>
          </section>

          {/* ── TOOLKIT ── */}
          <section id="toolkit" className="py-24 px-6 md:px-12 bg-[#f8f9fa] border-t border-gray-100 overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <Reveal className="mb-14">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span> Capabilities
                </p>
                <h2 className="text-4xl font-semibold leading-tight">Design Stacks<br />&amp; Toolkit</h2>
              </Reveal>
            </div>

            {/* Marquee — full bleed, no container cap */}
            <Reveal>
              <div className="relative overflow-hidden">
                {/* fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10 pointer-events-none" />

                <div className="animate-marquee gap-12 py-4" style={{ width: 'max-content' }}>
                  {[
                    { name: 'Figma', svg: <svg viewBox="0 0 38 57" className="h-12 w-auto" fill="currentColor"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" /><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" /><path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" /><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" /><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" /></svg> },
                    { name: 'Illustrator', svg: <svg viewBox="0 0 240 234" className="h-12 w-auto" fill="currentColor"><path d="M42.5 0h155C221 0 240 19 240 42.5v149c0 23.5-19 42.5-42.5 42.5h-155C19 234 0 215 0 191.5v-149C0 19 19 0 42.5 0z" opacity=".12" /><path d="M116 63l-39 86h17l9-20h38l9 20h18L129 63h-13zm-8 52l14-32 14 32h-28zM155 78h16v71h-16V78zm8-26a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" /></svg> },
                    { name: 'Photoshop', svg: <svg viewBox="0 0 240 234" className="h-12 w-auto" fill="currentColor"><path d="M42.5 0h155C221 0 240 19 240 42.5v149c0 23.5-19 42.5-42.5 42.5h-155C19 234 0 215 0 191.5v-149C0 19 19 0 42.5 0z" opacity=".12" /><path d="M69 63h35c20 0 33 11 33 29s-13 30-34 30H85v27H69V63zm16 45h17c12 0 19-5 19-16s-7-15-19-15H85v31zM141 130c0-25 17-42 41-42 4 0 7 0 10 1V63h15v85c-5 2-13 4-22 4-26 0-44-14-44-22zm51-27c-3-1-6-2-10-2-14 0-25 9-25 27 0 15 8 24 24 24 4 0 8 0 11-1v-48z" /></svg> },
                    { name: 'Sketch', svg: <svg viewBox="0 0 500 500" className="h-12 w-auto" fill="currentColor"><path d="M250 80l-175 75L75 300l175 120 175-120-0-145L250 80zm0 30l140 60-14 116L250 390l-126-104L110 170l140-60zm0 40l-93 40 9 77 84 69 84-69 9-77L250 150z" /></svg> },
                    { name: 'Webflow', svg: <svg viewBox="0 0 192 128" className="h-12 w-auto" fill="currentColor"><path d="M141.3 0C120 0 104 15 98 37c-8-15-21-25-37-25v37s0-25 25-37v113h25V68c0-25 12-43 30-43 17 0 26 12 26 30v70h25V52c0-32-16-52-51-52zM37 12C17 12 0 29 0 64s17 52 37 52 37-17 37-52S57 12 37 12zm0 25c7 0 12 12 12 27S44 91 37 91s-12-12-12-27 5-27 12-27z" /></svg> },
                    { name: 'Framer', svg: <svg viewBox="0 0 14 21" className="h-12 w-auto" fill="currentColor"><path d="M0 0h14v7H7L0 0zm0 7h7l7 7H7v7L0 14V7z" /></svg> },
                    { name: 'After Effects', svg: <svg viewBox="0 0 240 234" className="h-12 w-auto" fill="currentColor"><path d="M42.5 0h155C221 0 240 19 240 42.5v149c0 23.5-19 42.5-42.5 42.5h-155C19 234 0 215 0 191.5v-149C0 19 19 0 42.5 0z" opacity=".12" /><path d="M87 63l-39 86h17l9-20h38l9 20h18L100 63H87zm-8 52l14-32 14 32H79zm91-52h16v86h-16V63zm-11 0h13l28 42-28 44h-14l30-44-29-42z" /></svg> },
                    { name: 'Figma', svg: <svg viewBox="0 0 38 57" className="h-12 w-auto" fill="currentColor"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" /><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" /><path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" /><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" /><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" /></svg> },
                    { name: 'Illustrator', svg: <svg viewBox="0 0 240 234" className="h-12 w-auto" fill="currentColor"><path d="M42.5 0h155C221 0 240 19 240 42.5v149c0 23.5-19 42.5-42.5 42.5h-155C19 234 0 215 0 191.5v-149C0 19 19 0 42.5 0z" opacity=".12" /><path d="M116 63l-39 86h17l9-20h38l9 20h18L129 63h-13zm-8 52l14-32 14 32h-28zM155 78h16v71h-16V78zm8-26a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" /></svg> },
                    { name: 'Photoshop', svg: <svg viewBox="0 0 240 234" className="h-12 w-auto" fill="currentColor"><path d="M42.5 0h155C221 0 240 19 240 42.5v149c0 23.5-19 42.5-42.5 42.5h-155C19 234 0 215 0 191.5v-149C0 19 19 0 42.5 0z" opacity=".12" /><path d="M69 63h35c20 0 33 11 33 29s-13 30-34 30H85v27H69V63zm16 45h17c12 0 19-5 19-16s-7-15-19-15H85v31zM141 130c0-25 17-42 41-42 4 0 7 0 10 1V63h15v85c-5 2-13 4-22 4-26 0-44-14-44-22zm51-27c-3-1-6-2-10-2-14 0-25 9-25 27 0 15 8 24 24 24 4 0 8 0 11-1v-48z" /></svg> },
                    { name: 'Sketch', svg: <svg viewBox="0 0 500 500" className="h-12 w-auto" fill="currentColor"><path d="M250 80l-175 75L75 300l175 120 175-120-0-145L250 80zm0 30l140 60-14 116L250 390l-126-104L110 170l140-60zm0 40l-93 40 9 77 84 69 84-69 9-77L250 150z" /></svg> },
                    { name: 'Webflow', svg: <svg viewBox="0 0 192 128" className="h-12 w-auto" fill="currentColor"><path d="M141.3 0C120 0 104 15 98 37c-8-15-21-25-37-25v37s0-25 25-37v113h25V68c0-25 12-43 30-43 17 0 26 12 26 30v70h25V52c0-32-16-52-51-52zM37 12C17 12 0 29 0 64s17 52 37 52 37-17 37-52S57 12 37 12zm0 25c7 0 12 12 12 27S44 91 37 91s-12-12-12-27 5-27 12-27z" /></svg> },
                    { name: 'Framer', svg: <svg viewBox="0 0 14 21" className="h-12 w-auto" fill="currentColor"><path d="M0 0h14v7H7L0 0zm0 7h7l7 7H7v7L0 14V7z" /></svg> },
                    { name: 'After Effects', svg: <svg viewBox="0 0 240 234" className="h-12 w-auto" fill="currentColor"><path d="M42.5 0h155C221 0 240 19 240 42.5v149c0 23.5-19 42.5-42.5 42.5h-155C19 234 0 215 0 191.5v-149C0 19 19 0 42.5 0z" opacity=".12" /><path d="M87 63l-39 86h17l9-20h38l9 20h18L100 63H87zm-8 52l14-32 14 32H79zm91-52h16v86h-16V63zm-11 0h13l28 42-28 44h-14l30-44-29-42z" /></svg> },
                  ].map((tool, i) => (
                    <div
                      key={`${tool.name}-${i}`}
                      className="w-24 h-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center text-[#1a1a1a]/40 hover:text-[#1a1a1a] hover:shadow-lg hover:scale-110 hover:border-gray-200 transition-all duration-300 shrink-0 cursor-default"
                      title={tool.name}
                    >
                      {tool.svg}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>

          {/* ── EXPERIENCE ── */}
          <section id="experience" className="py-28 px-6 md:px-12 bg-[#f8f9fa] border-t border-gray-100">
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-14 gap-8">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span> Work History
                    </p>
                    <h2 className="text-4xl font-semibold leading-tight">Explore My Design<br />Journey</h2>
                  </div>
                  <div className="max-w-sm">
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                      Over a decade of crafting visual identities, leading creative teams, and delivering work that moves people across Sri Lanka and internationally.
                    </p>
                    <a href="#contact" className="inline-flex items-center gap-1 text-[12px] font-semibold text-black border-b border-black pb-0.5 hover-underline">
                      Work Together <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Reveal>

              <div className="flex flex-col gap-4">
                <TimelineRow
                  company="Tavisgo Motors (Pvt) Ltd"
                  location="Sri Lanka"
                  period="2024 — Present"
                  role="Creative Director"
                  description="Developing integrated marketing strategies, leading brand campaigns, overseeing digital and print creative across all touchpoints."
                  tags={['Brand Strategy', 'Art Direction']}
                  featured
                  delay={100}
                />
                <TimelineRow
                  company="British Cosmetics (Pvt) Ltd"
                  location="Sri Lanka"
                  period="2020 — 2024"
                  role="Creative Director"
                  description="Oversaw all visual output. Packaging design, compliance labelling, digital campaigns, web banners, and photo production for 50+ SKUs."
                  tags={['Packaging Design', 'Digital Campaigns']}
                  delay={150}
                />
                <TimelineRow
                  company="Boost Metrics"
                  location="Sri Lanka"
                  period="2019 — 2022"
                  role="Creative Designer"
                  description="Delivered print and digital collateral, brand identities, web assets, and motion graphics for a diverse range of marketing clients."
                  tags={['Brand Identity', 'Motion Graphics']}
                  delay={200}
                />
                <TimelineRow
                  company="Matjar Alwatany Trading Company"
                  location="Saudi Arabia"
                  period="2015 — 2018"
                  role="Graphic Designer"
                  description="Produced sales campaign visuals, in-store signage, vendor brand videos for big-screen display, and photo editing across retail touchpoints."
                  tags={['Print Design', 'Retail Branding']}
                  delay={250}
                />
                <TimelineRow
                  company="Tavisgo Motors (Pvt) Ltd"
                  location="Sri Lanka"
                  period="2014 — 2015"
                  role="Creative Designer"
                  description="Designed motion graphics, edited photography, and developed visual assets for automotive marketing materials."
                  tags={['Photography', 'Motion Graphics']}
                  delay={300}
                />
              </div>
            </div>
          </section>

          {/* ── PORTFOLIO ── */}
          <section id="portfolio" className="py-28 px-6 md:px-12 bg-[#f8f9fa] border-t border-gray-100">
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-14">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span> Portfolio
                    </p>
                    <h2 className="text-4xl font-semibold leading-tight">Latest Works</h2>
                  </div>
                  <a href="/work" className="mt-4 md:mt-0 inline-flex items-center gap-1 text-[12px] font-semibold text-black border-b border-black pb-0.5 hover-underline">
                    View All Work <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </Reveal>

              {/* Featured video — Ford Bronco */}
              <Reveal delay={0}>
                <VideoProjectCard
                  label="Commercial Video — Tavisgo Motors"
                  title="Ford Bronco – Outer Banks Commercial"
                  desc="A high-impact cinematic commercial for large-format display. The narrative follows a journey from urban confinement to untamed wilderness — visually representing freedom, power, and self-discovery."
                  tags={['After Effects', 'Premiere Pro', 'Motion Design', 'Cinematic']}
                  video="/Ford_Outer_Banks_Commercial.mp4"
                />
              </Reveal>

              {/* 3-col grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <Reveal delay={100}>
                  <ProjectCard
                    label="Product Design — British Cosmetics"
                    title="Prevense Facewash"
                    desc="Pure science meets everyday care. A premium label and product identity for Prevense Facewash combining clinical credibility with minimal elegance."
                    tags={['Packaging Design', 'Label Design', 'Brand Identity']}
                    image="/britishcosmetics-1.jpg"
                  />
                </Reveal>
                <Reveal delay={200}>
                  <ProjectCard
                    label="Luxury Campaign — British Cosmetics"
                    title="Prevense Gold Range"
                    desc="Radiance Redefined. Luxury branding, packaging and campaign development for the Prevense Gold Range — gold accents, premium finishes, and a coherent brand story."
                    tags={['Luxury Branding', 'Packaging', 'Campaign']}
                    image="/prevense-1.jpg"
                  />
                </Reveal>
                <Reveal delay={300}>
                  <ProjectCard
                    label="Publication Design — UN"
                    title="UN Report Cover & Template"
                    desc="Global Unity & Impact. A clean, modern and globally aligned report identity system for UN publications — clarity, authority, and inclusivity."
                    tags={['Publication Design', 'Template', 'Editorial']}
                    image="/UN-1.jpg"
                  />
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section id="contact" className="mx-4 md:mx-10 my-12 bg-[#1a1a1a] text-white rounded-3xl py-24 px-8 relative overflow-hidden">
            {/* Decorative rings */}
            <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full border border-white/5 pointer-events-none"></div>
            <div className="absolute -top-16 -right-16 w-[280px] h-[280px] rounded-full border border-white/5 pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full border border-white/5 pointer-events-none"></div>

            <Reveal className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-5">Let&apos;s Create Together</p>
              <h2 className="text-4xl md:text-5xl font-semibold mb-5 leading-tight">
                Got a Vision?<br />Let&apos;s Bring It to Life!
              </h2>
              <p className="text-gray-400 max-w-lg text-[13px] leading-relaxed mb-10">
                Whether you need a complete brand identity, a packaging system, a digital campaign, or strategic creative direction. I&apos;m here to make it happen. Let&apos;s talk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <a href="mailto:thouheedshereef@gmail.com"
                  className="flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-100 active:scale-95 transition-all duration-200">
                  Book a Call <ArrowRight className="w-4 h-4" />
                </a>
                <a href="mailto:thouheedshereef@gmail.com"
                  className="flex items-center gap-2 px-8 py-3.5 border border-white/20 text-white rounded-full font-medium text-sm hover:border-white transition-all duration-200">
                  <Mail className="w-4 h-4" /> Send an Email
                </a>
              </div>
            </Reveal>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer className="bg-[#111] text-gray-400 py-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-semibold">Thawheed De Alwis</span>
              </div>
              <p className="text-[11px] max-w-[220px] leading-relaxed">Creative Director &amp; Graphic Designer<br />Colombo, Sri Lanka</p>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[12px]">
              {['About Me', 'Experience', 'Toolkit', 'Portfolio', 'Contact'].map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="hover:text-white transition-colors duration-200">{link}</a>
              ))}
            </nav>

            {/* Contact */}
            <div className="flex flex-col gap-2 text-[12px]">
              <a href="mailto:thouheedshereef@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <Mail className="w-3.5 h-3.5" /> thouheedshereef@gmail.com
              </a>
              <a href="tel:+94779081798" className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <Phone className="w-3.5 h-3.5" /> (+94) 77 908 1798
              </a>
              <a href="https://www.linkedin.com/in/thawheed-de-alwis" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> LinkedIn Profile
              </a>
              <a href="https://www.behance.net/thouheeddealwis" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.051-1.598-5.051-5.355 0-3.590 1.925-5.744 5.051-5.744 3.074 0 4.814 1.867 5.101 4.996.047.437.069.885.069 1.353H15.5c.13 2.002 1.182 2.418 2.368 2.418 1.187 0 1.817-.694 2.063-1.667h3.795zm-7.44-3.667h3.569c-.051-1.453-.9-2.22-1.784-2.22-.929 0-1.645.748-1.785 2.22zM9.5 12.4c0 1.97-1.066 3.21-2.79 3.21-1.12 0-1.893-.453-2.21-1.193V15.5H1V5h3.5v3.827c.317-.693 1.007-1.127 2.21-1.127C8.434 7.7 9.5 8.957 9.5 12.4zm-3.414 0c0-1.518-.513-2.4-1.42-2.4-.907 0-1.416.882-1.416 2.4 0 1.516.51 2.4 1.416 2.4.907 0 1.42-.884 1.42-2.4z" /></svg> Behance Portfolio
              </a>
            </div>

          </div>

          <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-gray-600">
            <p>© {new Date().getFullYear()} Thawheed De Alwis. All rights reserved.</p>
            <p>Designed &amp; built with passion.</p>
          </div>
        </footer>

      </div>
    </MobileMenuCtx.Provider>
  );
}
