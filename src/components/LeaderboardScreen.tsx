// src/components/LeaderboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { useRanking } from '../hooks/useRanking';
import { Theme, LeaderboardEntry } from '../types';

interface LeaderboardScreenProps {
    userId: number;
    theme: Theme;
    onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ userId, theme, onBack }) => {
    const { leaderboard, userRanking, fetchLeaderboard, isLoading } = useRanking(userId);
    const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');
    const [gameType, setGameType] = useState<'all' | 'blackjack' | 'poker'>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchLeaderboard(itemsPerPage, currentPage * itemsPerPage);
    }, [currentPage, fetchLeaderboard]);

    const getRankIcon = (position: number) => {
        switch (position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${position}`;
        }
    };

    const getRankColor = (position: number) => {
        switch (position) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return theme.textColor;
        }
    };

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh',
            backgroundColor: theme.bgDark,
            color: theme.textColor,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
            }}>
                <h1 style={{ fontSize: '32px', color: theme.accent }}>🏆 Leaderboard</h1>
                <button
                    onClick={onBack}
                    style={{
                        backgroundColor: theme.muted,
                        color: theme.textColor,
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    ← Back
                </button>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '30px',
                backgroundColor: theme.panelBg,
                padding: '15px',
                borderRadius: '10px',
            }}>
                <div>
                    <label style={{ marginRight: '10px', color: theme.muted }}>Timeframe:</label>
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as never)}
                        style={{
                            backgroundColor: theme.bgDark,
                            color: theme.textColor,
                            border: `1px solid ${theme.accent}`,
                            padding: '8px 12px',
                            borderRadius: '6px',
                        }}
                    >
                        <option value="all">All Time</option>
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                    </select>
                </div>

                <div>
                    <label style={{ marginRight: '10px', color: theme.muted }}>Game:</label>
                    <select
                        value={gameType}
                        onChange={(e) => setGameType(e.target.value as never)}
                        style={{
                            backgroundColor: theme.bgDark,
                            color: theme.textColor,
                            border: `1px solid ${theme.accent}`,
                            padding: '8px 12px',
                            borderRadius: '6px',
                        }}
                    >
                        <option value="all">All Games</option>
                        <option value="blackjack">Blackjack</option>
                        <option value="poker">Poker</option>
                    </select>
                </div>
            </div>

            {/* User's Ranking Card */}
            {userRanking && (
                <div style={{
                    backgroundColor: theme.panelBg,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '30px',
                    border: `2px solid ${theme.accent}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            backgroundColor: theme.accent,
                            color: 'white',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                        }}>
                            {userRanking.rank}
                        </div>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Your Position</div>
                            <div style={{ color: theme.muted }}>
                                Rank: {userRanking.rank} | Level: {userRanking.level} | XP: {userRanking.xp}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>Win Rate: <strong style={{ color: theme.positive }}>{userRanking.winRate.toFixed(1)}%</strong></div>
                        <div>Games: {userRanking.gamesPlayed}</div>
                        <div>Lessons: {userRanking.lessonsCompleted}</div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div style={{
                backgroundColor: theme.panelBg,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 100px 100px 100px 100px 100px',
                    gap: '1px',
                    backgroundColor: theme.muted + '30',
                }}>
                    {/* Header */}
                    <div style={{ padding: '15px', backgroundColor: theme.bgDark, fontWeight: 'bold' }}>Rank</div>
                    <div style={{ padding: '15px', backgroundColor: theme.bgDark, fontWeight: 'bold' }}>Player</div>
                    <div style={{ padding: '15px', backgroundColor: theme.bgDark, fontWeight: 'bold' }}>XP</div>
                    <div style={{ padding: '15px', backgroundColor: theme.bgDark, fontWeight: 'bold' }}>Rank</div>
                    <div style={{ padding: '15px', backgroundColor: theme.bgDark, fontWeight: 'bold' }}>Level</div>
                    <div style={{ padding: '15px', backgroundColor: theme.bgDark, fontWeight: 'bold' }}>Games</div>
                    <div style={{ padding: '15px', backgroundColor: theme.bgDark, fontWeight: 'bold' }}>Win Rate</div>

                    {/* Rows */}
                    {isLoading ? (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: theme.muted }}>
                            Loading leaderboard...
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: theme.muted }}>
                            No leaderboard data available
                        </div>
                    ) : (
                        leaderboard.map((entry: LeaderboardEntry) => (
                            <React.Fragment key={entry.userId}>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: theme.panelBg,
                                    fontWeight: 'bold',
                                    color: getRankColor(entry.position),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}>
                                    <span style={{ fontSize: '20px' }}>{getRankIcon(entry.position)}</span>
                                    {entry.position}
                                </div>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: theme.panelBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: theme.accent,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                    }}>
                                        {entry.username.charAt(0).toUpperCase()}
                                    </div>
                                    {entry.username}
                                </div>
                                <div style={{ padding: '15px', backgroundColor: theme.panelBg }}>{entry.xp}</div>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: theme.panelBg,
                                    fontWeight: 'bold',
                                    color: theme.accent,
                                }}>
                                    {entry.rank}
                                </div>
                                <div style={{ padding: '15px', backgroundColor: theme.panelBg }}>{entry.level}</div>
                                <div style={{ padding: '15px', backgroundColor: theme.panelBg }}>{entry.gamesPlayed}</div>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: theme.panelBg,
                                    color: entry.winRate >= 50 ? theme.positive : theme.negative,
                                    fontWeight: 'bold',
                                }}>
                                    {entry.winRate.toFixed(1)}%
                                </div>
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '30px',
            }}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    style={{
                        backgroundColor: theme.muted,
                        color: theme.textColor,
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 0 ? 0.5 : 1,
                    }}
                >
                    ← Previous
                </button>
                <span style={{ color: theme.muted }}>Page {currentPage + 1}</span>
                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={{
                        backgroundColor: theme.accent,
                        color: theme.textColor,
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }}
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default LeaderboardScreen;