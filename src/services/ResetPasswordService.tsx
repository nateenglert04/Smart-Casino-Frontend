import { SmartCasinoClient } from './SmartCasinoClient';

export const ResetPasswordService = {
  
  getClient: () => SmartCasinoClient.getInstance().client,

  verifyEmail: async (email: string) => {
    const response = await ResetPasswordService.getClient().post(
      `/forgotPassword/verifyMail/${email}`
    );
    return response.data;
  },

  verifyOtp: async (otp: number, email: string) => {
    const response = await ResetPasswordService.getClient().post(
      `/forgotPassword/verifyOtp/${otp}/${email}`
    );
    return response.data;
  },

  resetPassword: async (data: { 
    email: string;
    otp: number; 
    password: string; 
    repeatPassword: string;
  }) => {
    const response = await ResetPasswordService.getClient().post(
      `/forgotPassword/changePassword/${data.email}`, 
      {
        password: data.password,
        repeatPassword: data.repeatPassword,
        otp: data.otp
      }
    );
    return response.data;
  }
};