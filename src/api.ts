// api.ts - Complete API integration
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (typeof window !== 'undefined' && window.location?.port)
    ? '/api'
    : ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8080/api');

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

interface ServerErrorResponse {
    error?: string;
    message?: string;
    [key: string]: unknown; // allows extra fields safely
}

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // You might want to redirect to login here
        }
        return Promise.reject(error);
    }
);

// Type definitions
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    email: string;
    enableQR?: boolean;
}

export interface QRLoginCredentials {
    token?: string;
    qrContent?: string;
}

export interface AuthResponse {
    user: {
        id: number;
        username: string;
        email: string;
        balance: number;
    };
    token: string;
}

export interface RegisterWithQRResponse extends AuthResponse {
    qrData?: {
        qrCode: string;
        token: string;
        qrContent: string;
        downloadUrl: string;
    };
}

export interface QRCodeResponse {
    qrCode: string;
    token: string;
    qrContent: string;
    downloadUrl: string;
    message: string;
}

// API Functions
export const userApi = {
    // Login with username and password
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

            // Store token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || 'Login failed';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Register new user
    async register(data: RegisterData): Promise<RegisterWithQRResponse> {
        const attempt = async (path: string) => {
            const response = await apiClient.post<RegisterWithQRResponse>(path, data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        };

        try {
            return await attempt('/auth/register');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 404 || status === 405) {
                    // Fallback: some backends expose /register without /auth
                    try {
                        return await attempt('/register');
                    } catch (err2) {
                        if (axios.isAxiosError(err2)) {
                            const status2 = err2.response?.status;
                            const statusText2 = err2.response?.statusText;
                            const respData2 = err2.response?.data as unknown as ServerErrorResponse;
                            let serverMsg2: string | undefined;
                            if (respData2) {
                                if (typeof respData2 === 'string') serverMsg2 = respData2;
                                else serverMsg2 = respData2.error || respData2.message;
                            }
                            const base2 = serverMsg2 ?? 'Registration failed';
                            const statusInfo2 = status2 ? ` (HTTP ${status2}${statusText2 ? ` ${statusText2}` : ''})` : '';
                            throw new Error(`${base2}${statusInfo2}`);
                        }
                        throw err2;
                    }
                }
                const statusText = error.response?.statusText;
                const respData = error.response?.data as unknown as ServerErrorResponse;
                let serverMsg: string | undefined;
                if (respData) {
                    if (typeof respData === 'string') serverMsg = respData;
                    else serverMsg = respData.error || respData.message;
                }
                const base = serverMsg ?? 'Registration failed';
                const statusInfo = status ? ` (HTTP ${status}${statusText ? ` ${statusText}` : ''})` : '';
                throw new Error(`${base}${statusInfo}`);
            }
            throw error;
        }
    },

    // Login with QR code
    async loginWithQR(credentials: QRLoginCredentials): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/qr/validate', credentials);

            // Store token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || 'QR login failed';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Upload QR code image file
    async uploadQRCode(file: File): Promise<AuthResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post<AuthResponse>('/auth/qr/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Store token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || 'QR code upload failed';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Generate QR code for logged-in user
    async generateQRCode(): Promise<QRCodeResponse> {
        try {
            const response = await apiClient.post<QRCodeResponse>('/auth/qr/generate');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || 'Failed to generate QR code';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Regenerate QR code
    async regenerateQRCode(): Promise<QRCodeResponse> {
        try {
            const response = await apiClient.post<QRCodeResponse>('/auth/regenerate-qr');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || 'Failed to regenerate QR code';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Download QR code image
    async downloadQRCode(token: string): Promise<Blob> {
        try {
            const response = await apiClient.get(`/auth/qr/download/${token}`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('Failed to download QR code');
            }
            throw error;
        }
    },

    // Logout
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Check if user is logged in
    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    },

    // Get current user from localStorage
    getCurrentUser(): AuthResponse['user'] | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },
};

// Export the axios instance for custom requests
export default apiClient;