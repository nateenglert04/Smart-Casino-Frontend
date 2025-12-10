import axios from 'axios';
import type { AxiosInstance } from 'axios';

export class SmartCasinoClient {
  public client: AxiosInstance;
  private static instance: SmartCasinoClient;

  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:8080/api',
      // Increase timeout to allow longer backend processing for catchup generation
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('smartcasino_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                              error.config?.url?.includes('/auth/register');
        if (error.response?.status === 401 && !isAuthRequest) {
          localStorage.removeItem('smartcasino_token');
          localStorage.removeItem('smartcasino_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): SmartCasinoClient {
    if (!SmartCasinoClient.instance) {
      SmartCasinoClient.instance = new SmartCasinoClient();
    }
    return SmartCasinoClient.instance;
  }
}



