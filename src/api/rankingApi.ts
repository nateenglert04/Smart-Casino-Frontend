// src/api/rankingApi.ts (updated)
import { UserRanking, LeaderboardEntry } from '../types';

// Define a proper type for XP breakdown instead of using 'any'
export interface XpBreakdown {
    totalXP: number;
    gamesXP: number;
    lessonsXP: number;
    challengesXP: number;
    dailyStreakXP: number;
    // Add other properties as needed based on your API response
    [key: string]: number; // Optional: if you want to allow additional properties
}

export const rankingApi = {
    /**
     * Get user's ranking information
     */
    async getUserRanking(userId: number): Promise<UserRanking> {
        try {
            const response = await fetch(`/api/leaderboard/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch ranking');
            const data = await response.json();

            return {
                rank: data.rank || "2",
                level: data.level || 1,
                xp: data.xp || 0,
                rankProgress: data.rankProgress || {
                    currentRank: "2",
                    currentXp: 0,
                    nextRank: "3",
                    xpToNextRank: 100,
                    progressPercentage: 0
                },
                gamesPlayed: data.gamesPlayed || 0,
                winRate: data.winRate || 0,
                lessonsCompleted: data.lessonsCompleted || 0,
            };
        } catch (error) {
            console.error('Error fetching user ranking:', error);
            throw error;
        }
    },

    /**
     * Get global leaderboard
     */
    async getGlobalLeaderboard(limit = 10, offset = 0): Promise<LeaderboardEntry[]> {
        try {
            const response = await fetch(`/api/leaderboard/global?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            const data = await response.json();
            return data.leaderboard || [];
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    },

    /**
     * Get all available ranks
     */
    async getAllRanks(): Promise<Map<string, number>> {
        try {
            const response = await fetch('/api/leaderboard/ranks', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch ranks');
            const data = await response.json();
            return new Map(Object.entries(data));
        } catch (error) {
            console.error('Error fetching ranks:', error);
            throw error;
        }
    },

    /**
     * Get top players
     */
    async getTopPlayers(count: number): Promise<LeaderboardEntry[]> {
        try {
            const response = await fetch(`/api/leaderboard/top/${count}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch top players');
            return await response.json();
        } catch (error) {
            console.error('Error fetching top players:', error);
            throw error;
        }
    },

    /**
     * Get players by specific rank
     */
    async getPlayersByRank(rank: string): Promise<LeaderboardEntry[]> {
        try {
            const response = await fetch(`/api/leaderboard/rank/${rank}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch players by rank');
            const data = await response.json();
            return data.players || [];
        } catch (error) {
            console.error('Error fetching players by rank:', error);
            throw error;
        }
    },

    /**
     * Get XP breakdown for user
     */
    async getXPBreakdown(userId: number): Promise<XpBreakdown> {
        try {
            const response = await fetch(`/api/xp/breakdown/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch XP breakdown');
            return await response.json();
        } catch (error) {
            console.error('Error fetching XP breakdown:', error);
            throw error;
        }
    }
};