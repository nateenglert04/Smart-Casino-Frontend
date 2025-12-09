// components/LoginScreen.tsx
import {useState} from 'react';
import {userApi} from '../api';
import type {Theme, User} from '../types';

interface LoginScreenProps {
    onLogin: (user: User) => void,
    onCreateAccount: () => void,
    onForgotPassword: () => void,
    onQRLogin: () => void,
    theme: Theme,
    onError: (error: string) => void,
    onBack?: () => void
}

const LoginScreen: React.FC<LoginScreenProps> = ({
                                                     onLogin,
                                                     onCreateAccount,
                                                     onForgotPassword,
                                                     onQRLogin,
                                                     theme,
                                                     onError
                                                 }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!credentials.username || !credentials.password) {
            onError('Please enter both username and password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await userApi.login({
                username: credentials.username,
                password: credentials.password
            });

            const user: User = {
                id: response.user.id,
                username: response.user.username,
                balance: response.user.balance ?? 0,
                email: response.user.email,
                token: response.token
            };

            onLogin(user);
            onError('Login successful!');
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: theme.bgDark,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: theme.panelBg,
                borderRadius: '12px',
                padding: '40px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    color: theme.textColor,
                    fontSize: '28px',
                    marginBottom: '30px'
                }}>
                    Welcome to Smart Casino
                </h1>

                <form onSubmit={handleSubmit}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            disabled={isLoading}
                            style={{
                                backgroundColor: '#3C3C3C',
                                color: theme.textColor,
                                border: `1px solid ${theme.muted}`,
                                borderRadius: '8px',
                                padding: '12px 16px',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                            aria-label="Username"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            disabled={isLoading}
                            style={{
                                backgroundColor: '#3C3C3C',
                                color: theme.textColor,
                                border: `1px solid ${theme.muted}`,
                                borderRadius: '8px',
                                padding: '12px 16px',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                            aria-label="Password"
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                backgroundColor: isLoading ? theme.muted : theme.positive,
                                color: theme.textColor,
                                border: 'none',
                                padding: '15px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.3s',
                                marginTop: '10px'
                            }}
                        >
                            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
                        </button>
                    </div>
                </form>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '20px'
                }}>
                    <button
                        onClick={onCreateAccount}
                        disabled={isLoading}
                        style={{
                            backgroundColor: theme.accent,
                            color: theme.textColor,
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        Create New Account
                    </button>

                    <button
                        onClick={onForgotPassword}
                        disabled={isLoading}
                        style={{
                            backgroundColor: 'transparent',
                            color: theme.textColor,
                            border: `1px solid ${theme.muted}`,
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        Forgot Password?
                    </button>

                    <button
                        onClick={onQRLogin}
                        disabled={isLoading}
                        style={{
                            backgroundColor: theme.panelBg,
                            color: theme.accent,
                            border: `2px solid ${theme.accent}`,
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 'bold'
                        }}
                    >
                        <span>📱</span>
                        Login with QR Code
                    </button>
                </div>

                <div style={{
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: `1px solid ${theme.muted}`,
                    textAlign: 'center',
                    color: theme.muted,
                    fontSize: '12px'
                }}>
                    Smart Casino - Educational Gaming Platform
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;