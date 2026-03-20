import React, { useState, useEffect, useCallback } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';
import { motion, AnimatePresence } from 'https://esm.sh/framer-motion@10.16.4?deps=react@18.2.0,react-dom@18.2.0';
import * as Lucide from 'https://esm.sh/lucide-react@0.263.1?deps=react@18.2.0,react-dom@18.2.0';

// Extended Items list for advanced gamification
const RAW_ITEMS = [
  // CORRECT 🌿
  { id: 1, name: "Келін", icon: "👰", isCorrect: true },
  { id: 2, name: "Орамал", icon: "🧣", isCorrect: true },
  { id: 3, name: "Сәлем салу", icon: "🙇‍♀️", isCorrect: true },
  { id: 4, name: "Шашу", icon: "🍬", isCorrect: true },
  { id: 5, name: "Домбыра", icon: "🪕", isCorrect: true },
  { id: 6, name: "Көрімдік", icon: "💰", isCorrect: true },
  { id: 7, name: "Наурыз көже", icon: "🍲", isCorrect: true },
  { id: 8, name: "Тайқазан", icon: "🥘", isCorrect: true },
  { id: 9, name: "Киіз үй", icon: "🛖", isCorrect: true },
  { id: 10, name: "Қамшы", icon: "🧵", isCorrect: true },
  { id: 21, name: "Бәйшешек", icon: "🌸", isCorrect: true },
  { id: 22, name: "Асық", icon: "🦴", isCorrect: true },
  
  // WRONG ❌
  { id: 11, name: "Торт", icon: "🎂", isCorrect: false },
  { id: 12, name: "Шар", icon: "🎈", isCorrect: false },
  { id: 13, name: "Алма", icon: "🍎", isCorrect: false },
  { id: 14, name: "Смартфон", icon: "📱", isCorrect: false },
  { id: 15, name: "Пицца", icon: "🍕", isCorrect: false },
  { id: 16, name: "Джойстик", icon: "🎮", isCorrect: false },
  { id: 17, name: "Кофе", icon: "☕", isCorrect: false },
  { id: 18, name: "Құлаққап", icon: "🎧", isCorrect: false },
  { id: 19, name: "Бургер", icon: "🍔", isCorrect: false },
  { id: 20, name: "Сағат", icon: "⌚", isCorrect: false },
  { id: 23, name: "Мәшту", icon: "🏎️", isCorrect: false },
  { id: 24, name: "Сөмке", icon: "👜", isCorrect: false },
];

