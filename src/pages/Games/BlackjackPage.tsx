import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, DollarSign, Shield, Layers, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PlayingCard, type Suit, type Rank } from '../../components/PlayingCard';

// --- Types (Match these to your Backend DTOs) ---
interface CardData {
  suit: Suit;
  rank: Rank;
}

interface GameState {
  gameId: string;
  status: 'betting' | 'playing' | 'dealer_turn' | 'finished';
  dealerHand: CardData[];
  playerHand: CardData[];
  playerScore: number;
  dealerScore: number; // Hidden from user if game is active
  balance: number;
  currentBet: number;
  message: string | null; // e.g., "Blackjack!", "Bust!"
}

/// Preview test Playing Card
const MOCK_INITIAL_STATE: GameState = {
  gameId: '123',
  status: 'playing',
  dealerHand: [
    { suit: 'spades', rank: 'A' }, 
    { suit: 'diamonds', rank: '6' }
  ],
  playerHand: [
    { suit: 'hearts', rank: '10' },
    { suit: 'clubs', rank: 'K' }
  ],
  playerScore: 20,
  dealerScore: 17,
  balance: 2500,
  currentBet: 100,
  message: null
};

export default function BlackjackGame() {
  const [gameState, setGameState] = useState<GameState>(MOCK_INITIAL_STATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);


  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (action: 'hit' | 'stand' | 'double' | 'split') => {
    setIsProcessing(true);
    console.log(`Sending action to backend: ${action}`);
    
    // Implement services
    setTimeout(() => {
      setIsProcessing(false);
    }, 600);
  };

  const handleSplitAttempt = () => {
    if (gameState.playerHand.length !== 2) {
      showNotification("You can only split on your first two cards.");
      return;
    }
    const card1 = gameState.playerHand[0].rank;
    const card2 = gameState.playerHand[1].rank;

    if (card1 !== card2) {
      showNotification(`Cannot split a ${card1} and a ${card2}. Ranks must match!`);
      return;
    }

    handleAction('split');
  };

  return (
    <div className="min-h-screen bg-felt-gradient flex flex-col font-sans text-foreground">
      
      <header className="px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">Blackjack</h1>
            <Badge variant="outline" className="text-xs border-primary/50 text-primary-foreground">
              Table #402
            </Badge>
          </div>
        </div>

        <div className="flex gap-6 text-sm font-mono text-white/90">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase">Balance</span>
            <span className="font-bold flex items-center text-green-400">
              <DollarSign className="w-4 h-4 mr-1" />
              {gameState.balance}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase">Current Bet</span>
            <span className="font-bold text-yellow-400">{gameState.currentBet}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center p-4 gap-8 overflow-hidden">
        
        {/* Dealer Section */}
        <div className="flex flex-col items-center gap-4 transition-all duration-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Dealer
            </span>
            {gameState.status === 'finished' && (
               <Badge className="ml-2 bg-white text-black">{gameState.dealerScore}</Badge>
            )}
          </div>

          <div className="flex justify-center -space-x-12 hover:space-x-4 transition-all duration-300">
            {gameState.dealerHand.map((card, idx) => (
              <div key={idx} className={idx > 0 ? "relative z-10" : "z-0"}>
                 {/* Logic: If game is playing, hide the first card (hole card) */}
                <PlayingCard 
                  suit={card.suit} 
                  rank={card.rank} 
                  isHidden={gameState.status === 'playing' && idx === 0}
                  className="shadow-2xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Info / Result Message */}
        <div className="h-16 flex items-center justify-center">
          {gameState.message && (
             <div className="bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/20 animate-in fade-in zoom-in duration-300">
                <span className="text-xl font-bold text-white tracking-widest uppercase">
                  {gameState.message}
                </span>
             </div>
          )}
        </div>

        {/* Player Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center -space-x-12 hover:space-x-4 transition-all duration-300">
            {gameState.playerHand.map((card, idx) => (
              <div key={idx} className="relative transition-transform hover:-translate-y-4">
                <PlayingCard suit={card.suit} rank={card.rank} className="shadow-2xl" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
             <div className={`
               px-4 py-1 rounded-full font-bold text-sm border
               ${gameState.playerScore > 21 
                  ? 'bg-destructive/20 border-destructive text-destructive-foreground' 
                  : 'bg-primary/20 border-primary text-primary-foreground'}
             `}>
               Score: {gameState.playerScore}
             </div>
          </div>
        </div>
      </main>

      <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10 p-6 pb-8">
        <div className="max-w-3xl mx-auto w-full">
            
          {gameState.status === 'finished' ? (
             <div className="flex justify-center">
                <Button size="lg" className="w-full max-w-xs text-lg font-bold gap-2">
                   <RefreshCw className="w-5 h-5" /> New Deal
                </Button>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <Button 
                onClick={() => handleAction('hit')}
                disabled={isProcessing}
                className="h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95"
              >
                HIT
              </Button>

              <Button 
                onClick={() => handleAction('stand')}
                disabled={isProcessing}
                variant="destructive"
                className="h-14 font-bold text-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-95"
              >
                STAND
              </Button>

              <Button 
                onClick={() => handleAction('double')}
                disabled={isProcessing || gameState.playerHand.length > 2} // Double usually only allowed on first 2 cards
                variant="secondary"
                className="h-14 font-bold text-lg bg-yellow-600 hover:bg-yellow-500 text-white gap-2 border-none shadow-[0_0_20px_rgba(234,179,8,0.2)]"
              >
                <DollarSign className="w-5 h-5" /> DOUBLE
              </Button>

              <div className="relative w-full">
                <div className={`
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50
                  w-max max-w-[250px]
                  transition-all duration-200 ease-out
                  ${notification 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}
                `}>
                  <div className="bg-destructive text-destructive-foreground text-xs font-bold px-4 py-2 rounded-lg shadow-xl border border-red-400/50 flex flex-col items-center text-center after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-destructive">
                    <span className="uppercase tracking-wider mb-0.5">Invalid Move</span>
                    <span className="font-normal opacity-90">{notification}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSplitAttempt}
                  disabled={isProcessing} 
                  variant="outline"
                  className="w-full h-14 font-bold text-lg border-2 bg-transparent text-white hover:bg-white/10 hover:text-white gap-2 transition-colors"
                >
                  <Layers className="w-5 h-5" /> SPLIT
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
             <p className="text-xs text-muted-foreground">
               Dealer stands on 17. Blackjack pays 3:2.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}