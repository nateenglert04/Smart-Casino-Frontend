import React, { useState, useEffect } from 'react';
import type {
    User,
    Theme,
    Card,
    BlackjackGameState,
    Probabilities,
    BlackjackStats
} from '../types';
import { useRanking } from '../hooks/useRanking';

interface BlackjackGameProps {
    user: User;
    onBack: () => void;
    theme: Theme;
}

// Helper function to calculate hand value (moved outside component for reuse)
const calculateHandValue = (hand: Card[]): number => {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
        if (card.rank === 'A') {
            aces++;
            value += 11;
        } else if (['K', 'Q', 'J', '10'].includes(card.rank)) {
            value += 10;
        } else {
            value += parseInt(card.rank) || 0;
        }
    });

    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
};

// Helper function for bust probability calculation
const calculateBustProbability = (currentValue: number): number => {
    if (currentValue <= 11) return 0.0;
    if (currentValue >= 17) return 100.0;
    return (currentValue - 11) * 15.0;
};

// Helper function for win probability calculation
const calculateWinProbability = (playerValue: number, dealerUpCard: number): number => {
    let baseWinRate = 42.0;

    // Adjust based on player hand strength
    if (playerValue >= 19) baseWinRate += 20;
    else if (playerValue >= 17) baseWinRate += 10;
    else if (playerValue <= 12) baseWinRate -= 15;

    // Adjust based on dealer up card
    if (dealerUpCard >= 7) baseWinRate -= 10;
    else if (dealerUpCard <= 6) baseWinRate += 8;

    return Math.max(5, Math.min(95, baseWinRate));
};

// Random card generation functions
const generateRandomCard = (): Card => {
    const suits: Array<Card['suit']> = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];

    let value = 0;
    if (rank === 'A') {
        value = 11;
    } else if (['K', 'Q', 'J'].includes(rank)) {
        value = 10;
    } else {
        value = parseInt(rank);
    }

    return {
        suit,
        rank,
        value,
        faceUp: true
    };
};

const generateRandomHand = (): Card[] => {
    return [generateRandomCard(), generateRandomCard()];
};

const generateRandomDealerHand = (): Card[] => {
    const hand = [generateRandomCard(), generateRandomCard()];
    // First dealer card face up, second face down
    if (hand.length > 1) {
        hand[1].faceUp = false;
    }
    return hand;
};

