// components/CreateAccountScreen.tsx
import { useState } from 'react';
import { userApi } from '../api';
import type { User, Theme } from "../types";
import {AxiosError} from "axios";

interface CreateAccountScreenProps {
    onBack: () => void;
    onLogin: (user: User) => void;
    theme: Theme;
    onError: (error: string) => void;
}

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({onBack, onLogin, theme, onError}) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        enableQR: false,
        securityAnswers: ['', '', '']
    });
    const [isLoading, setIsLoading] = useState(false);

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
            // Register the user with email
            await userApi.register({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                enableQR: formData.enableQR
            });
            onError('Account created successfully!');

            // Now log in with the created account
            const loginResponse = await userApi.login({
                username: formData.username,
                password: formData.password
            });

            if (loginResponse?.user && loginResponse?.token) {
                const user: User = {
                    id: loginResponse.user.id,
                    username: loginResponse.user.username,
                    email: loginResponse.user.email,
                    balance: loginResponse.user.balance ?? 0,
                    token: loginResponse.token
                };
                onLogin(user);
            } else {
                onError('Account created but login failed');
            }
        } catch (error: unknown) {
            let message = 'Registration failed. Please try again.';

            if (error instanceof AxiosError) {
                console.error('Registration error details:', error.response?.data);
                message = error.response?.data?.error ||
                    error.response?.data?.details ||
                    error.response?.data?.message ||
                    message;
            }

            onError(`Registration failed: ${message}`);
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

                    <label style={{color: theme.textColor, display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <input
                            type="checkbox"
                            checked={formData.enableQR}
                            onChange={(e) => setFormData({...formData, enableQR: e.target.checked})}
                            disabled={isLoading}
                            aria-label="Enable QR Code Login"
                        />
                        Enable QR Code Login
                    </label>
                </div>
            </div>

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
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'CREATING ACCOUNT...' : 'Create Account'}
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
        </div>
    );
};

export default CreateAccountScreen;