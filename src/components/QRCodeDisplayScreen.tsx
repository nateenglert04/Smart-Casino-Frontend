// components/QRCodeDisplayScreen.tsx
import React, { useState } from 'react';
import type { Theme, User } from '../types';

interface QRCodeDisplayScreenProps {
    user: User;
    qrData: {
        qrCode: string;
        token: string;
        qrContent: string;
        downloadUrl: string;
    };
    onProceed: () => void;
    theme: Theme;
    onError: (error: string) => void;
}

const QRCodeDisplayScreen: React.FC<QRCodeDisplayScreenProps> = ({
                                                                     user,
                                                                     qrData,
                                                                     onProceed,
                                                                     theme,
                                                                     onError
                                                                 }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Download QR code as image
            const response = await fetch(qrData.downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `smartcasino-qr-${user.username}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            onError('QR code downloaded successfully!');
        } catch (error) {
            onError('Failed to download QR code: ' + (error as Error).message);
        } finally {
            setIsDownloading(false);
        }
    };

    const copyTokenToClipboard = () => {
        navigator.clipboard.writeText(qrData.token)
            .then(() => onError('Token copied to clipboard!'))
            .catch(() => onError('Failed to copy token'));
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: theme.panelBg,
                borderRadius: '12px',
                padding: '30px',
                width: '100%',
                textAlign: 'center'
            }}>
                <h1 style={{
                    color: theme.textColor,
                    marginBottom: '10px'
                }}>
                    🎉 Welcome {user.username}!
                </h1>

                <p style={{
                    color: theme.muted,
                    marginBottom: '30px'
                }}>
                    Your account has been created successfully.
                </p>

                <h2 style={{
                    color: theme.textColor,
                    marginBottom: '20px',
                    borderBottom: `2px solid ${theme.accent}`,
                    paddingBottom: '10px'
                }}>
                    QR Code Login
                </h2>

                <p style={{
                    color: theme.muted,
                    marginBottom: '25px',
                    fontSize: '14px'
                }}>
                    Scan this QR code with your phone or save it for quick login later.
                </p>

                {/* QR Code Display */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '25px'
                }}>
                    <img
                        src={qrData.qrCode}
                        alt="QR Code for login"
                        style={{
                            width: '250px',
                            height: '250px',
                            display: 'block'
                        }}
                    />
                </div>

                {/* Token Display */}
                <div style={{
                    backgroundColor: '#3C3C3C',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '25px',
                    textAlign: 'left'
                }}>
                    <div style={{
                        color: theme.muted,
                        fontSize: '12px',
                        marginBottom: '5px'
                    }}>
                        QR Token (for manual entry):
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
                            flex: 1
                        }}>
                            {qrData.token}
                        </code>
                        <button
                            onClick={copyTokenToClipboard}
                            style={{
                                backgroundColor: theme.accent,
                                color: theme.textColor,
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{
                    backgroundColor: '#3C3C3C',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    textAlign: 'left'
                }}>
                    <h3 style={{
                        color: theme.textColor,
                        fontSize: '16px',
                        marginBottom: '10px'
                    }}>
                        How to use your QR code:
                    </h3>
                    <ul style={{
                        color: theme.muted,
                        fontSize: '14px',
                        paddingLeft: '20px',
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        <li>Open the Smart Casino app on another device</li>
                        <li>Go to "QR Login" and select "Scan QR Code"</li>
                        <li>Point your camera at this QR code</li>
                        <li>You'll be automatically logged in!</li>
                        <li>Alternatively, use the token above for manual entry</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginTop: '20px'
                }}>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        style={{
                            backgroundColor: isDownloading ? theme.muted : theme.positive,
                            color: theme.textColor,
                            border: 'none',
                            padding: '15px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: isDownloading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {isDownloading ? 'Downloading...' : '📥 Download QR Code'}
                    </button>

                    <button
                        onClick={onProceed}
                        style={{
                            backgroundColor: theme.accent,
                            color: theme.textColor,
                            border: 'none',
                            padding: '15px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Proceed to Main Menu →
                    </button>
                </div>

                {/* Security Notice */}
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
                        textAlign: 'center'
                    }}>
                        ⚠️ <strong>Security Notice:</strong> Keep your QR code safe like a password.
                        It never expires and can be used multiple times. Generate a new one if lost.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRCodeDisplayScreen;