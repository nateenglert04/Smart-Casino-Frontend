import { SmartCasinoClient } from './SmartCasinoClient';

export interface GamificationProfile {
  userId: number;
  totalXP: number;
  currentLevel: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  currentRank: string; // Ranks defined in backend
  xpToNextLevel: number;
  levelProgressPercent: number;
  winRate: number;
}

export const GamificationService = {
  
  getClient: () => SmartCasinoClient.getInstance().client,

  getPlayerProfile: async (userId: number) => {
    const response = await GamificationService.getClient().get<GamificationProfile>(
      `/gamification/profile/${userId}`
    );
    return response.data;
  },

  getRawProgress: async (userId: number) => {
    const response = await GamificationService.getClient().get(
      `/gamification/raw/${userId}`
    );
    return response.data;
  }
};