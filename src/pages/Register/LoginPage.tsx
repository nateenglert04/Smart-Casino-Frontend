import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, UploadCloud } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import smartCasinoLogo from '../../assets/smart-casino.png';
import { useAuth } from '../../contexts/AuthContext';
import { SmartCasinoClient } from '../../services/SmartCasinoClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<'standard' | 'qr'>('standard');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const MIN_LENGTH = 3;
  const PASS_MIN = 8;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processQrFile = async (file: File) => {
    if (!file) return;

    // Basic type check
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG/JPG).');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const client = SmartCasinoClient.getInstance();
      
      // Send to backend endpoint /upload
      const response = await client.uploadLoginQr(file);

      if (response.token && response.user) {
        login(response.token, response.user);
        navigate('/');
      } else {
        setError('QR Key valid, but authentication failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid Access Key. Please try a different image or standard login.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processQrFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processQrFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(''); 
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.username.length < MIN_LENGTH || formData.password.length < PASS_MIN) {
      setError('Please enter valid credentials.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Logging in with:', formData);
      
      const client = SmartCasinoClient.getInstance();
      const response = await client.loginUser(formData);
      
      if (response.token && response.user) {
        login(response.token, response.user);
        navigate('/'); 
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-felt-gradient p-4">
      
      <Card className="w-full max-w-md shadow-2xl border-sidebar-border/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 flex flex-col items-center text-center">
          <div className="w-60 h-60 relative">
            <img 
              src={smartCasinoLogo} 
              alt="Smart Casino Logo" 
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              Welcome Back to Smart Casino!
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the table.
            </CardDescription>
          </div>

          <div className="flex w-full bg-muted/50 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => { setLoginMethod('standard'); setError(''); }}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                loginMethod === 'standard' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('qr'); setError(''); }}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                loginMethod === 'qr' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              QR Code
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">

          {/* Global Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Login Form */}
          {loginMethod === 'standard' && (
            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="DalBasnet123"
                    className="pl-9"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    placeholder="********"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-9 pr-9"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* QR Upload View */}
          {loginMethod === 'qr' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                  ${isDragging 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-muted-foreground/25 hover:bg-muted/50 hover:border-primary/50'
                  }
                `}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm font-medium text-primary">Verifying Key...</span>
                  </div>
                ) : (
                  <>
                    <div className="bg-background p-3 rounded-full shadow-sm mb-3">
                        <UploadCloud className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {isDragging ? 'Drop key here' : 'Click or Drag QR Key'}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center px-8 mt-2">
                      Upload the image saved from your dashboard to log in automatically.
                    </p>
                  </>
                )}
                <Input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/png, image/jpeg"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {loginMethod === 'standard' && (
            <Button 
              type="submit" 
              form="login-form"
              className="w-full font-bold bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Dealing...' : 'Log In'}
            </Button>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have a seat at the table?{' '}
            <Link 
              to="/createAccount" 
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Create Account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;