// src/types/index.ts

// User Types
export interface User {
    id?: number;
    username: string;
    token?: string;
    balance?: number;
    qrSecret?: string;
    createdAt?: string;
    lastLogin?: string;
    isActive?: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    enableQR?: boolean;
}

export interface AuthResponse {
    token: string;
    user: {
        username: string;
        balance: number;
    };
}

export interface RegisterResponse {
    message: string;
    userId: number;
}

// Card and Game Types
export interface Card {
    suit: string;
    rank: string;
}

export interface PokerHand {
    handType: string;
    cards: Card[];
    score: number;
}

export interface PokerEvaluationRequest {
    cards: Card[];
}

// API Error Response
export interface ApiError {
    message: string;
    statusCode: number;
    timestamp?: string;
}

// Axios Request/Response Config
export interface AxiosRequestConfig {
    headers?: Record<string, string>;
    [key: string]: any; // This is acceptable for axios config
}