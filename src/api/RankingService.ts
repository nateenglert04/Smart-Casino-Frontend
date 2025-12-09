// src/services/RankingService.ts
export interface RankProgress {
    currentRank: string;
    currentXp: number;
    nextRank: string;
    xpToNextRank: number;
    progressPercentage: number;
}

export class RankingService {
    // IMPORTANT: This MUST match your Java RankingService exactly!
    private static readonly RANK_THRESHOLDS = new Map<number, string>([
        [0, "2"],      // Starting rank
        [100, "3"],    // 100 XP
        [250, "4"],    // 250 XP
        [450, "5"],    // 450 XP
        [700, "6"],    // 700 XP
        [1000, "7"],   // 1000 XP
        [1400, "8"],   // 1400 XP
        [1900, "9"],   // 1900 XP
        [2500, "10"],  // 2500 XP
        [3500, "J"],   // Jack - 3500 XP
        [5000, "Q"],   // Queen - 5000 XP
        [7000, "K"],   // King - 7000 XP
        [10000, "A"],  // Ace - 10000 XP
    ]);

    /**
     * Calculate rank based on XP - must match Java version
     */
    static calculateRank(xp: number): string {
        let currentRank = "2"; // Default starting rank
        const sortedThresholds = Array.from(this.RANK_THRESHOLDS.entries())
            .sort((a, b) => a[0] - b[0]);

        for (const [thresholdXp, rank] of sortedThresholds) {
            if (xp >= thresholdXp) {
                currentRank = rank;
            } else {
                break;
            }
        }

        return currentRank;
    }

    /**
     * Get rank progress percentage - must match Java version
     */
    static getRankProgress(xp: number): RankProgress {
        const currentRank = this.calculateRank(xp);
        const sortedEntries = Array.from(this.RANK_THRESHOLDS.entries())
            .sort((a, b) => a[0] - b[0]);

        let currentThreshold = 0;
        let nextThreshold = 0;
        let nextRank = "A"; // Ace is the highest
        let foundCurrent = false;

        for (const [thresholdXp, rank] of sortedEntries) {
            if (rank === currentRank) {
                currentThreshold = thresholdXp;
                foundCurrent = true;
            } else if (foundCurrent) {
                nextThreshold = thresholdXp;
                nextRank = rank;
                break;
            }
        }

        // If at max rank (Ace)
        if (currentRank === "A") {
            nextThreshold = 15000; // Arbitrary next milestone
            nextRank = "A";
        }

        // Calculate progress
        const xpInCurrentRank = xp - currentThreshold;
        const xpNeededForNextRank = nextThreshold - currentThreshold;
        const progressPercentage = xpNeededForNextRank > 0
            ? (xpInCurrentRank / xpNeededForNextRank) * 100
            : 100;

        return {
            currentRank,
            currentXp: xp,
            nextRank,
            xpToNextRank: Math.max(0, nextThreshold - xp),
            progressPercentage: Math.min(100, Math.round(progressPercentage * 100) / 100), // Round to 2 decimals
        };
    }

    /**
     * Get all ranks with their XP requirements
     */
    static getAllRanks(): Map<string, number> {
        const ranks = new Map<string, number>();
        for (const [xp, rank] of this.RANK_THRESHOLDS.entries()) {
            ranks.set(rank, xp);
        }
        return ranks;
    }

    /**
     * Get level based on XP (every 100 XP = 1 level) - must match Java
     */
    static calculateLevel(xp: number): number {
        return Math.floor(xp / 100) + 1;
    }

    /**
     * Get XP needed for next level
     */
    static getXpForNextLevel(xp: number): { xpProgress: number; xpNeeded: number } {
        const currentLevel = this.calculateLevel(xp);
        const xpForCurrentLevel = (currentLevel - 1) * 100;
        const xpForNextLevel = currentLevel * 100;
        const xpProgress = xp - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xp;

        return { xpProgress, xpNeeded };
    }

    /**
     * Validate that frontend calculations match backend
     */
    static validateWithBackend(backendRank: string, backendLevel: number, xp: number): boolean {
        const frontendRank = this.calculateRank(xp);
        const frontendLevel = this.calculateLevel(xp);

        const isValid = frontendRank === backendRank && frontendLevel === backendLevel;

        if (!isValid) {
            console.warn(`Rank mismatch! Frontend: ${frontendRank} (Lvl ${frontendLevel}), Backend: ${backendRank} (Lvl ${backendLevel})`);
        }

        return isValid;
    }
}