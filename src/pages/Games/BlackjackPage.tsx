import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, DollarSign, Shield, Layers, BrainCircuit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PlayingCard } from '../../components/PlayingCard';
import { useBlackjack, BlackjackProvider } from '../../contexts/BlackjackContext';
import { useAuth } from '../../contexts/AuthContext';

export default function BlackjackPage() {
  return (
    <BlackjackProvider>
      <BlackjackGameContent />
    </BlackjackProvider>
  );
}

function BlackjackGameContent() {
  const { 
    gameState, isProcessing, notification, startGame, hit, stand, doubleDown, split, resetGame, setBalance 
  } = useBlackjack();

  const { user, login, token } = useAuth();
  const [betInput, setBetInput] = useState<number>(50);

  useEffect(() => {
    if (user && user.balance !== undefined && gameState.balance === 0) {
      setBalance(user.balance);
    }
  }, [user, gameState.balance, setBalance]);

  useEffect(() => {
    if (token && user && gameState.balance !== user.balance) {
      if (gameState.balance !== 0) {
        login(token, { ...user, balance: gameState.balance });
      }
    }
  }, [gameState.balance, token, user, login]);

  const renderBettingPhase = () => (
    <div className="flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in duration-300 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-wider">Place Your Bets</h2>
        <p className="text-muted-foreground">Minimum bet $10. Blackjack pays 3:2.</p>
      </div>

      <div className="bg-black/30 p-8 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col gap-6 w-full max-w-md">
        <div className="flex items-center justify-between text-white text-lg">
          <span>Available:</span>
          <span className="font-mono text-green-400 flex items-center">
            {(gameState.balance ?? 0).toLocaleString()} Credits
          </span>
        </div>

        <div className="flex gap-4 justify-center">
          {[10, 50, 100, 500].map(amt => (
            <Button
              key={amt}
              variant="outline"
              onClick={() => setBetInput(amt)}
              className={`rounded-full w-16 h-16 border-2 font-bold text-lg transition-all ${betInput === amt ? 'bg-primary text-white border-primary ring-2 ring-offset-2 ring-offset-black ring-primary' : 'bg-transparent text-white border-white/20 hover:bg-white/10'}`}
            >
              {amt}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-white/5">
           <span className="text-white font-bold">$</span>
           <input 
             type="number"
             value={betInput}
             onChange={(e) => setBetInput(Number(e.target.value))}
             className="bg-transparent text-white text-xl font-mono w-full outline-none"
             min="1"
             max={gameState.balance}
           />
        </div>

        <Button 
          size="lg" 
          onClick={() => betInput > 0 && startGame(betInput)}
          disabled={isProcessing || betInput > gameState.balance}
          className="w-full text-lg font-bold h-12 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          {isProcessing ? "Dealing..." : "DEAL CARDS"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-felt-gradient flex flex-col font-sans text-foreground">
      
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link to="/games">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">Blackjack</h1>
          </div>
        </div>

        <div className="flex gap-6 text-sm font-mono text-white/90">
          {gameState.status !== 'betting' && (
            <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-4">
              <span className="text-xs text-muted-foreground uppercase">Current Bet</span>
              <span className="font-bold text-yellow-400 text-lg">{gameState.currentBet.toLocaleString()} Credits</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4 gap-8 overflow-hidden">
        
        {gameState.status === 'betting' ? (
          renderBettingPhase()
        ) : (
          <>
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
                    <PlayingCard 
                      suit={card.suit} 
                      rank={card.rank} 
                      isHidden={card.isHidden}
                      className="shadow-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Info / Result / AI Message */}
            <div className="h-24 flex flex-col items-center justify-center gap-2">
              {gameState.message && (
                 <div className={`
                    px-8 py-3 rounded-full border backdrop-blur-md animate-in fade-in zoom-in duration-300
                    ${gameState.backendStatus === 'WON' || gameState.backendStatus === 'BLACKJACK' 
                      ? 'bg-green-500/20 border-green-500 text-green-200' 
                      : gameState.backendStatus === 'LOST' 
                        ? 'bg-red-500/20 border-red-500 text-red-200' 
                        : 'bg-black/60 border-white/20 text-white'}
                 `}>
                    <span className="text-xl font-bold tracking-widest uppercase shadow-black drop-shadow-md">
                      {gameState.message}
                    </span>
                 </div>
              )}
              
              {/* AI Probability Insight */}
              {gameState.status === 'playing' && gameState.probabilities && (
                <div className="flex gap-4 text-xs font-mono text-muted-foreground/80 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <BrainCircuit className="w-3 h-3 text-cyan-400" />
                    <span>AI Insights:</span>
                  </div>
                  <span className={(gameState.probabilities.bustIfHit ?? 0) > 50 ? "text-red-400" : "text-green-400"}>
                    Bust Risk: {(gameState.probabilities.bustIfHit ?? 0).toFixed(1)}%
                  </span>
                  <span className="text-white/60">|</span>
                  <span>Win Chance: {(gameState.probabilities.winChance ?? 0).toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* Player Section - Handles Split vs Single Hand */}
            <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
              
              {gameState.splitHand.length > 0 ? (
                /* --- SPLIT VIEW --- */
                <div className="flex justify-center gap-12 w-full">
                  <div className={`flex flex-col items-center transition-opacity duration-300 ${gameState.activeHandIndex === 1 ? 'opacity-40 scale-95' : 'opacity-100 scale-105'}`}>
                    <span className="text-xs uppercase tracking-widest text-white/50 mb-2">Hand 1</span>
                    <div className="flex justify-center -space-x-12">
                      {gameState.playerHand.map((card, idx) => (
                        <div key={idx} className="relative">
                          <PlayingCard suit={card.suit} rank={card.rank} className="shadow-2xl" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 px-4 py-1 rounded-full font-bold text-sm bg-primary/20 border border-primary text-primary-foreground">
                       Score: {gameState.playerScore}
                    </div>
                  </div>

                  <div className={`flex flex-col items-center transition-opacity duration-300 ${gameState.activeHandIndex === 0 ? 'opacity-40 scale-95' : 'opacity-100 scale-105'}`}>
                    <span className="text-xs uppercase tracking-widest text-white/50 mb-2">Hand 2</span>
                    <div className="flex justify-center -space-x-12">
                      {gameState.splitHand.map((card, idx) => (
                        <div key={idx} className="relative">
                          <PlayingCard suit={card.suit} rank={card.rank} className="shadow-2xl" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 px-4 py-1 rounded-full font-bold text-sm bg-primary/20 border border-primary text-primary-foreground">
                       Score: {gameState.splitScore}
                    </div>
                  </div>
                </div>
              ) : (
                /* --- SINGLE HAND VIEW --- */
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
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer / Controls */}
      {gameState.status !== 'betting' && (
        <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10 p-6 pb-8">
          <div className="max-w-3xl mx-auto w-full">
            
            {gameState.status === 'finished' ? (
              <div className="flex justify-center">
                 <Button 
                   size="lg" 
                   onClick={resetGame}
                   className="w-full max-w-xs text-lg font-bold gap-2 bg-white text-black hover:bg-white/90"
                 >
                    <RefreshCw className="w-5 h-5" /> New Deal
                 </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <Button 
                  onClick={hit}
                  disabled={isProcessing}
                  className="h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95"
                >
                  HIT
                </Button>

                <Button 
                  onClick={stand}
                  disabled={isProcessing}
                  variant="destructive"
                  className="h-14 font-bold text-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-95"
                >
                  STAND
                </Button>

                <Button 
                  onClick={doubleDown}
                  disabled={isProcessing || gameState.playerHand.length > 2 || gameState.splitHand.length > 0}
                  variant="secondary"
                  className="h-14 font-bold text-lg bg-yellow-600 hover:bg-yellow-500 text-white gap-2 border-none shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                >
                  <DollarSign className="w-5 h-5" /> DOUBLE
                </Button>

                <div className="relative w-full">
                  {/* Notification Popup for Errors */}
                  <div className={`
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50
                    w-max max-w-[250px]
                    transition-all duration-200 ease-out
                    ${notification 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}
                  `}>
                    <div className="bg-destructive text-destructive-foreground text-xs font-bold px-4 py-2 rounded-lg shadow-xl border border-red-400/50 flex flex-col items-center text-center">
                      <span className="uppercase tracking-wider mb-0.5">Alert</span>
                      <span className="font-normal opacity-90">{notification}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={split}
                    disabled={
                      isProcessing || 
                      gameState.playerHand.length !== 2 || 
                      gameState.playerHand[0].rank !== gameState.playerHand[1].rank ||
                      gameState.splitHand.length > 0
                    } 
                    variant="outline"
                    className="w-full h-14 font-bold text-lg border-2 bg-transparent text-white hover:bg-white/10 hover:text-white gap-2 transition-colors disabled:opacity-50"
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
      )}
    </div>
  );
}