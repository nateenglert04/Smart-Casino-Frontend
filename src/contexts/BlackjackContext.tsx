import { createContext, useContext, useState, type ReactNode, useEffect, useCallback, useRef } from 'react';
import { blackjackService, mapCardData, type BlackjackGameResponse, type Probabilities, type BlackjackStats } from '../services/BlackjackService';
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
  activeHandIndex: number;
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
  stats: BlackjackStats | null;
  leaderboard: any[];
  startGame: (betAmount: number) => Promise<void>;
  hit: () => Promise<void>;
  stand: () => Promise<void>;
  doubleDown: () => Promise<void>;
  split: () => Promise<void>;
  resetGame: () => void;
  refreshStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  setBalance: (amount: number) => void;
}

const INITIAL_STATE: GameState = {
  gameId: null,
  status: 'betting',
  backendStatus: '',
  dealerHand: [],
  playerHand: [],
  splitHand: [],
  activeHandIndex: 0,
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
  const [stats, setStats] = useState<BlackjackStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const updateGameState = useCallback((response: BlackjackGameResponse) => {
    const isFinished = ['WON', 'LOST', 'PUSH', 'BLACKJACK'].includes(response.gameState);

    setGameState(prev => {
      const newBalance = response.newBalance ??
          response.remainingBalance ??
          response.userBalance ??
          prev.balance;

      return {
        ...prev,
        gameId: response.gameId,
        status: isFinished ? 'finished' : 'playing',
        backendStatus: response.gameState,
        dealerHand: (response.dealerHand || []).map(c => ({ ...mapCardData(c), isHidden: !c.faceUp })),
        dealerScore: response.dealerValue || 0,
        playerHand: (response.playerHand || []).map(c => mapCardData(c)),
        playerScore: response.playerValue || 0,
        splitHand: (response.splitHand || []).map(c => mapCardData(c)),
        splitScore: response.splitValue || 0,
        activeHandIndex: response.activeHandIndex ?? 0,
        balance: newBalance,
        currentBet: response.betAmount || prev.currentBet,
        message: response.message || null,
        feedback: response.feedback || null,
        probabilities: response.probabilities || null
      };
    });
  }, []);

  const setBalance = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, balance: amount }));
  }, []);

  const startGame = useCallback(async (betAmount: number) => {
    setIsProcessing(true);
    try {
      const response = await blackjackService.startGame(betAmount);
      updateGameState(response);
    } catch (error: unknown) {
      let msg = 'Failed to start game';
      if (error instanceof Error) msg = error.message;
      showNotification(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [updateGameState, showNotification]);

  const handleAction = useCallback(async (fn: (id: number) => Promise<BlackjackGameResponse>) => {
    const id = gameStateRef.current.gameId;
    if (!id) return;

    setIsProcessing(true);
    try {
      const response = await fn(id);
      updateGameState(response);
      if (response.gameState !== 'IN_PROGRESS') await refreshStats();
    } catch (error: unknown) {
      let msg = 'Action failed';
      if (error instanceof Error) msg = error.message;
      showNotification(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [updateGameState, showNotification]);

  const hit = () => handleAction(blackjackService.hit);
  const stand = () => handleAction(blackjackService.stand);
  const doubleDown = () => handleAction(blackjackService.doubleDown);
  const split = () => handleAction(blackjackService.split);

  const resetGame = () => setGameState(p => ({ ...INITIAL_STATE, balance: p.balance }));

  const refreshStats = async () => {
    const statsData = await blackjackService.getStats();
    setStats(statsData);

    // FIX: userBalance now typed on BlackjackStats
    if (statsData.userBalance !== undefined) {
      setBalance(statsData.userBalance);
    }
  };

  const refreshLeaderboard = async () => {
    const data = await blackjackService.getLeaderboard();
    setLeaderboard(data);
  };

  return (
      <BlackjackContext.Provider value={{
        gameState,
        isProcessing,
        notification,
        stats,
        leaderboard,
        startGame,
        hit,
        stand,
        doubleDown,
        split,
        resetGame,
        refreshStats,
        refreshLeaderboard,
        setBalance
      }}>
        {children}
      </BlackjackContext.Provider>
  );
}

export function useBlackjack() {
  const ctx = useContext(BlackjackContext);
  if (!ctx) throw new Error('useBlackjack must be used within provider');
  return ctx;
}