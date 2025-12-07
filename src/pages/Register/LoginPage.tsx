import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

// Shadcn UI Imports - Adjust paths based on your folder structure
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

// Asset Import
import smartCasinoLogo from '../../assets/smart-casino.png';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // State Management
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation Requirements
  const requirements = {
    usernameMin: 3,
    usernameMax: 20,
    passMin: 8,
    passSpecial: /[!@#$%^&*(),.?":{}|<>]/,
  };

  // Helper to check validation status for UI feedback
  const isValid = {
    usernameLength: formData.username.length >= requirements.usernameMin && formData.username.length <= requirements.usernameMax,
    passLength: formData.password.length >= requirements.passMin,
    passSpecial: requirements.passSpecial.test(formData.password),
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(''); // Clear global errors on type
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Final Validation Check
    if (!isValid.usernameLength || !isValid.passLength || !isValid.passSpecial) {
      setError('Please meet all field requirements below.');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Add your Auth API call here
      console.log('Logging in with:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to dashboard on success
      navigate('/dashboard'); 
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Applied your custom CSS class 'bg-felt-gradient' here
    <div className="min-h-screen w-full flex items-center justify-center bg-felt-gradient p-4">
      
      <Card className="w-full max-w-md shadow-2xl border-sidebar-border/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 flex flex-col items-center text-center">
          <div className="w-60 h-60 relative mb-1">
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
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            
            {/* Global Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
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
                  maxLength={requirements.usernameMax}
                  autoComplete="username"
                />
              </div>
              {/* Username requirements text */}
              <p className={`text-xs transition-colors ${
                  formData.username.length > 0 
                    ? (isValid.usernameLength ? 'text-green-600 dark:text-green-400' : 'text-destructive') 
                    : 'text-muted-foreground'
                }`}>
                Must be between {requirements.usernameMin} and {requirements.usernameMax} characters.
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  placeholder="********"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-9 pr-9"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Live Validation Checklist */}
              <div className="space-y-1 mt-2 p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Password Requirements:</p>
                
                <RequirementItem 
                  met={isValid.passLength} 
                  text={`At least ${requirements.passMin} characters long`} 
                />
                <RequirementItem 
                  met={isValid.passSpecial} 
                  text="Contains at least one special character (!@#...)" 
                />
              </div>
            </div>

          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full font-bold bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Dealing...' : 'Log In'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have a seat at the table?{' '}
              <Link 
                to="/create-account" 
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Create Account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
      met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
    }`}>
      <CheckCircle2 className={`h-3 w-3 ${met ? 'opacity-100' : 'opacity-30'}`} />
      <span>{text}</span>
    </div>
  );
}

export default LoginPage;