const LEVELS = [
  { level: 1, correctCount: 3, wrongCount: 3, time: 25, shuffleInterval: 0, grid: "grid-cols-2 lg:grid-cols-3" },
  { level: 2, correctCount: 5, wrongCount: 4, time: 30, shuffleInterval: 7000, grid: "grid-cols-3" },
  { level: 3, correctCount: 6, wrongCount: 6, time: 35, shuffleInterval: 5000, grid: "grid-cols-3 lg:grid-cols-4" },
  { level: 4, correctCount: 8, wrongCount: 8, time: 40, shuffleInterval: 3500, grid: "grid-cols-4" },
  { level: 5, correctCount: 10, wrongCount: 10, time: 45, shuffleInterval: 2500, grid: "grid-cols-4 lg:grid-cols-5" }, // BOSS LEVEL
];

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// --- ANIMATION COMPONENTS ---
const FloatingPoints = ({ texts }) => (
  <div className="pointer-events-none fixed inset-0 z-[100]">
    <AnimatePresence>
      {texts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 1, y: t.y, x: t.x - 20, scale: 0.5, rotate: Math.random() * 20 - 10 }}
          animate={{ opacity: 0, y: t.y - 150, scale: 1.8, rotate: Math.random() * 20 - 10 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute font-black text-4xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
          style={{ color: t.color, textShadow: '2px 4px 6px rgba(0,0,0,0.4)' }}
        >
          {t.text}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// Marquee Text
const InfiniteMarquee = () => {
   const items = ["🔥 5 Деңгей", "•", "⏱ Жылдамдық", "•", "🧠 Зейін", "•", "🇰🇿 Ұлттық мұра", "•", "🎁 24 Түрлі Зат", "•"];
   return (
      <div className="absolute bottom-0 left-0 w-full overflow-hidden bg-gradient-to-r from-transparent via-[#1B3C11]/10 to-transparent backdrop-blur-sm border-t border-white/20 py-2 flex z-40 pointer-events-none">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="whitespace-nowrap flex gap-4 items-center text-[#1B3C11] font-black uppercase text-xs sm:text-sm tracking-[0.2em] drop-shadow-sm opacity-80"
        >
          {[...items, ...items, ...items, ...items].map((text, i) => (
             <span key={i} className={text === "•" ? "text-[#C5A059]" : ""}>{text}</span>
          ))}
        </motion.div>
      </div>
   );
};

const App = () => {
  const [gameState, setGameState] = useState('start'); 
  const [levelIdx, setLevelIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  
  const [bestScore, setBestScore] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const [items, setItems] = useState([]);
  const [foundIds, setFoundIds] = useState(new Set());
  const [wrongTempIds, setWrongTempIds] = useState(new Set());
  const [shakeScreen, setShakeScreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); 
  
  const [streak, setStreak] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState([]);
  
  const isFever = streak >= 3;

  useEffect(() => {
     const saved = localStorage.getItem('betashar_best_score');
     if (saved) setBestScore(parseInt(saved));
  }, []);

  useEffect(() => {
     if ((gameState === 'gameOver' || gameState === 'won') && score > bestScore) {
        setBestScore(score);
        localStorage.setItem('betashar_best_score', score.toString());
     }
  }, [gameState, score, bestScore]);

  // AUDIO ENGINE (Synthesizer to avoid external MP3 links)
  const playSound = useCallback((type) => {
     if (!soundOn) return;
     try {
       const AudioContext = window.AudioContext || window.webkitAudioContext;
       if (!AudioContext) return;
       const ctx = new AudioContext();
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       osc.connect(gain);
       gain.connect(ctx.destination);

       if (type === 'correct') {
         osc.type = 'sine';
         osc.frequency.setValueAtTime(440, ctx.currentTime);
         osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
         gain.gain.setValueAtTime(0.2, ctx.currentTime);
         gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
         osc.start();
         osc.stop(ctx.currentTime + 0.1);
       } else if (type === 'wrong') {
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(150, ctx.currentTime);
         osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
         gain.gain.setValueAtTime(0.2, ctx.currentTime);
         gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
         osc.start();
         osc.stop(ctx.currentTime + 0.3);
       } else if (type === 'levelup' || type === 'won') {
         osc.type = 'square';
         osc.frequency.setValueAtTime(400, ctx.currentTime);
         osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
         osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
         gain.gain.setValueAtTime(0.1, ctx.currentTime);
         gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
         osc.start();
         osc.stop(ctx.currentTime + 0.4);
       } else if (type === 'gameover') {
         osc.type = 'square';
         osc.frequency.setValueAtTime(300, ctx.currentTime);
         osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.8);
         gain.gain.setValueAtTime(0.3, ctx.currentTime);
         gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
         osc.start();
         osc.stop(ctx.currentTime + 0.8);
       }
     } catch (e) {
       console.error("Audio block", e);
     }
  }, [soundOn]);

  const initLevel = useCallback((idx) => {
    const config = LEVELS[idx];
    const corrects = shuffleArray(RAW_ITEMS.filter(i => i.isCorrect)).slice(0, config.correctCount);
    const wrongs = shuffleArray(RAW_ITEMS.filter(i => !i.isCorrect)).slice(0, config.wrongCount);
    
    setItems(shuffleArray([...corrects, ...wrongs]));
    setFoundIds(new Set());
    setTimeLeft(config.time);
    setLevelIdx(idx);
    setStreak(0);
    setIsTransitioning(false);
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setStreak(0);
    initLevel(0);
    setGameState('playing');
  };

  const nextLevel = () => {
    initLevel(levelIdx + 1);
    setGameState('playing');
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !isTransitioning) {
      timer = setInterval(() => {
        if (!isFever) {
          setTimeLeft(prev => prev - 1);
        }
      }, 1000);
    } else if (gameState === 'playing' && timeLeft <= 0 && !isTransitioning) {
      setIsTransitioning(true);
      playSound('gameover');
      setGameState('gameOver');
      setIsTransitioning(false);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isFever, isTransitioning, playSound]);

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && LEVELS[levelIdx].shuffleInterval > 0 && !isFever && !isTransitioning) {
      interval = setInterval(() => {
        setItems(prev => shuffleArray([...prev]));
      }, LEVELS[levelIdx].shuffleInterval);
    }
    return () => clearInterval(interval);
  }, [gameState, levelIdx, isFever, isTransitioning]);

  const addFloatingText = useCallback((text, x, y, color) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1200);
  }, []);

  const fireConfetti = useCallback((type, event) => {
    if (!window.confetti) return;
    if (type === 'big') {
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 40, spread: 360, ticks: 80, zIndex: 1000 };
      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 60 * (timeLeft / duration);
        window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors: ['#76C94D', '#C5A059', '#FFD700', '#FFFFFF'] }));
      }, 250);
    } else if (event) {
      const rect = event.target.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      window.confetti({ particleCount: 50, spread: 70, startVelocity: 25, origin: { x, y }, colors: ['#76C94D', '#FFD700'], disableForReducedMotion: true, zIndex: 50 });
    }
  }, []);

  const handleItemClick = (item, event) => {
    if (gameState !== 'playing' || foundIds.has(item.id) || wrongTempIds.has(item.id) || isTransitioning) return;

    if (item.isCorrect) {
      playSound('correct');
      const newFound = new Set(foundIds).add(item.id);
      setFoundIds(newFound);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      const basePoints = 100;
      const streakBonus = newStreak * 20;
      const feverMultiplier = newStreak >= 3 ? 2 : 1;
      const earnedPoints = (basePoints + streakBonus) * feverMultiplier;
      
      setScore(prev => prev + earnedPoints);
      
      addFloatingText(`+${earnedPoints}`, event.clientX, event.clientY, newStreak >= 3 ? '#FFD700' : '#76C94D');
      fireConfetti('small', event);

      if (newFound.size === LEVELS[levelIdx].correctCount) {
        setIsTransitioning(true);
        if (levelIdx === LEVELS.length - 1) {
          playSound('won');
          setTimeout(() => { setGameState('won'); fireConfetti('big'); setIsTransitioning(false); }, 1000);
        } else {
          playSound('levelup');
          setTimeout(() => { setGameState('levelUp'); fireConfetti('big'); setIsTransitioning(false); }, 1000);
        }
      }
    } else {
      playSound('wrong');
      setLives(prev => prev - 1);
      setStreak(0);
      setTimeLeft(prev => Math.max(0, prev - 4));
      addFloatingText(`-4 сек`, event.clientX, event.clientY, '#EF4444');
      
      setWrongTempIds(new Set(wrongTempIds).add(item.id));
      setShakeScreen(true);
      
      if (lives - 1 <= 0) {
        setIsTransitioning(true);
        playSound('gameover');
        setTimeout(() => { setGameState('gameOver'); setIsTransitioning(false); }, 600);
      }

      setTimeout(() => {
        setShakeScreen(false);
        setWrongTempIds(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 600);
    }
  };

  const currentConfig = LEVELS[levelIdx] || LEVELS[0];

  return (
    <div className={`min-h-screen relative flex flex-col pt-4 sm:pt-14 pb-20 px-4 sm:px-6 z-10 transition-transform duration-75 ${shakeScreen ? 'animate-shake' : ''}`}>
      
      <AnimatePresence>
        {isFever && gameState === 'playing' && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 pointer-events-none z-[1] border-[12px] border-[#C5A059] shadow-[inset_0_0_150px_rgba(197,160,89,0.5)] transition-all duration-500 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.1)_0%,transparent_100%)]"
           />
        )}
      </AnimatePresence>

      <FloatingPoints texts={floatingTexts} />

      {/* TOP NAVIGATION INFO BAR */}
      <div className="fixed top-4 left-4 right-4 sm:left-8 sm:right-8 flex justify-between items-center z-[60] pointer-events-none">
         <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-white/60 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-[2rem] flex items-center gap-3 shadow-lg border border-white/70 pointer-events-auto group hover:bg-white transition-colors cursor-default">
            <div className="bg-gradient-to-br from-[#FFD700] to-[#F59E0B] p-2 rounded-full shadow-inner group-hover:scale-110 transition-transform">
              <Lucide.Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] sm:text-xs uppercase font-black text-[#5C715E] leading-none tracking-widest mb-1">Рекорд</span>
               <span className="text-xl sm:text-2xl font-black text-[#1B3C11] leading-none drop-shadow-sm">{bestScore.toLocaleString()}</span>
            </div>
         </motion.div>
         
         <motion.button initial={{ y: -50 }} animate={{ y: 0 }} onClick={() => setSoundOn(!soundOn)} className="bg-white/60 backdrop-blur-xl p-4 rounded-full shadow-lg border border-white/70 pointer-events-auto hover:scale-110 hover:bg-white transition-all active:scale-95 group">
            {soundOn ? <Lucide.Volume2 className="w-6 h-6 text-[#2D4F1E] group-hover:text-[#76C94D] transition-colors" /> : <Lucide.VolumeX className="w-6 h-6 text-red-500 group-hover:text-red-600 transition-colors" />}
         </motion.button>
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-[20]">
        
        {/* IN-GAME HUD - Changed relative over sticky to avoid layout compression! */}
        <AnimatePresence>
          {gameState !== 'start' && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              /* REMOVED sticky and top-24, added mb-12 to fix overlap bug */
              className={`flex flex-col sm:flex-row justify-between items-center gap-4 glass-panel rounded-[2.5rem] p-4 sm:p-5 relative mb-12 z-40 transition-all ${isFever ? 'border-2 border-[#C5A059] shadow-[0_15px_40px_rgba(197,160,89,0.4)]' : 'shadow-xl'}`}
            >
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="bg-white/80 px-4 py-3 rounded-3xl flex flex-col shadow-sm border border-[#76C94D]/20">
                   <span className="text-[10px] uppercase font-black text-[#5C715E] tracking-widest">Деңгей</span>
                   <span className="text-xl sm:text-2xl font-black text-[#1B3C11]">{levelIdx + 1} <span className="text-gray-300">/</span> {LEVELS.length}</span>
                </div>
                
                <div className="bg-white/80 px-5 py-3 rounded-3xl flex flex-col items-center shadow-sm relative overflow-hidden border border-[#76C94D]/20 min-w-[100px]">
                   {isFever && <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 via-orange-300/30 to-yellow-300/30 animate-[shimmer_2s_infinite]"></div>}
                   <span className="text-[10px] uppercase font-black text-[#5C715E] tracking-widest z-10">Ұпай</span>
                   <motion.span 
                      key={score}
                      initial={{ scale: 1.5, color: '#C5A059' }}
                      animate={{ scale: 1, color: isFever ? '#B45309' : '#1B3C11' }}
                      className="text-xl sm:text-3xl font-black z-10"
                   >
                      {score.toLocaleString()}
                   </motion.span>
                </div>

                <AnimatePresence>
                  {streak > 1 && (
                    <motion.div 
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      exit={{ scale: 0 }}
                      className={`px-4 py-3 rounded-3xl flex items-center gap-2 font-black text-lg ${isFever ? 'bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-white shadow-lg animate-pulse' : 'bg-[#E9F2E6] text-[#76C94D] border border-[#76C94D]/30'}`}
                    >
                       <Lucide.Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                       x{streak}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 w-full max-w-md flex flex-col gap-2">
                 <div className="flex justify-between items-center px-3">
                    <span className="text-xs font-black text-[#5C715E] flex items-center gap-1.5 uppercase tracking-widest">
                       <Lucide.Timer className="w-4 h-4 text-[#1B3C11]"/> 
                       {isFever ? <span className="text-[#C5A059] animate-pulse">Уақыт Тоқтады!</span> : "Уақыт Қалды"}
                    </span>
                    <span className={`text-base sm:text-xl font-black ${timeLeft <= 5 && !isFever ? 'text-red-500 animate-pulse drop-shadow-md' : 'text-[#2D4F1E]'}`}>
                       {timeLeft}с
                    </span>
                 </div>
                 <div className="h-5 w-full bg-black/10 rounded-full overflow-hidden shadow-inner relative border-2 border-white/40">
                    <motion.div 
                      className={`h-full rounded-full shadow-md relative overflow-hidden ${isFever ? 'bg-[#FFD700]' : timeLeft <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-[#76C94D] to-[#4ADE80]'}`}
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / currentConfig.time) * 100}%` }}
                      transition={{ ease: "linear" }}
                    >
                       {!isFever && <div className="absolute inset-0 w-[200%] h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>}
                    </motion.div>
                 </div>
              </div>

              <div className="flex items-center gap-2 bg-white/80 px-5 py-4 rounded-3xl shadow-sm border border-red-100">
                {[...Array(3)].map((_, i) => (
                  <motion.div key={i} animate={i >= lives ? { scale: 0.8, opacity: 0.2, filter: "grayscale(100%)" } : { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.5, delay: i * 0.2 } }}>
                    <Lucide.Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_3px_5px_rgba(239,68,68,0.5)]' : 'text-gray-400 fill-gray-300'}`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* 1. START SCREEN */}
        {gameState === 'start' && (
          <motion.div initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="flex flex-col items-center justify-center min-h-[75vh] relative w-full pt-16">
            
            <motion.div 
              initial={{ x: -80, opacity: 0, rotate: -20 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
              className="absolute left-[-20px] lg:left-[-120px] top-[15%] z-[60] hidden md:flex flex-col items-center pointer-events-none drop-shadow-2xl"
            >
              <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2rem] rounded-bl-none shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-2 border-[#76C94D]/30 max-w-[240px] mb-3 transform -rotate-3">
                <p className="text-[#1B3C11] font-bold text-sm sm:text-base leading-snug">
                  «Айналайын, салт-дәстүрді қалай біледі екенсің? Кәне, бірге байқап көрейік!»
                </p>
                <div className="absolute -bottom-[10px] left-4 w-4 h-4 bg-white/95 border-b-2 border-l-2 border-[#76C94D]/30 rotate-[-45deg]"></div>
              </div>
              <div className="text-7xl lg:text-8xl self-start drop-shadow-xl animate-bounce" style={{animationDuration: '3s'}}>👵🏻</div>
            </motion.div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
               <motion.div animate={{ y: [-20, 20, -20], rotate: [0, 15, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-[18%] text-5xl sm:text-7xl opacity-40 drop-shadow-xl">🪕</motion.div>
               <motion.div animate={{ y: [20, -20, 20], rotate: [0, -15, 20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-10 left-[15%] text-6xl sm:text-8xl opacity-[0.35] drop-shadow-xl">🍬</motion.div>
               <motion.div animate={{ y: [-25, 25, -25], rotate: [0, 25, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-10 right-[15%] text-5xl sm:text-7xl opacity-40 drop-shadow-xl">🛖</motion.div>
               <motion.div animate={{ y: [15, -15, 15], rotate: [0, -20, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-20 right-[12%] text-6xl sm:text-8xl opacity-[0.35] drop-shadow-xl">💰</motion.div>
               <motion.div animate={{ y: [-15, 15, -15], rotate: [0, 15, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute top-1/2 left-[5%] text-4xl sm:text-6xl opacity-30 drop-shadow-xl">🌸</motion.div>
               <motion.div animate={{ y: [10, -10, 10], rotate: [0, -10, 20, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }} className="absolute top-1/2 right-[5%] text-4xl sm:text-6xl opacity-30 drop-shadow-xl">🧣</motion.div>
            </div>

            <div className="glass-panel p-8 sm:p-14 rounded-[4rem] text-center max-w-3xl w-full border-[4px] border-white shadow-[0_40px_80px_rgba(27,60,17,0.15)] relative z-10 hover:border-[#76C94D]/50 transition-colors duration-700 bg-white/70 backdrop-blur-3xl group">
               <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-gradient-to-br from-[#76C94D] to-[#2E7D32] opacity-20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
               <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-[#C5A059] to-[#FFD700] opacity-20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
               
               <motion.div 
                 animate={{ y: [0, -12, 0], rotateZ: [-2, 2, -2] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-white to-[#FDFBF7] rounded-[2rem] shadow-[0_15px_30px_rgba(197,160,89,0.3)] mb-8 border-[5px] border-[#C5A059]/40 relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.8)_50%,transparent_80%)] animate-[shimmer_3s_infinite]"></div>
                  <Lucide.Crown className="w-14 h-14 text-[#C5A059]" strokeWidth={2.5}/>
               </motion.div>
               
               <h1 className="text-6xl sm:text-[5.5rem] font-serif font-black text-[#1B3C11] mb-6 drop-shadow-lg leading-[1.05] tracking-tighter">
                 Беташар <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#FFD700] to-[#F59E0B]">Майтөсі</span>
               </h1>
               
               <p className="text-[#1B3C11] text-lg sm:text-xl font-black mb-10 mx-auto px-8 bg-gradient-to-r from-[#E9F2E6] via-white to-[#E9F2E6] py-3.5 rounded-full shadow-md border-2 border-white inline-block tracking-wide">
                 ✨ Дәстүрлі заттарды тап. Қатеден сақтан!
               </p>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 text-left relative z-20">
                  <div className="bg-gradient-to-b from-white to-[#FDFBF7] p-5 rounded-[2rem] shadow-lg border-b-[6px] border-[#C5A059] flex flex-col items-center text-center gap-3 hover:-translate-y-2 hover:shadow-2xl transition transform duration-300">
                     <div className="bg-gradient-to-br from-[#FFF8E7] to-[#FFE4A0] p-4 rounded-[1.5rem] shadow-inner"><Lucide.Flame className="text-[#F59E0B] w-8 h-8"/></div>
                     <span className="font-black text-[#1B3C11] text-sm leading-snug mt-1">Комбо жинау<br/><span className="text-[#C5A059]">= Уақыт тоқтайды</span></span>
                  </div>
                  <div className="bg-gradient-to-b from-white to-[#E9F2E6]/30 p-5 rounded-[2rem] shadow-lg border-b-[6px] border-[#76C94D] flex flex-col items-center text-center gap-3 hover:-translate-y-2 hover:shadow-2xl transition transform duration-300 group/card">
                     <div className="bg-gradient-to-br from-[#E9F2E6] to-[#A0E67A] p-4 rounded-[1.5rem] shadow-inner"><Lucide.Shuffle className="text-[#2E7D32] w-8 h-8 group-hover/card:rotate-180 transition-transform duration-500"/></div>
                     <span className="font-black text-[#1B3C11] text-sm leading-snug mt-1">Карталардың<br/><span className="text-[#2E7D32]">сиқырлы биі</span></span>
                  </div>
                  <div className="bg-gradient-to-b from-white to-red-50/50 p-5 rounded-[2rem] shadow-lg border-b-[6px] border-red-500 flex flex-col items-center text-center gap-3 hover:-translate-y-2 hover:shadow-2xl transition transform duration-300 group/card2">
                     <div className="bg-gradient-to-br from-red-100 to-red-300 p-4 rounded-[1.5rem] shadow-inner"><Lucide.HeartCrack className="text-red-600 w-8 h-8 group-hover/card2:scale-125 transition-transform duration-300"/></div>
                     <span className="font-black text-[#1B3C11] text-sm leading-snug mt-1">Қате бассаң<br/><span className="text-red-600">өмір шегеріледі</span></span>
                  </div>
               </div>

               <button onClick={startGame} className="w-full sm:w-[90%] mx-auto px-10 py-6 sm:py-7 bg-gradient-to-tr from-[#1B3C11] via-[#2E7D32] to-[#76C94D] text-white rounded-[3rem] font-black text-3xl sm:text-4xl hover:scale-105 transition-all active:scale-95 shadow-[0_20px_40px_rgba(46,125,50,0.5)] relative overflow-hidden flex justify-center items-center gap-5 border-b-[8px] border-[#0F240A] hover:border-white active:border-b-0 active:translate-y-[8px] group z-20">
                  <div className="absolute inset-0 w-full h-full shimmer-bg pointer-events-none opacity-40"></div>
                  <motion.div animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     <Lucide.Play className="w-10 h-10 fill-white" />
                  </motion.div>
                  <span className="tracking-wide uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Қазір Ойнау</span>
               </button>
            </div>
          </motion.div>
        )}

        {/* 2. PLAYING SCREEN (THE GRID) */}
        {gameState === 'playing' && (
          <div className="flex flex-col items-center px-1">
            
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between w-full max-w-5xl px-3 gap-5">
               {isFever ? (
                 <motion.h2 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-orange-400 to-red-500 uppercase tracking-widest drop-shadow-xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                 >
                   🔥 Қызу Уақыт! x2 Ұпай
                 </motion.h2>
               ) : (
                 <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1B3C11] drop-shadow-md">
                   Алға мақсат: <span className="text-[#C5A059] bg-[#C5A059]/15 px-4 py-1.5 rounded-[1rem] shadow-inner inline-block mx-1 border border-[#C5A059]/30">{currentConfig.correctCount}</span> зат
                 </h2>
               )}
               
               <div className="text-sm sm:text-base font-black text-[#1B3C11] bg-white/90 backdrop-blur-md shadow-lg px-6 py-3 rounded-3xl border-[3px] border-[#76C94D]/30 flex items-center gap-3 transition-colors duration-500 hover:bg-white hover:border-[#76C94D]">
                 Табылды: 
                 <div className="flex gap-1.5">
                   {[...Array(currentConfig.correctCount)].map((_, i) => (
                     <div key={i} className={`w-3 sm:w-4 h-5 sm:h-6 rounded-[4px] shadow-inner transition-colors duration-300 ${i < foundIds.size ? 'bg-gradient-to-b from-[#76C94D] to-[#4ADE80] shadow-[0_0_8px_rgba(118,201,77,0.8)]' : 'bg-gray-200 border border-gray-300'}`}></div>
                   ))}
                 </div>
               </div>
            </div>

            <motion.div layout className={`w-full max-w-5xl grid ${currentConfig.grid} gap-4 sm:gap-6 preserve-3d px-2 pb-10`}>
              <AnimatePresence>
                {items.map((item, index) => {
                  const isFound = foundIds.has(item.id);
                  const isWrong = wrongTempIds.has(item.id);
                  
                  return (
                    <motion.button
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotateZ: 90 }}
                      transition={{ type: "spring", stiffness: 250, damping: 25, delay: index * 0.02 }}
                      whileHover={!isFound ? { y: -10, scale: 1.05 } : {}}
                      whileTap={!isFound ? { scale: 0.9, y: 0 } : {}}
                      onClick={(e) => handleItemClick(item, e)}
                      disabled={isFound}
                      className={`
                        relative group rounded-[2.5rem] p-5 sm:p-8 flex flex-col items-center justify-center transition-all duration-300 min-h-[160px] sm:min-h-[200px]
                        transform-style-3d
                        ${isFound 
                          ? 'bg-gradient-to-b from-[#E9F2E6] to-[#ffffff] border-2 border-b-2 border-[#76C94D] opacity-60 translate-y-[8px] !shadow-none' 
                          : isWrong
                          ? 'bg-red-50 border-2 border-b-2 border-red-500 shadow-none translate-y-[8px] z-10'
                          : 'bg-gradient-to-b from-white to-[#FDFBF7] border-[3px] border-white hover:border-[#C5A059]/80 cursor-pointer shadow-[0_10px_0_#E5E7EB] hover:shadow-[0_4px_0_#C5A059] hover:translate-y-1.5 mb-2'}
                      `}
                    >
                      {!isFound && !isWrong && <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] pointer-events-none"></div>}

                      <motion.span 
                        animate={isFound ? { rotateY: 360, scale: 0.7 } : isWrong ? { rotateZ: [-25, 25, -25, 25, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`text-7xl sm:text-[5.5rem] drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)] mb-4 z-10 transition-transform duration-300 ${!isFound && !isWrong && 'group-hover:scale-110 group-hover:-translate-y-3 group-hover:rotate-6'}`}
                      >
                        {item.icon}
                      </motion.span>
                      <span className={`text-sm sm:text-base font-black uppercase tracking-widest text-center leading-tight z-10
                          ${isFound ? 'text-[#76C94D] bg-[#76C94D]/10 px-3 py-1.5 rounded-xl' : 'text-[#2D4F1E]'}`}>
                        {item.name}
                      </span>
                      
                      {isWrong && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-9xl drop-shadow-2xl">
                            ❌
                          </motion.div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* 3. LEVEL UP SCREEN */}
        {gameState === 'levelUp' && (
          <motion.div initial={{ scale: 0.5, opacity: 0, rotateX: 45 }} animate={{ scale: 1, opacity: 1, rotateX: 0 }} transition={{ type: "spring", bounce: 0.5 }} className="flex justify-center items-center min-h-[60vh]">
             <div className="glass-panel p-14 rounded-[4rem] text-center max-w-lg w-full border-[6px] border-[#76C94D] shadow-[0_30px_60px_rgba(118,201,77,0.4)] bg-white/95 relative overflow-hidden group hover:border-[#2E7D32] transition-colors duration-500">
                <div className="absolute inset-0 bg-[#76C94D]/5 animate-pulse"></div>

                <motion.div 
                   animate={{ y: [-15, 15, -15] }} 
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="w-40 h-40 bg-gradient-to-br from-[#E9F2E6] to-[#76C94D] rounded-full mx-auto flex items-center justify-center mb-8 shadow-inner border-[8px] border-white relative z-10 group-hover:scale-110 transition-transform duration-500"
                >
                   <Lucide.ArrowUpCircle className="w-20 h-20 text-white" />
                </motion.div>
                <h2 className="text-6xl font-black text-[#1B3C11] mb-6 uppercase tracking-tighter relative z-10 drop-shadow-sm">Өте Жақсы!</h2>
                <div className="bg-[#E9F2E6] p-6 rounded-[2rem] mb-10 border-2 border-[#76C94D]/30 relative z-10 shadow-inner">
                  <p className="text-[#2D4F1E] text-2xl font-black uppercase tracking-widest mb-1">Келесі кезең</p>
                  <span className="text-5xl font-black text-[#76C94D] drop-shadow-sm">{levelIdx + 2} Деңгей</span>
                </div>
                <button onClick={nextLevel} className="w-full py-7 bg-gradient-to-r from-[#76C94D] to-[#51A32A] text-white rounded-[2.5rem] font-black text-3xl hover:scale-105 transition-all shadow-[0_15px_30px_rgba(118,201,77,0.4)] active:scale-95 border-b-[8px] border-[#3e8a1a] active:border-b-0 active:translate-y-[8px] relative z-10">
                   Алға Басу 🚀
                </button>
             </div>
          </motion.div>
        )}

        {/* 4. GAME OVER SCREEN */}
        {gameState === 'gameOver' && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center items-center min-h-[60vh]">
             <div className="glass-panel p-14 rounded-[4rem] text-center max-w-lg w-full border-[6px] border-red-500 shadow-[0_30px_60px_rgba(239,68,68,0.4)] bg-white/95 relative overflow-hidden group hover:border-red-600 transition-colors">
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15)_0%,transparent_80%)] pointer-events-none"></div>

                <motion.div animate={{ rotateZ: [-15, 15, -15] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-40 h-40 bg-gradient-to-br from-red-100 to-red-200 rounded-full mx-auto flex items-center justify-center mb-8 shadow-inner border-[8px] border-white z-10 relative">
                   <Lucide.Frown className="w-20 h-20 text-red-600" />
                </motion.div>
                
                <h2 className="text-6xl font-black text-red-600 mb-4 uppercase tracking-tighter drop-shadow-sm">Ойын Аяқталды</h2>
                <p className="text-red-900/70 font-black text-2xl mb-8">Уақыт не өмір таусылды.</p>
                
                <div className="bg-red-50 py-8 px-6 rounded-[3rem] mb-10 border-2 border-red-200 shadow-inner">
                   <span className="block text-sm text-red-500 uppercase font-black mb-3 tracking-[0.3em]">Сіздің ұпайыңыз</span>
                   <span className="text-7xl font-black text-red-600 drop-shadow-[0_3px_3px_rgba(0,0,0,0.1)]">{score.toLocaleString()}</span>
                </div>

                <button onClick={startGame} className="w-full py-7 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-[2.5rem] font-black text-3xl hover:scale-105 transition-all shadow-[0_15px_30px_rgba(239,68,68,0.4)] active:scale-95 border-b-[8px] border-red-900 active:border-b-0 active:translate-y-[8px] flex items-center justify-center gap-4">
                   <Lucide.RotateCcw className="w-10 h-10 group-hover:-rotate-180 transition-transform duration-700" strokeWidth={3.5} /> Қайта Бастау
                </button>
             </div>
          </motion.div>
        )}

        {gameState === 'won' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center items-center min-h-[85vh]">
             <div className="bg-gradient-to-br from-[#1B3C11] via-[#2E7D32] to-[#1B3C11] p-12 sm:p-[5rem] rounded-[4rem] text-center max-w-3xl w-full border-[8px] border-[#C5A059] shadow-[0_40px_100px_rgba(197,160,89,0.5)] relative overflow-hidden">
                
                <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="w-[1200px] h-[1200px] bg-[conic-gradient(from_0deg,transparent_0deg,#FFD700_5deg,transparent_10deg,transparent_30deg,#FFD700_35deg,transparent_40deg,transparent_60deg,#FFD700_65deg,transparent_70deg,transparent_90deg,#FFD700_95deg,transparent_100deg,transparent_120deg,#FFD700_125deg,transparent_130deg,transparent_150deg,#FFD700_155deg,transparent_160deg,transparent_180deg,#FFD700_185deg,transparent_190deg,transparent_210deg,#FFD700_215deg,transparent_220deg,transparent_240deg,#FFD700_245deg,transparent_250deg,transparent_270deg,#FFD700_275deg,transparent_280deg,transparent_300deg,#FFD700_305deg,transparent_310deg,transparent_330deg,#FFD700_335deg,transparent_340deg)]"></motion.div>
                </div>

                <motion.div 
                   animate={{ y: [-20, 20, -20], scale: [1, 1.05, 1] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="w-48 h-48 sm:w-56 sm:h-56 mx-auto relative mb-12 z-10"
                >
                   <div className="absolute inset-0 bg-[#FFD700] opacity-50 rounded-full blur-[40px] animate-pulse"></div>
                   <div className="w-full h-full bg-gradient-to-tr from-[#FFD700] via-[#FFF3B0] to-[#FFD700] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-[10px] border-white relative overflow-hidden">
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.8)_50%,transparent_80%)] animate-[shimmer_2s_infinite]"></div>
                     <Lucide.Trophy className="w-24 h-24 sm:w-28 sm:h-28 text-[#B45309] relative z-10" strokeWidth={2.5}/>
                   </div>
                </motion.div>
                
                <h2 className="text-7xl sm:text-[6.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF] to-[#FFD700] mb-6 drop-shadow-2xl z-10 relative uppercase tracking-tighter">Жеңіс!</h2>
                <p className="text-[#E9F2E6] text-2xl sm:text-3xl font-bold mb-12 z-10 relative max-w-xl mx-auto leading-relaxed">
                  Сіз нағыз <span className="text-[#FFD700] py-1.5 px-4 bg-black/30 rounded-2xl mx-1 shadow-inner">Беташар Батыры</span> атандыңыз!
                </p>
                
                <div className="bg-black/40 p-8 sm:p-10 rounded-[3rem] mb-14 backdrop-blur-xl border-[4px] border-white/20 z-10 relative shadow-[inset_0_5px_20px_rgba(0,0,0,0.5)]">
                   <div className="flex justify-center items-center gap-6 mb-4">
                     <Lucide.Star className="w-10 h-10 text-[#FFD700] fill-[#FFD700] drop-shadow-lg" />
                     <Lucide.Star className="w-16 h-16 text-[#FFD700] fill-[#FFD700] drop-shadow-lg scale-125" />
                     <Lucide.Star className="w-10 h-10 text-[#FFD700] fill-[#FFD700] drop-shadow-lg" />
                   </div>
                   <span className="block text-base sm:text-lg text-[#FFD700] uppercase font-black tracking-[0.4em] mb-4">Қорытынды Ұпай</span>
                   <span className="text-8xl sm:text-[7rem] font-black text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)] tracking-tighter leading-none block">{score.toLocaleString()}</span>
                </div>

                <button onClick={startGame} className="w-full sm:w-[80%] px-12 py-7 sm:py-8 bg-white text-[#1B3C11] rounded-full font-black text-3xl hover:bg-[#FFD700] hover:text-[#B45309] transition-colors duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 border-b-[8px] border-gray-300 hover:border-[#B45309] flex items-center justify-center gap-5 mx-auto z-10 relative active:translate-y-[8px] active:border-b-0 group">
                   <Lucide.RotateCw className="w-10 h-10 group-hover:rotate-180 transition-transform duration-700" strokeWidth={3.5} /> Басынан Ойнау
                </button>
             </div>
          </motion.div>
        )}

      </div>
      
      {gameState === 'start' && <InfiniteMarquee />}
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
