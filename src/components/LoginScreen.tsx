// components/LoginScreen.tsx
import {useState, KeyboardEvent} from 'react';
import {userApi} from '../api';
import type {User, Theme} from '../types';

interface LoginScreenProps {
    onLogin: (user: User) => void,
    onCreateAccount: () => void,
    onForgotPassword: () => void,
    onQRLogin: () => void,
    theme: Theme,
    onError?: (error: string) => void;
}

// Helper function to adjust brightness (moved outside component)
const adjustBrightness = (color: string, factor: number): string => {
    // Remove # if present
    const hex = color.startsWith('#') ? color.slice(1) : color;

    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn('Invalid color format:', color);
        return color;
    }

    // Adjust brightness
    const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Extracted button component for better organization
interface ModernButtonProps {
    text: string;
    color: string;
    onClick: () => void;
    textColor: string;
    disabled?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
                                                       text,
                                                       color,
                                                       onClick,
                                                       textColor,
                                                       disabled = false
                                                   }) => {
    const [hoverColor, setHoverColor] = useState(color);

    const handleMouseEnter = () => {
        setHoverColor(adjustBrightness(color, 1.2));
    };

    const handleMouseLeave = () => {
        setHoverColor(color);
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            style={{
                backgroundColor: hoverColor,
                color: textColor,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s, transform 0.2s',
                width: '100%',
                margin: '5px 0',
                opacity: disabled ? 0.7 : 1,
            }}
            aria-label={text}
        >
            {text}
        </button>
    );
};

const LoginScreen: React.FC<LoginScreenProps> = ({
                                                     onLogin,
                                                     onCreateAccount,
                                                     onForgotPassword,
                                                     onQRLogin,
                                                     theme
                                                 }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const credentials = {username, password};
            const authResponse = await userApi.login(credentials);

            if (authResponse?.user && authResponse?.token) {
                const user: User = {
                    id: authResponse.user.id,
                    username: authResponse.user.username,
                    balance: authResponse.user.balance ?? 0,
                    token: authResponse.token
                };
                onLogin(user);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Login failed. Please check your credentials.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleLogin();
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
                maxWidth: '400px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    color: theme.textColor,
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '30px'
                }}>
                    SMART CASINO
                </h1>

                {error && (
                    <div style={{
                        backgroundColor: `${theme.negative}20`,
                        color: theme.textColor,
                        border: `1px solid ${theme.negative}`,
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }} role="alert">
                        {error}
                    </div>
                )}

                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor: '#3C3C3C',
                            color: theme.textColor,
                            border: `1px solid ${theme.muted}`,
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '16px',
                            outline: 'none',
                            transition: 'border-color 0.3s'
                        }}
                        disabled={isLoading}
                        aria-label="Username"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor: '#3C3C3C',
                            color: theme.textColor,
                            border: `1px solid ${theme.muted}`,
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '16px',
                            outline: 'none',
                            transition: 'border-color 0.3s'
                        }}
                        disabled={isLoading}
                        aria-label="Password"
                    />

                    <ModernButton
                        text={isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                        color={theme.positive}
                        onClick={handleLogin}
                        textColor={theme.textColor}
                        disabled={isLoading}
                    />

                    <ModernButton
                        text="QR LOGIN"
                        color={theme.accent}
                        onClick={onQRLogin}
                        textColor={theme.textColor}
                        disabled={isLoading}
                    />

                    <ModernButton
                        text="CREATE ACCOUNT"
                        color="#9C27B0"
                        onClick={onCreateAccount}
                        textColor={theme.textColor}
                        disabled={isLoading}
                    />

                    <ModernButton
                        text="FORGOT PASSWORD?"
                        color={theme.negative}
                        onClick={onForgotPassword}
                        textColor={theme.textColor}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;