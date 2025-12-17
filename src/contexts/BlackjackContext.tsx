import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { blackjackService, mapCardData, type BlackjackGameResponse, type Probabilities } from '../services/BlackjackService'; 
import { type Suit, type Rank } from '../components/PlayingCard';

export interface CardData {
  suit: Suit;
  rank: Rank;
  isHidden?: boolean;
}

interface GameState {
  gameId: number | null;
  status: 'betting' | 'playing' | 'finished';
  backendStatus: string;
  dealerHand: CardData[];
  playerHand: CardData[];
  splitHand: CardData[];
  activeHandIndex: number | null;

  playerScore: number;
  splitScore: number;
  dealerScore: number;
  
  balance: number;
  currentBet: number;
  message: string | null;
  feedback: string | null;
  probabilities: Probabilities | null;
}

interface BlackjackContextType {
  gameState: GameState;
  isProcessing: boolean;
  notification: string | null;
  startGame: (betAmount: number) => Promise<void>;
  hit: () => Promise<void>;
  stand: () => Promise<void>;
  doubleDown: () => Promise<void>;
  split: () => Promise<void>;
  resetGame: () => void;
  refreshStats: () => Promise<void>;
  setBalance: (amount: number) => void;
}

const INITIAL_STATE: GameState = {
  gameId: null,
  status: 'betting',
  backendStatus: '',
  dealerHand: [],
  playerHand: [],
  splitHand: [],
  activeHandIndex: null,
  playerScore: 0,
  splitScore: 0,
  dealerScore: 0,
  balance: 0,
  currentBet: 0,
  message: null,
  feedback: null,
  probabilities: null
};

const BlackjackContext = createContext<BlackjackContextType | undefined>(undefined);

export function BlackjackProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const updateGameState = (response: BlackjackGameResponse) => {
    const isFinished = ['WON', 'LOST', 'PUSH', 'BLACKJACK', 'PARTIAL_WIN'].includes(response.gameState);
    
    const newBalance = response.newBalance ?? response.remainingBalance ?? response.userBalance ?? gameState.balance;

    setGameState(prev => ({
      ...prev,
      gameId: response.gameId,
      status: isFinished ? 'finished' : 'playing',
      backendStatus: response.gameState,
      
      dealerHand: response.dealerHand.map(c => ({
        ...mapCardData(c),
        isHidden: !c.faceUp 
      })),
      dealerScore: response.dealerValue || 0,

      playerHand: response.playerHand.map(c => mapCardData(c)),
      playerScore: response.playerValue,
      
      splitHand: response.splitHand ? response.splitHand.map(c => mapCardData(c)) : [],
      splitScore: response.splitValue || 0,
      
      activeHandIndex: response.activeHandIndex ?? null,

      balance: newBalance,
      currentBet: response.betAmount,
      message: response.message || null,
      feedback: response.feedback,
      probabilities: response.probabilities
    }));
  };

  const setBalance = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, balance: amount }));
  }, []);

  const startGame = async (betAmount: number) => {
    setIsProcessing(true);
    try {
      const response = await blackjackService.startGame(betAmount);
      updateGameState(response);
      
      if (response.playerValue === 21 && response.gameState === 'IN_PROGRESS') {
        const standResponse = await blackjackService.stand(response.gameId);
        updateGameState(standResponse);
      }
    } catch (error: any) {
      showNotification(error.response?.data?.error || "Failed to start game");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (
    actionFn: (id: number) => Promise<BlackjackGameResponse>
  ): Promise<BlackjackGameResponse | null> => {
    if (!gameState.gameId) return null;
    setIsProcessing(true);
    try {
      const response = await actionFn(gameState.gameId);
      updateGameState(response);
      return response;
    } catch (error: any) {
      showNotification(error.response?.data?.error || "Action failed");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const hit = async () => {
    const response = await handleAction(blackjackService.hit.bind(blackjackService));
    
    if (response && response.playerValue === 21 && response.gameState === 'IN_PROGRESS') {
      try {
        const standResponse = await blackjackService.stand(response.gameId);
        updateGameState(standResponse);
      } catch (err) {
        console.error("Auto-stand failed", err);
      }
    }
  };

  const stand = async () => { await handleAction(blackjackService.stand.bind(blackjackService)); };
  const doubleDown = async () => { await handleAction(blackjackService.doubleDown.bind(blackjackService)); };
  const split = async () => { await handleAction(blackjackService.split.bind(blackjackService)); };

  const resetGame = () => {
    setGameState(prev => ({
      ...INITIAL_STATE,
      balance: prev.balance,
      status: 'betting'
    }));
  };

  const refreshStats = async () => {
    try {
      const active = await blackjackService.getActiveGames();
      if (active && active.count > 0 && active.activeGames.length > 0) {
        const mostRecentGame = active.activeGames[0];
        console.log("Resuming active game:", mostRecentGame.gameId);
        updateGameState(mostRecentGame);
        showNotification("Game Session Resumed");
      }
    } catch (err) {
      console.error("Failed to check active games:", err);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <BlackjackContext.Provider value={{
      gameState,
      isProcessing,
      notification,
      startGame,
      hit,
      stand,
      doubleDown,
      split,
      resetGame,
      refreshStats,
      setBalance
    }}>
      {children}
    </BlackjackContext.Provider>
  );
}

export function useBlackjack() {
  const context = useContext(BlackjackContext);
  if (context === undefined) {
    throw new Error('useBlackjack must be used within a BlackjackProvider');
  }
  return context;
}