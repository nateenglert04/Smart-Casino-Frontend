// src/components/RankingDisplay.tsx
import React from 'react';
import { UserRanking, Theme } from '../types';

interface RankingDisplayProps {
    ranking: UserRanking;
    theme: Theme;
    showFullDetails?: boolean;
}

const RankingDisplay: React.FC<RankingDisplayProps> = ({
                                                           ranking,
                                                           theme,
                                                           showFullDetails = false,
                                                       }) => {
    const { rank, level, xp, rankProgress } = ranking;

    const getRankColor = (rank: string) => {
        const rankColors: Record<string, string> = {
            '2': '#C0C0C0', // Silver
            '3': '#CD7F32', // Bronze
            '4': '#CD7F32',
            '5': '#CD7F32',
            '6': '#FFD700', // Gold
            '7': '#FFD700',
            '8': '#FFD700',
            '9': '#E5E4E2', // Platinum
            '10': '#E5E4E2',
            'J': '#B9F2FF', // Diamond (Jack)
            'Q': '#B9F2FF', // Diamond (Queen)
            'K': '#FFD700', // King Gold
            'A': '#FF0000', // Ace Red
        };
        return rankColors[rank] || theme.accent;
    };

    return (
        <div style={{
            backgroundColor: theme.panelBg,
            borderRadius: '12px',
            padding: '20px',
            border: `2px solid ${getRankColor(rank)}`,
            boxShadow: `0 0 15px ${getRankColor(rank)}50`,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: showFullDetails ? '20px' : '10px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: getRankColor(rank),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#000',
                        border: '3px solid white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    }}>
                        {rank}
                    </div>

                    <div>
                        <div style={{ fontSize: '14px', color: theme.muted }}>Rank</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.textColor }}>
                            {rank === 'A' ? 'ACE' :
                                rank === 'K' ? 'KING' :
                                    rank === 'Q' ? 'QUEEN' :
                                        rank === 'J' ? 'JACK' :
                                            `Rank ${rank}`}
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: theme.muted }}>Level</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.positive }}>
                        {level}
                    </div>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '5px',
                    fontSize: '12px',
                    color: theme.muted,
                }}>
                    <span>XP: {xp}</span>
                    <span>Next Rank: {rankProgress.nextRank}</span>
                </div>

                <div style={{
                    height: '10px',
                    backgroundColor: '#3C3C3C',
                    borderRadius: '5px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: getRankColor(rank),
                        width: `${rankProgress.progressPercentage}%`,
                        transition: 'width 0.5s ease',
                    }} />
                </div>

                <div style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: theme.muted,
                    marginTop: '5px',
                }}>
                    {rankProgress.xpToNextRank} XP needed for next rank
                </div>
            </div>

            {/* Detailed Stats (if showFullDetails) */}
            {showFullDetails && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '10px',
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: `1px solid ${theme.muted}30`,
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: theme.muted }}>Games Played</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{ranking.gamesPlayed}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: theme.muted }}>Win Rate</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.positive }}>
                            {ranking.winRate.toFixed(1)}%
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: theme.muted }}>Lessons</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{ranking.lessonsCompleted}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingDisplay;