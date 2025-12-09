// types.ts
export interface Card {
    suit: 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
    rank: string;
    value?: number;
    faceUp: boolean;
}

export interface User {
    id: number;  // Changed from string to number to match backend
    username: string;
    balance?: number;
    token?: string;
    email?: string;
    name?: string;
    role?: string;  // Added role
    active?: boolean;  // Added active status
    qrSecret?: string;  // Added QR secret for user
}


export interface Probabilities {
    bustIfHit: number;
    winChance: number;
    pushChance: number;
}

export interface BlackjackStats {
    gamesPlayed: number;
    gamesWon: number;
    winPercentage: number;
    totalWinnings: number;
    bestStreak: number;
}

export type BlackjackResult = "WON" | "LOST" | "PUSH";

export interface BlackjackApiResponse {
    gameId?: number;
    playerHand?: Card[];
    dealerHand?: Card[];
    playerValue?: number;
    dealerValue?: number;
    dealerUpCardValue?: number;
    gameState?: GameState;
    result?: BlackjackResult;
    winnings?: number;
    newBalance?: number;
    remainingBalance?: number;
    feedback?: string;
    probabilities?: Probabilities;
    xpAwarded?: number;
}

export interface BlackjackGameState {
    playerHand: Card[];
    dealerHand: Card[];
    gameState: GameState;
    playerValue: number;
    dealerValue: number;
    betAmount: number;
    balance: number;
}

// Add these to your existing types in types.ts
export interface RegisterResponse {
    message: string;
    user?: User;
    token?: string;
    qrLogin?: {
        qrCode: string;
        token: string;
        qrContent: string;
        downloadUrl: string;
    };
}

export interface RegisterWithQRResponse {
    user: User;
    token: string;
    qrData?: {
        qrCode: string;
        token: string;
        qrContent: string;
        downloadUrl: string;
    };
    message?: string;
}
export interface QRData {
    qrCode: string;
    token: string;
    qrContent: string;
    downloadUrl: string;
}


export interface Theme {
    bgDark: string;
    panelBg: string;
    cardBg?: string;
    textColor: string;
    accent: string;
    positive: string;
    negative: string;
    muted: string;
}

export type GameState = 'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'GAME_OVER';
export type PokerState = 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN' | 'FOLDED';

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string;
    xpReward: number;
    difficulty: number;
    gameType: 'BLACKJACK' | 'POKER' | 'GENERAL';
    completed: boolean;
}

export interface UserProgress {
    level: number;
    xp: number;
    lessonsCompleted: number;
}

export interface PokerHand {
    handRank: string;
    description: string;
    rankValue: number;
    cards: Card[];
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    enableQR?: boolean;
    email?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}

export interface RegisterResponse {
    message: string;
    user?: User;
    token?: string;
}

export interface ApiError {
    error: string;
    message?: string;
    statusCode?: number;
}

// QR Code Login Types
export interface QRLoginCredentials {
    token: string;
}

export interface QRCodeResponse {
    qrCode: string;
    token: string;
    qrContent: string;
    downloadUrl: string;
    message: string;
}

export interface QrLoginToken {
    id: number;
    token: string;
    generatedAt: Date;
    expiresAt: Date;
    used: boolean;
    usedAt?: Date;
    user: User;
}

// Additional types that might be needed
export interface PokerEvaluation {
    handName: string;
    handValue: number;
    cards: Card[];
}

export interface BlackjackHand {
    cards: Card[];
    value: number;
    isBust: boolean;
    isBlackjack: boolean;
}

export interface BlackjackGameState {
    playerHand: Card[];
    dealerHand: Card[];
    gameState: GameState;
    playerValue: number;
    dealerValue: number;
    betAmount: number;
    balance: number;
}

// Game statistics
export interface GameStatistics {
    balance: number;
    xp: number;
    level: number;
    lessonsCompleted: number;
    totalGames: number;
    wins: number;
    winRate: number;
}
export interface RegisterWithQRResponse extends AuthResponse {
    qrData?: QRData;
}
// User session information
export interface UserSession {
    user: User;
    sessionToken: string;
    qrToken?: string;
    expiresAt: Date;
}

export interface RankProgress {
    currentRank: string;
    currentXp: number;
    nextRank: string;
    xpToNextRank: number;
    progressPercentage: number;
}

export interface UserRanking {
    rank: string;
    level: number;
    xp: number;
    rankProgress: RankProgress;
    gamesPlayed: number;
    winRate: number;
    lessonsCompleted: number;
}

export interface LeaderboardEntry {
    userId: number;
    username: string;
    xp: number;
    rank: string;
    level: number;
    gamesPlayed: number;
    lessonsCompleted: number;
    winRate: number;
    position: number;
}