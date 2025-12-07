// components/GameLobbyScreen.tsx
import type { User, Theme } from '../types';

interface GameLobbyScreenProps {
    user: User;
    onPlayBlackjack: () => void;
    onPlayPoker: () => void;
    onBack: () => void;
    theme: Theme;
}

const GameLobbyScreen: React.FC<GameLobbyScreenProps> = ({
                                                             user,
                                                             onPlayBlackjack,
                                                             onPlayPoker,
                                                             onBack,
                                                             theme
                                                         }) => {
    const createGameCard = (title: string, description: string, color: string, onClick: () => void) => (
        <div style={{
            backgroundColor: theme.panelBg,
            border: `2px solid ${color}`,
            borderRadius: '12px',
            padding: '25px',
            margin: '20px 0',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer'
        }}
             onClick={onClick}
             onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'translateY(-5px)';
                 e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
             }}
             onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'translateY(0)';
                 e.currentTarget.style.boxShadow = 'none';
             }}
             role="button"
             tabIndex={0}
             onKeyPress={(e) => e.key === 'Enter' && onClick()}
        >
            <h2 style={{
                color: theme.textColor,
                fontSize: '24px',
                marginBottom: '15px',
                textAlign: 'center'
            }}>
                {title}
            </h2>

            <p style={{
                color: '#CCCCCC',
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                {description}
            </p>

            <button
                onClick={onClick}
                style={{
                    backgroundColor: color,
                    color: theme.textColor,
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'transform 0.3s'
                }}
                aria-label={`Play ${title}`}
            >
                PLAY {title.toUpperCase()}
            </button>
        </div>
    );

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh'
        }}>
            <h1 style={{
                textAlign: 'center',
                fontSize: '28px',
                color: theme.textColor,
                marginBottom: '30px'
            }}>
                Game Lobby - Welcome, {user.username}!
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                {createGameCard(
                    'Blackjack',
                    'Try to get closer to 21 than the dealer without going over!',
                    theme.negative,
                    onPlayBlackjack
                )}

                {createGameCard(
                    'Texas Hold\'em Poker',
                    'Make the best 5-card hand using your 2 cards and 5 community cards!',
                    theme.accent,
                    onPlayPoker
                )}
            </div>

            <button
                onClick={onBack}
                style={{
                    backgroundColor: theme.muted,
                    color: theme.textColor,
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '20px'
                }}
            >
                BACK TO MAIN MENU
            </button>
        </div>
    );
};

export default GameLobbyScreen;