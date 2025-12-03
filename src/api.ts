import axios, {
    type AxiosInstance,
    type AxiosResponse,
    AxiosError,
    type InternalAxiosRequestConfig,
    type AxiosRequestHeaders
} from 'axios';
import type {
    Card,
    PokerHand,
    LoginCredentials,
    RegisterData,
    AuthResponse,
    RegisterResponse,
    User,
    ApiError
} from './types';

// Use Vite env var with safe access
const API_BASE_URL = import.meta.env?.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL)
    : 'http://localhost:8080/api';

console.log('API Base URL:', API_BASE_URL);

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

// Enhanced request interceptor with logging
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        console.log('[API Request] Data:', config.data);

        const token = localStorage.getItem('token');
        if (token && config.headers) {
            (config.headers as AxiosRequestHeaders)['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Enhanced response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
    },
    (error: AxiosError<ApiError>) => {
        console.error('[API Response Error]', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

// Poker API
export const pokerApi = {
    evaluateHand: async (cards: Card[]): Promise<PokerHand> => {
        try {
            console.log('Sending cards to evaluate:', cards);
            const response = await api.post<PokerHand>('/poker/evaluate', cards);
            console.log('Evaluation response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Poker evaluation failed:', error);
            throw error;
        }
    }
};

// User API
export const userApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            console.log('Attempting login with:', credentials);
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            console.log('Login response:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('Token saved to localStorage');
            }

            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    register: async (userData: RegisterData): Promise<RegisterResponse> => {
        try {
            console.log('Attempting registration with:', userData);
            const response = await api.post<RegisterResponse>('/auth/register', userData);
            console.log('Registration response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    getProfile: async (): Promise<User> => {
        try {
            console.log('Getting user profile');
            const response = await api.get<User>('/user/profile');
            console.log('Profile response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Get profile failed:', error);
            throw error;
        }
    },

    logout: (): void => {
        localStorage.removeItem('token');
        console.log('Logged out, token removed');
    }
};

export default api;