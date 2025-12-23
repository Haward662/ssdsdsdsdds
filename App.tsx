
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { SERVICES, REVIEWS, NAV_LINKS, CASES } from './constants.tsx';
import { Service, ReviewStory, CaseStudy } from './types.ts';

const LOGO_URL = "https://i.ibb.co/0pzdjPSh/Chat-GPT-Image-22-2025-12-19-19.png";

// --- Loading Screen Component ---
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  const phrases = [
    "Прогреваем базу так, что пицца остыть не успеет...",
    "Ищем тех, кто гуглит «хочу жрать» в 2 часа ночи...",
    "Считаем ROI каждой заказанной сушинки...",
    "Настраиваем таргет прямо в желудок клиента...",
    "Увеличиваем чеки быстрее, чем курьер на самокате...",
    "Шпионим за конкурентами (они всё еще постят котиков)...",
    "Заряжаем воронку на максимальный аппетит...",
    "PROBOOST: Готовим ваш маркетинг к выдаче..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 0.5;
      });
    }, 40);

    const phraseTimer = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(phraseTimer);
    };
  }, []);

  return (
    <motion.div 
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      <div className="absolute inset-0 holographic-bg opacity-5 blur-[100px]" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12 relative"
        >
          <img src={LOGO_URL} alt="Logo" className="h-20 md:h-32 object-contain drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-indigo-500 blur-3xl -z-10 rounded-full"
          />
        </motion.div>

        <div className="h-24 md:h-32 flex items-center justify-center mb-16 overflow-hidden max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-lg md:text-3xl font-black italic uppercase text-white/90 tracking-tighter leading-tight"
            >
              {phrases[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-64 md:w-96 h-[2px] bg-white/10 relative rounded-full overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 font-black italic text-[10px] md:text-xs tracking-[0.4em] text-white/30 uppercase">
          {Math.round(progress)}% DEEP DATA OPTIMIZATION
        </div>
      </div>
    </motion.div>
  );
};

// --- Other Custom Components ---
const CustomCursor = () => {
  const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(mouseY, { stiffness: 500, damping: 28 });
  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX - 16); mouseY.set(e.clientY - 16); };
    window.addEventListener('mousemove', move); return () => window.removeEventListener('mousemove', move);
  }, []);
  return <motion.div style={{ x: cursorX, y: cursorY }} className="fixed top-0 left-0 w-8 h-8 border border-indigo-500 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block" />;
};

const Magnetic = ({ children, strength = 0.35 }: { children?: React.ReactNode, strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x); const sy = useSpring(y);
  const move = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - (left + width / 2)) * strength);
    y.set((e.clientY - (top + height / 2)) * strength);
  };
  return <motion.div ref={ref} onMouseMove={move} onMouseLeave={() => {x.set(0); y.set(0);}} style={{ x: sx, y: sy }}>{children}</motion.div>;
};

// --- Lead Modal ---
const LeadModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-xl glass-card rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic mb-8 leading-none">ОБСУДИТЬ<br/><span className="text-indigo-500">ПРОЕКТ</span></h2>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <input required placeholder="ВАШЕ ИМЯ" className="w-full bg-transparent border-b-2 border-white/10 py-4 md:py-5 text-lg md:text-xl font-bold focus:border-indigo-600 outline-none transition-all text-white" />
          <input required placeholder="TELEGRAM / WHATSAPP" className="w-full bg-transparent border-b-2 border-white/10 py-4 md:py-5 text-lg md:text-xl font-bold focus:border-indigo-600 outline-none transition-all text-white" />
          <button className="w-full py-6 md:py-8 bg-white text-black font-black text-lg md:text-xl rounded-2xl hover:bg-indigo-600 hover:text-white transition-all uppercase italic">ОТПРАВИТЬ ЗАЯВКУ</button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Navbar ---
const Navbar = ({ onOpenQuiz }: { onOpenQuiz: () => void }) => (
  <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
    <img src={LOGO_URL} alt="Logo" className="h-10 md:h-14 w-auto object-contain" />
    <div className="hidden lg:flex space-x-12">
      {NAV_LINKS.map(link => (
        <a key={link.href} href={link.href} className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 hover:text-indigo-400 transition-colors">{link.label}</a>
      ))}
    </div>
    <button onClick={onOpenQuiz} className="bg-white text-black px-6 md:px-10 py-2.5 md:py-3 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg">Начать рост</button>
  </nav>
);

