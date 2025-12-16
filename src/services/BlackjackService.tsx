import { SmartCasinoClient } from '../services/SmartCasinoClient';
import type { Suit, Rank } from '../components/PlayingCard';

export interface BackendCard {
  cardId: number;
  rank: string;
  suit: string;
  value: number;
  faceUp: boolean;
}

export interface Probabilities {
  bustIfHit: number;
  winChance: number;
  pushChance: number;
}

export interface BlackjackGameResponse {
  gameId: number;
  playerHand: BackendCard[];
  dealerHand: BackendCard[];
  playerValue: number;
  dealerValue?: number;
  gameState: 'IN_PROGRESS' | 'WON' | 'LOST' | 'PUSH' | 'BLACKJACK';
  betAmount: number;
  remainingBalance?: number;
  newBalance?: number;
  userBalance?: number;
  feedback: string;
  probabilities: Probabilities;
  message?: string;
  blackjack?: boolean;
  splitHand?: BackendCard[];
  splitValue?: number;
  activeHandIndex?: number;
}

export interface ActiveGamesResponse {
  activeGames: {
    gameId: number;
    betAmount: number;
    playerHand: BackendCard[];
    gameState: string;
  }[];
  count: number;
}

export interface BlackjackStats {
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  totalWinnings: number;
  bestStreak: number;
  recentGames: RecentGame[];
  totalGames: number;
  userBalance?: number;
}

export interface RecentGame {
  gameId: number;
  betAmount: number;
  result: string;
  playerHand: BackendCard[];
  dealerHand: BackendCard[];
}

export const mapCardData = (backendCard: BackendCard): { suit: Suit; rank: Rank } => {
  // Map Suit
  let suit: Suit = 'spades';
  const bSuit = backendCard.suit.toUpperCase();
  if (bSuit === 'HEARTS') suit = 'hearts';
  else if (bSuit === 'DIAMONDS') suit = 'diamonds';
  else if (bSuit === 'CLUBS') suit = 'clubs';

  // Map Rank
  let rank: Rank = 'A'; // Default
  const bRank = backendCard.rank.toUpperCase();

  if (['JACK', 'QUEEN', 'KING', 'ACE'].includes(bRank)) {
    rank = bRank === 'ACE' ? 'A' : bRank.charAt(0) as Rank;
  } else {
    const numMap: Record<string, Rank> = {
      'TWO': '2', 'THREE': '3', 'FOUR': '4', 'FIVE': '5',
      'SIX': '6', 'SEVEN': '7', 'EIGHT': '8', 'NINE': '9', 'TEN': '10'
    };
    rank = numMap[bRank] || (bRank as Rank);
  }

  return { suit, rank };
};

class BlackjackService {
  private api = SmartCasinoClient.getInstance().client;
  private baseUrl = '/api/blackjack';

  // Start a new game
  async startGame(betAmount: number): Promise<BlackjackGameResponse> {
    const response = await this.api.post<BlackjackGameResponse>(`${this.baseUrl}/start`, {
      betAmount
    });
    return response.data;
  }

  // Action: Hit
  async hit(gameId: number): Promise<BlackjackGameResponse> {
    const response = await this.api.post<BlackjackGameResponse>(`${this.baseUrl}/${gameId}/hit`);
    return response.data;
  }

  // Action: Stand
  async stand(gameId: number): Promise<BlackjackGameResponse> {
    const response = await this.api.post<BlackjackGameResponse>(`${this.baseUrl}/${gameId}/stand`);
    return response.data;
  }

  // Action: Double Down
  async doubleDown(gameId: number): Promise<BlackjackGameResponse> {
    const response = await this.api.post<BlackjackGameResponse>(`${this.baseUrl}/${gameId}/double`);
    return response.data;
  }

  // Action: Split
  async split(gameId: number): Promise<BlackjackGameResponse> {
    const response = await this.api.post<BlackjackGameResponse>(`${this.baseUrl}/${gameId}/split`);
    return response.data;
  }

  // Get active games to resume session
  async getActiveGames(): Promise<ActiveGamesResponse> {
    const response = await this.api.get<ActiveGamesResponse>(`${this.baseUrl}/active`);
    return response.data;
  }

  // Get User Stats
  async getStats(): Promise<BlackjackStats> {
    const response = await this.api.get<BlackjackStats>(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<any> {
    const response = await this.api.get(`${this.baseUrl}/leaderboard`, {
      params: { limit }
    });
    return response.data;
  }
}

export const blackjackService = new BlackjackService();