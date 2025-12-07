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

  // Auth methods
  public async registerUser(userData: {
    username: string;
    password: string;
    email: string;
  }) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  public async loginUser(credentials: {
    username: string;
    password: string;
  }) {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }


  // Will need to implement simple crud operations for user data
  /*
  //getting and updating user methods
  public async getUser( userGuid: string) {
    const response = await this.client.get(`/User/${userGuid}`);
    return response.data;
  }

  public async updateUser( userGuid: string, userData:{
    username?: string;
    PasswordHash?: string;
    email?: string;
    
  } ) {
    const response = await this.client.put(`/User/${userGuid}`, userData);
    return response.data;
  }

  public async updateUserName(userGuid: string,  username: string){
    const response = await this.client.put(`/User/UserName/${userGuid}`,username )
    return response.data;
  }
  */
}



