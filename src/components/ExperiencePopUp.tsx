import { Trophy, Star, X } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';

export function ExperiencePopUp() {
  const { notification, clearNotification } = useGamification();

  if (!notification) return null;

  return (
    <div className="fixed bottom-8 left-8 z-[100] animate-in slide-in-from-left-10 fade-in duration-500">
      <div className={`
        relative overflow-hidden p-1 rounded-2xl shadow-2xl backdrop-blur-xl border
        ${notification.newRank ? 'bg-amber-500/20 border-amber-400/50' : 'bg-emerald-500/20 border-emerald-400/50'}
      `}>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
        
        <div className="bg-black/80 px-6 py-4 rounded-[calc(1rem-1px)] flex items-center gap-5">
          <div className={`
            p-3 rounded-xl
            ${notification.newRank ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}
          `}>
            {notification.newRank ? <Trophy className="w-6 h-6 text-black" /> : <Star className="w-6 h-6 text-white" />}
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg leading-tight">
              {notification.newRank ? 'RANK UP!' : 'XP GAINED'}
            </h4>
            <p className="text-muted-foreground text-sm font-medium">
              {notification.newRank 
                ? `You are now Rank ${notification.newRank}` 
                : `+${notification.xpGained} Experience earned`}
            </p>
          </div>

          <button 
            onClick={clearNotification}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>
    </div>
  );
}