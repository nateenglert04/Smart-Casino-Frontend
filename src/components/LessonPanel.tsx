// components/LessonPanel.tsx
import { useState, useEffect, useCallback } from 'react';
import type { User, Theme } from '../types';

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string;
    xpReward: number;
    difficulty: number;
    gameType: 'BLACKJACK' | 'POKER' | 'GENERAL';
    completed: boolean;
}

export interface UserProgress {
    level: number;
    xp: number;
    lessonsCompleted: number;
}

interface LessonPanelProps {
    user: User | null;
    onBack: () => void;
    theme: Theme;
    onError?: (message: string) => void;
}

const LessonPanel: React.FC<LessonPanelProps> = ({ user, onBack, theme, onError }) => {
    const mockLessons: Lesson[] = [
        {
            id: '1',
            title: 'Blackjack Basics',
            description: 'Learn the fundamental rules and objectives of Blackjack.',
            content: `<div style="color: #fff;">
                        <h3>Blackjack Basics</h3>
                        <p><strong>Objective:</strong> Beat the dealer by having a hand value closer to 21 without going over.</p>
                        <p><strong>Card Values:</strong></p>
                        <ul>
                            <li>Number cards: Face value</li>
                            <li>Face cards (Jack, Queen, King): 10 points</li>
                            <li>Ace: 1 or 11 points (player's choice)</li>
                        </ul>
                        <p><strong>Basic Actions:</strong></p>
                        <ul>
                            <li><strong>Hit:</strong> Take another card</li>
                            <li><strong>Stand:</strong> Keep your current hand</li>
                            <li><strong>Double Down:</strong> Double your bet and take one more card</li>
                        </ul>
                      </div>`,
            xpReward: 100,
            difficulty: 1,
            gameType: 'BLACKJACK',
            completed: false
        },
        {
            id: '2',
            title: 'Poker Hand Rankings',
            description: 'Understand the hierarchy of poker hands from high card to royal flush.',
            content: `<div style="color: #fff;">
                        <h3>Poker Hand Rankings</h3>
                        <ol>
                            <li>Royal Flush: A, K, Q, J, 10 of same suit</li>
                            <li>Straight Flush: Five consecutive cards, same suit</li>
                            <li>Four of a Kind: Four cards of same rank</li>
                            <li>Full House: Three of a kind + a pair</li>
                            <li>Flush: Five cards of same suit, not consecutive</li>
                            <li>Straight: Five consecutive cards, different suits</li>
                            <li>Three of a Kind: Three cards of same rank</li>
                            <li>Two Pair: Two different pairs</li>
                            <li>One Pair: Two cards of same rank</li>
                            <li>High Card: Highest card when no other hand is made</li>
                        </ol>
                      </div>`,
            xpReward: 150,
            difficulty: 2,
            gameType: 'POKER',
            completed: false
        },
        {
            id: '3',
            title: 'Blackjack Basic Strategy',
            description: 'Learn the optimal decisions for common Blackjack scenarios.',
            content: `<div style="color: #fff;">
                        <h3>Blackjack Basic Strategy</h3>
                        <p><strong>Hard Hands:</strong> Hit/Stand/Double based on dealer card.</p>
                        <p><strong>Soft Hands:</strong> Includes Ace counted as 11; strategy varies.</p>
                      </div>`,
            xpReward: 200,
            difficulty: 3,
            gameType: 'BLACKJACK',
            completed: false
        },
        {
            id: '4',
            title: 'Poker Position Strategy',
            description: 'Understand how table position affects your poker decisions.',
            content: `<div style="color: #fff;">
                        <h3>Poker Position Strategy</h3>
                        <p>Early, Middle, and Late positions affect hand selection and betting.</p>
                      </div>`,
            xpReward: 180,
            difficulty: 3,
            gameType: 'POKER',
            completed: false
        },
        {
            id: '5',
            title: 'Bankroll Management',
            description: 'Learn how to manage your money effectively in casino games.',
            content: `<div style="color: #fff;">
                        <h3>Bankroll Management</h3>
                        <p>Set limits, manage bet sizing, and know when to quit.</p>
                      </div>`,
            xpReward: 120,
            difficulty: 2,
            gameType: 'GENERAL',
            completed: false
        }
    ];

    const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
    const [progress, setProgress] = useState<UserProgress>({
        level: 1,
        xp: 0,
        lessonsCompleted: 0
    });

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // -------------------------------
    // COMPLETE LESSON
    // -------------------------------
    const completeLesson = useCallback(
        (lessonId: string) => {
            const lessonToComplete = lessons.find((l) => l.id === lessonId);
            if (!lessonToComplete || lessonToComplete.completed) return;

            setIsLoading(true);

            setTimeout(() => {
                setLessons((prev) =>
                    prev.map((l) =>
                        l.id === lessonId ? { ...l, completed: true } : l
                    )
                );

                setProgress((prev) => ({
                    ...prev,
                    lessonsCompleted: prev.lessonsCompleted + 1,
                    xp: prev.xp + lessonToComplete.xpReward,
                    level: Math.floor((prev.xp + lessonToComplete.xpReward) / 500) + 1
                }));

                setSelectedLesson(null);
                setIsLoading(false);

                if (onError) {
                    onError(`Lesson completed! +${lessonToComplete.xpReward} XP earned!`);
                }
            }, 500);
        },
        [lessons, onError]
    );

    // -------------------------------
    // INITIAL USER PROGRESS SETUP
    // -------------------------------
    useEffect(() => {
        if (!user) return;

        const completedLessons = Math.floor(Math.random() * 2);
        const completedLessonIds = ['1', '2'].slice(0, completedLessons);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLessons(prev =>
            prev.map(lesson =>
                completedLessonIds.includes(lesson.id)
                    ? { ...lesson, completed: true }
                    : lesson
            )
        );

        setProgress({
            level: Math.floor((completedLessons * 125) / 500) + 1,
            xp: completedLessons * 125,
            lessonsCompleted: completedLessons
        });
    }, [user]);

    const getDifficultyColor = (difficulty: number) => {
        switch (difficulty) {
            case 1:
                return '#4CAF50';
            case 2:
                return '#FF9800';
            case 3:
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    // -------------------------------
    // RENDER
    // -------------------------------
    return (
        <div style={{
            backgroundColor: theme.bgDark,
            color: theme.textColor,
            minHeight: '100vh',
            padding: '20px'
        }}>
            {/* HEADER */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px' }}>Educational Lessons</h1>
                    <p style={{ color: '#CCCCCC', marginTop: '5px' }}>
                        Complete lessons to earn XP and level up!
                    </p>
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
                        fontWeight: 'bold'
                    }}
                >
                    Back to Menu
                </button>
            </div>

            {/* PROGRESS BAR */}
            <div style={{
                backgroundColor: theme.panelBg,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Level {progress.level}</span>
                    <span>{progress.xp} / 500 XP</span>
                </div>

                <div style={{
                    height: '20px',
                    backgroundColor: '#3C3C3C',
                    borderRadius: '10px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: theme.accent,
                        width: `${(progress.xp / 500) * 100}%`,
                        transition: 'width 0.3s'
                    }} />
                </div>

                <div style={{ textAlign: 'center', marginTop: '10px', color: '#CCCCCC' }}>
                    {progress.lessonsCompleted} lessons completed
                </div>
            </div>

            {/* LESSON GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {lessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        style={{
                            backgroundColor: theme.panelBg,
                            borderRadius: '12px',
                            padding: '20px',
                            border: `2px solid ${
                                lesson.completed ? theme.positive : '#444'
                            }`,
                            opacity: lesson.completed ? 0.8 : 1
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0' }}>{lesson.title}</h3>

                                <div style={{
                                    display: 'inline-block',
                                    backgroundColor: getDifficultyColor(lesson.difficulty),
                                    color: 'white',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    marginBottom: '10px'
                                }}>
                                    {lesson.difficulty === 1
                                        ? 'EASY'
                                        : lesson.difficulty === 2
                                            ? 'MEDIUM'
                                            : 'HARD'}
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {lesson.xpReward}
                            </div>
                        </div>

                        <p style={{ color: '#CCCCCC', margin: '10px 0 15px 0' }}>
                            {lesson.description}
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '12px',
                                backgroundColor:
                                    lesson.gameType === 'BLACKJACK'
                                        ? theme.negative
                                        : lesson.gameType === 'POKER'
                                            ? theme.accent
                                            : '#9C27B0',
                                color: 'white',
                                padding: '3px 8px',
                                borderRadius: '4px'
                            }}>
                                {lesson.gameType}
                            </span>

                            {lesson.completed ? (
                                <span style={{ color: theme.positive, fontWeight: 'bold' }}>
                                    ✓ COMPLETED
                                </span>
                            ) : (
                                <button
                                    onClick={() => completeLesson(lesson.id)}
                                    disabled={isLoading}
                                    style={{
                                        backgroundColor: theme.positive,
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {isLoading ? 'LOADING...' : 'START LESSON'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* LESSON MODAL */}
            {selectedLesson && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: theme.panelBg,
                        borderRadius: '12px',
                        padding: '30px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{ margin: 0 }}>{selectedLesson.title}</h2>
                            <button
                                onClick={() => setSelectedLesson(null)}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: theme.textColor,
                                    fontSize: '24px',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div
                            dangerouslySetInnerHTML={{
                                __html: selectedLesson.content
                            }}
                        />

                        <div style={{
                            marginTop: '20px',
                            textAlign: 'center'
                        }}>
                            <button
                                onClick={() => completeLesson(selectedLesson.id)}
                                disabled={isLoading || selectedLesson.completed}
                                style={{
                                    backgroundColor:
                                        selectedLesson.completed
                                            ? theme.muted
                                            : theme.positive,
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    cursor: selectedLesson.completed
                                        ? 'default'
                                        : 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}
                            >
                                {selectedLesson.completed
                                    ? 'LESSON COMPLETED'
                                    : isLoading
                                        ? 'COMPLETING...'
                                        : `COMPLETE LESSON (+${selectedLesson.xpReward} XP)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPanel;
