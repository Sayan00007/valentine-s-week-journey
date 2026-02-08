import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { DayPage } from './components/DayPage';
import { DayConfig, ValentineDay } from './types';
import { SoundProvider, useSound } from './context/SoundContext';
import { Heart, Loader2 } from 'lucide-react';

// Data Configuration
const daysConfig: DayConfig[] = [
  {
    id: ValentineDay.ROSE,
    title: "Rose Day",
    date: "February 7",
    description: "Begin the week of love by expressing your feelings with a beautiful rose. A red rose for love, yellow for friendship, and pink for affection.",
    color: "from-rose-50 via-rose-100 to-white",
    accent: "from-rose-500 to-red-600",
    icon: "flower",
    image: "https://images.unsplash.com/photo-1563241527-96c21c3230a3?q=80&w=2600&auto=format&fit=crop", // Dark moody rose
  },
  {
    id: ValentineDay.PROPOSE,
    title: "Propose Day",
    date: "February 8",
    description: "The perfect day to confess your feelings. Whether it's a ring or just heartfelt words, make a promise of a lifetime today.",
    color: "from-orange-50 via-amber-50 to-white",
    accent: "from-amber-500 to-orange-600",
    icon: "ring",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop", // Wedding ring, sparkle
  },
  {
    id: ValentineDay.CHOCOLATE,
    title: "Chocolate Day",
    date: "February 9",
    description: "Sweeten the bond with chocolates. Because nothing says 'I love you' quite like sharing a sweet treat with your favorite person.",
    color: "from-stone-100 via-orange-50 to-white",
    accent: "from-yellow-800 to-yellow-900",
    icon: "candy",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=2670&auto=format&fit=crop", // Dark chocolate art
  },
  {
    id: ValentineDay.TEDDY,
    title: "Teddy Day",
    date: "February 10",
    description: "Gifting a soft teddy bear brings back childhood comfort and represents the warm, cozy feelings of love and care.",
    color: "from-fuchsia-50 via-pink-50 to-white",
    accent: "from-pink-500 to-fuchsia-600",
    icon: "bear",
    image: "https://images.unsplash.com/photo-1582236314812-70b1464c23db?q=80&w=2670&auto=format&fit=crop", // Cute teddy
  },
  {
    id: ValentineDay.PROMISE,
    title: "Promise Day",
    date: "February 11",
    description: "Love is about commitment. Make a promise to stay together through thick and thin, and to cherish every moment.",
    color: "from-blue-50 via-indigo-50 to-white",
    accent: "from-blue-500 to-indigo-600",
    icon: "scroll",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2670&auto=format&fit=crop", // Abstract pinky promise/hands or hearts. Using hearts for promise.
  },
  {
    id: ValentineDay.HUG,
    title: "Hug Day",
    date: "February 12",
    description: "A warm hug can speak a thousand words. It reassures your partner that you are always there for them, no matter what.",
    color: "from-teal-50 via-emerald-50 to-white",
    accent: "from-teal-500 to-emerald-600",
    icon: "users",
    image: "https://images.unsplash.com/photo-1517677208171-0bc5e5294a27?q=80&w=2600&auto=format&fit=crop", // Embrace
  },
  {
    id: ValentineDay.KISS,
    title: "Kiss Day",
    date: "February 13",
    description: "Seal your promise with a kiss. An expression of love that transcends words and connects souls.",
    color: "from-red-50 via-rose-100 to-white",
    accent: "from-red-500 to-rose-700",
    icon: "heart",
    image: "https://images.unsplash.com/photo-1522609925277-6642b06004b5?q=80&w=2670&auto=format&fit=crop", // Silhouette kiss
  },
  {
    id: ValentineDay.VALENTINE,
    title: "Valentine's Day",
    date: "February 14",
    description: "The grand finale. A day to celebrate love in all its forms. Cherish your partner and create memories that last forever.",
    color: "from-rose-100 via-pink-100 to-white",
    accent: "from-rose-600 to-pink-600",
    icon: "heart-filled",
    image: "https://6988d2b0df99ed1d08abdb6c.imgix.net/img.jpeg", // Red Hearts
  },
];

const TransitionOverlay = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-rose-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="relative">
        <Heart className="w-16 h-16 text-rose-500 fill-current animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
      <p className="mt-4 font-serif text-rose-800 text-lg animate-pulse">Traveling to your moment...</p>
    </div>
  );
};

const MainContent = () => {
  const [activeDay, setActiveDay] = useState<ValentineDay>(ValentineDay.ROSE);
  const [isNavigating, setIsNavigating] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isNavigating) {
            setActiveDay(entry.target.id as ValentineDay);
          }
        });
      },
      { 
        threshold: 0.5,
        rootMargin: "-10% 0px -10% 0px" 
      }
    );

    daysConfig.forEach((day) => {
      const el = document.getElementById(day.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isNavigating]);

  const handleNavigate = (day: ValentineDay) => {
    setIsNavigating(true);
    playSound('whoosh'); // Sound effect for parallax scrolling journey start
    
    // Show overlay briefly to simulate transition and load feeling
    setTimeout(() => {
      const el = document.getElementById(day);
      if (el) {
        el.scrollIntoView({ behavior: 'auto' }); // Instant jump behind the curtain
        setActiveDay(day);
        // Add a small delay before lifting curtain
        setTimeout(() => {
          setIsNavigating(false);
        }, 600);
      } else {
        setIsNavigating(false);
      }
    }, 400); // Wait for fade in
  };

  return (
    <div className="relative w-full bg-slate-900">
      <TransitionOverlay isVisible={isNavigating} />
      
      <Navigation 
        currentDay={activeDay} 
        onNavigate={handleNavigate} 
      />

      <main className="relative">
        {daysConfig.map((day, index) => (
          <DayPage 
            key={day.id} 
            config={day} 
            index={index}
            total={daysConfig.length}
            isActive={activeDay === day.id}
          />
        ))}
      </main>
      
      {/* Footer / End of Journey */}
      <div className="h-[50vh] flex items-center justify-center bg-black text-white relative z-50">
        <div className="text-center">
          <h2 className="text-4xl font-serif mb-4">Forever & Always</h2>
          <p className="text-slate-400">Our love story continues...</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <SoundProvider>
        <MainContent />
      </SoundProvider>
    </Router>
  );
};

export default App;