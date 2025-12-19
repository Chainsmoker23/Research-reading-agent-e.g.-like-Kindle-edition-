import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Brain, Sprout, ArrowRight, Search, 
  Atom, Globe, Sparkles, Feather, ChevronDown,
  Layers, Zap, Library, FileText, CheckCircle2,
  Network, Users, Activity, GraduationCap,
  BrainCircuit, Highlighter, Coffee
} from 'lucide-react';
import { Theme } from '../types';
import { AntMascot } from './AntMascot';
import { SpiderMascot } from './SpiderMascot';
import { WanderingAnt } from './WanderingAnt';

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

        {/* Parallax Elements - Mascots & Icons */}
        <div className="absolute inset-0 pointer-events-none z-0">
           {/* Original Icons */}
           <div style={parallax(-0.5)} className="absolute top-1/4 left-[15%] text-purple-500/30">
             <Globe size={80} strokeWidth={0.5} />
           </div>
           <div style={parallax(-0.8)} className="absolute top-1/3 right-[10%] text-fuchsia-500/30">
             <Atom size={120} strokeWidth={0.5} />
           </div>
           
           {/* WANDERING ANTS COLONY */}
           {/* We use a container ref for the ants to wander within */}
           <div className="absolute inset-0 pointer-events-none" id="ant-container">
              <WanderingAnt 
                variant="fire" 
                className="w-12 h-12 md:w-16 md:h-16 drop-shadow-md" 
                boundsRef={heroRef} 
                startPos={{x: 80, y: 20}}
              />
              <WanderingAnt 
                variant="black" 
                className="w-10 h-10 md:w-14 md:h-14 drop-shadow-md" 
                boundsRef={heroRef} 
                startPos={{x: 10, y: 80}}
              />
              <WanderingAnt 
                variant="red" 
                className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" 
                boundsRef={heroRef} 
                startPos={{x: 20, y: 85}}
              />
              <WanderingAnt 
                variant="green" 
                className="w-8 h-8 drop-shadow-md" 
                boundsRef={heroRef} 
                startPos={{x: 90, y: 90}}
              />
              <WanderingAnt 
                variant="hybrid" 
                className="w-8 h-8 opacity-70" 
                boundsRef={heroRef} 
                startPos={{x: 15, y: 30}}
              />
           </div>

           {/* SPIDER: Black Widow hanging from top left */}
           <div className="absolute -top-20 left-[5%] animate-float-delayed" style={{ animationDuration: '8s' }}>
              <div className="h-40 w-[1px] bg-gray-400 mx-auto opacity-50"></div>
              <SpiderMascot variant="black" className="w-16 h-16 rotate-180 drop-shadow-xl" />
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
            {/* Left Card: The Chaotic Problem */}
            <div className="relative w-full md:w-[400px] h-[550px] bg-[#fdfbf7] border border-borderSkin shadow-lg rounded-sm p-8 transform md:rotate-[-3deg] md:translate-x-12 z-10 overflow-hidden hover:z-30 hover:rotate-0 transition-all duration-500 group">
              
              {/* Coffee Stain */}
              <svg className="absolute top-10 right-8 w-24 h-24 opacity-10 pointer-events-none mix-blend-multiply" viewBox="0 0 100 100">
                <path d="M50,10 A40,40 0 1,1 10,50 A40,40 0 0,1 50,10 M50,15 A35,35 0 1,0 15,50 A35,35 0 0,0 50,15" fill="#5D4037" />
                <path d="M50,10 Q60,5 70,15" fill="none" stroke="#5D4037" strokeWidth="2" opacity="0.5" />
              </svg>

              {/* Header Info */}
              <div className="border-b-2 border-black mb-4 pb-2">
                 <div className="h-4 w-3/4 bg-black/80 mb-2"></div>
                 <div className="h-3 w-1/2 bg-black/60"></div>
              </div>

              {/* Dense 2-Column Layout */}
              <div className="grid grid-cols-2 gap-3 h-full opacity-70">
                 {/* Column 1 */}
                 <div className="space-y-1.5">
                    {[...Array(20)].map((_, i) => (
                      <div key={`c1-${i}`} className="h-1 bg-black/40 w-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                    ))}
                    <div className="h-16 w-full bg-black/10 border border-black/20 my-2 flex items-center justify-center">
                       <Activity size={12} className="opacity-20"/>
                    </div>
                    {[...Array(15)].map((_, i) => (
                      <div key={`c1-b-${i}`} className="h-1 bg-black/40 w-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                    ))}
                 </div>
                 {/* Column 2 */}
                 <div className="space-y-1.5">
                    {[...Array(12)].map((_, i) => (
                      <div key={`c2-${i}`} className="h-1 bg-black/40 w-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                    ))}
                    {/* Scribbled Note in Margin */}
                    <div className="relative">
                       <div className="absolute -left-4 top-0 w-24 h-8 border-2 border-red-500/50 rounded-full rotate-[-10deg]"></div>
                       <span className="absolute -left-2 -top-4 text-[10px] text-red-600 font-handwriting rotate-[-15deg]">What??</span>
                    </div>
                    {[...Array(25)].map((_, i) => (
                      <div key={`c2-b-${i}`} className="h-1 bg-black/40 w-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                    ))}
                 </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute bottom-10 left-6 transform rotate-3">
                 <div className="bg-yellow-200/50 p-2 text-[8px] font-mono border border-yellow-300 w-32 shadow-sm">
                    Fig 2.1: Data correlation in non-linear vector space...
                 </div>
              </div>

              {/* Creative: Confused Black Ant on the messy PDF */}
              <div className="absolute -left-4 top-1/2 z-20 animate-wiggle">
                 <AntMascot variant="black" className="w-12 h-12 rotate-[-90deg] drop-shadow-md" isMoving={true} />
                 <div className="absolute -top-4 -left-2 text-2xl animate-pulse font-bold text-red-600">?</div>
              </div>

              {/* Spider crawling on the messy PDF */}
              <div className="absolute top-4 right-4 z-20 animate-pulse-slow">
                 <SpiderMascot variant="garden" className="w-10 h-10 rotate-[135deg] opacity-80" />
              </div>
            </div>

            {/* Center Processor (OBSIDIAN ENGINE) */}
            <div className="relative z-20 flex flex-col items-center justify-center w-32 h-32 md:mx-4 -my-8 md:my-0">
               {/* Scanning Beam Animation */}
               <div className="absolute w-[200px] h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-[pulse_2s_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-0 md:opacity-100 z-0"></div>
               
               <div className="absolute inset-0 bg-stone-900/10 rounded-full animate-ping"></div>
               <div className="relative w-20 h-20 bg-gradient-to-br from-stone-800 to-black rounded-full flex items-center justify-center text-amber-400 shadow-2xl border-2 border-stone-700">
                 <BrainCircuit size={32} className="animate-pulse" />
               </div>
               <div className="mt-4 px-3 py-1 bg-stone-900 text-stone-200 text-[10px] font-mono tracking-widest rounded-full border border-stone-700 shadow-lg z-20 uppercase">
                 Neural Parse
               </div>
            </div>

            {/* Right Card: The Solution (Clean E-Reader) */}
            <div className="relative w-full md:w-[400px] h-[550px] bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 transform md:rotate-[3deg] md:-translate-x-12 z-10 hover:z-30 hover:rotate-0 transition-all duration-500 group overflow-hidden">
              
              {/* E-Reader UI Header */}
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center text-amber-700">
                      <Zap size={14} />
                   </div>
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">OpenParallax Reader</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">100% Focus</div>
              </div>

              {/* Title & Meta */}
              <div className="mb-6">
                 <h3 className="font-serif text-2xl font-bold text-gray-900 leading-tight mb-2">The Future of AI Reasoning</h3>
                 <p className="text-xs text-gray-500 italic">J. Doe et al. • 2024</p>
              </div>
              
              {/* Clean Content */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="w-1 h-12 bg-amber-400 rounded-full shrink-0 mt-1"></div>
                   <p className="text-sm text-gray-600 leading-relaxed font-serif">
                     <span className="bg-yellow-100 px-1 rounded">Core Concept:</span> Large language models demonstrate emergent reasoning capabilities when prompted with chain-of-thought methodologies.
                   </p>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed font-serif">
                  This study proposes a novel framework for evaluating step-by-step logic, reducing hallucination rates by <strong className="text-gray-900">45%</strong> compared to zero-shot baselines.
                </p>

                {/* Interactive Element: Highlight */}
                <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-100 relative group/insight cursor-help">
                   <div className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full border border-stone-200 shadow-sm text-amber-500">
                      <Highlighter size={14} />
                   </div>
                   <h4 className="text-xs font-bold text-stone-900 uppercase mb-1">Key Insight</h4>
                   <p className="text-xs text-stone-600">
                     "Self-correction is more effective than external verification."
                   </p>
                </div>
              </div>

              {/* Creative: Happy Fire Ant reading the clear text */}
              <div className="absolute -right-6 bottom-20 z-20 animate-float">
                 <AntMascot variant="fire" className="w-14 h-14 rotate-[-15deg] drop-shadow-md" isMoving={true} />
                 <div className="absolute -top-4 -right-2 text-lg text-amber-500 animate-bounce">♥</div>
              </div>

              {/* Robot Spider assisting */}
              <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <SpiderMascot variant="robot" className="w-10 h-10 rotate-[10deg]" />
              </div>

              {/* Page Number */}
              <div className="absolute bottom-4 right-8 text-[10px] text-gray-300 font-mono">
                 Pg 1 / 1
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
                color: "violet",
                ant: <AntMascot variant="green" className="absolute bottom-4 right-4 w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" isMoving={false} />
              },
              {
                icon: <Brain size={32} />,
                title: "Cognitive Rewrite",
                desc: "Our AI translates dense jargon into plain English concepts, highlighting methodology and core findings automatically.",
                color: "fuchsia",
                ant: <AntMascot variant="purple" className="absolute top-4 right-4 w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all" isMoving={false} />
              },
              {
                icon: <Sprout size={32} />,
                title: "Knowledge Tree",
                desc: "Visualize your growth. Earn ranks from 'Curious Observer' to 'God of Knowledge' as you read more papers.",
                color: "indigo",
                ant: <AntMascot variant="weaver" className="absolute bottom-4 left-4 w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:-rotate-12 transition-all" isMoving={false} />
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative p-8 rounded-3xl bg-main border border-borderSkin hover:border-transparent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-${feature.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Creative: Ant per card */}
                {feature.ant}

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

              {/* Creative: Tarantula guarding the web */}
              <div className="absolute bottom-4 right-4 z-10">
                 <SpiderMascot variant="tarantula" className="w-14 h-14 rotate-[-45deg] drop-shadow-lg" />
              </div>

              {/* Creative: Ant interacting with the graph */}
              <div className="absolute bottom-1/4 left-1/4 animate-float opacity-100">
                <AntMascot variant="red" className="w-10 h-10 rotate-45 drop-shadow-md" isMoving={true} />
              </div>
              <div className="absolute top-1/4 right-1/4 animate-float-delayed opacity-80">
                <AntMascot variant="black" className="w-8 h-8 rotate-[-15deg] drop-shadow-md" isMoving={true} />
              </div>

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

        {/* Creative: Marching Ant Trail along the bottom - NOW MULTI COLORED */}
        <div className="absolute bottom-4 left-0 w-full overflow-hidden opacity-30 pointer-events-none">
          <div className="flex gap-16 animate-scroll w-[200%]">
             {[...Array(20)].map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                   <AntMascot variant={i % 5 === 0 ? 'green' : i % 4 === 0 ? 'purple' : i % 3 === 0 ? 'black' : 'red'} className="w-6 h-6 md:w-8 md:h-8 rotate-90" isMoving={true} />
                   {/* Carrying a "bit" of knowledge */}
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
             ))}
          </div>
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