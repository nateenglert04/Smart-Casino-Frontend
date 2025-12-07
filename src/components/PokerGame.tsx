// components/PokerGame.tsx
import { useState, useCallback, useMemo } from 'react';
import type { User, Theme, Card } from '../types';

interface PokerGameProps {
    user: User;
    onBack: () => void;
    theme: Theme;
}

const PokerGame: React.FC<PokerGameProps> = ({
                                                 user,
                                                 onBack,
                                                 theme
                                             }) => {
    const [balance, setBalance] = useState(user.balance || 1000);
    const [pot, setPot] = useState(0);
    const [gameState, setGameState] = useState<'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN' | 'FOLDED'>('PRE_FLOP');
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [communityCards, setCommunityCards] = useState<Card[]>([]);
    const [feedback, setFeedback] = useState('Analyze your hand and position');
    const [raiseAmount, setRaiseAmount] = useState('50');

    const initializeDeck = useCallback((): Card[] => {
        const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] as const;
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'] as const;
        const deck: Card[] = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                let value = 0;
                if (rank === 'ACE') value = 14;
                else if (rank === 'KING') value = 13;
                else if (rank === 'QUEEN') value = 12;
                else if (rank === 'JACK') value = 11;
                else value = parseInt(rank);

                deck.push({
                    suit,
                    rank,
                    value,
                    faceUp: true
                });
            }
        }

        // Shuffle deck
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }, []);

    const startNewHand = () => {
        const deck = initializeDeck();

        // Draw player hand (2 cards)
        const playerCards: Card[] = [
            { ...deck[0], faceUp: true },
            { ...deck[1], faceUp: true }
        ];

        // Draw community cards (5 cards, first 3 face up)
        const community: Card[] = [
            { ...deck[2], faceUp: true },
            { ...deck[3], faceUp: true },
            { ...deck[4], faceUp: true },
            { ...deck[5], faceUp: false },
            { ...deck[6], faceUp: false }
        ];

        setPlayerHand(playerCards);
        setCommunityCards(community);
        setPot(100);
        setGameState('FLOP');
        setFeedback('Good starting hand - consider raising');
    };

    const playerFold = () => {
        setGameState('FOLDED');
        setFeedback('You folded - start new hand');
    };

    const playerCheckCall = () => {
        const callAmount = 25;
        if (balance >= callAmount) {
            setBalance(prev => prev - callAmount);
            setPot(prev => prev + callAmount);
            advanceGameState();
        }
    };

    const playerRaise = () => {
        const amount = parseFloat(raiseAmount);
        if (!isNaN(amount) && amount > 0 && balance >= amount) {
            setBalance(prev => prev - amount);
            setPot(prev => prev + amount);
            advanceGameState();
        }
    };

    const advanceGameState = () => {
        const states: Array<typeof gameState> = ['PRE_FLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'];
        const currentIndex = states.indexOf(gameState);

        if (currentIndex < states.length - 1) {
            const newState = states[currentIndex + 1];
            setGameState(newState);

            // Reveal community cards as game progresses
            if (newState === 'TURN') {
                setCommunityCards(prev => prev.map((card, i) =>
                    i === 3 ? { ...card, faceUp: true } : card
                ));
                setFeedback('Turn card revealed - assess your odds');
            } else if (newState === 'RIVER') {
                setCommunityCards(prev => prev.map((card, i) =>
                    i === 4 ? { ...card, faceUp: true } : card
                ));
                setFeedback('River card revealed - final betting round');
            } else if (newState === 'SHOWDOWN') {
                setFeedback('Showdown! Comparing hands...');
                // Simulate win
                setTimeout(() => {
                    setBalance(prev => prev + pot * 2);
                    setFeedback(`You win! +$${(pot * 2).toFixed(2)}`);
                }, 1000);
            }
        }
    };

    const renderCard = useCallback((card: Card, index: number) => {
        const suitSymbols = {
            HEARTS: '♥',
            DIAMONDS: '♦',
            CLUBS: '♣',
            SPADES: '♠'
        };

        const rankDisplay = card.rank === '10' ? '10' : card.rank[0];
        const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';

        return (
            <div
                key={`${card.suit}-${card.rank}-${index}`}
                style={{
                    width: 'clamp(60px, 10vw, 80px)',
                    height: 'clamp(90px, 15vw, 120px)',
                    backgroundColor: card.faceUp ? '#FFFFFF' : '#2A4AA0',
                    border: '1px solid #666',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 5px',
                    color: card.faceUp ? (isRed ? '#FF0000' : '#000000') : '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: card.faceUp ? 'clamp(16px, 2vw, 20px)' : 'clamp(12px, 1.5vw, 16px)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
                aria-label={card.faceUp ? `${rankDisplay} of ${card.suit.toLowerCase()}` : 'Face down card'}
            >
                {card.faceUp ? (
                    <>
                        <div>{rankDisplay}</div>
                        <div style={{ fontSize: 'clamp(24px, 3vw, 30px)' }}>{suitSymbols[card.suit]}</div>
                    </>
                ) : (
                    <div>♠♥♦♣</div>
                )}
            </div>
        );
    }, []);

    const gameStageInfo = useMemo(() => {
        switch (gameState) {
            case 'PRE_FLOP': return { text: 'Pre-Flop', color: '#FF6B6B' };
            case 'FLOP': return { text: 'Flop', color: '#4ECDC4' };
            case 'TURN': return { text: 'Turn', color: '#FFD166' };
            case 'RIVER': return { text: 'River', color: '#06D6A0' };
            case 'SHOWDOWN': return { text: 'Showdown', color: '#118AB2' };
            case 'FOLDED': return { text: 'Folded', color: '#EF476F' };
            default: return { text: 'Unknown', color: '#999' };
        }
    }, [gameState]);

    return (
        <div style={{
            backgroundColor: theme.bgDark,
            color: theme.textColor,
            minHeight: '100vh',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Game Info Panel */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                padding: '20px',
                backgroundColor: theme.panelBg,
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#CCCCCC' }}>POT</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD700' }}>
                        ${pot.toFixed(2)}
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#CCCCCC' }}>STATUS</div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: gameStageInfo.color
                    }}>
                        {gameStageInfo.text}
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#CCCCCC' }}>BALANCE</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00FF00' }}>
                        ${balance.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Game Analysis Panels */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #666',
                    borderRadius: '8px',
                    padding: '15px'
                }}>
                    <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '5px' }}>
                        Hand Analysis
                    </div>
                    <div style={{ fontSize: '14px', color: '#FFD700' }}>
                        Strength: 85% | Win: 65% | Improve: 35%
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #666',
                    borderRadius: '8px',
                    padding: '15px'
                }}>
                    <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '5px' }}>
                        Strategy & EV
                    </div>
                    <div style={{ fontSize: '14px', color: '#00FFFF' }}>
                        Call: +$12.50 | Raise: +$8.75
                    </div>
                    <div style={{ fontSize: '14px', color: '#FFA500', fontStyle: 'italic', marginTop: '5px' }}>
                        {feedback}
                    </div>
                </div>
            </div>

            {/* Card Areas */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '20px' }}>
                {/* Community Cards */}
                <div style={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #666',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '15px', color: '#FFFFFF' }}>
                        Community Cards
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {communityCards.map((card, index) => renderCard(card, index))}
                    </div>
                </div>

                {/* Player's Hand */}
                <div style={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #666',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '15px', color: '#FFFFFF' }}>
                        Your Hand
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {playerHand.map((card, index) => renderCard(card, index))}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '15px',
                padding: '20px 0'
            }}>
                {/* Left Side - Action Controls */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={playerFold}
                        disabled={gameState === 'FOLDED' || gameState === 'SHOWDOWN'}
                        style={{
                            backgroundColor: theme.negative,
                            color: theme.textColor,
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            minWidth: '100px'
                        }}
                        aria-label="Fold - surrender the hand"
                    >
                        Fold
                    </button>

                    <button
                        onClick={playerCheckCall}
                        disabled={gameState === 'FOLDED' || gameState === 'SHOWDOWN'}
                        style={{
                            backgroundColor: theme.accent,
                            color: theme.textColor,
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            minWidth: '140px'
                        }}
                        aria-label="Check or Call - match current bet"
                    >
                        Check/Call $25
                    </button>

                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>Raise: $</span>
                        <input
                            type="text"
                            value={raiseAmount}
                            onChange={(e) => setRaiseAmount(e.target.value)}
                            disabled={gameState === 'FOLDED' || gameState === 'SHOWDOWN'}
                            style={{
                                width: '60px',
                                padding: '8px',
                                backgroundColor: '#3C3C3C',
                                color: theme.textColor,
                                border: `1px solid ${theme.muted}`,
                                borderRadius: '6px'
                            }}
                            aria-label="Raise amount"
                        />
                        <button
                            onClick={playerRaise}
                            disabled={gameState === 'FOLDED' || gameState === 'SHOWDOWN'}
                            style={{
                                backgroundColor: theme.positive,
                                color: theme.textColor,
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            aria-label="Raise - increase the bet"
                        >
                            Raise
                        </button>
                    </div>
                </div>

                {/* Right Side - Game Controls */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                        onClick={startNewHand}
                        style={{
                            backgroundColor: theme.positive,
                            color: theme.textColor,
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                        aria-label="Start new poker hand"
                    >
                        New Hand
                    </button>

                    <button
                        onClick={onBack}
                        style={{
                            backgroundColor: theme.muted,
                            color: theme.textColor,
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PokerGame;