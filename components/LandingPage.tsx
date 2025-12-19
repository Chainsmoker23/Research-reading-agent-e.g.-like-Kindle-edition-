import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Brain, Sprout, ArrowRight, Search, 
  Atom, Globe, Sparkles, Feather, ChevronDown,
  Layers, Zap, Library, FileText, CheckCircle2,
  Network, Users, Activity, GraduationCap
} from 'lucide-react';
import { Theme } from '../types';

interface LandingPageProps {
  onStart: () => void;
  theme: Theme;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, theme }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  // Parallax Helper
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

  return (
    <div 
      className="flex-1 bg-main overflow-x-hidden selection:bg-violet-200 selection:text-violet-900" 
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

        {/* Ambient Gradient Blobs (Purple/Violet Theme) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-violet-300/30 dark:bg-violet-900/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] bg-fuchsia-300/30 dark:bg-fuchsia-900/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Parallax Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
           <div style={parallax(-0.5)} className="absolute top-1/4 left-[15%] text-purple-500/30">
             <Globe size={80} strokeWidth={0.5} />
           </div>
           <div style={parallax(-0.8)} className="absolute top-1/3 right-[10%] text-fuchsia-500/30">
             <Atom size={120} strokeWidth={0.5} />
           </div>
           <div style={parallax(0.3, 'rotate')} className="absolute bottom-1/4 left-[20%] text-indigo-400/20">
             <Feather size={60} strokeWidth={1} />
           </div>
           <div style={parallax(0.6)} className="absolute bottom-[15%] right-[20%] text-violet-400/20">
             <Sparkles size={40} strokeWidth={1} />
           </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/80 backdrop-blur-md border border-violet-200/50 dark:border-violet-800/30 text-textMuted text-xs font-mono tracking-widest uppercase shadow-sm hover:bg-surface transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
              The Future of Reading
            </span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black text-textMain tracking-tight leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Read Less.<br/>
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 dark:from-violet-300 dark:via-fuchsia-300 dark:to-purple-300 pb-2">
              Understand More.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-violet-400 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              className="group relative px-8 py-4 bg-textMain text-main rounded-full font-bold text-lg shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full sm:w-auto border border-transparent"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Researching <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-surface/50 backdrop-blur-sm border border-borderSkin text-textMain rounded-full font-medium hover:bg-surface hover:border-violet-300 transition-all w-full sm:w-auto"
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

      {/* --- TRUSTED BY MARQUEE --- */}
      <section className="py-12 border-y border-borderSkin bg-surface/50 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-textMuted mb-8">Trusted by researchers from</p>
        <div className="relative flex w-full overflow-hidden mask-fade-sides">
          {/* Mask gradient for sides */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-main to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-main to-transparent z-10"></div>
          
          <div className="flex animate-scroll whitespace-nowrap gap-16 px-8 min-w-full items-center">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {['MIT', 'Stanford', 'Oxford', 'ETH Zurich', 'Harvard', 'Cambridge', 'Caltech', 'Max Planck', 'Tokyo Univ'].map((name) => (
                  <div key={name} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default group">
                    <GraduationCap size={20} className="text-violet-500" />
                    <span className="font-serif font-bold text-lg text-textMain">{name}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* --- CHAOS TO CLARITY SECTION --- */}
      <section ref={compareRef} className="py-32 px-6 bg-main relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-textMain mb-6">From Chaos to Clarity</h2>
            <p className="text-lg text-textMuted max-w-2xl mx-auto">See how OpenParallax transforms dense, multi-column PDFs into a streamlined reading experience.</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {/* Left Card: The Problem */}
            <div className="relative w-full md:w-[400px] h-[500px] bg-white border border-borderSkin shadow-lg rounded-xl p-6 transform md:rotate-[-3deg] md:translate-x-12 z-10 overflow-hidden hover:z-30 hover:rotate-0 transition-all duration-500 group">
              <div className="absolute inset-0 bg-red-500/5 group-hover:bg-transparent transition-colors"></div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div className="text-xs text-red-500 font-bold uppercase flex items-center gap-1"><FileText size={12}/> Standard PDF</div>
                <div className="text-[10px] text-gray-400">Page 1 of 24</div>
              </div>
              <div className="space-y-2 opacity-60 blur-[0.5px] group-hover:blur-0 transition-all">
                <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                <div className="grid grid-cols-2 gap-2 text-[6px] text-justify leading-tight font-serif text-gray-600">
                  <div className="space-y-1">
                     {[...Array(12)].map((_,i) => <div key={i} className="h-1.5 w-full bg-gray-200 rounded"></div>)}
                  </div>
                  <div className="space-y-1">
                     {[...Array(12)].map((_,i) => <div key={i} className="h-1.5 w-full bg-gray-200 rounded"></div>)}
                  </div>
                </div>
                <div className="h-24 w-full bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs mt-2">Complex Diagram</div>
                <div className="grid grid-cols-2 gap-2 text-[6px] text-justify leading-tight font-serif text-gray-600 mt-2">
                  <div className="space-y-1">
                     {[...Array(8)].map((_,i) => <div key={i} className="h-1.5 w-full bg-gray-200 rounded"></div>)}
                  </div>
                  <div className="space-y-1">
                     {[...Array(8)].map((_,i) => <div key={i} className="h-1.5 w-full bg-gray-200 rounded"></div>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Processor */}
            <div className="relative z-20 flex flex-col items-center justify-center w-24 h-24 md:mx-4">
               <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping"></div>
               <div className="relative w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center text-white shadow-xl">
                 <Sparkles size={24} className="animate-spin-slow" />
               </div>
               <div className="mt-4 font-mono text-xs font-bold text-violet-600 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm">AI Engine</div>
            </div>

            {/* Right Card: The Solution */}
            <div className="relative w-full md:w-[400px] h-[500px] bg-surface border border-violet-200 shadow-2xl rounded-xl p-8 transform md:rotate-[3deg] md:-translate-x-12 z-10 hover:z-30 hover:rotate-0 transition-all duration-500 group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
              <div className="flex justify-between items-center mb-6">
                <div className="text-xs text-violet-600 font-bold uppercase flex items-center gap-1"><Zap size={12}/> OpenParallax</div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-8 w-5/6 bg-textMain rounded opacity-90"></div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-[10px] font-bold">CORE CONCEPT</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">5 MIN READ</span>
                </div>
                
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-4/5 bg-gray-200 rounded"></div>
                </div>

                <div className="p-4 bg-violet-50 border border-violet-100 rounded-lg my-4">
                  <div className="flex gap-2 items-center mb-2">
                    <Brain size={14} className="text-violet-600"/>
                    <span className="text-xs font-bold text-violet-800">AI Insight</span>
                  </div>
                  <div className="h-2 w-full bg-violet-200/50 rounded mb-1"></div>
                  <div className="h-2 w-3/4 bg-violet-200/50 rounded"></div>
                </div>
                
                <button className="w-full py-2 bg-textMain text-main text-xs font-bold rounded-lg mt-4 flex items-center justify-center gap-2 group-hover:bg-violet-600 transition-colors">
                  Ask AI Mentor <ArrowRight size={12}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section id="features" ref={featuresRef} className="py-24 px-6 bg-surface border-y border-borderSkin relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen size={32} />,
                title: "Kindle-Style Reader",
                desc: "No more two-column PDFs. We reformat every paper into a clean, single-column reading experience designed for focus.",
                color: "violet"
              },
              {
                icon: <Brain size={32} />,
                title: "Cognitive Rewrite",
                desc: "Our AI translates dense jargon into plain English concepts, highlighting methodology and core findings automatically.",
                color: "fuchsia"
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
                className="group relative p-8 rounded-3xl bg-main border border-borderSkin hover:border-transparent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-${feature.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className={`relative w-16 h-16 rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-900/20 text-${feature.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                
                <h3 className="relative font-serif text-2xl font-bold text-textMain mb-4 group-hover:text-violet-700 transition-colors">
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

      {/* --- STATS & NETWORK --- */}
      <section ref={statsRef} className="py-24 px-6 bg-main relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
           <svg className="w-full h-full" viewBox="0 0 100 100">
             <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
               <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             </pattern>
             <rect width="100" height="100" fill="url(#grid)" />
           </svg>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
           <div className="flex-1 space-y-8">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-textMain">Expanding the Knowledge Graph</h2>
              <p className="text-xl text-textMuted">Join a rapidly growing network of researchers transforming how science is consumed.</p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                 {[
                   { label: "Papers Parsed", value: "12M+", icon: <FileText size={20} className="text-violet-500"/> },
                   { label: "Active Researchers", value: "85k+", icon: <Users size={20} className="text-fuchsia-500"/> },
                   { label: "Daily Queries", value: "1.2M", icon: <Activity size={20} className="text-emerald-500"/> },
                   { label: "Knowledge Nodes", value: "450M+", icon: <Network size={20} className="text-amber-500"/> },
                 ].map((stat, i) => (
                   <div key={i} className="p-4 bg-surface rounded-xl border border-borderSkin shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        {stat.icon}
                        <span className="text-xs font-bold text-textMuted uppercase">{stat.label}</span>
                      </div>
                      <div className="text-3xl font-bold text-textMain">{stat.value}</div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Abstract Visualizer */}
           <div className="flex-1 w-full h-[400px] bg-surface border border-borderSkin rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50"></div>
              {/* Floating Nodes */}
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-white shadow-md border border-violet-100 flex items-center justify-center animate-pulse-slow"
                  style={{
                    width: Math.random() * 60 + 40 + 'px',
                    height: Math.random() * 60 + 40 + 'px',
                    top: Math.random() * 80 + '%',
                    left: Math.random() * 80 + '%',
                    animationDelay: i * 0.5 + 's',
                    animationDuration: (Math.random() * 3 + 3) + 's'
                  }}
                >
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                </div>
              ))}
              {/* Connecting Lines (Simulated with SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                 <path d="M 50,50 Q 200,100 350,50 T 350,300" stroke="currentColor" strokeWidth="2" fill="none" className="text-violet-500 animate-pulse" />
                 <path d="M 350,50 Q 200,300 50,300" stroke="currentColor" strokeWidth="2" fill="none" className="text-fuchsia-500" />
              </svg>

              <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-violet-100 shadow-lg">
                 <div className="flex gap-3 items-center">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <div className="text-sm font-medium text-textMain">Live System Status: <span className="text-green-600 font-bold">Operational</span></div>
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
          <div className="w-16 h-16 bg-violet-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 rotate-12 shadow-lg group hover:rotate-0 transition-transform duration-300">
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
              className="px-12 py-5 bg-violet-500 text-white rounded-full font-bold text-lg hover:bg-violet-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(139,92,246,0.5)]"
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