// --- Hero Section ---
const Hero = ({ onOpenQuiz }: { onOpenQuiz: () => void }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-10 px-6 md:px-8 overflow-hidden bg-black">
      <div className="absolute inset-0 holographic-bg opacity-10 blur-[150px] pointer-events-none" />
      <motion.div style={{ y }} className="relative z-20 max-w-[1600px] w-full mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        
        <div className="text-center lg:text-left space-y-8 md:space-y-12 order-1 lg:order-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 md:px-8 py-2 md:py-3 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.15em] italic">
              Комплексный маркетинг для доставок еды и ресторанов
            </span>
          </motion.div>

          <h1 className="text-[18vw] lg:text-[11rem] font-black leading-[0.8] text-white italic tracking-tighter uppercase">МАРКЕ<br/><span className="gradient-text">ТИНГ</span></h1>
          
          <p className="text-xl md:text-3xl text-white/80 uppercase tracking-tight italic font-black max-w-xl leading-[1.1]">увеличиваем заказы и отправляем в нокаут ваших конкурентов</p>
          
          <div className="flex justify-center lg:justify-start pt-4">
            <Magnetic><button onClick={onOpenQuiz} className="px-10 md:px-16 py-6 md:py-10 bg-white text-black rounded-full font-black text-xl md:text-2xl hover:bg-indigo-600 hover:text-white transition-all blue-glow uppercase italic tracking-tighter">ОБСУДИТЬ ПРОЕКТ</button></Magnetic>
          </div>
        </div>
        
        <div className="relative flex justify-center lg:justify-end order-2 lg:order-2 mt-10 lg:mt-0">
          <motion.div 
            initial={{ x: 50, opacity: 0, scale: 0.8 }} 
            animate={{ x: 0, opacity: 1, scale: 1 }} 
            transition={{ delay: 0.8, type: 'spring', stiffness: 50 }} 
            className="absolute -left-4 md:-left-10 lg:-left-20 top-1/4 z-40 glass-card p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-white/20 shadow-[0_0_80px_rgba(99,102,241,0.15)] backdrop-blur-[30px] md:backdrop-blur-[40px]"
          >
            <div className="space-y-6 md:space-y-12">
              <div className="relative">
                <h3 className="text-4xl md:text-7xl font-black gradient-text tracking-tighter leading-none italic">6 ЛЕТ</h3>
                <p className="text-white/60 uppercase text-[9px] md:text-[11px] font-black mt-2 md:mt-3 tracking-[0.3em] md:tracking-[0.4em]">В МАРКЕТИНГЕ</p>
                <div className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-1 h-8 md:h-12 bg-indigo-600 rounded-full" />
              </div>
              <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
              <div className="relative">
                <h3 className="text-4xl md:text-7xl font-black gradient-text tracking-tighter leading-none italic">30+</h3>
                <p className="text-white/60 uppercase text-[9px] md:text-[11px] font-black mt-2 md:mt-3 tracking-[0.3em] md:tracking-[0.4em] leading-tight">КЕЙСОВ ROI x3.5+</p>
                <div className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-1 h-8 md:h-12 bg-indigo-600 rounded-full" />
              </div>
            </div>
          </motion.div>
          
          <div className="photo-mask relative">
            <img src="https://i.ibb.co/prK8TG9V/2025-12-22-11-51-05.png" alt="Данила" className="w-[85vw] max-w-[650px] grayscale hover:grayscale-0 transition-all duration-1000 select-none drop-shadow-[0_0_100px_rgba(99,102,241,0.2)]" />
            <div className="absolute -bottom-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-indigo-600/20 blur-[100px] md:blur-[120px] -z-10" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// --- Cases Section (NEW) ---
const CasesSection = () => {
  const [filter, setFilter] = useState('Все');
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = ['Все', 'Комплексный маркетинг', 'SMM', 'Разработка сайта', 'Карты и агрегаторы', 'CRM и аналитика'];

  const filteredCases = filter === 'Все' 
    ? CASES 
    : CASES.filter(c => c.tags.includes(filter));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.5;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="cases" className="relative py-24 md:py-32 px-6 md:px-8 bg-black border-t border-white/5">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-12 md:mb-16">
          <h2 className="text-5xl md:text-8xl font-black text-indigo-500 mb-8 md:mb-12 tracking-tighter">Кейсы</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3 md:gap-4 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all border ${
                  filter === cat 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'bg-transparent border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-4">
             <button onClick={() => scroll('left')} className="p-3 hover:text-indigo-500 transition-colors text-white/50"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg></button>
             <button onClick={() => scroll('right')} className="p-3 hover:text-indigo-500 transition-colors text-white/50"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12H19M19 12L12 5M19 12L12 19"/></svg></button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-10 snap-x">
          <AnimatePresence mode="popLayout">
            {filteredCases.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-shrink-0 w-full md:w-[600px] bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors snap-start"
              >
                {/* Header: Logo & Company Info */}
                <div className="flex items-start justify-between mb-8 md:mb-12">
                   <div className="flex flex-col gap-1">
                      <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">{c.companyName}</h3>
                      <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest max-w-[200px]">{c.companyDescription}</p>
                   </div>
                   <div className="hidden md:block w-px h-12 bg-white/10 mx-4" />
                   <div className="hidden md:block text-[10px] text-white/30 uppercase tracking-widest max-w-[150px] text-right">
                     {c.tags.join(' • ')}
                   </div>
                </div>

                {/* Body: Title & Tasks */}
                <div className="mb-8 md:mb-12">
                   <h4 className="text-xl md:text-2xl font-light text-white uppercase mb-6 leading-tight">
                     {c.title} <span className="text-indigo-500 font-bold">{c.highlight}</span>
                   </h4>
                   <ul className="space-y-3">
                     {c.tasks.map((task, i) => (
                       <li key={i} className="flex items-start gap-3 text-sm text-white/60 font-light">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                          {task}
                       </li>
                     ))}
                   </ul>
                </div>

                {/* Footer: Metrics */}
                <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Выход на показатели:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {c.metrics.map((m, i) => (
                      <div key={i}>
                        <p className="text-2xl md:text-3xl font-medium text-indigo-400 mb-1">{m.value}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

// --- УМНАЯ ВОРОНКА ---
const SmartFunnel = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });

  const steps = [
    { title: 'ОХВАТ', subtitle: 'ПОСЕВЫ И ТАРГЕТ', range: [0.1, 0.35], radiusMult: 1 },
    { title: 'ИНТЕРЕС', subtitle: 'КОНТЕНТ И ВОРОНКИ', range: [0.3, 0.55], radiusMult: 0.8 },
    { title: 'ЖЕЛАНИЕ', subtitle: 'ОФФЕРЫ И АКЦИИ', range: [0.5, 0.75], radiusMult: 0.6 },
    { title: 'ЗАКАЗ', subtitle: 'CRM И ПРОДАЖИ', range: [0.7, 0.95], radiusMult: 0.4 },
    { title: 'ЛОЯЛЬНОСТЬ', subtitle: 'LTV И ПОВТОРЫ', range: [0.85, 1.0], radiusMult: 0.2 },
  ];

  return (
    <section ref={sectionRef} className="relative h-[800vh] bg-black">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Intro Text - Adjusted positioning and visibility */}
        <div className="absolute top-24 md:top-36 flex flex-col items-center select-none pointer-events-none z-30 px-6 text-center">
          <motion.p 
             style={{ 
               opacity: useTransform(smoothProgress, [0, 0.05, 0.15], [0, 1, 0]),
               y: useTransform(smoothProgress, [0, 0.1], [20, 0])
             }}
             className="text-[10px] md:text-xl font-black text-white uppercase italic tracking-[0.2em] md:tracking-[0.4em] mb-4 md:mb-8 max-w-2xl leading-relaxed drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            мы выстраиваем воронку которая будет проста для ваших клиентов а вам дает прибыль
          </motion.p>
        </div>

        <div className="absolute top-40 md:top-60 flex flex-col items-center select-none pointer-events-none z-0">
          <motion.h2 
             style={{ opacity: useTransform(smoothProgress, [0.05, 0.1, 0.2], [0, 1, 1]) }}
             className="text-[15vw] md:text-[12vw] font-black italic text-white leading-none tracking-tighter uppercase"
          >
            УМНАЯ
          </motion.h2>
          <motion.h2 
             style={{ opacity: useTransform(smoothProgress, [0.05, 0.1, 0.2], [0, 0.2, 0.2]) }}
             className="text-[15vw] md:text-[12vw] font-black italic text-white/20 leading-none tracking-tighter uppercase -mt-4 md:-mt-10"
          >
            ВОРОНКА
          </motion.h2>
        </div>

        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[150vw] h-[150vw] bg-[radial-gradient(circle,rgba(30,41,159,0.3)_0%,rgba(0,0,0,0)_60%)]" />
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="absolute border border-white/[0.03] rounded-full" 
              style={{ width: `${(i + 1) * 25}vw`, height: `${(i + 1) * 25}vw` }} 
            />
          ))}
        </div>

        <div className="relative w-full h-full flex items-center justify-center z-20">
          {steps.map((step, i) => {
            const stepScroll = useTransform(smoothProgress, step.range, [0, 1]);
            const baseRadius = typeof window !== 'undefined' && window.innerWidth < 768 ? 400 : 1200;
            const maxRadius = baseRadius * step.radiusMult;
            
            const radius = useTransform(stepScroll, [0, 0.5, 1], [maxRadius, 0, -100]);
            const angle = useTransform(stepScroll, [0, 0.5, 1], [-Math.PI * 3, 0, Math.PI / 2]);
            const scale = useTransform(stepScroll, [0, 0.5, 1], [1.5, 1, 0.4]);
            const opacity = useTransform(stepScroll, [0, 0.2, 0.5, 0.8, 1], [0, 0.5, 1, 0.5, 0]);
            const x = useTransform(radius, r => Math.cos(angle.get()) * r);
            const y = useTransform(radius, r => Math.sin(angle.get()) * r);
            const glow = useTransform(stepScroll, [0.4, 0.5, 0.6], [0, 60, 0]);

            return (
              <motion.div
                key={i}
                style={{ x, y, opacity, scale }}
                className="absolute flex flex-col items-center text-center pointer-events-none px-4"
              >
                <motion.span 
                  style={{ textShadow: useTransform(glow, g => `0 0 ${g}px rgba(255,255,255,0.9)`) }}
                  className="text-5xl md:text-[9rem] font-black italic text-white uppercase tracking-tighter leading-none"
                >
                  {step.title}
                </motion.span>
                
                <motion.span 
                  style={{ opacity: useTransform(stepScroll, [0.45, 0.5, 0.55], [0, 0.6, 0]) }}
                  className="text-xs md:text-xl font-bold text-white tracking-[0.3em] md:tracking-[0.4em] uppercase mt-4 md:mt-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                >
                  {step.subtitle}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// --- Strategy Video Section ---
const StrategyVideoSection = () => {
  return (
    <section className="py-24 md:py-40 px-6 md:px-8 bg-neutral-900 border-y border-white/5 relative overflow-hidden">
      {/* Background accents similar to other sections */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Text Content */}
          <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase leading-[0.9] tracking-tighter">
              КАКАЯ ДОЛЖНА БЫТЬ <span className="text-indigo-500">МАРКЕТИНГ СТРАТЕГИЯ</span> И ВОРОНКА ПРОДАЖ?
            </h2>
            <div className="space-y-6 pl-4 border-l-2 border-indigo-500/30">
               <p className="text-sm md:text-base text-white/60 font-bold italic uppercase tracking-widest">
                 ДЛЯ ДОСТАВОК ЕДЫ И РЕСТОРАНОВ
               </p>
               <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
                 В видео я расскажу: Про воронку продаж, как зацепить клиента, как достучаться до сложной аудитории и превратить их в постоянных гостей.
               </p>
            </div>
            <div className="pt-4">
              <a href="https://vk.com/proboostsmm" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-white/50 hover:text-indigo-400 transition-colors uppercase text-xs font-black tracking-widest">
                <span>Смотреть больше в VK</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>

          {/* Video Embed */}
          <div className="relative order-1 lg:order-2">
            <div className="glass-card p-2 md:p-4 rounded-[2rem] border border-white/10 shadow-2xl relative z-10">
              <div className="relative aspect-video rounded-[1.5rem] overflow-hidden bg-black border border-white/5">
                <iframe
                  src="https://vk.com/video_ext.php?oid=-210647270&id=456239025&hd=2"
                  width="100%"
                  height="100%"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture;"
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full"
                  title="Marketing Strategy Video"
                ></iframe>
              </div>
            </div>
            {/* Decorative elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-[80px] -z-10" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/10 blur-[80px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Services Section ---
const ServicesSection = () => (
  <section id="services" className="relative py-20 md:py-32 px-6 md:px-8 bg-neutral-950">
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-12 md:mb-20 space-y-4 md:space-y-6">
        <h2 className="text-4xl md:text-7xl lg:text-[7rem] font-black text-white uppercase italic tracking-tighter leading-none">ИНСТРУ<br/><span className="text-white/10">МЕНТЫ</span></h2>
        <p className="text-white/40 text-sm md:text-xl font-bold uppercase italic tracking-widest max-w-3xl leading-snug">
          от упаковки смыслов до масштабирования прибыли. Используем только проверенные инструменты для фуд индустрии
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {SERVICES.map((s, i) => (
          <div key={s.id} className="group p-6 md:p-10 bg-white/5 border border-white/5 hover:bg-indigo-600/10 hover:border-indigo-500/20 transition-all duration-300 flex flex-col min-h-[220px] md:min-h-[280px] relative overflow-hidden">
            <div className="flex gap-2 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">
              {s.icons.map((icon, idx) => (
                <img key={idx} src={icon} alt="" className="h-8 md:h-12 w-auto object-contain" />
              ))}
            </div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white uppercase mb-2 md:mb-4 tracking-tighter leading-tight">{s.title}</h3>
            <p className="text-white/40 leading-snug mb-4 md:mb-6 flex-grow text-xs md:text-sm lg:text-base pr-4">{s.description}</p>
            <div className="absolute right-4 bottom-4 text-white/[0.03] text-5xl md:text-7xl font-black italic select-none">{i+1}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Stories Section ---
const StoriesSection = () => {
  const [active, setActive] = useState<ReviewStory | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="reviews" className="py-24 md:py-56 px-6 md:px-8 bg-black overflow-hidden relative">
      <div className="max-w-[1500px] mx-auto relative">
        <h2 className="text-5xl md:text-[9rem] font-black text-white uppercase italic mb-20 md:mb-40 text-center tracking-tighter leading-none">РЕАЛЬНЫЕ<br/><span className="text-indigo-600">РЕЗУЛЬТАТЫ</span></h2>
        
        <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between items-center pointer-events-none z-30 px-4">
          <button 
            onClick={() => scroll('left')} 
            className="pointer-events-auto p-6 glass-card rounded-full border border-white/20 text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all -ml-12 group"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="pointer-events-auto p-6 glass-card rounded-full border border-white/20 text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all -mr-12 group"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className="flex md:hidden justify-center gap-6 mb-10">
          <button onClick={() => scroll('left')} className="p-4 glass-card rounded-full border border-white/10"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button onClick={() => scroll('right')} className="p-4 glass-card rounded-full border border-white/10"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>

        <div ref={scrollRef} className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar pb-10 md:pb-20 px-4 snap-x">
          {REVIEWS.map(r => (
            <motion.div 
              key={r.id} 
              onClick={() => setActive(r)} 
              whileHover={{ y: -20, scale: 1.02 }} 
              className="flex-shrink-0 w-[280px] md:w-[350px] aspect-[9/16] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden relative cursor-pointer border border-white/10 group shadow-2xl bg-neutral-900 snap-center"
            >
              <img src={r.slides[0].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-8 md:bottom-12 left-6 md:left-10 flex items-center gap-4 md:gap-5">
                <img src={r.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-indigo-600 object-cover" />
                <span className="font-black text-sm md:text-lg uppercase text-white tracking-widest italic">{r.username}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl" onClick={() => setActive(null)}>
            <div className="relative w-full max-w-[450px] aspect-[9/16] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-neutral-900 border border-white/20 shadow-[0_0_200px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
              <img src={active.slides[0].image} className="w-full h-full object-cover" />
              <div className="absolute top-8 md:top-12 left-6 md:left-8 right-6 md:right-8 flex justify-between items-center">
                <div className="flex items-center gap-4 md:gap-5">
                  <img src={active.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-indigo-600 object-cover shadow-lg" />
                  <span className="font-black text-white uppercase tracking-tighter text-lg md:text-xl italic drop-shadow-md">{active.username}</span>
                </div>
                <button onClick={() => setActive(null)} className="text-white p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
              <div className="absolute bottom-8 md:bottom-12 left-6 md:left-8 right-6 md:right-8">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/60 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <p className="text-white text-lg md:text-xl font-bold uppercase italic leading-tight">{active.slides[0].text}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- Contact Section ---
const ContactSection = () => {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="py-24 md:py-56 px-6 md:px-8 bg-neutral-950">
      <div className="max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-16 md:gap-32">
        <div className="space-y-8 md:space-y-12">
          <h2 className="text-6xl md:text-[10rem] font-black text-white italic uppercase leading-[0.85] tracking-tighter">ДАВАЙ<br/><span className="text-indigo-600 text-[18vw] md:text-[11rem]">РОСТ!</span></h2>
          <p className="text-xl md:text-2xl text-white/30 max-w-md font-bold italic uppercase tracking-widest leading-snug">Мы строим маркетинг, который окупается в первый месяц. Хватит сливать бюджет.</p>
        </div>
        <div className="glass-card p-10 md:p-24 rounded-[3rem] md:rounded-[5rem] border border-white/5 relative shadow-2xl overflow-hidden">
          {sent ? (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center py-10 md:py-20">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10">
                  <svg className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase italic">ЗАЯВКА ПРИНЯТА!</h3>
                <p className="text-white/40 mt-4 uppercase font-black text-sm md:text-base">Скоро свяжемся с вами в Telegram.</p>
            </motion.div>
          ) : (
            <form className="space-y-8 md:space-y-12" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input required placeholder="ВАШЕ ИМЯ" className="w-full bg-transparent border-b-2 md:border-b-4 border-white/10 py-4 md:py-8 text-xl md:text-3xl font-black focus:border-indigo-600 outline-none transition-all text-white placeholder:text-white/5" />
              <input required placeholder="TELEGRAM / ТЕЛЕФОН" className="w-full bg-transparent border-b-2 md:border-b-4 border-white/10 py-4 md:py-8 text-xl md:text-3xl font-black focus:border-indigo-600 outline-none transition-all text-white placeholder:text-white/5" />
              <button className="w-full py-8 md:py-12 bg-white text-black font-black text-xl md:text-2xl rounded-[2rem] md:rounded-[3rem] hover:bg-indigo-600 hover:text-white transition-all uppercase italic tracking-tighter shadow-2xl">СТАТЬ ПЕРВЫМ В ГОРОДЕ</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

// --- App Root ---
const App = () => {
  const [isQuiz, setIsQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-indigo-500 antialiased font-['Inter']">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <CustomCursor />
          <Navbar onOpenQuiz={() => setIsQuiz(true)} />
          <main>
            <Hero onOpenQuiz={() => setIsQuiz(true)} />
            <CasesSection />
            <ServicesSection />
            <SmartFunnel />
            <StrategyVideoSection />
            <StoriesSection />
            <ContactSection />
          </main>
          
          <LeadModal isOpen={isQuiz} onClose={() => setIsQuiz(false)} />
          
          <footer className="py-16 md:py-24 px-6 md:px-8 border-t border-white/5 bg-black">
            <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-16">
              <div className="space-y-6 md:space-y-8">
                <img src={LOGO_URL} alt="Logo" className="h-12 md:h-20 opacity-30 grayscale hover:opacity-100 transition-all cursor-pointer" />
                <div className="text-[9px] md:text-[11px] font-black uppercase opacity-20 space-y-1 md:space-y-2 tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">
                  <p>ИП Калякин Д.А</p>
                  <p>ОГРНИП: 325547600069350</p>
                  <p>ИНН: 540307997300</p>
                </div>
              </div>
              <div className="text-[10px] md:text-[12px] font-black uppercase opacity-20 tracking-[0.4em] md:tracking-[0.5em] text-left md:text-right leading-relaxed">
                PROBOOST AGENCY © 2026<br/>
                ALL RIGHTS RESERVED
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
};

export default App;
