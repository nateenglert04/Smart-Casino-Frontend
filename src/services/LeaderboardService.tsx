import { SmartCasinoClient } from './SmartCasinoClient';

export interface LeaderboardEntry {
  userId: number;
  username: string;
  position: number;
  xp: number;
  level: number;
  rank: string;
  gamesPlayed: number;
  winRate: number;
  totalWinnings: number;
  balance: number;
  gameType: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
  limit: number;
  offset: number;
  sortBy: string;
  gameType: string;
}

export interface RankInfo {
  [key: string]: number; // e.g. "A": 10000
}

export interface UserRankResponse extends LeaderboardEntry {
  rankProgress: {
    currentRank: string;
    nextRank: string;
    xpToNextRank: number;
    progressPercentage: number;
  };
}

class LeaderboardService {
  private api = SmartCasinoClient.getInstance().client;
  private baseUrl = '/leaderboard';

  async getGlobalLeaderboard(limit: number = 20, offset: number = 0, sortBy: string = 'xp', gameType: string = 'global'): Promise<LeaderboardResponse> {
    const response = await this.api.get<LeaderboardResponse>(
      `${this.baseUrl}/global`, 
      { params: { limit, offset, sortBy, gameType } }
    );
    return response.data;
  }
  
  async getUserRankPosition(userId: number): Promise<UserRankResponse> {
    const response = await this.api.get<UserRankResponse>(
      `${this.baseUrl}/user/${userId}`
    );
    return response.data;
  }

  async getAllRanks(): Promise<RankInfo> {
    const response = await this.api.get<RankInfo>(
      `${this.baseUrl}/ranks`
    );
    return response.data;
  }

  async getPlayersByRank(rank: string): Promise<LeaderboardEntry[]> {
    const response = await this.api.get<{ players: LeaderboardEntry[] }>(
      `${this.baseUrl}/rank/${rank}`
    );
    return response.data.players;
  }
};

export const leaderboardService = new LeaderboardService();