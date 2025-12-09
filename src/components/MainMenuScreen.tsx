// components/MainMenuScreen.tsx - Complete Updated Version
import React, { useState, useEffect } from 'react';
import type { User, Theme } from '../types';
import { useRanking } from '../hooks/useRanking';
import RankingDisplay from '../components/RankingDisplay';

// Import LeaderboardScreen (we'll create this separately)
// import LeaderboardScreen from './LeaderboardScreen';

interface MainMenuScreenProps {
    user: User;
    onPlayBlackjack: () => void;
    onPlayPoker: () => void;
    onShowLessons: () => void;
    onShowGameLobby: () => void;
    onShowQRGenerate: () => void;
    onLogout: () => void;
    theme: Theme;
}

// Simple leaderboard modal for now - we can expand this later
const LeaderboardModal: React.FC<{ userId: number; theme: Theme; onClose: () => void }> = ({
                                                                                               userId,
                                                                                               theme,
                                                                                               onClose
                                                                                           }) => {
    const { leaderboard, isLoading } = useRanking(userId);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: theme.panelBg,
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                }}>
                    <h2 style={{ margin: 0, color: theme.textColor }}>🏆 Global Leaderboard</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: theme.textColor,
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '10px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: theme.muted }}>
                        Loading leaderboard...
                    </div>
                ) : (
                    <div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 100px 80px 100px 100px',
                            gap: '15px',
                            padding: '15px',
                            borderBottom: `1px solid ${theme.muted}30`,
                            marginBottom: '10px',
                            fontWeight: 'bold',
                            color: theme.muted,
                        }}>
                            <div>Rank</div>
                            <div>Player</div>
                            <div>XP</div>
                            <div>Rank</div>
                            <div>Level</div>
                            <div>Win Rate</div>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: theme.muted }}>
                                No leaderboard data available
                            </div>
                        ) : (
                            leaderboard.slice(0, 10).map((entry, index) => (
                                <div
                                    key={entry.userId}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '60px 1fr 100px 80px 100px 100px',
                                        gap: '15px',
                                        padding: '15px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        borderRadius: '8px',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        {index < 3 ? (
                                            <div style={{
                                                fontSize: '24px',
                                                color: index === 0 ? '#FFD700' :
                                                    index === 1 ? '#C0C0C0' : '#CD7F32',
                                            }}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                            </div>
                                        ) : (
                                            <span style={{ fontWeight: 'bold' }}>#{index + 1}</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            backgroundColor: theme.accent,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                        }}>
                                            {entry.username.charAt(0).toUpperCase()}
                                        </div>
                                        {entry.username}
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: theme.accent }}>{entry.xp}</div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        fontSize: '18px',
                                        color: theme.positive,
                                    }}>
                                        {entry.rank}
                                    </div>
                                    <div>Lvl {entry.level}</div>
                                    <div style={{
                                        color: entry.winRate >= 50 ? theme.positive : theme.negative,
                                        fontWeight: 'bold',
                                    }}>
                                        {entry.winRate.toFixed(1)}%
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div style={{
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: `1px solid ${theme.muted}30`,
                    textAlign: 'center',
                    color: theme.muted,
                    fontSize: '14px',
                }}>
                    Updated in real-time • Refresh for latest rankings
                </div>
            </div>
        </div>
    );
};

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
                                                           user,
                                                           onPlayBlackjack,
                                                           onPlayPoker,
                                                           onShowLessons,
                                                           onShowGameLobby,
                                                           onShowQRGenerate,
                                                           onLogout,
                                                           theme
                                                       }) => {
    const { userRanking } = useRanking(user.id);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Initialize user stats if they don't exist
    useEffect(() => {
        if (user && user.id) {
            const xp = localStorage.getItem(`user_${user.id}_xp`);
            const games = localStorage.getItem(`user_${user.id}_games`);
            const wins = localStorage.getItem(`user_${user.id}_wins`);
            const lessons = localStorage.getItem(`user_${user.id}_lessons`);

            if (!xp) localStorage.setItem(`user_${user.id}_xp`, '0');
            if (!games) localStorage.setItem(`user_${user.id}_games`, '0');
            if (!wins) localStorage.setItem(`user_${user.id}_wins`, '0');
            if (!lessons) localStorage.setItem(`user_${user.id}_lessons`, '0');
        }
    }, [user]);

    const menuButtons = [
        {
            text: 'EDUCATIONAL LESSONS',
            color: '#9C27B0',
            onClick: onShowLessons,
            icon: '📚',
            description: 'Learn game strategies'
        },
        {
            text: 'GAME LOBBY',
            color: '#FF8C00',
            onClick: onShowGameLobby,
            icon: '🎮',
            description: 'Choose and join game tables'
        },
        {
            text: 'GENERATE QR LOGIN',
            color: '#3399FF',
            onClick: onShowQRGenerate,
            icon: '📱',
            description: 'Generate QR code for quick login'
        },
        {
            text: 'PLAY BLACKJACK',
            color: '#DC143C',
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
            color: '#4CAF50',
            onClick: () => {
                // Show statistics including ranking
                const xp = parseInt(localStorage.getItem(`user_${user.id}_xp`) || '0');
                const gamesPlayed = parseInt(localStorage.getItem(`user_${user.id}_games`) || '0');
                const gamesWon = parseInt(localStorage.getItem(`user_${user.id}_wins`) || '0');
                const lessonsCompleted = parseInt(localStorage.getItem(`user_${user.id}_lessons`) || '0');
                const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : '0.0';

                alert(`📊 Game Statistics:\n\n` +
                    `💰 Balance: $${user.balance?.toFixed(2) || '0.00'}\n` +
                    `⭐ XP: ${xp}\n` +
                    `📈 Level: ${userRanking?.level || 1}\n` +
                    `🏆 Rank: ${userRanking?.rank || '2'}\n` +
                    `📚 Lessons Completed: ${lessonsCompleted}\n\n` +
                    `🎮 Total Games: ${gamesPlayed}\n` +
                    `✅ Wins: ${gamesWon}\n` +
                    `📊 Win Rate: ${winRate}%`);
            },
            icon: '📊',
            description: 'Your gaming stats'
        },
        {
            text: 'GLOBAL LEADERBOARD',
            color: '#FFD700',
            onClick: () => setShowLeaderboard(true),
            icon: '🏆',
            description: 'View global rankings'
        },
        {
            text: 'LOGOUT',
            color: theme.muted,
            onClick: onLogout,
            icon: '🚪',
            description: 'Return to login screen'
        },
    ];

    // Get user stats from localStorage
    const getUserStats = () => {
        const xp = parseInt(localStorage.getItem(`user_${user.id}_xp`) || '0');
        const gamesPlayed = parseInt(localStorage.getItem(`user_${user.id}_games`) || '0');
        const gamesWon = parseInt(localStorage.getItem(`user_${user.id}_wins`) || '0');
        const lessonsCompleted = parseInt(localStorage.getItem(`user_${user.id}_lessons`) || '0');
        const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

        return { xp, gamesPlayed, gamesWon, lessonsCompleted, winRate };
    };

    const stats = getUserStats();

    return (
        <>
            {showLeaderboard && (
                <LeaderboardModal
                    userId={user.id}
                    theme={theme}
                    onClose={() => setShowLeaderboard(false)}
                />
            )}

            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: '20px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header with user info */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    padding: '25px',
                    backgroundColor: theme.panelBg,
                    borderRadius: '16px',
                    border: `2px solid ${theme.accent}30`,
                    position: 'relative',
                }}>
                    <h1 style={{
                        fontSize: '36px',
                        marginBottom: '15px',
                        color: theme.textColor,
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #3399FF, #9C27B0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        🎰 Smart Casino
                    </h1>

                    <div style={{
                        fontSize: '22px',
                        color: '#FFD700',
                        marginBottom: '10px',
                        fontWeight: 'bold'
                    }}>
                        👤 {user.username}
                    </div>

                    <div style={{
                        fontSize: '20px',
                        color: '#00FF00',
                        fontWeight: 'bold',
                        marginBottom: '15px'
                    }}>
                        💰 Balance: ${user.balance?.toFixed(2) || '0.00'}
                    </div>

                    {/* Quick Stats Row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        marginTop: '15px',
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: theme.muted }}>Games</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.gamesPlayed}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: theme.muted }}>Wins</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.positive }}>{stats.gamesWon}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: theme.muted }}>Win Rate</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.positive }}>{stats.winRate.toFixed(1)}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: theme.muted }}>Lessons</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.lessonsCompleted}</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 300px',
                    gap: '30px',
                    flex: 1,
                    marginBottom: '30px'
                }}>
                    {/* Left Column: Menu Buttons */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        {menuButtons.map((button, index) => (
                            <div
                                key={index}
                                style={{
                                    background: `linear-gradient(135deg, ${button.color}, ${button.color}80)`,
                                    color: theme.textColor,
                                    border: 'none',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    opacity: button.text === 'GLOBAL LEADERBOARD' ? 1 : 0.95,
                                }}
                                className="menu-button"
                            >
                                <button
                                    onClick={button.onClick}
                                    style={{
                                        background: 'transparent',
                                        color: 'inherit',
                                        border: 'none',
                                        padding: '25px 30px',
                                        width: '100%',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        const parent = e.currentTarget.parentElement as HTMLElement;
                                        if (parent) {
                                            parent.style.transform = 'translateY(-4px)';
                                            parent.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        const parent = e.currentTarget.parentElement as HTMLElement;
                                        if (parent) {
                                            parent.style.transform = 'translateY(0)';
                                            parent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                        }
                                    }}
                                    aria-label={`${button.text} - ${button.description}`}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <span style={{
                                            fontSize: '30px',
                                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                        }}>
                                            {button.icon}
                                        </span>
                                        <div>
                                            <div style={{
                                                fontSize: '18px',
                                                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                                            }}>
                                                {button.text}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                opacity: 0.9,
                                                marginTop: '5px',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                            }}>
                                                {button.description}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '24px',
                                        opacity: 0.8,
                                        transition: 'transform 0.2s'
                                    }}>
                                        →
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Ranking Display */}
                    <div>
                        <div style={{
                            position: 'sticky',
                            top: '20px',
                        }}>
                            {/* Ranking Display */}
                            {userRanking ? (
                                <RankingDisplay
                                    ranking={userRanking}
                                    theme={theme}
                                    showFullDetails={true}
                                />
                            ) : (
                                <div style={{
                                    backgroundColor: theme.panelBg,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: theme.muted,
                                }}>
                                    Loading ranking...
                                </div>
                            )}

                            {/* XP Progress Section */}
                            <div style={{
                                backgroundColor: theme.panelBg,
                                borderRadius: '12px',
                                padding: '20px',
                                marginTop: '20px',
                            }}>
                                <h3 style={{
                                    marginTop: 0,
                                    marginBottom: '15px',
                                    color: theme.textColor,
                                    textAlign: 'center'
                                }}>
                                    🎯 XP Goals
                                </h3>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '5px',
                                        fontSize: '12px',
                                        color: theme.muted,
                                    }}>
                                        <span>Current Level</span>
                                        <span>{userRanking?.level || 1}</span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        backgroundColor: '#3C3C3C',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '5px',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            backgroundColor: theme.positive,
                                            width: `${(stats.xp % 100)}%`,
                                        }} />
                                    </div>
                                    <div style={{
                                        textAlign: 'center',
                                        fontSize: '12px',
                                        color: theme.muted,
                                    }}>
                                        {100 - (stats.xp % 100)} XP to next level
                                    </div>
                                </div>

                                {/* Daily Challenge */}
                                <div style={{
                                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                    border: `1px solid rgba(255, 215, 0, 0.3)`,
                                    borderRadius: '8px',
                                    padding: '15px',
                                    marginTop: '15px',
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '10px',
                                    }}>
                                        <span style={{ fontSize: '20px' }}>🎯</span>
                                        <strong style={{ color: '#FFD700' }}>Daily Challenge</strong>
                                    </div>
                                    <div style={{ fontSize: '14px', color: theme.muted }}>
                                        Complete 3 games today for 25 bonus XP!
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '10px',
                                        fontSize: '12px',
                                    }}>
                                        <span>Progress: 1/3</span>
                                        <span>+25 XP</span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        backgroundColor: '#3C3C3C',
                                        borderRadius: '3px',
                                        marginTop: '5px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            backgroundColor: '#FFD700',
                                            width: '33%',
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: theme.muted,
                    fontSize: '14px',
                    borderTop: `1px solid ${theme.muted}30`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                }}>
                    <div>Smart Casino - Educational Gaming Platform</div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>Players Online: 1,234</span>
                        <span>Total Games Today: 5,678</span>
                    </div>
                </div>

                {/* Add some CSS for button animations */}
                <style>{`
                    @keyframes buttonPulse {
                        0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
                        70% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
                    }
                    
                    .menu-button:nth-child(7) { /* Leaderboard button */
                        animation: buttonPulse 2s infinite;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    .menu-button {
                        animation: fadeIn 0.5s ease-out;
                        animation-fill-mode: both;
                    }
                    
                    .menu-button:nth-child(1) { animation-delay: 0.1s; }
                    .menu-button:nth-child(2) { animation-delay: 0.2s; }
                    .menu-button:nth-child(3) { animation-delay: 0.3s; }
                    .menu-button:nth-child(4) { animation-delay: 0.4s; }
                    .menu-button:nth-child(5) { animation-delay: 0.5s; }
                    .menu-button:nth-child(6) { animation-delay: 0.6s; }
                    .menu-button:nth-child(7) { animation-delay: 0.7s; }
                    .menu-button:nth-child(8) { animation-delay: 0.8s; }
                `}</style>
            </div>
        </>
    );
};

export default MainMenuScreen;