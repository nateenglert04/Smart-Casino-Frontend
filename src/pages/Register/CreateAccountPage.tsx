import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
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
import { SmartCasinoClient } from '../../services/SmartCasinoClient';
import { useAuth } from '../../contexts/AuthContext';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ 
    username: '', 
    email: '',
    password: '', 
    confirmPassword: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Requirements Constants
  const requirements = {
    usernameMin: 3,
    usernameMax: 20,
    passMin: 8,
    passSpecial: /[!@#$%^&*(),.?":{}|<>]/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  };

  // Live Validation Logic
  const isValid = {
    usernameLength: formData.username.length >= requirements.usernameMin && formData.username.length <= requirements.usernameMax,
    email: requirements.emailRegex.test(formData.email),
    passLength: formData.password.length >= requirements.passMin,
    passSpecial: requirements.passSpecial.test(formData.password),
    passMatch: formData.password.length > 0 && formData.password === formData.confirmPassword
  };

  // Helper to check if form is ready for submit
  const isFormValid = isValid.usernameLength && isValid.email && isValid.passLength && isValid.passSpecial && isValid.passMatch;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isFormValid) {
      setError('Please ensure all requirements are met.');
      return;
    }

    try {
      setIsLoading(true);
      const client = SmartCasinoClient.getInstance();
      const registerPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      const response = await client.registerUser(registerPayload);
      
      if (response.token && response.user) {
         login(response.token, response.user);
         navigate('/dashboard'); 
      } else {
         navigate('/login');
      }

    } catch (err: any) {
      console.error(err);
      setError('Could not create User');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-felt-gradient p-4">
      <Card className="w-full max-w-md shadow-2xl border-sidebar-border/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 flex flex-col items-center text-center">
          {/* Logo - slightly smaller here to save vertical space */}
          <div className="w-60 h-60 relative">
            <img 
              src={smartCasinoLogo} 
              alt="Smart Casino Logo" 
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              Join the Table
            </CardTitle>
            <CardDescription>
              Create your profile to start playing.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            
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
                  placeholder="Choose a username"
                  className="pl-9"
                  value={formData.username}
                  onChange={handleInputChange}
                  maxLength={requirements.usernameMax}
                  autoComplete="username"
                />
              </div>
              <p className={`text-xs transition-colors ${
                  formData.username.length > 0 
                    ? (isValid.usernameLength ? 'text-green-600 dark:text-green-400' : 'text-destructive') 
                    : 'text-muted-foreground'
                }`}>
                {requirements.usernameMin}-{requirements.usernameMax} characters
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </div>
              {/* Only show email feedback if they have started typing */}
              {formData.email.length > 0 && !isValid.email && (
                <p className="text-xs text-destructive">Please enter a valid email address.</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="pl-9 pr-9"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="pl-9"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Combined Requirements Checklist */}
            <div className="space-y-1 mt-2 p-3 bg-muted/50 rounded-md border border-border/50">
              <p className="text-xs font-medium mb-2 text-muted-foreground">Security Requirements:</p>
              
              <RequirementItem 
                met={isValid.passLength} 
                text={`At least ${requirements.passMin} characters`} 
              />
              <RequirementItem 
                met={isValid.passSpecial} 
                text="At least one special character" 
              />
              <RequirementItem 
                met={isValid.passMatch} 
                text="Passwords match" 
              />
            </div>

          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full font-bold bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              <Link 
                to="/login"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Back to Login
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
      met ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'
    }`}>
      <CheckCircle2 className={`h-3 w-3 ${met ? 'opacity-100' : 'opacity-30'}`} />
      <span>{text}</span>
    </div>
  );
}

export default CreateAccountPage;