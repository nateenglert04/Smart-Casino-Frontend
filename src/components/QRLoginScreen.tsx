// components/QRLoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../api';
import type { Theme, User, QRCodeResponse, QRLoginCredentials } from '../types';

interface QRLoginScreenProps {
    onBack: () => void;
    onLogin: (user: User) => void;
    theme: Theme;
    onError: (error: string) => void;
}

// Mock QR scanner component
const QrScanner: React.FC<{
    onScan: (result: string) => void;
    onError: (error: string) => void;
    theme: Theme; // Add theme prop
}> = ({ onScan, onError, theme }) => {
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const startScanning = async () => {
        setIsScanning(true);
        try {
            // Mock scanning - replace with actual QR scanning library
            setTimeout(() => {
                const mockToken = `qr-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                onScan(mockToken);
                setIsScanning(false);
            }, 2000);
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Failed to access camera';

            onError(message);
            setIsScanning(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
        }}>
            <div style={{
                width: '300px',
                height: '300px',
                backgroundColor: '#000',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {isScanning ? (
                    <>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: '2px solid #00FF00',
                            animation: 'scanline 2s linear infinite'
                        }} />
                        <video
                            ref={videoRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            autoPlay
                            muted
                        />
                        <div style={{
                            position: 'absolute',
                            color: '#00FF00',
                            fontSize: '14px',
                            bottom: '10px',
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            Scanning...
                        </div>
                    </>
                ) : (
                    <div style={{
                        color: '#666',
                        fontSize: '16px',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        Camera preview will appear here
                    </div>
                )}
            </div>

            <button
                onClick={startScanning}
                disabled={isScanning}
                style={{
                    backgroundColor: isScanning ? theme.muted : theme.positive,
                    color: theme.textColor,
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: isScanning ? 'not-allowed' : 'pointer',
                    minWidth: '200px'
                }}
            >
                {isScanning ? 'SCANNING...' : 'START SCANNING'}
            </button>
        </div>
    );
};

const QRLoginScreen: React.FC<QRLoginScreenProps> = ({ onBack, onLogin, theme, onError }) => {
    const [mode, setMode] = useState<'scan' | 'generate' | 'upload'>('scan');
    const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
    const [, setQrToken] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState<number>(300);
    const [, setScanning] = useState(false);
    const [manualToken, setManualToken] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if user is logged in (has token)
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    // Generate QR code for logged-in user
    const generateQRCode = async () => {
        setIsGenerating(true);
        try {
            const response: QRCodeResponse = await userApi.generateQRCode();
            setQrCodeImage(response.qrCode);
            setQrToken(response.token);
            setExpiresIn(response.expiresIn);
            onError(`QR code generated! Expires in ${Math.floor(response.expiresIn / 60)} minutes.`);
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to generate QR code. Please log in first.';
            onError(errorMessage);
            if (errorMessage.includes('401') || errorMessage.includes('logged in')) {
                setMode('scan');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle QR code scan result
    const handleScanResult = async (token: string) => {
        setScanning(false);
        try {
            const qrCredentials: QRLoginCredentials = { token };
            const authResponse = await userApi.loginWithQR(qrCredentials);

            if (authResponse?.user && authResponse?.token) {
                const user: User = {
                    id: authResponse.user.id,
                    username: authResponse.user.username,
                    balance: authResponse.user.balance ?? 0,
                    token: authResponse.token
                };
                onLogin(user);
            }
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Invalid QR code. Please try again.';
            onError(errorMessage);
        }
    };

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // In a real app, you would use a library to decode QR from image
        // For now, we'll simulate it
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result;
            if (result) {
                // Simulate QR decoding
                setTimeout(() => {
                    const mockToken = `file-token-${Date.now()}`;
                    handleScanResult(mockToken);
                }, 1000);
            }
        };
        reader.readAsDataURL(file);
    };

    // Handle manual token entry
    const handleManualTokenLogin = async () => {
        if (!manualToken.trim()) {
            onError('Please enter a token');
            return;
        }
        await handleScanResult(manualToken);
    };

    // Start scanning
    const startScanning = () => {
        setScanning(true);
        setMode('scan');
    };

    // Countdown timer for QR code expiry
    useEffect(() => {
        if (!expiresIn || expiresIn <= 0) return;

        const timer = setInterval(() => {
            setExpiresIn(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onError('QR code expired. Please generate a new one.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresIn, onError]);

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{
                    color: theme.textColor,
                    fontSize: '28px',
                    margin: 0
                }}>
                    QR Code Login
                </h1>
                <button
                    onClick={onBack}
                    style={{
                        backgroundColor: theme.muted,
                        color: theme.textColor,
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ← Back
                </button>
            </div>

            {/* Mode Selection */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '30px'
            }}>
                <button
                    onClick={() => {
                        setMode('scan');
                        startScanning();
                    }}
                    style={{
                        backgroundColor: mode === 'scan' ? theme.accent : theme.panelBg,
                        color: theme.textColor,
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                    }}
                >
                    Scan QR Code
                </button>

                {isLoggedIn && (
                    <button
                        onClick={() => {
                            setMode('generate');
                            generateQRCode();
                        }}
                        disabled={isGenerating}
                        style={{
                            backgroundColor: mode === 'generate' ? theme.positive : theme.panelBg,
                            color: theme.textColor,
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            flex: 1,
                            opacity: isGenerating ? 0.7 : 1
                        }}
                    >
                        {isGenerating ? 'GENERATING...' : 'Generate QR Code'}
                    </button>
                )}

                <button
                    onClick={() => {
                        setMode('upload');
                        fileInputRef.current?.click();
                    }}
                    style={{
                        backgroundColor: mode === 'upload' ? '#FF8C00' : theme.panelBg,
                        color: theme.textColor,
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                    }}
                >
                    Upload Image
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Content Area */}
            <div style={{
                backgroundColor: theme.panelBg,
                borderRadius: '12px',
                padding: '30px',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {mode === 'scan' && (
                    <>
                        <h2 style={{
                            color: theme.textColor,
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            Scan QR Code with Camera
                        </h2>
                        <QrScanner
                            onScan={handleScanResult}
                            onError={onError}
                            theme={theme} // Pass theme to QrScanner
                        />
                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <p style={{ color: theme.muted, marginBottom: '15px' }}>
                                Or enter token manually:
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                maxWidth: '400px',
                                margin: '0 auto'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Enter QR token"
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#3C3C3C',
                                        color: theme.textColor,
                                        border: `1px solid ${theme.muted}`,
                                        borderRadius: '6px',
                                        padding: '10px',
                                        fontSize: '14px'
                                    }}
                                />
                                <button
                                    onClick={handleManualTokenLogin}
                                    style={{
                                        backgroundColor: theme.accent,
                                        color: theme.textColor,
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {mode === 'generate' && qrCodeImage && (
                    <>
                        <h2 style={{
                            color: theme.textColor,
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            Your QR Code for Login
                        </h2>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <img
                                src={qrCodeImage}
                                alt="QR Code"
                                style={{
                                    width: '250px',
                                    height: '250px',
                                    display: 'block'
                                }}
                            />
                        </div>
                        <div style={{
                            color: theme.textColor,
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            <p>Scan this QR code with another device to log in</p>
                            <p style={{
                                color: expiresIn < 60 ? theme.negative : '#FFD700',
                                fontWeight: 'bold'
                            }}>
                                Expires in: {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
                            </p>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={generateQRCode}
                                disabled={isGenerating}
                                style={{
                                    backgroundColor: theme.accent,
                                    color: theme.textColor,
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    opacity: isGenerating ? 0.7 : 1
                                }}
                            >
                                Generate New QR
                            </button>
                            <button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = qrCodeImage;
                                    link.download = 'smartcasino-qr.png';
                                    link.click();
                                }}
                                style={{
                                    backgroundColor: theme.positive,
                                    color: theme.textColor,
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Download QR
                            </button>
                        </div>
                    </>
                )}

                {mode === 'generate' && !qrCodeImage && !isGenerating && (
                    <div style={{
                        textAlign: 'center',
                        color: theme.textColor
                    }}>
                        <p>No QR code generated yet.</p>
                        <button
                            onClick={generateQRCode}
                            disabled={isGenerating}
                            style={{
                                backgroundColor: theme.accent,
                                color: theme.textColor,
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                marginTop: '20px',
                                opacity: isGenerating ? 0.7 : 1
                            }}
                        >
                            {isGenerating ? 'Generating...' : 'Generate QR Code'}
                        </button>
                    </div>
                )}

                {mode === 'generate' && isGenerating && !qrCodeImage && (
                    <div style={{
                        textAlign: 'center',
                        color: theme.textColor
                    }}>
                        <p>Generating QR code...</p>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: `4px solid ${theme.muted}`,
                            borderTop: `4px solid ${theme.accent}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '20px auto'
                        }} />
                    </div>
                )}

                {mode === 'upload' && (
                    <>
                        <h2 style={{
                            color: theme.textColor,
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            Upload QR Code Image
                        </h2>
                        <div style={{
                            border: `2px dashed ${theme.muted}`,
                            borderRadius: '12px',
                            padding: '40px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            marginBottom: '20px',
                            width: '100%',
                            maxWidth: '400px'
                        }}
                             onClick={() => fileInputRef.current?.click()}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                            <p style={{ color: theme.textColor, marginBottom: '10px' }}>
                                Click to select QR code image
                            </p>
                            <p style={{ color: theme.muted, fontSize: '14px' }}>
                                Supports: PNG, JPG, JPEG
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                    </>
                )}
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: theme.panelBg,
                borderRadius: '8px',
                color: theme.muted,
                fontSize: '14px'
            }}>
                <h3 style={{ color: theme.textColor, marginBottom: '10px' }}>How to use:</h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li><strong>Scan QR Code:</strong> Use your device's camera to scan a QR code from another device</li>
                    <li><strong>Generate QR Code:</strong> Create a QR code that you can scan with another device (requires login)</li>
                    <li><strong>Upload Image:</strong> Select a saved QR code image from your device</li>
                    <li>QR codes expire after 5 minutes for security</li>
                    <li>Each QR code can only be used once</li>
                </ul>
            </div>

            <style>{`
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default QRLoginScreen;