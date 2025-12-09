// src/hooks/useRanking.ts - Using TypeScript RankingService
import { useState, useEffect, useCallback } from 'react';
import { rankingApi } from '../api/rankingApi';
import { RankingService } from '../api/RankingService'; // TypeScript version
import { UserRanking, LeaderboardEntry } from '../types';

// Define types for the XP update response if needed
interface XpUpdateResponse {
    success: boolean;
    newXp: number;
    message?: string;
}

export const useRanking = (userId?: number) => {
    const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);

    // Check online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Set initial online status
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const fetchUserRanking = useCallback(async (id?: number) => {
        const targetUserId = id || userId;
        if (!targetUserId) {
            setError('No user ID provided');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Always calculate locally first for immediate feedback
        const storedXp = parseInt(localStorage.getItem(`user_${targetUserId}_xp`) || '0', 10);
        const storedGames = parseInt(localStorage.getItem(`user_${targetUserId}_games`) || '0', 10);
        const storedWinRate = parseFloat(localStorage.getItem(`user_${targetUserId}_winrate`) || '0');
        const storedLessons = parseInt(localStorage.getItem(`user_${targetUserId}_lessons`) || '0', 10);

        const localRanking = RankingService.calculateRank(storedXp);
        const localLevel = RankingService.calculateLevel(storedXp);

        // Set temporary local ranking
        const tempRanking: UserRanking = {
            rank: localRanking,
            level: localLevel,
            xp: storedXp,
            rankProgress: RankingService.getRankProgress(storedXp),
            gamesPlayed: storedGames,
            winRate: storedWinRate,
            lessonsCompleted: storedLessons,
        };

        setUserRanking(tempRanking);

        // Try to sync with backend if online
        if (isOnline) {
            try {
                const backendRanking = await rankingApi.getUserRanking(targetUserId);
                setUserRanking(backendRanking);

                // Validate consistency
                RankingService.validateWithBackend(
                    backendRanking.rank,
                    backendRanking.level,
                    backendRanking.xp
                );

                // Sync local storage with backend data
                localStorage.setItem(`user_${targetUserId}_xp`, backendRanking.xp.toString());
                localStorage.setItem(`user_${targetUserId}_games`, backendRanking.gamesPlayed.toString());
                localStorage.setItem(`user_${targetUserId}_winrate`, backendRanking.winRate.toString());
                localStorage.setItem(`user_${targetUserId}_lessons`, backendRanking.lessonsCompleted.toString());
            } catch (err) {
                console.warn('Backend sync failed, using local data:', err);
                // Keep using local data
                setError('Backend sync failed, using local data');
            }
        }

        setIsLoading(false);
    }, [isOnline, userId]);

    const fetchLeaderboard = useCallback(async (limit = 10, offset = 0) => {
        setIsLoading(true);
        setError(null);

        if (isOnline) {
            try {
                const leaderboardData = await rankingApi.getGlobalLeaderboard(limit, offset);
                setLeaderboard(leaderboardData);
            } catch (err) {
                console.error('Backend leaderboard error:', err);
                setError('Using cached leaderboard');
                // Could load from localStorage cache here
            }
        } else {
            setError('Offline - leaderboard unavailable');
            setLeaderboard([]);
        }

        setIsLoading(false);
    }, [isOnline]);

    // Update user XP locally and optionally sync with backend
    const updateUserXp = useCallback(async (
        newXp: number,
        targetUserId?: number,
        syncWithBackend = true
    ): Promise<void> => {
        const id = targetUserId || userId;
        if (!id) {
            console.error('No user ID provided for XP update');
            return;
        }

        // Update local storage immediately
        localStorage.setItem(`user_${id}_xp`, newXp.toString());

        // Calculate new ranking locally
        const storedGames = parseInt(localStorage.getItem(`user_${id}_games`) || '0', 10);
        const storedWinRate = parseFloat(localStorage.getItem(`user_${id}_winrate`) || '0');
        const storedLessons = parseInt(localStorage.getItem(`user_${id}_lessons`) || '0', 10);

        const ranking: UserRanking = {
            rank: RankingService.calculateRank(newXp),
            level: RankingService.calculateLevel(newXp),
            xp: newXp,
            rankProgress: RankingService.getRankProgress(newXp),
            gamesPlayed: storedGames,
            winRate: storedWinRate,
            lessonsCompleted: storedLessons,
        };

        setUserRanking(ranking);

        // Sync with backend if online and requested
        if (isOnline && syncWithBackend) {
            try {
                const response = await fetch('/api/user/xp/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ userId: id, xp: newXp }),
                });

                if (!response.ok) {
                    throw new Error('Failed to sync XP with backend');
                }

                const data: XpUpdateResponse = await response.json();
                if (!data.success) {
                    console.warn('Backend XP update returned unsuccessful:', data.message);
                }
            } catch (err) {
                console.warn('Failed to sync XP with backend:', err);
                // You might want to queue this update for later retry
                // or notify the user about sync failure
            }
        }
    }, [isOnline, userId]);

    // Fetch user ranking on mount if userId is provided
    useEffect(() => {
        if (userId) {
            fetchUserRanking();
        }
    }, [userId, fetchUserRanking]);

    // Other methods could be added here (like updateGamesPlayed, updateWinRate, etc.)

    return {
        userRanking,
        leaderboard,
        isLoading,
        error,
        isOnline,
        fetchUserRanking,
        fetchLeaderboard,
        updateUserXp,
        // Add this for local calculations:
        calculateRank: RankingService.calculateRank,
        calculateLevel: RankingService.calculateLevel,
        getRankProgress: RankingService.getRankProgress,
    };
};