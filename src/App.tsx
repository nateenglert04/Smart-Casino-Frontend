import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { userApi } from './api';
import type { User, Card, PokerHand, LoginCredentials } from './types';
import axios from 'axios';

function App() {
    const [count, setCount] = useState<number>(0);
    const [pokerHand, setPokerHand] = useState<PokerHand | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [backendStatus, setBackendStatus] = useState<string>('Checking...');

    // Test backend connection on load
    useEffect(() => {
        checkBackendStatus();
    }, []);

    const checkBackendStatus = async (): Promise<void> => {
        try {
            // Use relative path (will be proxied to backend)
            const response = await fetch('/api/test/health');
            const text = await response.text();
            console.log('Backend response:', text);

            if (response.ok) {
                setBackendStatus('Connected ✅');
            } else {
                setBackendStatus(`Error ${response.status}: ${text}`);
            }
        } catch (err) {
            setBackendStatus('Not connected ❌');
            console.error('Backend connection failed:', err);
        }
    };

    const evaluateSampleHand = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const sampleCards = [
                { suit: 'HEARTS', rank: '10' },
                { suit: 'HEARTS', rank: 'JACK' },
                { suit: 'HEARTS', rank: 'QUEEN' },
                { suit: 'HEARTS', rank: 'KING' },
                { suit: 'HEARTS', rank: 'ACE' }
            ];

            console.log('Sending cards:', sampleCards);

            // Use relative path through proxy
            const response = await axios.post('/api/poker/evaluate', sampleCards, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Received result:', response.data);
            setPokerHand(response.data);
        } catch (err: unknown) {
            console.error('Error evaluating hand:', err);
            if (err instanceof Error) {
                setError(`Failed to evaluate hand: ${err.message}`);
            } else {
                setError('Failed to evaluate hand: Unknown error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (): Promise<void> => {
        setError(null);
        try {
            const credentials: LoginCredentials = {
                username: 'demoUser',
                password: 'password123'
            };

            console.log('Logging in with:', credentials);
            const authResponse = await userApi.login(credentials);
            console.log('Login response:', authResponse);

            // Check if response has expected structure
            if (authResponse && authResponse.user) {
                setUser({
                    id: authResponse.user.id,
                    username: authResponse.user.username,
                    balance: authResponse.user.balance,
                    token: authResponse.token
                });
            } else {
                setError('Invalid response structure from server');
            }
        } catch (err: unknown) {
            console.error('Login failed:', err);
            if (err instanceof Error) {
                setError(`Login failed: ${err.message}`);
            } else {
                setError('Login failed: Unknown error');
            }
        }
    };

    const handleRegister = async (): Promise<void> => {
        setError(null);
        try {
            const userData = {
                username: `testUser${Date.now()}`,
                password: 'test123',
                enableQR: false
            };

            console.log('Registering user:', userData);
            await userApi.register(userData);
            console.log('Registration successful');

            // Try login with same credentials
            await handleLogin();
        } catch (err: unknown) {
            console.error('Registration failed:', err);
            if (err instanceof Error) {
                setError(`Registration failed: ${err.message}`);
            } else {
                setError('Registration failed: Unknown error');
            }
        }
    };

    const handleLogout = (): void => {
        userApi.logout();
        setUser(null);
        setPokerHand(null);
        setError(null);
    };

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>

            <h1>Smart Casino - Poker</h1>

            {/* Backend Status */}
            <div className="card">
                <p><strong>Backend Status:</strong> {backendStatus}</p>
                <button onClick={checkBackendStatus}>Refresh Status</button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="card" style={{ background: '#ff6b6b', color: 'white' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* User Section */}
            <div className="card">
                {user ? (
                    <div>
                        <p>Welcome, {user.username || 'Player'}!</p>
                        <p>Balance: ${user.balance?.toFixed(2) || '0.00'}</p>
                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div>
                        <button onClick={handleLogin} style={{ marginRight: '10px' }}>
                            Demo Login
                        </button>
                        <button onClick={handleRegister}>
                            Register Test User
                        </button>
                    </div>
                )}
            </div>

            {/* Poker Hand Evaluation */}
            <div className="card">
                <button onClick={evaluateSampleHand} disabled={loading}>
                    {loading ? 'Evaluating...' : 'Evaluate Sample Royal Flush'}
                </button>

                {pokerHand && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Hand Result:</h3>
                        <p><strong>Hand Type:</strong> {pokerHand.handType}</p>
                        <p><strong>Score:</strong> {pokerHand.score}</p>
                        <div>
                            <strong>Cards:</strong>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                {pokerHand.cards.map((card: Card, index: number) => (
                                    <div
                                        key={`${card.suit}-${card.rank}-${index}`}
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #646cff',
                                            borderRadius: '5px',
                                            background: 'white',
                                            color: card.suit === 'HEARTS' || card.suit === 'DIAMONDS' ? 'red' : 'black'
                                        }}
                                    >
                                        {card.rank} of {card.suit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Debug Information */}
            <div className="card">
                <h3>Debug Information</h3>
                <div style={{ textAlign: 'left', fontSize: '12px' }}>
                    <p><strong>LocalStorage Token:</strong> {localStorage.getItem('token') || 'None'}</p>
                    <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}</p>
                    <button onClick={() => {
                        console.log('Current state:', {
                            user,
                            pokerHand,
                            error,
                            backendStatus
                        });
                        console.log('LocalStorage:', {
                            token: localStorage.getItem('token')
                        });
                    }}>
                        Log State to Console
                    </button>
                </div>
            </div>

            {/* Original Counter */}
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>

            <p className="read-the-docs">
                Smart Casino Backend Integration Demo
            </p>
        </>
    );
}

export default App;