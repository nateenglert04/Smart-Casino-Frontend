// components/CreateAccountScreen.tsx - Corrected version with TypeScript fixes
import { useState } from 'react';
import { userApi } from '../api';
import type { User, Theme, RegisterWithQRResponse, QRData } from "../types";
import { AxiosError } from "axios";
import QRCodeDisplayScreen from './QRCodeDisplayScreen';

interface CreateAccountScreenProps {
    onBack: () => void;
    onLogin: (user: User) => void;
    theme: Theme;
    onError: (error: string) => void;
}

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({
                                                                     onBack,
                                                                     onLogin,
                                                                     theme,
                                                                     onError
                                                                 }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        enableQR: false,
        securityAnswers: ['', '', '']
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrData, setQrData] = useState<QRData | null>(null);
    const [registeredUser, setRegisteredUser] = useState<User | null>(null);

    const securityQuestions = [
        "What was the name of your first pet?",
        "What city were you born in?",
        "What is your mother's maiden name?"
    ];

    const handleSubmit = async () => {
        if (!formData.username || !formData.password || !formData.email) {
            onError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            onError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            onError('Password must be at least 6 characters long');
            return;
        }

        if (!formData.email.includes('@')) {
            onError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const registerResponse: RegisterWithQRResponse = await userApi.register({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                enableQR: formData.enableQR
            });

            const user: User = {
                id: registerResponse.user.id,
                username: registerResponse.user.username,
                email: registerResponse.user.email,
                balance: registerResponse.user.balance ?? 1000,
                token: registerResponse.token || ''
            };

            setRegisteredUser(user);

            if (formData.enableQR && registerResponse.qrData) {
                setQrData(registerResponse.qrData);
                setShowQRCode(true);
                onError('Account created successfully! QR code generated.');
            } else {
                onLogin(user);
                onError('Account created successfully!');
            }
        } catch (error: unknown) {
            console.error('Full registration error:', error);

            let message = 'Registration failed. Please try again.';
            let statusInfo = '';

            if (error instanceof AxiosError) {
                const status = error.response?.status;
                const statusText = error.response?.statusText;
                statusInfo = status ? ` (HTTP ${status}${statusText ? ` ${statusText}` : ''})` : '';

                console.error('Registration AxiosError details:', {
                    status,
                    statusText,
                    data: error.response?.data,
                    headers: error.response?.headers
                });

                if (error.response?.data) {
                    // Fix: Use proper type instead of 'any'
                    const errorData = error.response.data;
                    if (typeof errorData === 'string') {
                        message = errorData;
                    } else if (errorData && typeof errorData === 'object') {
                        // Type-safe property access
                        if ('error' in errorData && typeof errorData.error === 'string') {
                            message = errorData.error;
                        } else if ('message' in errorData && typeof errorData.message === 'string') {
                            message = errorData.message;
                        } else {
                            try {
                                message = JSON.stringify(errorData);
                            } catch {
                                message = 'Unknown error format';
                            }
                        }
                    } else {
                        message = 'Unknown error format';
                    }
                } else if (error.request) {
                    console.error('No response received:', error.request);
                    message = 'No response from server. Check if backend is running.';
                } else if (error.message) {
                    message = error.message;
                }
            } else if (error instanceof Error) {
                message = error.message;
            }

            const finalMsg = message.startsWith('Registration failed') ? `${message}${statusInfo}` : `Registration failed: ${message}${statusInfo}`;
            onError(finalMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceedToMainMenu = () => {
        if (registeredUser) {
            onLogin(registeredUser);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    // Show QR code screen if registration was successful with QR
    if (showQRCode && qrData && registeredUser) {
        return (
            <QRCodeDisplayScreen
                user={registeredUser}
                qrData={qrData}
                onProceed={handleProceedToMainMenu}
                theme={theme}
                onError={onError}
            />
        );
    }

    // Show registration form
    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh'
        }}>
            <h1 style={{
                textAlign: 'center',
                color: theme.textColor,
                marginBottom: '30px'
            }}>
                Create Account
            </h1>

            <div style={{
                backgroundColor: theme.panelBg,
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h2 style={{color: theme.textColor, marginBottom: '20px'}}>
                    Account Information
                </h2>

                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <input
                        type="text"
                        placeholder="Username *"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        style={{
                            padding: '12px',
                            backgroundColor: '#3C3C3C',
                            color: theme.textColor,
                            border: `1px solid ${theme.muted}`,
                            borderRadius: '8px'
                        }}
                        aria-label="Username"
                    />

                    <input
                        type="email"
                        placeholder="Email *"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        style={{
                            padding: '12px',
                            backgroundColor: '#3C3C3C',
                            color: theme.textColor,
                            border: `1px solid ${theme.muted}`,
                            borderRadius: '8px'
                        }}
                        aria-label="Email"
                    />

                    <input
                        type="password"
                        placeholder="Password *"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        style={{
                            padding: '12px',
                            backgroundColor: '#3C3C3C',
                            color: theme.textColor,
                            border: `1px solid ${theme.muted}`,
                            borderRadius: '8px'
                        }}
                        aria-label="Password"
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password *"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        style={{
                            padding: '12px',
                            backgroundColor: '#3C3C3C',
                            color: theme.textColor,
                            border: `1px solid ${theme.muted}`,
                            borderRadius: '8px'
                        }}
                        aria-label="Confirm Password"
                    />

                    <label style={{
                        color: theme.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        backgroundColor: '#3C3C3C',
                        borderRadius: '8px',
                        border: `2px solid ${theme.accent}`
                    }}>
                        <input
                            type="checkbox"
                            checked={formData.enableQR}
                            onChange={(e) => setFormData({...formData, enableQR: e.target.checked})}
                            disabled={isLoading}
                            aria-label="Generate QR Code for Login"
                        />
                        <div>
                            <div style={{fontWeight: 'bold'}}>Generate QR Code for Login</div>
                            <div style={{fontSize: '12px', color: theme.muted}}>
                                Get a QR code for quick login on other devices
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Security Questions Section */}
            <div style={{
                backgroundColor: theme.panelBg,
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h2 style={{color: theme.textColor, marginBottom: '20px'}}>
                    Security Questions (Optional)
                </h2>

                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {securityQuestions.map((question, index) => (
                        <div key={index}>
                            <div style={{color: '#CCCCCC', marginBottom: '5px'}}>
                                {question}
                            </div>
                            <input
                                type="text"
                                value={formData.securityAnswers[index]}
                                onChange={(e) => {
                                    const newAnswers = [...formData.securityAnswers];
                                    newAnswers[index] = e.target.value;
                                    setFormData({...formData, securityAnswers: newAnswers});
                                }}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#3C3C3C',
                                    color: theme.textColor,
                                    border: `1px solid ${theme.muted}`,
                                    borderRadius: '8px'
                                }}
                                aria-label={`Security question ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* QR Code Benefits Info */}
            {formData.enableQR && (
                <div style={{
                    backgroundColor: '#3399FF20',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: `1px solid ${theme.accent}`
                }}>
                    <h3 style={{color: theme.textColor, marginBottom: '10px'}}>
                        🔐 QR Code Benefits:
                    </h3>
                    <ul style={{
                        color: theme.muted,
                        fontSize: '14px',
                        paddingLeft: '20px',
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        <li>Quick login on multiple devices</li>
                        <li>No need to remember passwords on trusted devices</li>
                        <li>Enhanced security with one-time use codes</li>
                        <li>Can be saved as an image for future use</li>
                        <li>Works even if you forget your password</li>
                    </ul>
                </div>
            )}

            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    {isLoading ? (
                        <>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid transparent',
                                borderTop: `2px solid ${theme.textColor}`,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            CREATING ACCOUNT...
                        </>
                    ) : formData.enableQR ? (
                        'Create Account with QR Code'
                    ) : (
                        'Create Account'
                    )}
                </button>

                <button
                    onClick={onBack}
                    disabled={isLoading}
                    style={{
                        backgroundColor: theme.muted,
                        color: theme.textColor,
                        border: 'none',
                        padding: '15px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Back to Login
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CreateAccountScreen;