
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { SERVICES, REVIEWS, NAV_LINKS } from './constants.tsx';
import { ReviewStory } from './types.ts';

const LOGO_URL = "https://i.ibb.co/0pzdjPSh/Chat-GPT-Image-22-2025-12-19-19.png";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(timer); setTimeout(onComplete, 500); return 100; } return p + 4; });
    }, 40);
    return () => clearInterval(timer);
  }, []);
  return (
    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
      <motion.img 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        src={LOGO_URL} className="h-20 mb-12" 
      />
      <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
        <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
};

const CustomCursor = () => {
  const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { stiffness: 400, damping: 30 });
  const cursorY = useSpring(mouseY, { stiffness: 400, damping: 30 });
  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX - 16); mouseY.set(e.clientY - 16); };
    window.addEventListener('mousemove', move); return () => window.removeEventListener('mousemove', move);
  }, []);
  return <motion.div style={{ x: cursorX, y: cursorY }} className="fixed top-0 left-0 w-10 h-10 border border-indigo-500/50 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block" />;
};

const Navbar = ({ onOpen }: { onOpen: () => void }) => (
  <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center transition-all duration-500">
    <div className="absolute inset-0 bg-black/20 backdrop-blur-xl border-b border-white/5" />
    <img src={LOGO_URL} className="h-10 relative z-10" />
    <div className="hidden lg:flex space-x-12 relative z-10">
      {NAV_LINKS.map(l => (
        <a key={l.href} href={l.href} className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 hover:text-white transition-all duration-300">{l.label}</a>
      ))}
    </div>
    <button onClick={onOpen} className="relative z-10 bg-indigo-600 text-white px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">ОБСУДИТЬ</button>
  </nav>
);

