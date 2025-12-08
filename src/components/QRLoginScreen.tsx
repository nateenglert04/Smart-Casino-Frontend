// components/QRLoginScreen.tsx - Updated with expiration removed
import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../api';
import type { Theme, User, QRCodeResponse, QRLoginCredentials } from '../types';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

interface QRLoginScreenProps {
    onBack: () => void;
    onLogin: (user: User) => void;
    theme: Theme;
    onError: (error: string) => void;
}

const QRLoginScreen: React.FC<QRLoginScreenProps> = ({ onBack, onLogin, theme, onError }) => {
    const [mode, setMode] = useState<'scan' | 'generate' | 'upload' | 'manual'>('manual');
    const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
    const [manualToken, setManualToken] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerControlsRef = useRef<IScannerControls | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    // Check if user is logged in
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
            onError('QR code generated successfully!');
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to generate QR code. Please log in first.';
            onError(errorMessage);
            if (errorMessage.includes('401') || errorMessage.includes('token')) {
                setMode('manual');
                setIsLoggedIn(false);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle webcam scanning
    const startScan = async () => {
        setScanError(null);
        if (isScanning) return;
        try {
            const codeReader = new BrowserMultiFormatReader();
            await stopScan();
            const videoEl = videoRef.current;
            if (!videoEl) {
                setScanError('Video element not available');
                return;
            }
            setIsScanning(true);
            const controls = await codeReader.decodeFromVideoDevice(undefined, videoEl, (result) => {
                if (result) {
                    const text = result.getText();
                    handleDecoded(text);
                }
                // ignore transient errors during scanning loop
            });
            scannerControlsRef.current = controls;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            setScanError('Camera access denied or not available');
            setIsScanning(false);
        }
    };

    const stopScan = async () => {
        try {
            scannerControlsRef.current?.stop();
            scannerControlsRef.current = null;
        } catch { /* empty */ }
        try {
            const stream = videoRef.current?.srcObject as MediaStream | null;
            stream?.getTracks().forEach(t => t.stop());
        } catch { /* empty */ }
        setIsScanning(false);
    };

    const handleDecoded = async (decodedText: string) => {
        await stopScan();

        let token = decodedText;

        // Extract token from QR content if it's a full URL
        if (decodedText.startsWith('smartcasino://login?token=')) {
            try {
                // Parse the URL to extract token
                const url = new URL(decodedText.replace('smartcasino://', 'http://'));
                token = url.searchParams.get('token') || decodedText;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {//error was giving grief
                // If URL parsing fails, try to extract manually
                const tokenMatch = decodedText.match(/token=([^&]+)/);
                if (tokenMatch && tokenMatch[1]) {
                    token = tokenMatch[1];
                }
            }
        }

        setManualToken(token);
        setIsLoggingIn(true);
        try {
            const qrCredentials: QRLoginCredentials = { token: token };
            const authResponse = await userApi.loginWithQR(qrCredentials);

            if (authResponse?.user && authResponse?.token) {
                const user: User = {
                    id: authResponse.user.id,
                    username: authResponse.user.username,
                    balance: authResponse.user.balance ?? 0,
                    email: authResponse.user.email,
                    token: authResponse.token
                };
                onLogin(user);
            }
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Invalid QR token. Please try again.';
            onError(errorMessage);
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Handle manual token login
    const handleManualTokenLogin = async () => {
        if (!manualToken.trim()) {
            onError('Please enter a token');
            return;
        }

        let token = manualToken.trim();

        // Extract token if it's a full URL
        if (manualToken.startsWith('smartcasino://login?token=')) {
            try {
                const url = new URL(manualToken.replace('smartcasino://', 'http://'));
                token = url.searchParams.get('token') || manualToken;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                const tokenMatch = manualToken.match(/token=([^&]+)/);
                if (tokenMatch && tokenMatch[1]) {
                    token = tokenMatch[1];
                }
            }
        }

        setIsLoggingIn(true);
        try {
            const qrCredentials: QRLoginCredentials = { token: token };
            const authResponse = await userApi.loginWithQR(qrCredentials);

            if (authResponse?.user && authResponse?.token) {
                const user: User = {
                    id: authResponse.user.id,
                    username: authResponse.user.username,
                    balance: authResponse.user.balance ?? 0,
                    email: authResponse.user.email,
                    token: authResponse.token
                };
                onLogin(user);
            }
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Invalid QR token. Please try again.';
            onError(errorMessage);
        } finally {
            setIsLoggingIn(false);
        }
    };


    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            onError('Please select a valid image file');
            return;
        }

        setIsLoggingIn(true);
        try {
            const authResponse = await userApi.uploadQRCode(file);

            if (authResponse?.user && authResponse?.token) {
                const user: User = {
                    id: authResponse.user.id,
                    username: authResponse.user.username,
                    balance: authResponse.user.balance ?? 0,
                    email: authResponse.user.email,
                    token: authResponse.token
                };
                onLogin(user);
            }
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to process QR code from image';
            onError(errorMessage);
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Download QR code
    const handleDownloadQR = () => {
        if (!qrCodeImage) return;

        const link = document.createElement('a');
        link.href = qrCodeImage;
        link.download = 'smartcasino-qr.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onError('QR code downloaded successfully!');
    };

    // Stop scanning when leaving scan mode or on unmount
    useEffect(() => {
        if (mode !== 'scan') {
            stopScan();
        }
        return () => {
            stopScan();
        };
    }, [mode]);

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh'
        }}>
            {/* Header */}
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

            {/* Mode Selection Tabs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isLoggedIn ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '30px'
            }}>
                <button
                    onClick={() => setMode('manual')}
                    style={{
                        backgroundColor: mode === 'manual' ? theme.accent : theme.panelBg,
                        color: theme.textColor,
                        border: mode === 'manual' ? `2px solid ${theme.accent}` : 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: mode === 'manual' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                    }}
                >
                    📝 Enter Token
                </button>

                <button
                    onClick={() => {
                        setMode('upload');
                    }}
                    style={{
                        backgroundColor: mode === 'upload' ? '#FF8C00' : theme.panelBg,
                        color: theme.textColor,
                        border: mode === 'upload' ? '2px solid #FF8C00' : 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: mode === 'upload' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                    }}
                >
                    📤 Upload Image
                </button>

                <button
                    onClick={() => setMode('scan')}
                    style={{
                        backgroundColor: mode === 'scan' ? theme.accent : theme.panelBg,
                        color: theme.textColor,
                        border: mode === 'scan' ? `2px solid ${theme.accent}` : 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: mode === 'scan' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                    }}
                >
                    📷 Scan with Camera
                </button>

                {isLoggedIn && (
                    <button
                        onClick={() => {
                            setMode('generate');
                            if (!qrCodeImage) generateQRCode();
                        }}
                        disabled={isGenerating}
                        style={{
                            backgroundColor: mode === 'generate' ? theme.positive : theme.panelBg,
                            color: theme.textColor,
                            border: mode === 'generate' ? `2px solid ${theme.positive}` : 'none',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: mode === 'generate' ? 'bold' : 'normal',
                            opacity: isGenerating ? 0.7 : 1,
                            transition: 'all 0.3s'
                        }}
                    >
                        {isGenerating ? '⏳ Generating...' : '🔐 Generate QR'}
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div style={{
                backgroundColor: theme.panelBg,
                borderRadius: '12px',
                padding: '30px',
                minHeight: '400px'
            }}>
                {/* Manual Token Entry Mode */}
                {mode === 'manual' && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: theme.textColor, marginBottom: '20px' }}>
                            Enter QR Token Manually
                        </h2>
                        <p style={{ color: theme.muted, marginBottom: '30px' }}>
                            Enter the token from your QR code to log in
                        </p>

                        <div style={{
                            maxWidth: '500px',
                            margin: '0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            <input
                                type="text"
                                placeholder="Enter QR token here..."
                                value={manualToken}
                                onChange={(e) => setManualToken(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !isLoggingIn) {
                                        handleManualTokenLogin();
                                    }
                                }}
                                disabled={isLoggingIn}
                                style={{
                                    padding: '15px',
                                    backgroundColor: '#3C3C3C',
                                    color: theme.textColor,
                                    border: `2px solid ${theme.muted}`,
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />

                            <button
                                onClick={handleManualTokenLogin}
                                disabled={isLoggingIn || !manualToken.trim()}
                                style={{
                                    backgroundColor: isLoggingIn || !manualToken.trim() ? theme.muted : theme.positive,
                                    color: theme.textColor,
                                    border: 'none',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: isLoggingIn || !manualToken.trim() ? 'not-allowed' : 'pointer',
                                    opacity: isLoggingIn || !manualToken.trim() ? 0.7 : 1
                                }}
                            >
                                {isLoggingIn ? 'LOGGING IN...' : 'LOGIN WITH TOKEN'}
                            </button>
                        </div>

                        <div style={{
                            marginTop: '40px',
                            padding: '20px',
                            backgroundColor: '#3C3C3C',
                            borderRadius: '8px',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ color: theme.textColor, marginBottom: '10px' }}>
                                ℹ️ How to get a token:
                            </h3>
                            <ul style={{ color: theme.muted, fontSize: '14px', paddingLeft: '20px' }}>
                                <li>Log in on another device</li>
                                <li>Generate a QR code from the main menu</li>
                                <li>Copy the token displayed below the QR code</li>
                                <li>Paste it here to log in instantly</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Upload Image Mode */}
                {mode === 'upload' && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: theme.textColor, marginBottom: '20px' }}>
                            Upload QR Code Image
                        </h2>
                        <p style={{ color: theme.muted, marginBottom: '30px' }}>
                            Select a saved QR code image from your device
                        </p>

                        <div
                            style={{
                                border: `3px dashed ${theme.muted}`,
                                borderRadius: '12px',
                                padding: '60px 40px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                backgroundColor: '#3C3C3C',
                                maxWidth: '500px',
                                margin: '0 auto'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = theme.accent;
                                e.currentTarget.style.backgroundColor = `${theme.accent}20`;
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.style.borderColor = theme.muted;
                                e.currentTarget.style.backgroundColor = '#3C3C3C';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = theme.muted;
                                e.currentTarget.style.backgroundColor = '#3C3C3C';

                                const file = e.dataTransfer.files[0];
                                if (file) {
                                    const mockEvent = {
                                        target: { files: [file] }
                                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                                    handleFileUpload(mockEvent);
                                }
                            }}
                        >
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📸</div>
                            <div style={{ color: theme.textColor, fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>
                                Click or drag & drop to select image
                            </div>
                            <div style={{ color: theme.muted, fontSize: '14px' }}>
                                Supports: PNG, JPG, JPEG
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />

                        {isLoggingIn && (
                            <div style={{ marginTop: '30px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    border: `4px solid ${theme.muted}`,
                                    borderTop: `4px solid ${theme.accent}`,
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto'
                                }} />
                                <p style={{ color: theme.textColor, marginTop: '15px' }}>
                                    Processing QR code...
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Scan with Camera Mode */}
                {mode === 'scan' && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: theme.textColor, marginBottom: '20px' }}>
                            Scan QR Code with Camera
                        </h2>
                        <p style={{ color: theme.muted, marginBottom: '20px' }}>
                            Point your camera at the QR code to log in automatically
                        </p>

                        <div style={{
                            backgroundColor: '#000',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'inline-block',
                            border: `3px solid ${theme.muted}`,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                        }}>
                            <video
                                ref={videoRef}
                                style={{ width: '420px', height: '320px', objectFit: 'cover' }}
                                muted
                                playsInline
                                autoPlay
                            />
                        </div>

                        {scanError && (
                            <div style={{
                                backgroundColor: `${theme.negative}20`,
                                color: theme.textColor,
                                border: `1px solid ${theme.negative}`,
                                borderRadius: '8px',
                                padding: '10px',
                                marginTop: '15px',
                                maxWidth: '520px',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}>
                                {scanError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                            {!isScanning ? (
                                <button
                                    onClick={startScan}
                                    style={{
                                        backgroundColor: theme.accent,
                                        color: theme.textColor,
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ▶ Start Scanning
                                </button>
                            ) : (
                                <button
                                    onClick={stopScan}
                                    style={{
                                        backgroundColor: theme.negative,
                                        color: theme.textColor,
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ■ Stop Scanning
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Generate QR Mode */}
                {mode === 'generate' && (
                    <div style={{ textAlign: 'center' }}>
                        {qrCodeImage ? (
                            <>
                                <h2 style={{ color: theme.textColor, marginBottom: '20px' }}>
                                    Your QR Code for Login
                                </h2>
                                <p style={{ color: theme.muted, marginBottom: '30px' }}>
                                    Scan this code with another device to log in
                                </p>

                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    display: 'inline-block',
                                    marginBottom: '20px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                                }}>
                                    <img
                                        src={qrCodeImage}
                                        alt="QR Code"
                                        style={{
                                            width: '300px',
                                            height: '300px',
                                            display: 'block'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '15px',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={generateQRCode}
                                        disabled={isGenerating}
                                        style={{
                                            backgroundColor: isGenerating ? theme.muted : theme.accent,
                                            color: theme.textColor,
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                                            opacity: isGenerating ? 0.7 : 1
                                        }}
                                    >
                                        🔄 Generate New
                                    </button>

                                    <button
                                        onClick={handleDownloadQR}
                                        style={{
                                            backgroundColor: theme.positive,
                                            color: theme.textColor,
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📥 Download
                                    </button>
                                </div>
                            </>
                        ) : isGenerating ? (
                            <div>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    border: `6px solid ${theme.muted}`,
                                    borderTop: `6px solid ${theme.accent}`,
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '40px auto'
                                }} />
                                <p style={{ color: theme.textColor, fontSize: '18px' }}>
                                    Generating your QR code...
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ color: theme.textColor, marginBottom: '20px' }}>
                                    No QR code generated yet.
                                </p>
                                <button
                                    onClick={generateQRCode}
                                    style={{
                                        backgroundColor: theme.accent,
                                        color: theme.textColor,
                                        border: 'none',
                                        padding: '15px 30px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Generate QR Code
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Instructions Panel */}
            {/* Instructions Panel */}
            <div style={{
                marginTop: '30px',
                padding: '25px',
                backgroundColor: theme.panelBg,
                borderRadius: '8px',
                color: theme.muted,
                fontSize: '14px'
            }}>
                <h3 style={{ color: theme.textColor, marginBottom: '15px' }}>
                    💡 Quick Guide:
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                    <li><strong>Enter Token:</strong> Manually type in a QR token to log in</li>
                    <li><strong>Upload Image:</strong> Select a saved QR code image from your device</li>
                    {isLoggedIn && <li><strong>Generate QR:</strong> Create a new QR code for another device to scan</li>}
                    <li>QR codes can be used anytime after generation</li>
                    <li>Each QR code remains active until you generate a new one</li>
                    <li>QR codes never expire - save them for future use</li>
                    <li>Generate a new QR code if you lose your current one</li>
                </ul>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default QRLoginScreen;