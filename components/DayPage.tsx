import React, { useEffect, useRef, useState } from 'react';
import { DayConfig, ValentineDay } from '../types';
import { Heart, Stars, Sparkles, Flower, Gift, User, PenTool, Smile, X, Lock, Info } from 'lucide-react';
import { useSound } from '../context/SoundContext';

interface DayPageProps {
  config: DayConfig;
  index: number;
  total: number;
  isActive: boolean;
}

// Advanced Physics Particle for Burst/Scatter
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  friction: number;
  gravity: number;
  oscillation: number;
  oscillationSpeed: number;

  constructor(width: number, height: number, color: string, startX?: number, startY?: number, isBurst: boolean = false) {
    this.x = startX ?? Math.random() * width;
    this.y = startY ?? Math.random() * height;
    this.size = Math.random() * 4 + 2; // Slightly larger
    this.color = color;
    this.oscillation = Math.random() * Math.PI * 2;
    this.oscillationSpeed = Math.random() * 0.05;

    if (isBurst) {
      // Explosive initial velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 15 + 8; // Faster burst
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.friction = 0.92; 
      this.gravity = 0.2; // Add gravity for burst
    } else {
      // Gentle drift
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = Math.random() * 0.5 + 0.2; // Slowly falling
      this.friction = 1;
      this.gravity = 0;
    }
  }

  update(mouse: { x: number; y: number }, width: number, height: number) {
    // Apply velocity
    this.x += this.vx + Math.sin(this.oscillation) * 0.5; // Add swaying
    this.y += this.vy;
    this.vy += this.gravity;
    this.oscillation += this.oscillationSpeed;

    // Apply friction to bursts
    if (this.friction < 1) {
      this.vx *= this.friction;
      this.vy *= this.friction;
      
      // If slowed down enough, reset to gentle drift
      if (Math.abs(this.vx) < 0.5 && Math.abs(this.vy) < 0.5) {
        this.friction = 1;
        this.gravity = 0;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * 0.5 + 0.2;
      }
    }

    // Wrap around screen
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Mouse Interaction (Strong Repulsion)
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 300; // Larger influence radius
    
    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      const angle = Math.atan2(dy, dx);
      // Stronger push
      const push = force * 4.0; 
      
      this.vx -= Math.cos(angle) * push;
      this.vy -= Math.sin(angle) * push;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Generic Floating Emoji Component
const FloatingEmoji = ({ char, x, y }: { char: string, x: number, y: number }) => {
  const [active, setActive] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setActive(true)) }, []);
  return (
    <div 
      className={`fixed z-[100] text-5xl pointer-events-none transition-all duration-1000 ease-out transform ${active ? '-translate-y-32 opacity-0 scale-150 rotate-12' : 'scale-0'}`}
      style={{ left: x, top: y }}
    >
      {char}
    </div>
  );
};

// Hint Component
const HintTooltip = ({ text, position = 'top' }: { text: string, position?: 'top' | 'bottom' }) => (
  <div className={`absolute left-1/2 -translate-x-1/2 ${position === 'top' ? '-top-10' : '-bottom-8'} pointer-events-none opacity-0 group-hover/hint:opacity-100 transition-all duration-300 z-50`}>
    <div className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1 border border-white/20 animate-in slide-in-from-bottom-2 fade-in">
      <Sparkles size={10} className="text-yellow-400" />
      {text}
    </div>
  </div>
);