const Hero = ({ onOpen }: { onOpen: () => void }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -150]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [0, 5]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 px-6 overflow-hidden">
      {/* Мягкие свечения Aura */}
      <div className="absolute top-1/4 -left-1/4 w-[60vw] h-[60vw] bg-indigo-600/10 blur-[180px] rounded-full" />
      <div className="absolute bottom-1/4 -right-1/4 w-[60vw] h-[60vw] bg-purple-600/10 blur-[180px] rounded-full" />
      
      <motion.div style={{ y, rotate }} className="relative z-20 max-w-[1400px] w-full mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-10">
          <motion.span 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="inline-block px-5 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em]"
          >
            ProBoost • Food Delivery Marketing
          </motion.span>
          <h1 className="text-[12vw] lg:text-[8.5rem] font-brutal leading-[0.85] text-white italic tracking-tighter uppercase">
            МАКСИ<br/><span className="gradient-text">МУМ</span><br/>ЗАКАЗОВ
          </h1>
          <p className="text-xl md:text-2xl text-white/50 uppercase italic font-black leading-tight max-w-lg tracking-tight">
            Разрываем рынок доставки еды. Делаем ваш бренд номером один в городе.
          </p>
          <div className="flex flex-wrap gap-6">
            <button onClick={onOpen} className="px-14 py-8 bg-white text-black rounded-full font-black text-xl hover:bg-indigo-600 hover:text-white transition-all uppercase italic tracking-tighter hover:shadow-[0_0_50px_rgba(99,102,241,0.4)]">
              ХОЧУ ТАК ЖЕ
            </button>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <motion.img 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            src="https://i.ibb.co/prK8TG9V/2025-12-22-11-51-05.png" 
            className="w-full max-w-[600px] grayscale hover:grayscale-0 transition-all duration-1000 select-none" 
          />
          <div className="absolute -left-10 bottom-10 glass-card p-12 rounded-[3.5rem] border border-white/10 shadow-2xl">
             <div className="space-y-10">
                <div><h3 className="text-6xl font-brutal gradient-text italic">ROI 300%+</h3><p className="text-white/30 text-[9px] font-black tracking-[0.4em] uppercase">СРЕДНИЙ ПОКАЗАТЕЛЬ</p></div>
                <div className="h-px bg-white/5" />
                <div><h3 className="text-6xl font-brutal gradient-text italic">24/7</h3><p className="text-white/30 text-[9px] font-black tracking-[0.4em] uppercase">ПОДДЕРЖКА ПРОЕКТА</p></div>
             </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const SmartFunnel = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 45, damping: 25 });

  const steps = [
    { title: 'ОХВАТ', sub: 'ВИРАЛЬНЫЙ ТРАФИК', range: [0.15, 0.32], rBase: 44 },
    { title: 'ИНТЕРЕС', sub: 'ПРОГРЕВ В СОЦСЕТЯХ', range: [0.28, 0.45], rBase: 36 },
    { title: 'ЖЕЛАНИЕ', sub: 'ВКУСНЫЙ КОНТЕНТ', range: [0.41, 0.58], rBase: 28 },
    { title: 'ЗАКАЗ', sub: 'БЫСТРАЯ КОРЗИНА', range: [0.54, 0.71], rBase: 21 },
    { title: 'БАЗА', sub: 'АВТОМАТИЗАЦИЯ LTV', range: [0.67, 0.84], rBase: 14 },
    { title: 'ПРИБЫЛЬ', sub: 'МАСШТАБИРОВАНИЕ', range: [0.80, 1.0], rBase: 7 },
  ];

  const introOpacity = useTransform(smoothScroll, [0, 0.12], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[800vh] bg-black">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        <motion.div style={{ opacity: introOpacity }} className="absolute flex flex-col items-center text-center px-6 z-0 max-w-5xl">
           <p className="text-indigo-500 text-[12px] font-black uppercase tracking-[0.8em] mb-6">СТРАТЕГИЯ</p>
           <h2 className="text-[10vw] font-brutal italic text-white/5 leading-none uppercase tracking-tighter">ENGINE OF GROWTH</h2>
           <p className="text-white/40 text-xl font-black uppercase italic mt-12 max-w-3xl leading-relaxed tracking-wide">
             Мы строим экосистему, которая превращает прохожего в лояльного клиента вашей доставки
           </p>
        </motion.div>

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
          {steps.map((s, idx) => (
            <div 
              key={`orbit-${idx}`}
              className="absolute border border-indigo-500/5 rounded-full"
              style={{ width: `${s.rBase * 2}vw`, height: `${s.rBase * 2}vw` }}
            />
          ))}
        </div>

        <div className="relative w-full h-full flex items-center justify-center z-10">
          {steps.map((step, i) => {
            const start = step.range[0];
            const end = step.range[1];
            const mid = (start + end) / 2;
            const angle = useTransform(smoothScroll, [start, end], [Math.PI * 0.7, -Math.PI * 0.7]);
            const r = step.rBase;
            const x = useTransform(angle, a => Math.cos(a) * r + "vw");
            const y = useTransform(angle, a => Math.sin(a) * r + "vw");
            const opacity = useTransform(smoothScroll, [start, start + 0.03, mid, end - 0.03, end], [0, 1, 1, 1, 0]);
            const scale = useTransform(smoothScroll, [start, mid, end], [0.4, 1.1, 0.4]);
            const glow = useTransform(smoothScroll, 
              [start, mid, end], 
              ["0px 0px 0px rgba(99, 102, 241, 0)", "0px 0px 80px rgba(99, 102, 241, 0.6)", "0px 0px 0px rgba(99, 102, 241, 0)"]
            );

            return (
              <motion.div
                key={i}
                style={{ x, y, opacity, scale }}
                className="absolute flex flex-col items-center text-center w-full px-4"
              >
                <div className="mb-2 text-indigo-500/50 font-brutal italic tracking-widest text-[8px] uppercase">STEP 0{i+1}</div>
                <motion.h3 
                  style={{ textShadow: glow }}
                  className="text-3xl md:text-[4vw] font-brutal italic text-white uppercase tracking-tighter leading-none"
                >
                  {step.title}
                </motion.h3>
                <p className="text-[8px] md:text-sm font-black text-white/40 uppercase tracking-[0.4em] mt-4 max-w-[300px]">
                  {step.sub}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Services = () => (
  <section id="services" className="py-32 px-6 bg-[#050505]">
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end mb-24">
        <h2 className="text-7xl md:text-[10rem] font-brutal text-white uppercase italic tracking-tighter leading-none">УСЛУГИ</h2>
        <p className="hidden lg:block text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-4">TOTAL CONTROL • MAXIMUM IMPACT</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
        {SERVICES.map((s, i) => (
          <motion.div 
            key={s.id} 
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            className="p-14 bg-black border border-white/5 transition-all relative overflow-hidden group cursor-default"
          >
            <div className="text-6xl mb-10 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{s.icon}</div>
            <h3 className="text-2xl font-black text-white uppercase mb-6 tracking-tight">{s.title}</h3>
            <p className="text-white/40 text-base leading-relaxed font-medium">{s.description}</p>
            <div className="absolute -right-4 -bottom-4 text-white/[0.03] text-[10rem] font-brutal italic group-hover:text-white/[0.06] transition-colors">{i+1}</div>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Reviews = () => {
  const [active, setActive] = useState<ReviewStory | null>(null);
  return (
    <section id="reviews" className="py-32 md:py-56 px-6 bg-black">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-32">
          <p className="text-indigo-500 font-black uppercase tracking-[0.6em] mb-4">PROVEN RESULTS</p>
          <h2 className="text-7xl md:text-[11rem] font-brutal text-white uppercase italic tracking-tighter leading-none">КЕЙСЫ</h2>
        </div>
        <div className="flex gap-8 overflow-x-auto no-scrollbar pb-20 snap-x">
          {REVIEWS.map(r => (
            <motion.div 
              key={r.id} 
              onClick={() => setActive(r)} 
              whileHover={{ y: -20 }}
              className="flex-shrink-0 w-[320px] md:w-[420px] aspect-[9/16] rounded-[4rem] overflow-hidden relative cursor-pointer group border border-white/10 snap-center shadow-2xl"
            >
              <img src={r.slides[0].image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-12 left-10 flex items-center gap-5">
                 <img src={r.avatar} className="w-14 h-14 rounded-full border-2 border-indigo-500 object-cover shadow-lg" />
                 <div>
                    <span className="block font-black text-white uppercase italic tracking-tighter text-lg">{r.username}</span>
                    <span className="text-white/40 text-[8px] font-black tracking-widest uppercase">ПОСМОТРЕТЬ СТОРИС</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/98 flex items-center justify-center p-4 backdrop-blur-3xl" onClick={() => setActive(null)}>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-[450px] aspect-[9/16] rounded-[4rem] overflow-hidden border border-white/20 shadow-[0_0_100px_rgba(99,102,241,0.2)]" 
              onClick={e => e.stopPropagation()}
            >
              <img src={active.slides[0].image} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-12">
                <p className="text-white font-black uppercase italic text-xl leading-snug">{active.slides[0].text}</p>
              </div>
              <button onClick={() => setActive(null)} className="absolute top-10 right-10 text-white/50 p-4 bg-white/10 backdrop-blur-md rounded-full hover:bg-white hover:text-black transition-all">✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Contact = () => (
  <section id="contact" className="py-32 md:py-56 px-6 bg-[#050505]">
    <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 items-center">
      <div className="space-y-12">
        <h2 className="text-8xl md:text-[12rem] font-brutal text-white italic uppercase leading-[0.8] tracking-tighter">ВРЕМЯ<br/><span className="text-indigo-600">РОСТА</span></h2>
        <div className="space-y-6">
           <p className="text-2xl text-white/40 font-black uppercase italic tracking-wide max-w-md">Каждый день простоя — это заказы, которые ушли вашим конкурентам.</p>
           <div className="flex gap-4">
              <div className="w-12 h-[2px] bg-indigo-600 mt-4" />
              <p className="text-indigo-500 font-black uppercase tracking-widest text-sm">ПОРА ЭТО ИСПРАВИТЬ</p>
           </div>
        </div>
      </div>
      <div className="glass-card p-12 md:p-24 rounded-[5rem] border border-white/10 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-colors" />
        <form className="space-y-14 relative z-10" onSubmit={e => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">КАК ВАС ЗОВУТ?</label>
            <input required placeholder="ИМЯ" className="w-full bg-transparent border-b-2 border-white/10 py-6 text-3xl font-black focus:border-indigo-600 outline-none text-white transition-all placeholder:text-white/10" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">ГДЕ ВАМ УДОБНО ОБЩАТЬСЯ?</label>
            <input required placeholder="TELEGRAM / WHATSAPP" className="w-full bg-transparent border-b-2 border-white/10 py-6 text-3xl font-black focus:border-indigo-600 outline-none text-white transition-all placeholder:text-white/10" />
          </div>
          <button className="w-full py-12 bg-white text-black font-black text-2xl rounded-[3rem] hover:bg-indigo-600 hover:text-white transition-all uppercase italic tracking-tighter shadow-2xl hover:shadow-indigo-500/40">ОТПРАВИТЬ ЗАЯВКУ</button>
        </form>
      </div>
    </div>
  </section>
);

const App = () => {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  return (
    <div className="bg-black text-white min-h-screen selection:bg-indigo-500 antialiased overflow-x-hidden">
      <AnimatePresence>{loading && <LoadingScreen onComplete={() => setLoading(false)} />}</AnimatePresence>
      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
          <CustomCursor />
          <Navbar onOpen={() => setModal(true)} />
          <main>
            <Hero onOpen={() => setModal(true)} />
            <Services />
            <SmartFunnel />
            <Reviews />
            <Contact />
          </main>
          <footer className="py-24 px-6 border-t border-white/5 text-center flex flex-col items-center gap-12 bg-black">
            <img src={LOGO_URL} className="h-12 opacity-30 grayscale" />
            <div className="flex gap-12">
               {NAV_LINKS.map(l => (
                 <a key={`f-${l.href}`} href={l.href} className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">{l.label}</a>
               ))}
            </div>
            <div className="text-[9px] font-black uppercase opacity-20 tracking-[0.6em] leading-relaxed max-w-lg">
              PROBOOST AGENCY © 2026 • ЭФФЕКТИВНЫЙ МАРКЕТИНГ ДЛЯ ВАШЕГО БИЗНЕСА<br/>ИП КАЛЯКИН Д.А. • ОГРНИП 321595800000000
            </div>
          </footer>
          <AnimatePresence>
            {modal && (
              <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl" onClick={() => setModal(false)}>
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.95, opacity: 0 }} 
                  className="glass-card p-14 md:p-24 rounded-[5rem] max-w-2xl w-full text-center relative border border-white/10" 
                  onClick={e => e.stopPropagation()}
                >
                  <h2 className="text-6xl font-brutal italic text-white uppercase mb-12 leading-none">ДАВАЙ<br/><span className="text-indigo-500">ОБСУДИМ</span></h2>
                  <form className="space-y-10" onSubmit={e => { e.preventDefault(); setModal(false); }}>
                    <input required placeholder="ВАШЕ ИМЯ" className="w-full bg-transparent border-b-2 border-white/10 py-5 text-2xl font-black text-white outline-none focus:border-indigo-600 transition-colors" />
                    <input required placeholder="TELEGRAM" className="w-full bg-transparent border-b-2 border-white/10 py-5 text-2xl font-black text-white outline-none focus:border-indigo-600 transition-colors" />
                    <button className="w-full py-10 bg-white text-black font-black text-2xl rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-xl">ЖДУ ЗВОНКА</button>
                  </form>
                  <button onClick={() => setModal(false)} className="absolute top-12 right-12 text-white/20 hover:text-white p-4">✕</button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default App;
