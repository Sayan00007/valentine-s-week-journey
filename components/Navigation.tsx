import React, { useState } from 'react';
import { ValentineDay } from '../types';
import { Menu, X, Heart, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';

interface NavigationProps {
  currentDay: ValentineDay | null;
  onNavigate: (day: ValentineDay) => void;
}

const days = [
  { id: ValentineDay.ROSE, label: 'Rose' },
  { id: ValentineDay.PROPOSE, label: 'Propose' },
  { id: ValentineDay.CHOCOLATE, label: 'Chocolate' },
  { id: ValentineDay.TEDDY, label: 'Teddy' },
  { id: ValentineDay.PROMISE, label: 'Promise' },
  { id: ValentineDay.HUG, label: 'Hug' },
  { id: ValentineDay.KISS, label: 'Kiss' },
  { id: ValentineDay.VALENTINE, label: 'Valentine' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentDay, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMuted, toggleMute, playSound } = useSound();

  // Calculate current day index for the counter
  const currentIndex = days.findIndex(d => d.id === currentDay);
  const displayIndex = currentIndex !== -1 ? currentIndex + 1 : 1;

  const handleNavClick = (dayId: ValentineDay) => {
    playSound('click');
    onNavigate(dayId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Sound Toggle (Top Left) */}
      <button
        onClick={toggleMute}
        className="fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-white hover:bg-white/20 transition-all"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Mobile Toggle */}
      <button 
        onClick={() => {
          playSound('click');
          setIsOpen(!isOpen);
        }}
        className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-white hover:bg-white/20 transition-all md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar / Topbar */}
      <nav className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-black/80 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-white/10
        md:translate-x-0 md:left-0 md:w-20 md:border-r md:border-white/10 md:border-l-0 md:bg-black/40
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full py-8 md:items-center">
          <div className="mb-8 px-6 md:px-0 mt-12 md:mt-0">
            <Heart className="w-8 h-8 text-rose-500 fill-current animate-pulse-slow" />
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-4 md:px-2 scrollbar-hide">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => handleNavClick(day.id)}
                onMouseEnter={() => playSound('hover')}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                  md:justify-center md:px-2 md:w-12 md:h-12 md:rounded-full
                  ${currentDay === day.id 
                    ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 scale-110' 
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'}
                `}
              >
                <span className="md:hidden">{day.label} Day</span>
                <span className={`hidden md:block text-xs font-bold leading-none ${currentDay === day.id ? 'block' : 'hidden group-hover:block'}`}>
                   {currentDay === day.id ? day.label[0] : day.label[0]}
                </span>
                 {/* Dot for non-active items on desktop */}
                <span className={`hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600 ${currentDay === day.id ? 'hidden' : 'group-hover:hidden'}`} />
              </button>
            ))}
          </div>

          {/* Day Counter */}
          <div className="mt-4 px-4 md:px-0 text-center">
             <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10">
               <span className="text-[10px] font-bold tracking-widest uppercase text-rose-400">
                 {displayIndex}/{days.length}
               </span>
             </div>
          </div>
        </div>
      </nav>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};