// components/ForgotPasswordScreen.tsx
import { useState } from 'react';
import type { Theme } from '../types';

interface ForgotPasswordScreenProps {
    onBack: () => void;
    theme: Theme;
    onError?: (error: string) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
                                                                       onBack,
                                                                       theme,
                                                                       onError
                                                                   }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const handleSubmit = async () => {
        if (!formData.username || !formData.email) {
            onError?.('Please enter your username and email');
            return;
        }

        if (!formData.newPassword) {
            onError?.('Please enter a new password');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            onError?.('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            onError?.('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock success
            setResetSent(true);
            onError?.('Password reset instructions sent to your email!');

            // Auto-redirect after 3 seconds
            setTimeout(() => {
                onBack();
            }, 3000);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            onError?.('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
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
                    Reset Password
                </h1>

                {resetSent ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                        <h3 style={{ color: theme.textColor, marginBottom: '10px' }}>
                            Reset Link Sent!
                        </h3>
                        <p style={{ color: '#CCCCCC', marginBottom: '30px' }}>
                            Password reset instructions have been sent to your email.
                            You will be redirected to login shortly...
                        </p>
                        <button
                            onClick={onBack}
                            style={{
                                backgroundColor: theme.accent,
                                color: theme.textColor,
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{
                            color: '#CCCCCC',
                            textAlign: 'center',
                            marginBottom: '30px',
                            fontSize: '16px'
                        }}>
                            Enter your username and email to reset your password
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                onKeyPress={handleKeyPress}
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
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                onKeyPress={handleKeyPress}
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
                                aria-label="Email Address"
                            />

                            <input
                                type="password"
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                onKeyPress={handleKeyPress}
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
                                aria-label="New Password"
                            />

                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                onKeyPress={handleKeyPress}
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
                                aria-label="Confirm New Password"
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                <button
                                    onClick={handleSubmit}
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
                                        transition: 'background-color 0.3s'
                                    }}
                                    aria-label={isLoading ? 'Sending reset instructions' : 'Reset Password'}
                                >
                                    {isLoading ? 'SENDING...' : 'RESET PASSWORD'}
                                </button>

                                <button
                                    onClick={onBack}
                                    disabled={isLoading}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: theme.textColor,
                                        border: `1px solid ${theme.muted}`,
                                        padding: '15px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;