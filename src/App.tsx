// App.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { userApi } from './api';
import type { User, Theme } from './types';
import LoginScreen from './components/LoginScreen';
import CreateAccountScreen from './components/CreateAccountScreen';
import MainMenuScreen from './components/MainMenuScreen';
import GameLobbyScreen from './components/GameLobbyScreen';
import BlackjackGame from './components/BlackjackGame';
import PokerGame from './components/PokerGame';
import LessonPanel from './components/LessonPanel';
import ForgotPasswordScreen from './components/ForgetPasswordScreen';
import QRLoginScreen from './components/QRLoginScreen';
import './App.css';

// Error Boundary Component
class GameErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Game Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#121212',
                    color: 'white',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Game Crashed</h1>
                        <p style={{ marginBottom: '20px' }}>Something went wrong. Please restart the game.</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                backgroundColor: '#DC143C',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Restart Game
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

type Screen =
    | 'LOGIN'
    | 'CREATE_ACCOUNT'
    | 'FORGOT_PASSWORD'
    | 'QR_LOGIN'
    | 'MAIN_MENU'
    | 'GAME_LOBBY'
    | 'BLACKJACK'
    | 'POKER'
    | 'LESSONS';

function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [backendStatus, setBackendStatus] = useState<string>('Checking...');
    const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

    // Memoize theme so children won't re-render unnecessarily if they're memoized
    const theme: Theme = useMemo(
        () => ({
            bgDark: '#121212',
            panelBg: '#282828',
            cardBg: '#FAFAFA',
            textColor: '#FFFFFF',
            accent: '#3399FF',
            positive: '#4CAF50',
            negative: '#DC143C',
            muted: '#A9A9A9',
        }),
        []
    );

    // Ref to hold interval id so we can pause/resume polling
    const intervalRef = useRef<number | null>(null);

    const checkBackendStatus = useCallback(async (): Promise<void> => {
        try {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 5000);

            const response = await fetch('/api/test/health', {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const text = await response.text();
            if (response.ok) {
                setBackendStatus('Connected ✅');
                setIsBackendConnected(true);
            } else {
                setBackendStatus(`Error ${response.status}: ${text}`);
                setIsBackendConnected(false);
            }
        } catch (err) {
            // Type guard to check if it's an AbortError
            if (err instanceof DOMException && err.name === 'AbortError') {
                setBackendStatus('Request timed out ❌');
            } else if (err instanceof Error) {
                setBackendStatus('Not connected ❌');
                console.error('Backend connection failed:', err.message);
            } else {
                // fallback for unknown error type
                setBackendStatus('Unknown error ❌');
                console.error('Backend connection failed:', err);
            }

            setIsBackendConnected(false);
        }
    }, []);

    const startPolling = useCallback(() => {
        // Don't double-start
        if (intervalRef.current !== null) return;
        // setInterval returns number in browsers
        intervalRef.current = window.setInterval(() => {
            checkBackendStatus();
        }, 30_000);
    }, [checkBackendStatus]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        // initial check
        checkBackendStatus();
        startPolling();

        // Pause polling when page is hidden to save resources; resume when visible
        const onVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                checkBackendStatus();
                startPolling();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('smartCasinoUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setCurrentScreen('MAIN_MENU');
            } catch (err) {
                console.error('Failed to parse saved user:', err);
                localStorage.removeItem('smartCasinoUser');
            }
        }

        // Load game state from localStorage
        const savedGameState = localStorage.getItem('blackjackState');
        if (savedGameState) {
            console.log('Saved game state available:', savedGameState);
        }

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [checkBackendStatus, startPolling, stopPolling]);

    // Save user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('smartCasinoUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('smartCasinoUser');
        }
    }, [user]);

    // Auto-clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = window.setTimeout(() => {
                setError(null);
            }, 5000);
            return () => window.clearTimeout(timer);
        }
    }, [error]);

    /* ============================================================
       Screen transitions (memoized)
    ============================================================ */
    const showLoginScreen = useCallback(() => {
        setCurrentScreen('LOGIN');
        setError(null);
    }, []);

    const showCreateAccountScreen = useCallback(() => {
        setCurrentScreen('CREATE_ACCOUNT');
        setError(null);
    }, []);

    const showForgotPasswordScreen = useCallback(() => {
        setCurrentScreen('FORGOT_PASSWORD');
        setError(null);
    }, []);

    const showQRLoginScreen = useCallback(() => {
        setCurrentScreen('QR_LOGIN');
        setError(null);
    }, []);

    const showMainMenu = useCallback((userData: User) => {
        setUser(userData);
        setCurrentScreen('MAIN_MENU');
        setError(null);
    }, []);

    const showLessons = useCallback(() => {
        setCurrentScreen('LESSONS');
        setError(null);
    }, []);
    useCallback(() => {
        setCurrentScreen('GAME_LOBBY');
        setError(null);
    }, []);
    const playBlackjack = useCallback(() => {
        setCurrentScreen('BLACKJACK');
        setError(null);
    }, []);

    const playPoker = useCallback(() => {
        setCurrentScreen('POKER');
        setError(null);
    }, []);

    const returnToMainMenu = useCallback(() => {
        setCurrentScreen('MAIN_MENU');
        setError(null);
    }, []);

    // Make logout async and handle errors
    const logout = useCallback(async () => {
        try {
            await userApi.logout?.();
        } catch (err) {
            // non-blocking: still clear local user state so UI returns to login
            setError('Logout failed (local state cleared).');
            console.error('Logout failed:', err);
        } finally {
            setUser(null);
            setCurrentScreen('LOGIN');
            setError(null);
            localStorage.removeItem('smartCasinoUser');
        }
    }, []);

    /* ============================================================
       Sub-component: backend indicator (keyboard + screen-reader friendly)
    ============================================================ */
    const BackendStatusIndicator = (
        <button
            type="button"
            className="backend-status-indicator"
            onClick={() => checkBackendStatus()}
            title="Check backend connection"
            aria-pressed={isBackendConnected}
            style={{
                position: 'fixed',
                top: 10,
                right: 10,
                backgroundColor: isBackendConnected ? theme.positive : theme.negative,
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                border: 'none',
                cursor: 'pointer',
            }}
        >
            <span>{backendStatus}</span>
            {!isBackendConnected && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        checkBackendStatus();
                    }}
                    className="retry-button"
                    aria-label="Retry connection"
                    style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px 6px',
                        borderRadius: '4px',
                    }}
                >
                    ⟳ Retry
                </button>
            )}
        </button>
    );

    return (
        <GameErrorBoundary>
            <div
                className="app"
                style={{
                    backgroundColor: theme.bgDark,
                    color: theme.textColor,
                    minHeight: '100vh',
                    width: '100%',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    position: 'relative',
                }}
            >
                {BackendStatusIndicator}

                {/* Error Display -- accessible */}
                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        style={{
                            position: 'fixed',
                            top: 50,
                            right: 20,
                            backgroundColor: theme.negative,
                            color: 'white',
                            padding: '15px 20px',
                            borderRadius: '8px',
                            zIndex: 1000,
                            maxWidth: '420px',
                            boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
                            animation: 'slideIn 0.3s ease-out',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>⚠️</span>
                                <div>
                                    <strong style={{ fontSize: '14px' }}>Error</strong>
                                    <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.95 }}>{error}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                aria-label="Dismiss error"
                                style={{
                                    marginLeft: '15px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    padding: '0',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="app-content" style={{ position: 'relative', zIndex: 1 }}>
                    {currentScreen === 'LOGIN' && (
                        <LoginScreen
                            onLogin={showMainMenu}
                            onCreateAccount={showCreateAccountScreen}
                            onForgotPassword={showForgotPasswordScreen}
                            onQRLogin={showQRLoginScreen}
                            theme={theme}
                            onError={setError}
                        />
                    )}

                    {currentScreen === 'CREATE_ACCOUNT' && (
                        <CreateAccountScreen
                            onBack={showLoginScreen}
                            onLogin={showMainMenu}
                            theme={theme}
                            onError={setError}
                        />
                    )}

                    {currentScreen === 'FORGOT_PASSWORD' && (
                        <ForgotPasswordScreen onBack={showLoginScreen} theme={theme} onError={setError} />
                    )}

                    {currentScreen === 'QR_LOGIN' && (
                        <QRLoginScreen onBack={showLoginScreen} onLogin={showMainMenu} theme={theme} onError={setError} />
                    )}

                    {currentScreen === 'MAIN_MENU' && user && (
                        <MainMenuScreen
                            user={user}
                            onPlayBlackjack={playBlackjack}
                            onPlayPoker={playPoker}
                            onShowLessons={showLessons}
                            onLogout={logout}
                            theme={theme}
                        />
                    )}

                    {currentScreen === 'GAME_LOBBY' && user && (
                        <GameLobbyScreen
                            user={user}
                            onPlayBlackjack={playBlackjack}
                            onPlayPoker={playPoker}
                            onBack={returnToMainMenu}
                            theme={theme}
                        />
                    )}

                    {currentScreen === 'LESSONS' && user && (
                        <LessonPanel user={user} onBack={returnToMainMenu} theme={theme} onError={setError} />
                    )}

                    {currentScreen === 'BLACKJACK' && user && (
                        <BlackjackGame user={user} onBack={returnToMainMenu} theme={theme} />
                    )}

                    {currentScreen === 'POKER' && user && <PokerGame user={user} onBack={returnToMainMenu} theme={theme} />}
                </div>

                {/* Connection Warning (shown when backend is disconnected) */}
                {!isBackendConnected && currentScreen !== 'LOGIN' && (
                    <div
                        role="status"
                        aria-live="polite"
                        style={{
                            position: 'fixed',
                            bottom: 20,
                            right: 20,
                            backgroundColor: theme.negative,
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            zIndex: 999,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    >
                        <span>⚠️ Offline Mode - Some features may be limited</span>
                    </div>
                )}

                {/* Add CSS for animation and hover behaviors */}
                <style>{`
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to   { transform: translateX(0); opacity: 1; }
                    }
                    .app-content { transition: opacity 0.3s ease; }
                    .app-content > * { animation: fadeIn 0.25s ease; }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .backend-status-indicator:hover { filter: brightness(1.05); }
                    .retry-button:hover { filter: brightness(1.08); }
                    
                    /* Responsive adjustments */
                    @media (max-width: 768px) {
                        .app-content {
                            padding: 10px;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .backend-status-indicator {
                            top: 5px;
                            right: 5px;
                            font-size: 10px;
                            padding: 4px 8px;
                        }
                    }
                `}</style>
            </div>
        </GameErrorBoundary>
    );
}

export default App;