// components/QRGenerateScreen.tsx
import React, { useState } from 'react';
import { userApi } from '../api';
import type { User, Theme, QRCodeResponse } from '../types';

interface QRGenerateScreenProps {
    user: User;
    onBack: () => void;
    theme: Theme;
    onError: (error: string) => void;
}

const QRGenerateScreen: React.FC<QRGenerateScreenProps> = ({
                                                               user,
                                                               onBack,
                                                               theme,
                                                               onError
                                                           }) => {
    const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateQR = async () => {
        setIsGenerating(true);
        try {
            const response = await userApi.generateQRCode();
            setQrData(response);
            onError('QR code generated successfully!');
        } catch (err) {
            onError('Failed to generate QR code: ' + (err as Error).message);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadQR = async () => {
        if (!qrData) return;

        try {
            const blob = await userApi.downloadQRCode(qrData.token);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `smartcasino-qr-${user.username}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            onError('QR code downloaded!');
        } catch (err) {
            onError('Download failed: ' + (err as Error).message);
        }
    };

    const copyToken = () => {
        if (!qrData) return;
        navigator.clipboard.writeText(qrData.token)
            .then(() => onError('Token copied to clipboard!'))
            .catch(() => onError('Failed to copy token'));
    };

    const regenerateQR = async () => {
        setIsGenerating(true);
        try {
            const response = await userApi.regenerateQRCode();
            setQrData(response);
            onError('New QR code generated!');
        } catch (err) {
            onError('Failed to regenerate QR code: ' + (err as Error).message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            maxWidth: '600px',
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
                <h1 style={{ color: theme.textColor, margin: 0 }}>
                    Generate QR Login
                </h1>
                <button
                    onClick={onBack}
                    style={{
                        background: theme.muted,
                        color: theme.textColor,
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Menu
                </button>
            </div>

            {/* Content */}
            <div style={{
                background: theme.panelBg,
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center'
            }}>
                {!qrData ? (
                    <div>
                        <h2 style={{color: theme.textColor, marginBottom: '20px'}}>
                            Generate QR Login Code
                        </h2>
                        <p style={{color: theme.muted, marginBottom: '30px'}}>
                            Create a QR code that can be scanned to log into your account on another device.
                            The QR code can be used once and then regenerated when needed.
                        </p>
                        <button
                            onClick={generateQR}
                            disabled={isGenerating}
                            style={{
                                background: isGenerating ? theme.muted : theme.accent,
                                color: theme.textColor,
                                border: 'none',
                                padding: '15px 30px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                margin: '0 auto'
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '2px solid transparent',
                                        borderTop: `2px solid ${theme.textColor}`,
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}/>
                                    Generating...
                                </>
                            ) : (
                                'Generate QR Code'
                            )}
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 style={{color: theme.textColor, marginBottom: '20px'}}>
                            Your QR Login Code
                        </h2>

                        {/* QR Code */}
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            display: 'inline-block',
                            marginBottom: '20px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                        }}>
                            <img
                                src={qrData.qrCode}
                                alt="QR Code"
                                style={{
                                    width: '250px',
                                    height: '250px',
                                    display: 'block'
                                }}
                            />
                        </div>

                        {/* Token */}
                        <div style={{
                            background: '#3C3C3C',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '30px',
                            textAlign: 'left'
                        }}>
                            <div style={{
                                color: theme.muted,
                                fontSize: '12px',
                                marginBottom: '5px',
                                fontWeight: 'bold'
                            }}>
                                Token for manual entry:
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <code style={{
                                    color: '#00FF00',
                                    fontSize: '14px',
                                    wordBreak: 'break-all',
                                    flex: 1,
                                    fontFamily: 'monospace'
                                }}>
                                    {qrData.token}
                                </code>
                                <button
                                    onClick={copyToken}
                                    style={{
                                        background: theme.accent,
                                        color: theme.textColor,
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={downloadQR}
                                style={{
                                    background: theme.positive,
                                    color: theme.textColor,
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontWeight: 'bold'
                                }}
                            >
                                📥 Download QR
                            </button>
                            <button
                                onClick={regenerateQR}
                                disabled={isGenerating}
                                style={{
                                    background: isGenerating ? theme.muted : theme.accent,
                                    color: theme.textColor,
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontWeight: 'bold'
                                }}
                            >
                                🔄 New QR
                            </button>
                        </div>
                    </>
                )}

                {/* Instructions */}
                {/* Instructions */}
                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: '#3C3C3C',
                    borderRadius: '8px',
                    textAlign: 'left'
                }}>
                    <h3 style={{
                        color: theme.textColor,
                        marginBottom: '15px',
                        fontSize: '18px'
                    }}>
                        💡 How to use this QR code:
                    </h3>
                    <ul style={{
                        color: theme.muted,
                        fontSize: '14px',
                        paddingLeft: '20px',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        <li><strong>Scan with camera:</strong> Open Smart Casino on another device, go to "QR Login" → "Upload Image"</li>
                        <li><strong>Manual entry:</strong> Use the token above in "QR Login" → "Enter Token"</li>
                        <li><strong>Save for later:</strong> Download the QR code image to use anytime</li>
                        <li>QR codes <strong>never expire</strong> and can be used multiple times</li>
                        <li>Generate a new QR code if you lose your current one</li>
                    </ul>
                </div>

                {/* Security Notice */}
                <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    backgroundColor: '#DC143C20',
                    border: `1px solid ${theme.negative}`,
                    borderRadius: '6px'
                }}>
                    <p style={{
                        color: theme.textColor,
                        fontSize: '12px',
                        margin: 0,
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}>
                        ⚠️ <strong>Security Notice:</strong> Keep your QR code safe like a password.
                        It never expires and can be used multiple times. Generate a new one if lost.
                    </p>
                </div>
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

export default QRGenerateScreen;