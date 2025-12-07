import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle} from 'lucide-react';

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
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation Constants
  const MIN_LENGTH = 3;
  const PASS_MIN = 8;

  // Implement Auth Context here when built

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(''); // Clear global errors on type
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic "Is not empty" check for login
    if (formData.identifier.length < MIN_LENGTH || formData.password.length < PASS_MIN) {
      setError('Please enter valid credentials.');
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

            {/* Username/Email Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  placeholder="DalBasnet123 or name@example.com"
                  className="pl-9"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  autoComplete="username"
                />
              </div>
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
                  maxLength={50}
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
                to="/createAccount" 
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

export default LoginPage;