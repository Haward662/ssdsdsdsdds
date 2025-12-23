
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { SERVICES, REVIEWS, NAV_LINKS } from './constants';
import { ReviewStory } from './types';
import { GoogleGenAI } from "@google/genai";

const LOGO_URL = "https://i.ibb.co/0pzdjPSh/Chat-GPT-Image-22-2025-12-19-19.png";

// --- AI Chat Assistant Component ---
const AIChatAssistant = ({ onLeadCapture }: { onLeadCapture: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ 
    role: 'user' | 'model'; 
    text: string;
    sources?: { title: string; uri: string }[];
  }[]>([
    { role: 'model', text: "Привет! Я помогу понять, где вы сейчас теряете заказы и как увеличить прибыль доставки. Скажите, пожалуйста, у вас уже есть реклама или пока только органика?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const QUICK_QUESTIONS = [
    "Как увеличить заказы?",
    "Стоимость клиента?",
    "Нужен ли мне сайт?",
    "Кейсы по роллам"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textOverride?: string) => {
    const userMessage = textOverride || inputValue.trim();
    if (!userMessage || isTyping) return;

    // --- ДИАГНОСТИКА КЛЮЧА ---
    const rawKey = process.env.API_KEY || '';
    const apiKey = rawKey.trim();

    console.log("--- AI DEBUG ---");
    console.log("Raw Key exists:", !!apiKey);
    console.log("Key length:", apiKey.length);
    console.log("Key starts with AIzaSy:", apiKey.startsWith('AIzaSy'));
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "🚨 КЛЮЧ НЕ НАЙДЕН. \n\nПроверь файл .env.local. В нем должна быть строка: \nGEMINI_API_KEY=твой_ключ\n\nЗатем ОБЯЗАТЕЛЬНО перезапусти сервер в терминале (Ctrl+C и npm run dev)." 
      }]);
      return;
    }

    if (!apiKey.startsWith('AIzaSy')) {
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "❌ КЛЮЧ НЕКОРРЕКТЕН. \n\nТвой ключ начинается не с 'AIzaSy'. Проверь, что ты скопировал его полностью из Google AI Studio." 
      }]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `Ты — AI-ассистент маркетингового агентства ProBoost. Ты эксперт в маркетинге доставок еды. 
          Общайся профессионально, задавай уточняющие вопросы, веди к аудиту.`,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });

      const responseText = response.text || "Извините, я не смог сформулировать ответ.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "Произошла ошибка при обращении к AI.";
      if (error.message?.includes('403')) errorMsg = "Ошибка 403: Доступ запрещен. Проверьте, включен ли API в консоли или нет ли ограничений по региону.";
      if (error.message?.includes('429')) errorMsg = "Ошибка 429: Слишком много запросов. Подождите минуту.";
      
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[4000] font-['Inter']">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[90vw] md:w-[420px] h-[600px] glass-card rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden backdrop-blur-3xl bg-black/95"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic">PROBOOST AI EXPERT</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[90%] p-5 rounded-[1.5rem] text-sm md:text-base font-bold italic leading-relaxed shadow-xl ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
              {QUICK_QUESTIONS.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-indigo-600/20 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white transition-all italic"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-5 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Задайте вопрос..."
                  className="w-full bg-black/60 border border-white/10 rounded-2xl py-4.5 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-indigo-600 transition-all font-bold italic"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={isTyping || !inputValue.trim()}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-indigo-500 disabled:opacity-30"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Magnetic strength={0.25}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-18 h-18 md:w-20 md:h-20 bg-white text-black rounded-full shadow-2xl flex items-center justify-center relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <div className="relative z-10">
            {isOpen ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:text-white transition-colors"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:text-white transition-colors"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            )}
          </div>
        </motion.button>
      </Magnetic>
    </div>
  );
};

// --- Loading Screen ---
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 1));
    }, 30);
    if (progress === 100) setTimeout(onComplete, 500);
    return () => clearInterval(timer);
  }, [progress, onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
    >
      <img src={LOGO_URL} className="h-20 mb-10 opacity-50" alt="logo" />
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
};

// --- Custom Cursor ---
const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(mouseY, { stiffness: 500, damping: 28 });
  
  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX - 16); mouseY.set(e.clientY - 16); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  return <motion.div style={{ x: cursorX, y: cursorY }} className="fixed top-0 left-0 w-8 h-8 border border-indigo-500 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block" />;
};

// --- Magnetic Component ---
const Magnetic = ({ children, strength = 0.35 }: { children: React.ReactNode, strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x);
  const sy = useSpring(y);

  const move = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - (left + width / 2)) * strength);
    y.set((e.clientY - (top + height / 2)) * strength);
  };

  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={() => {x.set(0); y.set(0);}} style={{ x: sx, y: sy }}>
      {children}
    </motion.div>
  );
};

// --- Lead Modal ---
const LeadModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-xl glass-card rounded-[3rem] p-12 text-center border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h2 className="text-4xl font-black text-white uppercase italic mb-8">ОБСУДИТЬ ПРОЕКТ</h2>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <input required placeholder="ВАШЕ ИМЯ" className="w-full bg-transparent border-b-2 border-white/10 py-5 text-xl font-bold focus:border-indigo-600 outline-none transition-all text-white" />
          <input required placeholder="TELEGRAM / WHATSAPP" className="w-full bg-transparent border-b-2 border-white/10 py-5 text-xl font-bold focus:border-indigo-600 outline-none transition-all text-white" />
          <button className="w-full py-8 bg-white text-black font-black text-xl rounded-2xl hover:bg-indigo-600 hover:text-white transition-all uppercase italic">ОТПРАВИТЬ ЗАЯВКУ</button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Navbar ---
