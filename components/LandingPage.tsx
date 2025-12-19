import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Brain, Sprout, ArrowRight, Search, 
  Atom, Globe, Sparkles, Feather, ChevronDown,
  Layers, Zap, Library
} from 'lucide-react';
import { Theme } from '../types';

interface LandingPageProps {
  onStart: () => void;
  theme: Theme;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, theme }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse Move for Parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize -1 to 1
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    
    setMousePos({ x, y });
  };

  // Parallax Calculation
  const parallax = (depth: number, type: 'translate' | 'rotate' = 'translate') => {
    if (type === 'rotate') {
      return {
        transform: `rotate(${mousePos.x * depth * 10}deg)`,
        transition: 'transform 0.1s ease-out'
      };
    }
    return {
      transform: `translate(${mousePos.x * depth * 30}px, ${mousePos.y * depth * 30}px)`,
      transition: 'transform 0.1s ease-out'
    };
  };

  // 3D Tilt Effect for Mockup
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = (x / rect.width) - 0.5;
    const yPct = (y / rect.height) - 0.5;

    setTilt({ x: -yPct * 20, y: xPct * 20 });
  };

  const handleCardLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className="flex-1 bg-main overflow-x-hidden selection:bg-amber-200 selection:text-amber-900" 
      onMouseMove={handleMouseMove}
    >
      
      {/* --- HERO SECTION --- */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20"
      >
        {/* Dynamic Grid Background */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            transform: `perspective(500px) rotateX(60deg) translateY(${scrollY * 0.5}px) scale(2)`,
            transformOrigin: 'top center'
          }}
        ></div>

        {/* Ambient Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-amber-200/20 dark:bg-amber-900/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Parallax Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
           <div style={parallax(-0.5)} className="absolute top-1/4 left-[15%] text-emerald-500/30">
             <Globe size={80} strokeWidth={0.5} />
           </div>
           <div style={parallax(-0.8)} className="absolute top-1/3 right-[10%] text-amber-500/30">
             <Atom size={120} strokeWidth={0.5} />
           </div>
           <div style={parallax(0.3, 'rotate')} className="absolute bottom-1/4 left-[20%] text-indigo-400/20">
             <Feather size={60} strokeWidth={1} />
           </div>
           <div style={parallax(0.6)} className="absolute bottom-[15%] right-[20%] text-rose-400/20">
             <Sparkles size={40} strokeWidth={1} />
           </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/50 backdrop-blur-md border border-borderSkin text-textMuted text-xs font-mono tracking-widest uppercase shadow-sm hover:bg-surface transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              The Future of Reading
            </span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black text-textMain tracking-tight leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Read Less.<br/>
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 dark:from-amber-200 dark:via-orange-300 dark:to-amber-400 pb-2">
              Understand More.
              {/* Underline decoration */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-400 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.00025 6.99997C18.5002 9.77975 62.1118 9.72907 112.111 6.99997C156.111 4.59997 197 2.00002 197 2.00002" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-textMuted max-w-2xl mx-auto leading-relaxed font-serif animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Your personal AI research mentor. We distill complex academic papers into clear, narrative insights instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={onStart}
              className="group relative px-8 py-4 bg-textMain text-main rounded-full font-bold text-lg shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Researching <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-surface/50 backdrop-blur-sm border border-borderSkin text-textMain rounded-full font-medium hover:bg-surface transition-colors w-full sm:w-auto"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-textMuted/50 transition-opacity duration-500"
          style={{ opacity: scrollY > 100 ? 0 : 1 }}
        >
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown size={24} />
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID (Staggered Reveal) --- */}
      <section id="features" ref={featuresRef} className="py-32 px-6 bg-surface border-t border-borderSkin relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
             <h2 className="font-serif text-3xl md:text-5xl font-bold text-textMain">Designed for Deep Work</h2>
             <p className="text-textMuted text-lg max-w-2xl mx-auto">The tools you need to master any subject, built into one seamless flow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen size={32} />,
                title: "Kindle-Style Reader",
                desc: "No more two-column PDFs. We reformat every paper into a clean, single-column reading experience designed for focus.",
                color: "amber"
              },
              {
                icon: <Brain size={32} />,
                title: "Cognitive Rewrite",
                desc: "Our AI translates dense jargon into plain English concepts, highlighting methodology and core findings automatically.",
                color: "emerald"
              },
              {
                icon: <Sprout size={32} />,
                title: "Knowledge Tree",
                desc: "Visualize your growth. Earn ranks from 'Curious Observer' to 'God of Knowledge' as you read more papers.",
                color: "indigo"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative p-8 rounded-3xl bg-main border border-borderSkin hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-${feature.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className={`relative w-16 h-16 rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-900/20 text-${feature.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                
                <h3 className="relative font-serif text-2xl font-bold text-textMain mb-4 group-hover:text-amber-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-textMuted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LIVE DEMO SECTION (3D Tilt) --- */}
      <section ref={demoRef} className="py-32 px-6 overflow-hidden bg-main relative">
        {/* Background Stripe */}
        <div className="absolute top-1/2 left-0 right-0 h-[500px] -translate-y-1/2 bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-amber-500/5 -skew-y-3 transform z-0"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 text-amber-600 font-bold uppercase tracking-wider text-sm">
              <Library size={18} /> Global Repository
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-textMain leading-tight">
              One search. <br/>
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-purple-600">Infinite knowledge.</span>
            </h2>
            <p className="text-xl text-textMuted leading-relaxed">
              Stop jumping between tabs. OpenParallax aggregates millions of papers from arXiv, Nature, IEEE, and more into one unified interface.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-4">
              {['Physics', 'Computer Science', 'Biology', 'History', 'Medicine'].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-lg bg-surface border border-borderSkin text-textMuted text-sm font-medium hover:border-amber-400 hover:text-amber-600 transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
            </div>

            <button 
              onClick={onStart}
              className="mt-8 text-textMain font-bold text-lg underline underline-offset-8 decoration-2 decoration-amber-500/50 hover:decoration-amber-500 transition-all hover:text-amber-600 flex items-center gap-2"
            >
              Try it yourself <ArrowRight size={18} />
            </button>
          </div>
          
          {/* 3D TILT MOCKUP */}
          <div className="flex-1 w-full perspective-1000">
             <div 
               ref={cardRef}
               onMouseMove={handleCardMouseMove}
               onMouseLeave={handleCardLeave}
               className="relative w-full max-w-lg mx-auto transition-transform duration-100 ease-out"
               style={{
                 transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                 transformStyle: 'preserve-3d'
               }}
             >
               {/* Card Glow */}
               <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500 to-purple-600 rounded-3xl blur-2xl opacity-20 -z-10 animate-pulse"></div>
               
               {/* Main Card */}
               <div className="bg-surface border border-borderSkin rounded-2xl shadow-2xl p-6 md:p-8 h-[400px] flex flex-col relative overflow-hidden backdrop-blur-xl">
                  {/* Floating Elements inside card */}
                  <div className="flex items-center gap-3 mb-8 border-b border-borderSkin pb-4" style={{ transform: 'translateZ(20px)' }}>
                    <Search size={20} className="text-textMuted" />
                    <div className="h-2 w-32 bg-borderSkin rounded-full"></div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-amber-400"></div>
                  </div>
                  
                  <div className="space-y-6" style={{ transform: 'translateZ(40px)' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4 group cursor-default">
                        <div className="w-12 h-16 bg-main border border-borderSkin rounded flex-shrink-0 group-hover:border-amber-400 transition-colors"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-3/4 bg-textMain/10 rounded group-hover:bg-textMain/20 transition-colors"></div>
                          <div className="h-2 w-full bg-borderSkin rounded"></div>
                          <div className="h-2 w-1/2 bg-borderSkin rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="absolute bottom-6 left-0 right-0 text-center transform translate-z-30" style={{ transform: 'translateZ(60px)' }}>
                    <div className="inline-block px-4 py-2 bg-textMain text-main rounded-lg shadow-lg text-sm font-bold">
                      +1.5M New Papers Daily
                    </div>
                  </div>
               </div>
             </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-24 px-6 bg-textMain text-main text-center relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 rotate-12 shadow-lg">
            <Zap size={32} fill="currentColor" />
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl font-bold">
            Ready to upgrade your mind?
          </h2>
          <p className="text-main/70 text-xl font-light max-w-xl mx-auto">
            Join a community of curious minds. Your personal library awaits.
          </p>
          <div className="pt-8">
            <button 
              onClick={onStart}
              className="px-12 py-5 bg-amber-500 text-white rounded-full font-bold text-lg hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(245,158,11,0.5)]"
            >
              Enter OpenParallax
            </button>
          </div>
          <p className="text-xs text-main/40 mt-8 font-mono">
            © 2024 OpenParallax. Science for everyone.
          </p>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;