import { cn } from '../lib/utils';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface PlayingCardProps {
  suit: Suit;
  rank: Rank;
  isHidden?: boolean;
  className?: string;
  onClick?: () => void;
}

const suitConfig = {
  hearts: { icon: Heart, color: "text-red-600", fill: "fill-red-600" },
  diamonds: { icon: Diamond, color: "text-red-600", fill: "fill-red-600" },
  clubs: { icon: Club, color: "text-slate-900", fill: "fill-slate-900" },
  spades: { icon: Spade, color: "text-slate-900", fill: "fill-slate-900" },
};

export const PlayingCard = ({ 
  suit, 
  rank, 
  isHidden = false, 
  className,
  onClick 
}: PlayingCardProps) => {
  const SuitIcon = suitConfig[suit].icon;
  const suitColor = suitConfig[suit].color;
  const suitFill = suitConfig[suit].fill;

  const CardBack = () => (
    <div className="w-full h-full bg-primary rounded-lg border-2 border-white/20 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      <div className="w-8 h-8 rounded-full border-2 border-primary-foreground/30 opacity-50" />
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px)' 
           }} 
      />
    </div>
  );

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative w-24 h-36 rounded-xl shadow-lg transition-transform hover:-translate-y-2 duration-300 select-none cursor-pointer perspective-1000",
        className
      )}
    >
      <div className={cn(
        "w-full h-full transition-all duration-500 transform-style-3d border border-border/20 rounded-xl",
        // If hidden, show the back. If not, show the white face.
        isHidden ? "bg-primary" : "bg-white"
      )}>
        
        {isHidden ? (
          <CardBack />
        ) : (
          /* Card Face */
          <div className="w-full h-full flex flex-col justify-between p-2 relative overflow-hidden">
            <div className="flex flex-col items-center gap-0.5 leading-none">
              <span className={cn("text-lg font-bold font-mono tracking-tighter", suitColor)}>
                {rank}
              </span>
              <SuitIcon className={cn("w-4 h-4", suitColor, suitFill)} />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {['J', 'Q', 'K'].includes(rank) ? (
                 <span className={cn("text-4xl font-serif font-black opacity-20 scale-150 transform rotate-12", suitColor)}>
                   {rank}
                 </span>
              ) : (
                <SuitIcon className={cn("w-16 h-16 opacity-10", suitColor, suitFill)} />
              )}
            </div>
            <div className="flex flex-col items-center gap-0.5 leading-none transform rotate-180">
              <span className={cn("text-lg font-bold font-mono tracking-tighter", suitColor)}>
                {rank}
              </span>
              <SuitIcon className={cn("w-4 h-4", suitColor, suitFill)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};