// Mock API calls - replace with actual API integration
const blackjackApi = {
    async startGame(_userId: number, betAmount: number) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/blackjack/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ betAmount }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Ensure all required fields are present
            return {
                gameId: data.gameId || Date.now(),
                playerHand: data.playerHand || [],
                dealerHand: data.dealerHand || [],
                playerValue: data.playerValue || 0,
                dealerUpCardValue: data.dealerUpCardValue || 0,
                gameState: data.gameState || 'IN_PROGRESS',
                betAmount: data.betAmount || betAmount,
                remainingBalance: data.remainingBalance || 0,
                feedback: data.feedback || 'Game started successfully.',
                probabilities: data.probabilities || {
                    bustIfHit: 0,
                    winChance: 0,
                    pushChance: 0
                },
                blackjack: data.blackjack || false
            };
        } catch (error) {
            console.error('Error starting game:', error);

            // Generate random cards for fallback mode
            const playerHand = generateRandomHand();
            const dealerHand = generateRandomDealerHand();
            const playerValue = calculateHandValue(playerHand);
            const dealerUpCardValue = dealerHand[0]?.value || 0;
            const balance = parseInt(localStorage.getItem('userBalance') || '1000');

            return {
                gameId: Date.now(),
                playerHand: playerHand,
                dealerHand: dealerHand,
                playerValue: playerValue,
                dealerUpCardValue: dealerUpCardValue,
                gameState: 'IN_PROGRESS',
                betAmount: betAmount,
                remainingBalance: balance - betAmount,
                feedback: `Game started with ${playerValue}. The dealer shows ${dealerHand[0]?.rank || '?'}.`,
                probabilities: {
                    bustIfHit: calculateBustProbability(playerValue),
                    winChance: calculateWinProbability(playerValue, dealerUpCardValue),
                    pushChance: 0.15
                },
                blackjack: playerValue === 21 && playerHand.length === 2,
                isFallback: true
            };
        }
    },

    async hit(gameId: number) {
        try {
            const response = await fetch(`/api/blackjack/${gameId}/hit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();

            // Ensure the response has the expected structure
            return {
                playerHand: data.playerHand || [],
                playerValue: data.playerValue || 0,
                gameState: data.gameState || 'IN_PROGRESS',
                feedback: data.feedback || 'You took a card.',
                remainingBalance: data.remainingBalance || data.newBalance || 0,
                probabilities: data.probabilities || {
                    bustIfHit: 0,
                    winChance: 0,
                    pushChance: 0
                }
            };
        } catch (error) {
            console.error('Error hitting:', error);
            return mockHit();
        }
    },

    async stand(gameId: number) {
        try {
            const response = await fetch(`/api/blackjack/${gameId}/stand`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();

            return {
                playerHand: data.playerHand || [],
                dealerHand: data.dealerHand || [],
                playerValue: data.playerValue || 0,
                dealerValue: data.dealerValue || 0,
                gameState: data.gameState || 'GAME_OVER',
                result: data.result || 'LOST',
                winnings: data.winnings || 0,
                newBalance: data.newBalance || data.remainingBalance || 0,
                feedback: data.feedback || 'Game ended.',
                xpAwarded: data.xpAwarded || 0
            };
        } catch (error) {
            console.error('Error standing:', error);
            return mockStand();
        }
    },

    async double(gameId: number) {
        try {
            const response = await fetch(`/api/blackjack/${gameId}/double`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();

            return {
                playerHand: data.playerHand || [],
                dealerHand: data.dealerHand || [],
                playerValue: data.playerValue || 0,
                dealerValue: data.dealerValue || 0,
                gameState: data.gameState || 'GAME_OVER',
                result: data.result || 'LOST',
                winnings: data.winnings || 0,
                newBalance: data.newBalance || data.remainingBalance || 0,
                feedback: data.feedback || 'Doubled down.',
                xpAwarded: data.xpAwarded || 0
            };
        } catch (error) {
            console.error('Error doubling:', error);
            return mockDouble();
        }
    },

    async getAdvice(gameId: number) {
        try {
            const response = await fetch(`/api/blackjack/${gameId}/advice`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting advice:', error);
            return mockAdvice();
        }
    },

    async getStats() {
        try {
            const response = await fetch('/api/blackjack/stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting stats:', error);
            return mockStats();
        }
    }
};

// Mock functions for offline play - updated with random cards
const mockHit = () => {
    // Generate a random card to add to player's hand
    const newCard = generateRandomCard();

    // Simulate having at least 2 cards already
    const currentHand = [generateRandomCard(), generateRandomCard()];
    const newHand = [...currentHand, newCard];
    const newPlayerValue = calculateHandValue(newHand);
    const bust = newPlayerValue > 21;

    return {
        playerHand: newHand,
        playerValue: newPlayerValue,
        gameState: bust ? 'GAME_OVER' : 'IN_PROGRESS',
        feedback: bust ? `You busted with ${newPlayerValue}! Remember: always stand on 17 or higher against a dealer 10.`
            : `You drew a ${newCard.rank} of ${newCard.suit}. Total: ${newPlayerValue}`,
        remainingBalance: 950,
        probabilities: {
            bustIfHit: calculateBustProbability(newPlayerValue),
            winChance: calculateWinProbability(newPlayerValue, 10), // Dealer shows 10
            pushChance: 0.15
        }
    };
};

const mockStand = () => {
    const playerHand = [generateRandomCard(), generateRandomCard()];
    const dealerHand = [generateRandomCard(), generateRandomCard()];

    // Reveal dealer's cards
    dealerHand.forEach(card => card.faceUp = true);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    let result = 'LOST';
    if (dealerValue > 21 || playerValue > dealerValue) {
        result = 'WON';
    } else if (playerValue === dealerValue) {
        result = 'PUSH';
    }

    return {
        playerHand: playerHand,
        dealerHand: dealerHand,
        playerValue: playerValue,
        dealerValue: dealerValue,
        gameState: 'GAME_OVER',
        result: result,
        winnings: result === 'WON' ? 50 : result === 'PUSH' ? 25 : 0,
        newBalance: result === 'WON' ? 1050 : result === 'PUSH' ? 1000 : 950,
        feedback: `Dealer had ${dealerValue}. ${result === 'WON' ? 'You win!' : result === 'PUSH' ? 'Push!' : 'You lose.'}`,
        xpAwarded: 2
    };
};

const mockDouble = () => {
    const playerHand = [generateRandomCard(), generateRandomCard(), generateRandomCard()];
    const dealerHand = [generateRandomCard(), generateRandomCard()];

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    let result = 'LOST';
    if (dealerValue > 21 || playerValue > dealerValue) {
        result = 'WON';
    } else if (playerValue === dealerValue) {
        result = 'PUSH';
    }

    return {
        playerHand: playerHand,
        dealerHand: dealerHand,
        playerValue: playerValue,
        dealerValue: dealerValue,
        gameState: 'GAME_OVER',
        result: result,
        winnings: result === 'WON' ? 100 : result === 'PUSH' ? 50 : 0,
        newBalance: result === 'WON' ? 1100 : result === 'PUSH' ? 1000 : 900,
        feedback: `Doubled down. You got ${playerValue}, dealer had ${dealerValue}. ${result === 'WON' ? 'Win!' : result === 'PUSH' ? 'Push!' : 'Better luck next time!'}`,
        xpAwarded: 2
    };
};

const mockAdvice = () => {
    const randomValue = Math.floor(Math.random() * 10) + 12; // 12-21
    return {
        feedback: `Basic Strategy: ${randomValue >= 17 ? 'Stand' : 'Hit'} on ${randomValue}.`,
        probabilities: {
            bustIfHit: Math.random() * 0.5,
            winChance: 0.3 + Math.random() * 0.4,
            pushChance: 0.1 + Math.random() * 0.1
        },
        recommendedActions: ["STAND", "HIT"],
        basicStrategy: {
            action: "STAND",
            reason: "Never hit on 17 or higher",
            softHandAdvice: "N/A"
        }
    };
};

const mockStats = () => ({
    gamesPlayed: 15,
    gamesWon: 9,
    winPercentage: 60.0,
    totalWinnings: 450.0,
    bestStreak: 5
});

const BlackjackGame: React.FC<BlackjackGameProps> = ({ user, onBack, theme }) => {
    const [gameState, setGameState] = useState<BlackjackGameState>({
        playerHand: [],
        dealerHand: [],
        gameState: 'BETTING',
        playerValue: 0,
        dealerValue: 0,
        betAmount: 0,
        balance: user.balance || 1000
    });

    const [currentGameId, setCurrentGameId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string>("Place your bet to start!");
    const [probabilities, setProbabilities] = useState<Probabilities | null>(null);
    const [betInput, setBetInput] = useState<string>('25');
    const [isLoading, setIsLoading] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showAdvice, setShowAdvice] = useState(false);
    const [gameHistory, setGameHistory] = useState<Array<{result: string, bet: number, profit: number}>>([]);
    const [userStats, setUserStats] = useState<BlackjackStats>({
        gamesPlayed: 0,
        gamesWon: 0,
        winPercentage: 0,
        totalWinnings: 0,
        bestStreak: 0
    });
    const [showTutorial, setShowTutorial] = useState(false);

    const { updateUserXp } = useRanking(user.id);

    // Initialize user stats
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

            loadStats();
        }
    }, [user]);

    const loadStats = async () => {
        try {
            const stats = await blackjackApi.getStats();
            setUserStats(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Set default stats on error
            setUserStats({
                gamesPlayed: 0,
                gamesWon: 0,
                winPercentage: 0,
                totalWinnings: 0,
                bestStreak: 0
            });
        }
    };

    const startGame = async () => {
        const betAmount = parseFloat(betInput);
        if (isNaN(betAmount) || betAmount <= 0) {
            setFeedback("Please enter a valid bet amount");
            return;
        }
        if (betAmount > gameState.balance) {
            setFeedback("Insufficient balance");
            return;
        }

        setIsLoading(true);
        try {
            const result = await blackjackApi.startGame(user.id, betAmount);

            setCurrentGameId(result.gameId);
            setGameState({
                playerHand: result.playerHand,
                dealerHand: result.dealerHand,
                gameState: 'PLAYER_TURN',
                playerValue: calculateHandValue(result.playerHand), // Recalculate to ensure accuracy
                dealerValue: result.dealerUpCardValue,
                betAmount,
                balance: result.remainingBalance
            });
            setFeedback(result.feedback);
            setProbabilities(result.probabilities);

            // Add to game history
            setGameHistory(prev => [...prev, { result: 'Started', bet: betAmount, profit: 0 }]);
        } catch (error: any) {
            console.error('Error starting game:', error);
            setFeedback("Failed to start game. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHit = async () => {
        if (!currentGameId || gameState.gameState !== 'PLAYER_TURN') return;

        setIsLoading(true);
        try {
            const result = await blackjackApi.hit(currentGameId);

            console.log('Hit result:', result); // Debug log

            // If result.playerHand is empty or undefined, create a new hand from current hand plus a new card
            let newPlayerHand;
            if (result.playerHand && result.playerHand.length > 0) {
                newPlayerHand = result.playerHand;
            } else {
                newPlayerHand = [...gameState.playerHand, generateRandomCard()];
            }

            const newPlayerValue = calculateHandValue(newPlayerHand);
            console.log('New player value:', newPlayerValue); // Debug log

            if (newPlayerValue > 21) {
                // Player busts
                await handleGameEnd('LOST', 0);
                setFeedback(result.feedback || "You busted!");
            } else {
                setGameState(prev => ({
                    ...prev,
                    playerHand: newPlayerHand,
                    playerValue: newPlayerValue,
                    gameState: result.gameState === 'GAME_OVER' ? 'GAME_OVER' : 'PLAYER_TURN'
                }));
                setFeedback(result.feedback || `You took a card. Total: ${newPlayerValue}`);

                if (result.probabilities) {
                    setProbabilities(result.probabilities);
                }
            }
        } catch (error: any) {
            console.error('Error hitting:', error);
            // Fallback: add a random card locally
            const newCard = generateRandomCard();
            const newHand = [...gameState.playerHand, newCard];
            const newValue = calculateHandValue(newHand);

            if (newValue > 21) {
                await handleGameEnd('LOST', 0);
                setFeedback(`You busted with ${newValue}!`);
            } else {
                setGameState(prev => ({
                    ...prev,
                    playerHand: newHand,
                    playerValue: newValue
                }));
                setFeedback(`You drew a ${newCard.rank} of ${newCard.suit}. Total: ${newValue}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStand = async () => {
        if (!currentGameId || gameState.gameState !== 'PLAYER_TURN') return;

        setIsLoading(true);
        try {
            const result = await blackjackApi.stand(currentGameId);

            const dealerRevealed = result.dealerHand?.map((card: Card, index: number) =>
                index === 1 ? { ...card, faceUp: true } : card
            ) || gameState.dealerHand;

            const dealerValue = calculateHandValue(dealerRevealed);
            const playerValue = calculateHandValue(gameState.playerHand);

            let resultType: 'WON' | 'LOST' | 'PUSH' = 'LOST';
            let winnings = 0;

            if (dealerValue > 21) {
                resultType = 'WON';
                winnings = gameState.betAmount * 2;
            } else if (playerValue > dealerValue) {
                resultType = 'WON';
                winnings = gameState.betAmount * 2;
            } else if (playerValue === dealerValue) {
                resultType = 'PUSH';
                winnings = gameState.betAmount;
            }

            await handleGameEnd(resultType, winnings);

            setGameState(prev => ({
                ...prev,
                dealerHand: dealerRevealed,
                dealerValue,
                gameState: 'GAME_OVER'
            }));

            setFeedback(result.feedback || `Dealer has ${dealerValue}. ${resultType === 'WON' ? 'You win!' : resultType === 'PUSH' ? 'Push!' : 'You lose.'}`);
        } catch (error: any) {
            console.error('Error standing:', error);
            setFeedback("Failed to stand. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDouble = async () => {
        if (!currentGameId || gameState.gameState !== 'PLAYER_TURN' || gameState.playerHand.length !== 2) {
            setFeedback("Can only double on first two cards");
            return;
        }

        if (gameState.betAmount * 2 > gameState.balance) {
            setFeedback("Insufficient balance to double");
            return;
        }

        setIsLoading(true);
        try {
            const result = await blackjackApi.double(currentGameId);

            const newPlayerHand = result.playerHand || [...gameState.playerHand, generateRandomCard()];
            const newPlayerValue = calculateHandValue(newPlayerHand);

            if (newPlayerValue > 21) {
                await handleGameEnd('LOST', 0);
                setFeedback(result.feedback || "You busted after doubling!");
            } else {
                // After doubling, automatically stand
                await handleStand();
            }

            if (result.newBalance) {
                setGameState(prev => ({ ...prev, balance: result.newBalance }));
            }
        } catch (error: any) {
            console.error('Error doubling:', error);
            setFeedback("Failed to double. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGameEnd = async (result: 'WON' | 'LOST' | 'PUSH', winnings: number) => {
        const profit = winnings - gameState.betAmount;
        const newBalance = gameState.balance + profit;

        // Update game state
        setGameState(prev => ({
            ...prev,
            gameState: 'GAME_OVER',
            balance: newBalance
        }));

        // Update game history
        setGameHistory(prev => [...prev, {
            result,
            bet: gameState.betAmount,
            profit
        }]);

        // Update ranking system
        if (user.id) {
            const currentXp = parseInt(localStorage.getItem(`user_${user.id}_xp`) || '0', 10);
            const xpGained = result === 'WON' ? 5 : result === 'PUSH' ? 2 : 1;
            const newXp = currentXp + xpGained;

            localStorage.setItem(`user_${user.id}_xp`, newXp.toString());

            const gamesPlayed = parseInt(localStorage.getItem(`user_${user.id}_games`) || '0', 10) + 1;
            localStorage.setItem(`user_${user.id}_games`, gamesPlayed.toString());

            if (result === 'WON') {
                const gamesWon = parseInt(localStorage.getItem(`user_${user.id}_wins`) || '0', 10) + 1;
                localStorage.setItem(`user_${user.id}_wins`, gamesWon.toString());
            }

            // Calculate win rate
            const games = parseInt(localStorage.getItem(`user_${user.id}_games`) || '0', 10);
            const wins = parseInt(localStorage.getItem(`user_${user.id}_wins`) || '0', 10);
            const winRate = games > 0 ? (wins / games) * 100 : 0;
            localStorage.setItem(`user_${user.id}_winrate`, winRate.toString());

            // Update XP in ranking hook
            updateUserXp?.(newXp, user.id);
        }

        // Reload stats
        await loadStats();
    };

    const resetGame = () => {
        setGameState({
            playerHand: [],
            dealerHand: [],
            gameState: 'BETTING',
            playerValue: 0,
            dealerValue: 0,
            betAmount: 0,
            balance: gameState.balance
        });
        setCurrentGameId(null);
        setFeedback("Place your bet to start a new game!");
        setProbabilities({bustIfHit: 0, pushChance: 0, winChance: 0});
    };

    const getAdvice = async () => {
        if (!currentGameId || gameState.gameState !== 'PLAYER_TURN') {
            setShowAdvice(true);
            return;
        }

        setIsLoading(true);
        try {
            const advice = await blackjackApi.getAdvice(currentGameId);
            setFeedback(advice.feedback);
            setProbabilities(advice.probabilities || {bustIfHit: 0, winChance: 0, pushChance: 0});
            setShowAdvice(true);
        } catch (error: any) {
            console.error('Error getting advice:', error);
            setFeedback("Could not get advice at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    const getCardColor = (suit: string) => {
        switch (suit) {
            case 'HEARTS':
            case 'DIAMONDS':
                return '#DC143C';
            case 'CLUBS':
            case 'SPADES':
                return '#000000';
            default:
                return '#333333';
        }
    };

    const getCardSymbol = (suit: string) => {
        switch (suit) {
            case 'HEARTS': return '♥';
            case 'DIAMONDS': return '♦';
            case 'CLUBS': return '♣';
            case 'SPADES': return '♠';
            default: return '?';
        }
    };

    const CardComponent: React.FC<{ card: Card; isDealer?: boolean }> = ({ card, isDealer = false }) => {
        if (!card.faceUp && isDealer) {
            return (
                <div style={{
                    width: '80px',
                    height: '120px',
                    backgroundColor: theme.panelBg,
                    border: `2px solid ${theme.accent}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: theme.accent,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    margin: '5px',
                }}>
                    ?
                </div>
            );
        }

        return (
            <div style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#FFFFFF',
                border: `2px solid ${getCardColor(card.suit)}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                margin: '5px',
                position: 'relative',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: getCardColor(card.suit),
                }}>
                    {card.rank}
                </div>
                <div style={{
                    fontSize: '36px',
                    color: getCardColor(card.suit),
                }}>
                    {getCardSymbol(card.suit)}
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: getCardColor(card.suit),
                    transform: 'rotate(180deg)',
                }}>
                    {card.rank}
                </div>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: theme.bgDark,
            color: theme.textColor,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px',
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '32px', color: theme.accent }}>
                        ♠️ Blackjack ♥️
                    </h1>
                    <div style={{ color: theme.muted, fontSize: '14px' }}>
                        Beat the dealer to 21 without going over
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{
                        backgroundColor: theme.panelBg,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '12px', color: theme.muted }}>Balance</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.positive }}>
                            ${gameState.balance.toFixed(2)}
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: theme.panelBg,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '12px', color: theme.muted }}>Current Bet</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>
                            ${gameState.betAmount.toFixed(2)}
                        </div>
                    </div>

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
                            alignSelf: 'center',
                        }}
                    >
                        ← Back to Menu
                    </button>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: '30px',
                flex: 1,
            }}>
                {/* Main Game Area */}
                <div>
                    {/* Dealer Area */}
                    <div style={{
                        backgroundColor: theme.panelBg,
                        borderRadius: '12px',
                        padding: '25px',
                        marginBottom: '30px',
                        border: `2px solid ${theme.accent}30`,
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <h2 style={{ margin: 0, fontSize: '24px' }}>
                                🃏 Dealer {gameState.dealerValue > 0 && `- ${gameState.dealerValue}`}
                            </h2>
                            {gameState.gameState === 'GAME_OVER' && (
                                <div style={{
                                    backgroundColor: theme.bgDark,
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                }}>
                                    {gameState.dealerValue > 21 ? 'BUSTED!' : `Total: ${gameState.dealerValue}`}
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '10px',
                            minHeight: '140px',
                        }}>
                            {gameState.dealerHand.length === 0 ? (
                                <div style={{
                                    width: '80px',
                                    height: '120px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: `2px dashed ${theme.muted}`,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: theme.muted,
                                }}>
                                    ?
                                </div>
                            ) : (
                                gameState.dealerHand.map((card, index) => (
                                    <CardComponent
                                        key={index}
                                        card={card}
                                        isDealer={index === 1 && gameState.gameState !== 'GAME_OVER'}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Player Area */}
                    <div style={{
                        backgroundColor: theme.panelBg,
                        borderRadius: '12px',
                        padding: '25px',
                        marginBottom: '30px',
                        border: `2px solid ${theme.positive}30`,
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <h2 style={{ margin: 0, fontSize: '24px' }}>
                                👤 You {gameState.playerValue > 0 && `- ${gameState.playerValue}`}
                            </h2>
                            {gameState.playerValue > 0 && (
                                <div style={{
                                    backgroundColor: theme.bgDark,
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    color: gameState.playerValue > 21 ? theme.negative :
                                        gameState.playerValue === 21 ? theme.positive : theme.textColor,
                                }}>
                                    {gameState.playerValue > 21 ? 'BUST!' :
                                        gameState.playerValue === 21 ? 'BLACKJACK!' : `Total: ${gameState.playerValue}`}
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '10px',
                            minHeight: '140px',
                        }}>
                            {gameState.playerHand.length === 0 ? (
                                <div style={{
                                    width: '80px',
                                    height: '120px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: `2px dashed ${theme.muted}`,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: theme.muted,
                                }}>
                                    ?
                                </div>
                            ) : (
                                gameState.playerHand.map((card, index) => (
                                    <CardComponent key={index} card={card} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '15px',
                        marginBottom: '30px',
                    }}>
                        {gameState.gameState === 'BETTING' ? (
                            <>
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    gridColumn: '1 / -1',
                                }}>
                                    <input
                                        type="number"
                                        value={betInput}
                                        onChange={(e) => setBetInput(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '15px',
                                            backgroundColor: theme.bgDark,
                                            color: theme.textColor,
                                            border: `2px solid ${theme.accent}`,
                                            borderRadius: '8px',
                                            fontSize: '18px',
                                        }}
                                        placeholder="Enter bet amount"
                                        min="1"
                                        max={gameState.balance}
                                    />
                                    <button
                                        onClick={startGame}
                                        disabled={isLoading}
                                        style={{
                                            backgroundColor: theme.positive,
                                            color: 'white',
                                            border: 'none',
                                            padding: '0 30px',
                                            borderRadius: '8px',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            opacity: isLoading ? 0.7 : 1,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {isLoading ? 'Starting...' : 'DEAL CARDS'}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setBetInput((gameState.balance * 0.1).toFixed(0))}
                                    style={{
                                        backgroundColor: theme.muted,
                                        color: theme.textColor,
                                        border: 'none',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    10% (${(gameState.balance * 0.1).toFixed(2)})
                                </button>
                                <button
                                    onClick={() => setBetInput((gameState.balance * 0.25).toFixed(0))}
                                    style={{
                                        backgroundColor: theme.muted,
                                        color: theme.textColor,
                                        border: 'none',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    25% (${(gameState.balance * 0.25).toFixed(2)})
                                </button>
                                <button
                                    onClick={() => setBetInput(gameState.balance.toFixed(0))}
                                    style={{
                                        backgroundColor: theme.negative,
                                        color: 'white',
                                        border: 'none',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ALL IN (${gameState.balance.toFixed(2)})
                                </button>
                            </>
                        ) : gameState.gameState === 'PLAYER_TURN' ? (
                            <>
                                <button
                                    onClick={handleHit}
                                    disabled={isLoading || gameState.playerValue >= 21}
                                    style={{
                                        backgroundColor: '#FF6B6B',
                                        color: 'white',
                                        border: 'none',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: isLoading || gameState.playerValue >= 21 ? 'not-allowed' : 'pointer',
                                        opacity: isLoading || gameState.playerValue >= 21 ? 0.5 : 1,
                                    }}
                                >
                                    HIT
                                </button>
                                <button
                                    onClick={handleStand}
                                    disabled={isLoading}
                                    style={{
                                        backgroundColor: '#4ECDC4',
                                        color: 'white',
                                        border: 'none',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.7 : 1,
                                    }}
                                >
                                    STAND
                                </button>
                                <button
                                    onClick={handleDouble}
                                    disabled={isLoading || gameState.playerHand.length !== 2 || gameState.betAmount * 2 > gameState.balance}
                                    style={{
                                        backgroundColor: '#FFD166',
                                        color: '#000',
                                        border: 'none',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: isLoading || gameState.playerHand.length !== 2 || gameState.betAmount * 2 > gameState.balance ? 'not-allowed' : 'pointer',
                                        opacity: isLoading || gameState.playerHand.length !== 2 || gameState.betAmount * 2 > gameState.balance ? 0.5 : 1,
                                    }}
                                >
                                    DOUBLE
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={resetGame}
                                style={{
                                    backgroundColor: theme.accent,
                                    color: 'white',
                                    border: 'none',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    gridColumn: '1 / -1',
                                }}
                            >
                                PLAY AGAIN
                            </button>
                        )}
                    </div>
                </div>

                {/* Side Panel */}
                <div>
                    {/* Feedback Panel */}
                    <div style={{
                        backgroundColor: theme.panelBg,
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        minHeight: '200px',
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', color: theme.accent }}>
                            💡 Feedback & Strategy
                        </h3>
                        <div style={{
                            fontSize: '14px',
                            lineHeight: 1.6,
                            color: theme.textColor,
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            padding: '15px',
                            borderRadius: '8px',
                            minHeight: '120px',
                        }}>
                            {feedback}
                        </div>

                        {/* In the Feedback & Strategy section */}
                        {probabilities && (
                            <div style={{
                                marginTop: '15px',
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap',
                            }}>
                                <div style={{
                                    backgroundColor: theme.negative,
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}>
                                    Bust Chance: {(probabilities.bustIfHit * 100).toFixed(0)}%
                                </div>
                                <div style={{
                                    backgroundColor: theme.positive,
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}>
                                    Win Chance: {(probabilities.winChance * 100).toFixed(0)}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Game Controls */}
                    <div style={{
                        backgroundColor: theme.panelBg,
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', color: theme.accent }}>
                            ⚙️ Game Controls
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                        }}>
                            <button
                                onClick={getAdvice}
                                disabled={gameState.gameState !== 'PLAYER_TURN' && gameState.gameState !== 'BETTING'}
                                style={{
                                    backgroundColor: '#9C27B0',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    cursor: gameState.gameState !== 'PLAYER_TURN' && gameState.gameState !== 'BETTING' ? 'not-allowed' : 'pointer',
                                    opacity: gameState.gameState !== 'PLAYER_TURN' && gameState.gameState !== 'BETTING' ? 0.5 : 1,
                                }}
                            >
                                Get Advice
                            </button>
                            <button
                                onClick={() => setShowStats(true)}
                                style={{
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                }}
                            >
                                View Stats
                            </button>
                            <button
                                onClick={() => setShowTutorial(true)}
                                style={{
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                }}
                            >
                                Tutorial
                            </button>
                            <button
                                onClick={resetGame}
                                style={{
                                    backgroundColor: theme.muted,
                                    color: theme.textColor,
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                }}
                            >
                                New Game
                            </button>
                        </div>
                    </div>

                    {/* Recent Games */}
                    <div style={{
                        backgroundColor: theme.panelBg,
                        borderRadius: '12px',
                        padding: '20px',
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', color: theme.accent }}>
                            📜 Recent Games
                        </h3>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {gameHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', color: theme.muted, padding: '20px' }}>
                                    No games played yet
                                </div>
                            ) : (
                                gameHistory.slice(-5).reverse().map((game, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px',
                                            backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            borderRadius: '6px',
                                            marginBottom: '5px',
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {game.result === 'WON' ? '✅ Won' :
                                                    game.result === 'LOST' ? '❌ Lost' :
                                                        game.result === 'PUSH' ? '🔄 Push' : game.result}
                                            </div>
                                            <div style={{ fontSize: '12px', color: theme.muted }}>
                                                Bet: ${game.bet.toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontWeight: 'bold',
                                            color: game.profit > 0 ? theme.positive :
                                                game.profit < 0 ? theme.negative : theme.muted,
                                        }}>
                                            {game.profit > 0 ? '+' : ''}${game.profit.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showStats && (
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
                        maxWidth: '500px',
                        width: '90%',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <div style={{
                                backgroundColor: theme.bgDark,
                                padding: '15px',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }}>
                                <div style={{fontSize: '12px', color: theme.muted}}>Games Played</div>
                                <div style={{fontSize: '24px', fontWeight: 'bold'}}>
                                    {userStats.gamesPlayed}
                                </div>
                            </div>
                            <h2 style={{margin: 0, color: theme.textColor}}>📊 Blackjack Stats</h2>
                            <button
                                onClick={() => setShowStats(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: theme.textColor,
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            marginBottom: '20px',
                        }}>
                            <div style={{
                                backgroundColor: theme.bgDark,
                                padding: '15px',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '12px', color: theme.muted }}>Games Played</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.gamesPlayed}</div>
                            </div>
                            <div style={{
                                backgroundColor: theme.bgDark,
                                padding: '15px',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '12px', color: theme.muted }}>Games Won</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.positive }}>
                                    {userStats.gamesWon}
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: theme.bgDark,
                                padding: '15px',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '12px', color: theme.muted }}>Win Rate</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.positive }}>
                                    {userStats.winPercentage.toFixed(1)}%
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: theme.bgDark,
                                padding: '15px',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '12px', color: theme.muted }}>Best Streak</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD700' }}>
                                    {userStats.bestStreak}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: theme.bgDark,
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                        }}>
                            <div style={{ fontSize: '12px', color: theme.muted, marginBottom: '5px' }}>
                                Total Winnings
                            </div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: userStats.totalWinnings > 0 ? theme.positive : theme.textColor
                            }}>
                                ${userStats.totalWinnings.toFixed(2)}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowStats(false)}
                            style={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                width: '100%',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showAdvice && (
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
                        maxWidth: '500px',
                        width: '90%',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <h2 style={{ margin: 0, color: theme.textColor }}>🤔 Basic Strategy Advice</h2>
                            <button
                                onClick={() => setShowAdvice(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: theme.textColor,
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: theme.accent, marginBottom: '10px' }}>General Rules:</h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: theme.textColor, lineHeight: 1.6 }}>
                                <li>Always stand on 17 or higher</li>
                                <li>Always hit on 11 or lower</li>
                                <li>Double down on 11 against dealer 2-10</li>
                                <li>Never take insurance</li>
                                <li>Split Aces and 8s, never split 10s or 5s</li>
                            </ul>
                        </div>

                        <div style={{
                            backgroundColor: theme.bgDark,
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                        }}>
                            <h3 style={{ color: theme.accent, marginTop: 0, marginBottom: '10px' }}>
                                Current Situation:
                            </h3>
                            <div style={{ color: theme.textColor, lineHeight: 1.6 }}>
                                {feedback}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAdvice(false)}
                            style={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                width: '100%',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            {showTutorial && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: theme.panelBg,
                        borderRadius: '16px',
                        padding: '30px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <h2 style={{ margin: 0, color: theme.textColor }}>📖 Blackjack Tutorial</h2>
                            <button
                                onClick={() => setShowTutorial(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: theme.textColor,
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ color: theme.textColor, lineHeight: 1.6 }}>
                            <h3 style={{ color: theme.accent }}>🎯 Objective</h3>
                            <p>Beat the dealer by having a hand value closer to 21 without going over.</p>

                            <h3 style={{ color: theme.accent }}>🃏 Card Values</h3>
                            <ul>
                                <li>Number cards: Face value (2-10)</li>
                                <li>Face cards (J, Q, K): 10 points</li>
                                <li>Ace: 1 or 11 points (whichever is better)</li>
                            </ul>

                            <h3 style={{ color: theme.accent }}>🎮 Actions</h3>
                            <ul>
                                <li><strong>Hit:</strong> Take another card</li>
                                <li><strong>Stand:</strong> Keep your current hand</li>
                                <li><strong>Double:</strong> Double your bet and take one more card</li>
                            </ul>

                            <h3 style={{ color: theme.accent }}>🏆 Winning</h3>
                            <ul>
                                <li>Blackjack (Ace + 10-value card): 3:2 payout</li>
                                <li>Beat dealer without busting: 1:1 payout</li>
                                <li>Tie (push): Bet returned</li>
                                <li>Dealer busts: You win automatically</li>
                            </ul>

                            <h3 style={{ color: theme.accent }}>💡 Basic Strategy Tips</h3>
                            <ul>
                                <li>Always stand on 17 or higher</li>
                                <li>Hit on 16 or lower when dealer shows 7 or higher</li>
                                <li>Double down on 11 against dealer 2-10</li>
                                <li>Never take insurance</li>
                            </ul>

                            <div style={{
                                backgroundColor: theme.bgDark,
                                padding: '15px',
                                borderRadius: '8px',
                                marginTop: '20px',
                                borderLeft: `4px solid ${theme.positive}`,
                            }}>
                                <strong>💎 Pro Tip:</strong> The dealer must hit on 16 or less and stand on 17 or more.
                                Use this to your advantage!
                            </div>
                        </div>

                        <button
                            onClick={() => setShowTutorial(false)}
                            style={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                width: '100%',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                marginTop: '20px',
                            }}
                        >
                            Start Playing!
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: `1px solid ${theme.muted}30`,
                textAlign: 'center',
                color: theme.muted,
                fontSize: '12px',
            }}>
                <div>♠️ ♥️ ♣️ ♦️ Practice responsible gaming ♦️ ♣️ ♥️ ♠️</div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1001,
                }}>
                    <div style={{
                        backgroundColor: theme.panelBg,
                        padding: '30px',
                        borderRadius: '12px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: `4px solid ${theme.muted}`,
                            borderTopColor: theme.accent,
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite',
                        }} />
                        <div style={{ color: theme.textColor, fontSize: '18px' }}>
                            Processing...
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes cardDeal {
                    0% { transform: translateY(-50px) rotate(-5deg); opacity: 0; }
                    100% { transform: translateY(0) rotate(0deg); opacity: 1; }
                }
                .card-deal-animation {
                    animation: cardDeal 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default BlackjackGame;