import { useState, useCallback, useMemo } from 'react';
import type { User, Card, Theme } from '../types';

interface BlackjackGameProps {
    user: User;
    onBack: () => void;
    theme: Theme;
}

const BlackjackGame: React.FC<BlackjackGameProps> = ({ user, onBack, theme }) => {
    const [balance, setBalance] = useState<number>(user.balance ?? 1000);
    const [betAmount, setBetAmount] = useState<string>('25');
    const [gameState, setGameState] = useState<'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'GAME_OVER'>('BETTING');
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [feedback, setFeedback] = useState<string>('Place your bet to start the game.');
    const [handAnalysis, setHandAnalysis] = useState<string>('Bust: --% | Win: --% | Push: --% | BJ: --%');
    const [deck, setDeck] = useState<Card[]>([]);

    /* ============================================================
       Helper Functions (Memoized)
    ============================================================ */
    const calculateHandValue = useCallback((hand: Card[]): number => {
        let value = 0;
        let aces = 0;

        for (const card of hand) {
            if (card.rank === 'ACE') {
                aces++;
                value += 11;
            } else if (['KING', 'QUEEN', 'JACK'].includes(card.rank)) {
                value += 10;
            } else {
                value += Number(card.rank) || 0;
            }
        }

        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }, []);

    const initializeDeck = useCallback((): Card[] => {
        const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] as const;
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'] as const;
        const deck: Card[] = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({
                    suit,
                    rank,
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

    const drawCard = useCallback((faceUp: boolean = true): Card => {
        setDeck(prev => {
            if (prev.length === 0) {
                return initializeDeck();
            }
            return prev;
        });

        if (deck.length === 0) {
            const newDeck = initializeDeck();
            setDeck(newDeck.slice(1));
            return { ...newDeck[0], faceUp };
        }

        const card = deck[0];
        setDeck(prev => prev.slice(1));
        return { ...card, faceUp };
    }, [deck, initializeDeck]);

    /* ============================================================
       Game Flow
    ============================================================ */
    const initializeGame = useCallback(() => {
        const newDeck = initializeDeck();
        setDeck(newDeck.slice(4)); // Remove first 4 cards

        const playerCards = [newDeck[0], newDeck[2]];
        const dealerCards = [newDeck[1], { ...newDeck[3], faceUp: false }];

        setPlayerHand(playerCards);
        setDealerHand(dealerCards);

        setGameState('PLAYER_TURN');
        //updateAnalysis(playerCards);
    }, [initializeDeck]);

    const placeBet = () => {
        const amount = Number(betAmount);
        if (isNaN(amount) || amount <= 0 || amount > balance) {
            setFeedback('Invalid bet amount');
            return;
        }

        setBalance(prev => prev - amount);
        initializeGame();
        setFeedback('Your turn - Hit or Stand?');
    };

    const playerHit = () => {
        const newCard = drawCard();
        const newHand = [...playerHand, newCard];
        setPlayerHand(newHand);

        const value = calculateHandValue(newHand);
        if (value > 21) {
            setGameState('GAME_OVER');
            setFeedback('Bust! You lose.');
            setHandAnalysis('Hand completed - Bust');
        } else {
            updateAnalysis(newHand);
        }
    };

    const handleDealerTurn = useCallback((currentPlayerHand: Card[], currentDealerHand?: Card[]) => {
        setGameState('DEALER_TURN');

        const revealed = (currentDealerHand ?? dealerHand).map(card => ({ ...card, faceUp: true }));
        setDealerHand(revealed);

        setTimeout(() => {
            const hand = [...revealed];
            let value = calculateHandValue(hand);

            while (value < 17) {
                const newCard = drawCard();
                hand.push(newCard);
                value = calculateHandValue(hand);
            }

            setDealerHand(hand);

            const pVal = calculateHandValue(currentPlayerHand);
            const amount = Number(betAmount);

            if (value > 21) {
                setFeedback('Dealer busts! You win!');
                setBalance(prev => prev + amount * 2);
            } else if (pVal > value) {
                setFeedback('You win!');
                setBalance(prev => prev + amount * 2);
            } else if (value > pVal) {
                setFeedback('Dealer wins.');
            } else {
                setFeedback('Push — bet returned.');
                setBalance(prev => prev + amount);
            }

            setGameState('GAME_OVER');
        }, 900);
    }, [dealerHand, betAmount, calculateHandValue, drawCard]);

    const playerStand = () => {
        handleDealerTurn(playerHand);
    };

    const playerDouble = () => {
        const amount = Number(betAmount);
        if (balance < amount || playerHand.length !== 2) return;

        setBalance(prev => prev - amount);

        const newCard = drawCard();
        const newHand = [...playerHand, newCard];
        setPlayerHand(newHand);

        if (calculateHandValue(newHand) > 21) {
            setGameState('GAME_OVER');
            setFeedback('Bust! You lose.');
            setHandAnalysis('Hand completed - Bust');
            return;
        }

        handleDealerTurn(newHand);
    };

    const startNewGame = () => {
        setGameState('BETTING');
        setPlayerHand([]);
        setDealerHand([]);
        setFeedback('Place your bet to start the game.');
        setHandAnalysis('Bust: --% | Win: --% | Push: --% | BJ: --%');
        setDeck([]);
    };

    /* ============================================================
       Hand Analysis (improved)
    ============================================================ */
    const updateAnalysis = useCallback((player: Card[]) => {
        const pVal = calculateHandValue(player);

        let bustChance = 0;
        if (pVal >= 12 && pVal <= 20) {
            bustChance = (pVal - 11) * 8.33; // More accurate percentages
        } else if (pVal > 20) {
            bustChance = 100;
        } else if (pVal <= 11) {
            bustChance = 0;
        }

        const winChance = Math.max(0, 100 - bustChance - 25);
        const pushChance = 8;
        const bj = player.length === 2 && pVal === 21 ? 100 : 0;

        setHandAnalysis(`Bust: ${Math.round(bustChance)}% | Win: ${Math.round(winChance)}% | Push: ${pushChance}% | BJ: ${bj}%`);
    }, [calculateHandValue]);

    /* ============================================================
       UI Helpers
    ============================================================ */
    const renderCard = useCallback((card: Card, index: number) => {
        const suits: Record<Card['suit'], string> = {
            HEARTS: '♥',
            DIAMONDS: '♦',
            CLUBS: '♣',
            SPADES: '♠',
        };

        const rankMap: Record<string, string> = {
            ACE: 'A',
            KING: 'K',
            QUEEN: 'Q',
            JACK: 'J',
        };

        const rankDisplay = rankMap[card.rank] ?? card.rank;
        const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';

        return (
            <div
                key={`${card.suit}-${card.rank}-${index}`}
                style={{
                    width: 'clamp(60px, 10vw, 80px)',
                    height: 'clamp(90px, 15vw, 120px)',
                    backgroundColor: card.faceUp ? theme.cardBg ?? '#FFF' : '#2A4AA0',
                    border: '2px solid #666',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 5px',
                    color: card.faceUp ? (isRed ? '#FF0000' : '#000') : '#FFF',
                    fontWeight: 'bold',
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
                aria-label={`${card.faceUp ? `${rankDisplay} of ${card.suit.toLowerCase()}` : 'Face down card'}`}
            >
                {card.faceUp ? (
                    <>
                        <div style={{ fontSize: 'clamp(18px, 3vw, 24px)' }}>{rankDisplay}</div>
                        <div style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}>{suits[card.suit]}</div>
                    </>
                ) : (
                    <div style={{ fontSize: 'clamp(14px, 2vw, 20px)' }}>♠♥♦♣</div>
                )}
            </div>
        );
    }, [theme]);

    /* ============================================================
       Memoized Calculations
    ============================================================ */
    const playerValue = useMemo(() => calculateHandValue(playerHand), [playerHand, calculateHandValue]);
    const dealerValue = useMemo(() => calculateHandValue(dealerHand.filter(c => c.faceUp)), [dealerHand, calculateHandValue]);

    return (
        <div style={{ backgroundColor: theme.bgDark, color: theme.textColor, minHeight: '100vh', padding: '20px' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h1 style={{ margin: 0 }}>Blackjack</h1>
                <div style={{ textAlign: 'right' }}>
                    <div><strong>{user.username}</strong></div>
                    <div style={{ color: theme.positive ?? '#0F0', fontSize: '18px', fontWeight: 'bold' }}>
                        ${balance.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* HANDS */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '10px' }}>Dealer — {dealerValue}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {dealerHand.map(renderCard)}
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '10px' }}>Your Hand — {playerValue}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {playerHand.map(renderCard)}
                </div>
            </div>

            {/* FEEDBACK */}
            <div style={{
                margin: '20px auto',
                maxWidth: '600px',
                padding: '15px',
                backgroundColor: theme.panelBg,
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '18px', color: '#FFD700', marginBottom: '10px' }}>{feedback}</div>
                <div style={{ color: '#AAA', fontSize: '14px' }}>{handAnalysis}</div>
            </div>

            {/* CONTROLS */}
            <div style={{
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap'
            }}>
                {gameState === 'BETTING' && (
                    <>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={e => setBetAmount(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{
                                width: '80px',
                                padding: '8px',
                                backgroundColor: '#3C3C3C',
                                color: theme.textColor,
                                border: `1px solid ${theme.muted}`,
                                borderRadius: '4px'
                            }}
                            aria-label="Bet amount"
                            min="1"
                            max={balance}
                        />
                        <button
                            onClick={placeBet}
                            style={{
                                backgroundColor: theme.positive,
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Place Bet
                        </button>
                    </>
                )}

                {gameState === 'PLAYER_TURN' && (
                    <>
                        <button
                            onClick={playerHit}
                            style={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            aria-label="Hit - take another card"
                        >
                            Hit (H)
                        </button>
                        <button
                            onClick={playerStand}
                            style={{
                                backgroundColor: theme.positive,
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            aria-label="Stand - keep current hand"
                        >
                            Stand (S)
                        </button>
                        <button
                            onClick={playerDouble}
                            style={{
                                backgroundColor: '#FF8C00',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            aria-label="Double down - double your bet and take one card"
                        >
                            Double (D)
                        </button>
                    </>
                )}

                {gameState === 'GAME_OVER' && (
                    <button
                        onClick={startNewGame}
                        style={{
                            backgroundColor: theme.accent,
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        New Game
                    </button>
                )}

                <button
                    onClick={onBack}
                    style={{
                        backgroundColor: theme.muted,
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Back to Menu
                </button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                fontSize: '12px',
                textAlign: 'center',
                color: '#AAA'
            }}>
                <div>Keyboard Shortcuts: H = Hit, S = Stand, D = Double</div>
                <div>Cards remaining in deck: {deck.length}</div>
            </div>
        </div>
    );
};

export default BlackjackGame;