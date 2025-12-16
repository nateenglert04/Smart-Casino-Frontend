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

  // Helper to parse backend response into UI state
  const updateGameState = (response: BlackjackGameResponse) => {
    const isFinished = ['WON', 'LOST', 'PUSH', 'BLACKJACK'].includes(response.gameState);
    
    // Determine balance 
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
    } catch (error: any) {
      showNotification(error.response?.data?.error || "Failed to start game");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (actionFn: (id: number) => Promise<BlackjackGameResponse>) => {
    if (!gameState.gameId) return;
    setIsProcessing(true);
    try {
      const response = await actionFn(gameState.gameId);
      updateGameState(response);
    } catch (error: any) {
      showNotification(error.response?.data?.error || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const hit = () => handleAction(blackjackService.hit.bind(blackjackService));
  const stand = () => handleAction(blackjackService.stand.bind(blackjackService));
  const doubleDown = () => handleAction(blackjackService.doubleDown.bind(blackjackService));
  const split = () => handleAction(blackjackService.split.bind(blackjackService));

  const resetGame = () => {
    setGameState(prev => ({
      ...INITIAL_STATE,
      balance: prev.balance,
      status: 'betting'
    }));
  };

  const refreshStats = async () => {
    try {
      // Just fetching to update balance if needed, or active games
      const active = await blackjackService.getActiveGames();
      if (active.count > 0) {
        // Logic to resume could go here
        // For now, we just ensure balance is updated via stats check if needed
      }
      // Assuming you might add a getBalance endpoint or rely on stats
      const stats = await blackjackService.getStats();
      // If stats included balance, we'd update it here. 
      // For now we rely on game actions to return balance.
    } catch (err) {
      console.error(err);
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