const Navbar = ({ onOpenQuiz }: { onOpenQuiz: () => void }) => (
  <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 px-8 py-6 flex justify-between items-center">
    <img src={LOGO_URL} alt="Logo" className="h-12 w-auto object-contain" />
    <div className="hidden lg:flex space-x-12">
      {NAV_LINKS.map(link => (
        <a key={link.href} href={link.href} className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 hover:text-indigo-400 transition-colors">{link.label}</a>
      ))}
    </div>
    <button onClick={onOpenQuiz} className="bg-white text-black px-10 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Начать рост</button>
  </nav>
);

// --- Hero Section ---
const Hero = ({ onOpenQuiz }: { onOpenQuiz: () => void }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-10 px-8 overflow-hidden bg-black">
      <div className="absolute inset-0 holographic-bg opacity-10 blur-[150px] pointer-events-none" />
      <motion.div style={{ y }} className="relative z-20 max-w-[1600px] w-full mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div className="text-center lg:text-left space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-8 py-3 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-[0.15em] italic">
              Комплексный маркетинг для доставок еды
            </span>
          </motion.div>
          <h1 className="text-[11rem] font-black leading-[0.8] text-white italic tracking-tighter uppercase">МАРКЕ<br/><span className="gradient-text">ТИНГ</span></h1>
          <p className="text-3xl text-white/80 uppercase tracking-tight italic font-black max-w-xl leading-[1.1]">увеличиваем заказы и отправляем в нокаут ваших конкурентов</p>
          <div className="flex justify-center lg:justify-start pt-4">
            <Magnetic><button onClick={onOpenQuiz} className="px-16 py-10 bg-white text-black rounded-full font-black text-2xl hover:bg-indigo-600 hover:text-white transition-all blue-glow uppercase italic tracking-tighter">ОБСУДИТЬ ПРОЕКТ</button></Magnetic>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <div className="photo-mask relative">
            <img src="https://i.ibb.co/prK8TG9V/2025-12-22-11-51-05.png" alt="Danila" className="w-full max-w-[650px] grayscale select-none" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// --- Services ---
const ServicesSection = () => {
  return (
    <section id="services" className="relative py-40 px-8 bg-neutral-950 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-[6rem] font-black text-white uppercase italic tracking-tighter text-center mb-24">НАШИ <span className="text-indigo-600">УСЛУГИ</span></h2>
        <div className="grid md:grid-cols-3 gap-8">
          {SERVICES.map((s, i) => (
            <motion.div 
              key={s.id} 
              whileHover={{ y: -10 }}
              className="glass-card rounded-[3rem] p-12 border border-white/5 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex gap-4 mb-10">
                {s.icons.map((icon, idx) => <img key={idx} src={icon} className="h-8 w-8 object-contain opacity-50" alt="icon" />)}
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic mb-4">{s.title}</h3>
              <p className="text-white/60 leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Stories ---
const StoriesSection = () => {
  const [active, setActive] = useState<ReviewStory | null>(null);
  return (
    <section id="reviews" className="py-56 px-8 bg-black">
      <div className="max-w-[1500px] mx-auto">
        <h2 className="text-[9rem] font-black text-white uppercase italic mb-40 text-center tracking-tighter leading-none">РЕЗУЛЬТАТЫ</h2>
        <div className="flex gap-10 overflow-x-auto no-scrollbar pb-20 px-4">
          {REVIEWS.map(r => (
            <div key={r.id} onClick={() => setActive(r)} className="flex-shrink-0 w-[350px] aspect-[9/16] rounded-[4rem] overflow-hidden relative cursor-pointer border border-white/10 hover:scale-105 transition-all">
              <img src={r.slides[0].image} className="w-full h-full object-cover" />
              <div className="absolute bottom-12 left-10 flex items-center gap-5">
                <img src={r.avatar} className="w-16 h-16 rounded-full border-2 border-indigo-600 object-cover" />
                <span className="font-black text-lg uppercase text-white italic">{r.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[6000] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl" onClick={() => setActive(null)}>
            <div className="relative w-full max-w-[450px] aspect-[9/16] rounded-[4rem] overflow-hidden bg-neutral-900 border border-white/20" onClick={e => e.stopPropagation()}>
              {active.slides[0].videoUrl ? (
                <iframe src={active.slides[0].videoUrl} className="w-full h-full" frameBorder="0" allowFullScreen />
              ) : (
                <img src={active.slides[0].image} className="w-full h-full object-cover" />
              )}
              <button onClick={() => setActive(null)} className="absolute top-8 right-8 text-white p-2 bg-black/40 rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- App Root ---
const App = () => {
  const [isQuiz, setIsQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-indigo-500 antialiased font-['Inter']">
      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      {!isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CustomCursor />
          <Navbar onOpenQuiz={() => setIsQuiz(true)} />
          <main>
            <Hero onOpenQuiz={() => setIsQuiz(true)} />
            <ServicesSection />
            <StoriesSection />
          </main>
          <AIChatAssistant onLeadCapture={() => setIsQuiz(true)} />
          <LeadModal isOpen={isQuiz} onClose={() => setIsQuiz(false)} />
          <footer className="py-24 px-8 border-t border-white/5 bg-black text-center opacity-20 text-[10px] font-black uppercase tracking-[0.5em]">
            PROBOOST AGENCY © 2026
          </footer>
        </motion.div>
      )}
    </div>
  );
};

export default App;
