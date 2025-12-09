import { useState } from 'react';
import { QrCode, Download, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { SmartCasinoClient } from '../services/SmartCasinoClient';
import { useAuth } from '../contexts/AuthContext';

export function QrAccessModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    try {
      setLoading(true);
      const client = SmartCasinoClient.getInstance();

      const response = await client.generateUserQr();
      
      if (response.token) {
        setQrToken(response.token);
        // The generate endpoint usually returns a base64 preview for UI
        setQrPreview(response.qrCode); 
      }
    } catch (error) {
      console.error("Failed to generate QR", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingCode = async () => {
    try {
      setLoading(true);
      const client = SmartCasinoClient.getInstance();
      // Calls /qr/generate (Safe)
      const response = await client.generateUserQr();
      
      if (response && response.token && response.qrCode) {
        setQrToken(response.token);
        setQrPreview(response.qrCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const client = SmartCasinoClient.getInstance();
      const response = await client.regenerateUserQr();
      
      if (response && response.token && response.qrCode) {
        setQrToken(response.token);
        setQrPreview(response.qrCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !qrToken) {
      loadExistingCode();
    }
  };

  const handleDownload = async () => {
    if (!qrToken) return;
    
    try {
      const client = SmartCasinoClient.getInstance();
      const blob = await client.downloadQrImage(qrToken);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      link.download = `smartcasino-key-${user?.username}.png`; 
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <QrCode className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Secure Login Key</DialogTitle>
          <DialogDescription>
            Download this Key. When you log in next time, simply upload this image to authenticate instantly.
          </DialogDescription>
          <DialogDescription><strong>Make sure to save somewhere safe!</strong></DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {loading ? (
            <div className="h-48 w-48 flex items-center justify-center border-2 border-dashed rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : qrPreview ? (
            <div className="relative group">
               <div className="p-3 bg-white rounded-lg shadow-inner border">
                  <img src={qrPreview} alt="Login QR" className="w-48 h-48 object-contain" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                 <CheckCircle2 className="w-4 h-4" />
               </div>
            </div>
          ) : (
            <div className="h-48 w-48 flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-sm">
              Key Unavailable
            </div>
          )}

          <div className="flex gap-2 w-full pt-2">
            <Button 
              onClick={handleRegenerate} 
              variant="outline" 
              className="flex-1"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button 
              onClick={handleDownload} 
              className="flex-1 bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
              disabled={!qrToken || loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}