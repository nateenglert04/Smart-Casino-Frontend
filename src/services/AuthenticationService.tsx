import { SmartCasinoClient } from './SmartCasinoClient';

export type User = {
  id: number;
  username: string;
  email: string;
  balance: number;
}

export const AuthenticationService = {
  
  getClient: () => SmartCasinoClient.getInstance().client,

  registerUser: async (userData: {
    username: string;
    password: string;
    email: string;
  }) => {
    const response = await AuthenticationService.getClient().post('/auth/register', userData);
    return response.data;
  },

  loginUser: async (credentials: {
    username: string;
    password: string;
  }) => {
    const response = await AuthenticationService.getClient().post('/auth/login', credentials);
    return response.data;
  },

  // QR Code Login Service Endpoints

  uploadLoginQr: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await AuthenticationService.getClient().post('/auth/qr/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateUserQr: async () => {
    const response = await AuthenticationService.getClient().post('/auth/qr/generate');
    return response.data;
  },

  regenerateUserQr: async () => {
    const response = await AuthenticationService.getClient().post('/auth/regenerate-qr');
    return response.data;
  },

  downloadQrImage: async (token: string): Promise<Blob> => {
    const response = await AuthenticationService.getClient().get(`/auth/qr/download/${token}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}