// components/MainMenuScreen.tsx
import type { User, Theme } from '../types';

interface MainMenuScreenProps {
    user: User;
    onPlayBlackjack: () => void;
    onPlayPoker: () => void;
    onShowLessons: () => void;
    onLogout: () => void;
    theme: Theme;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
                                                           user,
                                                           onPlayBlackjack,
                                                           onPlayPoker,
                                                           onShowLessons,
                                                           onLogout,
                                                           theme
                                                       }) => {
    const menuButtons = [
        {
            text: 'EDUCATIONAL LESSONS',
            color: '#9C27B0',
            onClick: onShowLessons,
            icon: '📚',
            description: 'Learn game strategies'
        },
        // In the menuButtons array in MainMenuScreen.tsx
        {
            text: 'GENERATE QR LOGIN',
            color: '#3399FF',
            onClick: () => {
                // Navigate to QR generation screen
                // You'll need to add this navigation to your App.tsx
            },
            icon: '📱',
            description: 'Generate QR code for quick login'
        },
        {
            text: 'PLAY BLACKJACK',
            color: theme.negative,
            onClick: onPlayBlackjack,
            icon: '♠️',
            description: 'Beat the dealer to 21'
        },
        {
            text: 'PLAY POKER',
            color: theme.accent,
            onClick: onPlayPoker,
            icon: '🎲',
            description: 'Texas Hold\'em poker'
        },
        {
            text: 'VIEW STATISTICS',
            color: '#FF8C00',
            onClick: () => {
                // Show mock statistics
                alert(`Game Statistics:\n\nBalance: $${user.balance?.toFixed(2) || '0.00'}\nXP: 500\nLevel: 3\nLessons Completed: 2\n\nTotal Games: 15\nWins: 9\nWin Rate: 60%`);
            },
            icon: '📊',
            description: 'Your gaming stats'
        },
        {
            text: 'LOGOUT',
            color: theme.muted,
            onClick: onLogout,
            icon: '🚪',
            description: 'Return to login screen'
        }
    ];

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header with user info */}
            <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                padding: '20px',
                backgroundColor: theme.panelBg,
                borderRadius: '12px'
            }}>
                <h1 style={{
                    fontSize: '32px',
                    marginBottom: '10px',
                    color: theme.textColor,
                    fontWeight: 'bold'
                }}>
                    Welcome to Smart Casino
                </h1>

                <div style={{
                    fontSize: '20px',
                    color: '#FFD700',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                }}>
                    {user.username}
                </div>

                <div style={{
                    fontSize: '18px',
                    color: '#00FF00',
                    fontWeight: 'bold'
                }}>
                    Balance: ${user.balance?.toFixed(2) || '0.00'}
                </div>
            </div>

            {/* Menu Buttons */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {menuButtons.map((button, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: button.color,
                            color: theme.textColor,
                            border: 'none',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <button
                            onClick={button.onClick}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'inherit',
                                border: 'none',
                                padding: '20px 30px',
                                width: '100%',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.parentElement!.style.transform = 'translateY(-2px)';
                                e.currentTarget.parentElement!.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.parentElement!.style.transform = 'translateY(0)';
                                e.currentTarget.parentElement!.style.boxShadow = 'none';
                            }}
                            aria-label={`${button.text} - ${button.description}`}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ fontSize: '24px' }}>{button.icon}</span>
                                <div>
                                    <div>{button.text}</div>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
                                        {button.description}
                                    </div>
                                </div>
                            </div>
                            <span style={{ fontSize: '20px' }}>→</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '30px',
                padding: '15px',
                textAlign: 'center',
                color: theme.muted,
                fontSize: '14px',
                borderTop: `1px solid ${theme.muted}`
            }}>
                Smart Casino - Educational Gaming Platform
            </div>
        </div>
    );
};

export default MainMenuScreen;