export const DayPage: React.FC<DayPageProps> = ({ config, index, total, isActive }) => {
  // Refs for Parallax (Direct DOM manipulation for smoothness)
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { playSound } = useSound();
  
  // Interaction State
  const [clickCount, setClickCount] = useState(0); // For Valentine Heart
  const [showSurprise, setShowSurprise] = useState(false); // Valentine Modal
  const [isShaking, setIsShaking] = useState(false); // Icon animation
  const [isSqueezing, setIsSqueezing] = useState(false); // Hug effect
  const [isGlowing, setIsGlowing] = useState(false); // Valentine Rapid Hover Glow
  const [showUnlockMessage, setShowUnlockMessage] = useState(false); // Valentine Secret Unlocked Message
  
  // Floating Emojis (Rose, Chocolate, Kiss)
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, x: number, y: number, char: string}[]>([]);
  
  // State for specific days
  const [secretTitle, setSecretTitle] = useState(false); // Propose & Valentine Day
  const [isPromiseLocked, setIsPromiseLocked] = useState(false); // Promise Day
  
  // Rapid Hover Logic (Chocolate & Valentine Day)
  const [hoverCount, setHoverCount] = useState(0);
  const lastHoverTime = useRef(0);

  // Typewriter Text Logic
  const [displayedTitle, setDisplayedTitle] = useState('');
  
  // Helper to spawn emoji
  const spawnEmoji = (x: number, y: number, char: string) => {
    const newEmoji = { id: Date.now() + Math.random(), x, y, char };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id)), 1500);
  };

  useEffect(() => {
    if (isActive) {
      playSound('chime'); 
      setDisplayedTitle('');
      let i = 0;
      const timer = setInterval(() => {
        if (i < config.title.length) {
          setDisplayedTitle((prev) => config.title.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 80); 
      return () => clearInterval(timer);
    }
  }, [isActive, config.title, playSound]);

  // Optimized Scroll Parallax
  useEffect(() => {
    let ticking = false;
    
    const updateParallax = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (rect.bottom < -100 || rect.top > viewportHeight + 100) return;

      const offset = rect.top;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${offset * -0.6}px, 0) scale(1.6)`;
      }
      
      if (fgRef.current) {
        fgRef.current.style.transform = `translate3d(0, ${offset * -0.2}px, 0)`;
      }

      if (textRef.current) {
        const centerOffset = (offset + rect.height/2) - viewportHeight/2;
        const rotateVal = centerOffset * 0.02; 
        textRef.current.style.transform = `translate3d(0, ${offset * -0.15}px, 0) rotateX(${rotateVal}deg)`;
      }
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax(); 
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Confetti System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = [];
      const color = isActive ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height, color));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.update(mouse, canvas.width, canvas.height);
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
         const rect = containerRef.current.getBoundingClientRect();
         mouse.x = e.clientX - rect.left;
         mouse.y = e.clientY - rect.top;
      }
    };

    window.addEventListener('resize', resize);
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (containerRef.current) containerRef.current.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  const triggerConfettiBurst = () => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const color = 'rgba(255, 180, 180, 0.9)'; 
    for (let i = 0; i < 30; i++) {
       particlesRef.current.push(new Particle(rect.width, rect.height, color, centerX, centerY, true));
    }
    if (particlesRef.current.length > 200) {
      particlesRef.current = particlesRef.current.slice(particlesRef.current.length - 200);
    }
  };

  // --- Interaction Handlers ---

  const handleCardHover = () => {
    playSound('hover'); 
    triggerConfettiBurst();

    // Valentine Day: Golden Glow on Rapid Hover
    if (config.id === ValentineDay.VALENTINE && !isGlowing) {
        const now = Date.now();
        if (now - lastHoverTime.current < 1000) {
            setHoverCount(prev => {
                const newCount = prev + 1;
                if (newCount === 3) {
                    playSound('surprise');
                    setIsGlowing(true);
                    setShowUnlockMessage(true);
                    setTimeout(() => setShowUnlockMessage(false), 3000); // Hide message after 3s
                }
                return newCount;
            });
        } else {
            setHoverCount(1);
        }
        lastHoverTime.current = now;
    }
  };

  const handleIconHover = (e: React.MouseEvent) => {
    // Chocolate Day Surprise: Rapid Hover
    if (config.id === ValentineDay.CHOCOLATE) {
        const now = Date.now();
        if (now - lastHoverTime.current < 500) {
            const newCount = hoverCount + 1;
            setHoverCount(newCount);
            if (newCount >= 3) {
                playSound('surprise');
                for(let i=0; i<5; i++) {
                    setTimeout(() => spawnEmoji(e.clientX + (Math.random()*100 - 50), e.clientY + (Math.random()*100 - 50), '🍫'), i*100);
                }
                setHoverCount(0);
            }
        } else {
            setHoverCount(1);
        }
        lastHoverTime.current = now;
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    playSound('click');

    // 1. Valentine's Day: 5 Click Count
    if (config.id === ValentineDay.VALENTINE) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount === 5) {
        playSound('surprise');
        setShowSurprise(true);
      }
      return;
    }

    // 2. Rose Day: Rose Petal Shower
    if (config.id === ValentineDay.ROSE) {
        for(let i=0; i<8; i++) {
            setTimeout(() => spawnEmoji(e.clientX + (Math.random()*100 - 50), e.clientY + (Math.random()*100 - 50), '🌹'), i*100);
        }
        return;
    }

    // 3. Teddy Day: Wiggle
    if (config.id === ValentineDay.TEDDY) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // 4. Propose Day: Secret Message
      if (config.id === ValentineDay.PROPOSE) {
          setSecretTitle(prev => !prev);
          playSound('chime');
      }
      // 4b. Valentine Day: Secret Message
      if (config.id === ValentineDay.VALENTINE) {
          setSecretTitle(prev => !prev);
          playSound('chime');
      }
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // 5. Promise Day: Lock Promise
      if (config.id === ValentineDay.PROMISE) {
          setIsPromiseLocked(true);
          playSound('click');
      }
  };

  const handleCardClick = () => {
      // 6. Hug Day: Squeeze Card
      if (config.id === ValentineDay.HUG) {
          setIsSqueezing(true);
          playSound('whoosh');
          setTimeout(() => setIsSqueezing(false), 300);
      }
  };

  const handleSectionDoubleClick = (e: React.MouseEvent) => {
      // 7. Kiss Day: Floating Kisses (Moved from Valentine)
      if (config.id === ValentineDay.KISS) {
          playSound('chime');
          spawnEmoji(e.clientX, e.clientY, '💋');
      }
  };

  // --- Hints Logic ---
  const getIconHint = () => {
      if (config.id === ValentineDay.ROSE) return "Tap for Petals";
      if (config.id === ValentineDay.CHOCOLATE) return "Hover Fast!";
      if (config.id === ValentineDay.TEDDY) return "Tickle Me";
      if (config.id === ValentineDay.VALENTINE) return "Tap 5 Times";
      return null;
  };

  const getTitleHint = () => {
      if (config.id === ValentineDay.PROPOSE || config.id === ValentineDay.VALENTINE) return "Tap for Secret";
      return null;
  };

  const getDescHint = () => {
      if (config.id === ValentineDay.PROMISE) return "Tap to Lock";
      return null;
  };

  // Determine Icon
  const IconComponent = () => {
    const props = { className: `w-8 h-8 text-slate-700` }; 
    switch (config.icon) {
      case 'flower': return <Flower {...props} className="w-8 h-8 text-rose-500" />;
      case 'ring': return <Sparkles {...props} className="w-8 h-8 text-amber-500" />;
      case 'candy': return <Gift {...props} className="w-8 h-8 text-orange-500" />;
      case 'bear': return <Smile {...props} className="w-8 h-8 text-pink-500" />;
      case 'scroll': return <PenTool {...props} className="w-8 h-8 text-blue-500" />;
      case 'users': return <User {...props} className="w-8 h-8 text-emerald-500" />;
      case 'heart': return <Heart {...props} className="w-8 h-8 text-red-500" />;
      default: return <Heart {...props} className="w-8 h-8 text-rose-500" />;
    }
  };

  const getSectionStyle = (idx: number) => {
    const baseStyle: React.CSSProperties = { zIndex: idx + 10 };
    if (idx === 0) return baseStyle;
    const h = '12vh'; 
    const patterns = [
      `polygon(0 ${h}, 100% 0, 100% 100%, 0 100%)`, 
      `polygon(0 0, 50% ${h}, 100% 0, 100% 100%, 0 100%)`, 
      `polygon(0 0, 100% ${h}, 100% 100%, 0 100%)`, 
      `polygon(0 ${h}, 20% 0, 80% 0, 100% ${h}, 100% 100%, 0 100%)`, 
      `polygon(0 0, 30% ${h}, 60% 0, 100% ${h}, 100% 100%, 0 100%)`, 
      `polygon(0 5vh, 100% 0, 100% 100%, 0 100%)`, 
    ];
    const clip = patterns[(idx - 1) % patterns.length];
    return {
        ...baseStyle,
        clipPath: clip,
        WebkitClipPath: clip,
        filter: 'drop-shadow(0px -30px 50px rgba(0,0,0,0.9))', 
        transition: 'filter 0.5s ease-out'
    };
  };

  const isEven = index % 2 === 0;
  
  // Dynamic Title Logic
  let titleText = isActive ? displayedTitle : config.title;
  if (config.id === ValentineDay.PROPOSE && secretTitle) titleText = "Will You Marry Me?";
  if (config.id === ValentineDay.VALENTINE && secretTitle) titleText = "Happy Valentine's Day My Love!";

  const iconHint = getIconHint();
  const titleHint = getTitleHint();
  const descHint = getDescHint();

  return (
    <section 
      id={config.id}
      ref={containerRef}
      onDoubleClick={handleSectionDoubleClick}
      className={`sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-slate-900 shadow-2xl transition-all will-change-transform perspective-1000 ${config.id === ValentineDay.KISS ? 'cursor-pointer' : ''}`}
      style={getSectionStyle(index)}
    >
      {/* 1. Deep Background Layer */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-[150%] -top-[25%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${config.image})` }}
      />
      
      {/* 2. Middle Ground */}
      <div className={`absolute inset-0 bg-gradient-to-b ${
         isEven ? 'from-black/60 via-black/40 to-black/80' : 'from-black/70 via-black/30 to-black/90'
      }`} />
      <div className={`absolute inset-0 opacity-40 bg-gradient-to-tr ${config.color} mix-blend-overlay`} />

      {/* 3. Foreground Parallax Layer */}
      <div ref={fgRef} className="absolute inset-0 pointer-events-none opacity-40 will-change-transform">
         <div className="absolute top-1/4 left-10 w-32 h-32 text-white/10 animate-float">
            <Heart size={64} className="fill-current" />
         </div>
         <div className="absolute bottom-1/3 right-20 w-24 h-24 text-white/5" style={{ animation: 'float 8s infinite reverse' }}>
            <Stars size={80} className="fill-current" />
         </div>
      </div>

      {/* 4. Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* 5. Render Floating Emojis (Surprise) */}
      {floatingEmojis.map(k => <FloatingEmoji key={k.id} char={k.char} x={k.x} y={k.y} />)}

      {/* 6. Main Content Card */}
      <div className="relative z-20 container mx-auto px-6 flex justify-center perspective-1000">
        <div 
          ref={containerRef}
          onMouseEnter={handleCardHover}
          onClick={handleCardClick}
          className={`
            group relative w-full max-w-3xl backdrop-blur-md border p-8 md:p-16 rounded-3xl text-center transform transition-all duration-500 ease-out 
            ${isSqueezing ? 'scale-95 bg-white/20' : 'hover:scale-[1.02] hover:-translate-y-2'}
            ${isGlowing 
                ? 'bg-rose-900/40 border-yellow-400/50 shadow-[0_0_100px_rgba(255,215,0,0.6)] animate-pulse' 
                : 'bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl'
            }
          `}
          style={{ boxShadow: isGlowing ? '0 0 100px rgba(255,215,0,0.6)' : '0 30px 60px -12px rgba(0, 0, 0, 0.6)' }}
        >
          {/* Unlocked Message for Valentine Glow */}
          {showUnlockMessage && (
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-max bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-[0_0_30px_rgba(255,215,0,0.8)] animate-in slide-in-from-bottom-4 fade-in zoom-in duration-500 z-50 flex items-center gap-2">
              <Sparkles size={18} className="animate-spin-slow" />
              You unlocked a secret!
              <Sparkles size={18} className="animate-spin-slow" />
            </div>
          )}

          {/* Dynamic Glow */}
          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r ${config.accent} blur-[60px] -z-10`}></div>

          {/* Icon */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 group/hint relative z-30">
              <button 
                onClick={handleIconClick}
                onMouseEnter={handleIconHover}
                className={`
                  w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl ring-4 transition-all 
                  ${isGlowing ? 'ring-yellow-400 animate-pulse' : 'ring-white/20 group-hover:ring-white/40'}
                  cursor-pointer active:scale-95
                  ${isShaking ? 'animate-none translate-x-1' : 'animate-float'}
                `}
                style={isShaking ? { transform: 'translateX(-50%) rotate(10deg)' } : {}}
              >
                <IconComponent />
                {config.id === ValentineDay.VALENTINE && clickCount > 0 && clickCount < 5 && (
                  <span className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-bounce">
                    {5 - clickCount}
                  </span>
                )}
              </button>
              {iconHint && <HintTooltip text={iconHint} />}
          </div>

          {/* Text Container */}
          <div 
            ref={textRef}
            className="mt-8 space-y-6 relative z-20 min-h-[200px] flex flex-col justify-center will-change-transform origin-center"
          >
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.25em] uppercase text-white bg-gradient-to-r ${config.accent} shadow-lg self-center`}>
              {config.date}
            </span>
            
            <div className="group/hint relative inline-block">
                <h1 
                    onClick={handleTitleClick}
                    className={`font-serif text-5xl md:text-7xl lg:text-8xl text-white drop-shadow-2xl leading-tight min-h-[1.2em] transition-all duration-500 ${config.id === ValentineDay.PROPOSE || config.id === ValentineDay.VALENTINE ? 'cursor-pointer hover:text-amber-200' : ''}`}
                >
                  {titleText}
                  <span className="animate-pulse text-rose-400">|</span>
                </h1>
                {titleHint && <HintTooltip text={titleHint} position="bottom" />}
            </div>

            <div className={`w-24 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto my-8 transition-all duration-700 ${isGlowing ? 'w-full via-yellow-400/80' : 'group-hover:w-48'}`} />

            <div className="group/hint relative inline-block max-w-xl mx-auto">
                <p 
                  onClick={handleDescriptionClick}
                  className={`font-sans text-lg md:text-2xl text-white/90 leading-relaxed font-light drop-shadow-lg transition-all duration-1000 transform 
                    ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                    ${config.id === ValentineDay.PROMISE ? 'cursor-pointer hover:text-yellow-100' : ''}
                    ${isPromiseLocked ? 'text-yellow-300 font-medium' : ''}
                  `}
                  style={{ transitionDelay: '500ms' }}
                >
                  {isGlowing ? "You found the hidden glow of eternal love! ✨" : config.description} {isPromiseLocked && <Lock className="inline w-5 h-5 ml-2 animate-bounce" />}
                </p>
                {descHint && <HintTooltip text={descHint} position="bottom" />}
            </div>
          </div>

          <div className="mt-12 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
             {config.id === ValentineDay.VALENTINE ? (
               <p className="text-xs text-white uppercase tracking-widest flex items-center justify-center gap-2 font-bold animate-pulse">
                  <Stars size={12} />
                  {isGlowing ? "Secret Unlocked!" : (clickCount === 0 ? "Tap Heart... Hover Fast... Tap Title" : "Keep Tapping...")}
                  <Stars size={12} />
               </p>
             ) : config.id === ValentineDay.KISS ? (
                <p className="text-xs text-white uppercase tracking-widest flex items-center justify-center gap-2 font-bold animate-pulse">
                  <Stars size={12} /> Double-Click Background <Stars size={12} />
                </p>
             ) : config.id === ValentineDay.HUG ? (
                <p className="text-xs text-white uppercase tracking-widest flex items-center justify-center gap-2 font-bold animate-pulse">
                    <Stars size={12} /> Click Card to Hug <Stars size={12} />
                </p>
             ) : (
                <p className="text-xs text-white uppercase tracking-widest flex items-center justify-center gap-2 font-bold">
                  <Stars size={12} className="animate-spin-slow" />
                  Explore the Card
                  <Stars size={12} className="animate-spin-slow" />
                </p>
             )}
          </div>
        </div>
      </div>

      {/* Valentine Surprise Modal */}
      {showSurprise && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Massive confetti burst */}
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="absolute animate-confetti text-4xl" style={{ 
                   left: `${Math.random() * 100}%`, 
                   animationDuration: `${Math.random() * 3 + 2}s`,
                   animationDelay: `${Math.random() * 2}s`
                }}>
                  {['❤️', '💖', '🌹', '✨'][i % 4]}
                </div>
              ))}
           </div>
           
           <div className="relative z-10 max-w-2xl bg-white text-slate-900 p-12 rounded-[3rem] shadow-2xl transform hover:scale-105 transition-transform">
              <button 
                onClick={() => setShowSurprise(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={24} />
              </button>
              <Heart className="w-20 h-20 text-rose-500 mx-auto mb-6 animate-bounce fill-current" />
              <h2 className="text-5xl font-serif font-bold mb-6 text-rose-600">I Love You!</h2>
              <p className="text-xl text-slate-600 mb-8 font-light leading-relaxed">
                Every moment with you is a treasure. Thank you for making my life beautiful. Will you be my Valentine, today and forever?
              </p>
              <button 
                 onClick={() => { playSound('click'); setShowSurprise(false); }}
                 className="px-10 py-4 bg-rose-500 text-white rounded-full font-bold text-lg shadow-lg hover:bg-rose-600 hover:shadow-rose-500/50 transition-all"
              >
                Yes, Forever! 💖
              </button>
           </div>
        </div>
      )}
    </section>
  );
};