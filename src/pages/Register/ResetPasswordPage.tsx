import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { ResetPasswordService } from '../../services/ResetPasswordService';
import { RequirementItem } from '../../components/RequirementItem';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const requirements = {
    passMin: 8,
    passSpecial: /[!@#$%^&*(),.?":{}|<>]/,
  };

  const isValid = {
    passLength: password.length >= requirements.passMin,
    passSpecial: requirements.passSpecial.test(password),
    passMatch: password.length > 0 && password === confirmPassword
  };

  const isFormValid = isValid.passLength && isValid.passSpecial && isValid.passMatch;

  const handleSendAuthenticatedCode = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      await ResetPasswordService.verifyEmail(user.email); // Trigger backend OTP
      setStep(2); // Jump straight to OTP entry
    } catch (err: any) {
      setError("Failed to send code to your registered email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await ResetPasswordService.verifyEmail(email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data || "Email not found or server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await ResetPasswordService.verifyOtp(parseInt(otp), email);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data || "Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError("Please ensure all password requirements are met.");
      return;
    }
    
    setIsLoading(true);
    try {
      await ResetPasswordService.resetPassword({
        email,
        otp: parseInt(otp),
        password,
        repeatPassword: confirmPassword
      });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-felt-gradient p-4">
      <Card className="w-full max-w-md shadow-2xl border-sidebar-border/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Link 
              to={isAuthenticated ? "/account" : "/login"} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Enter Code"}
              {step === 3 && "New Password"}
            </CardTitle>
          </div>
          <CardDescription>
            {step === 1 && "Enter your email to receive a verification code."}
            {step === 2 && `We sent a 6-digit code to ${email}`}
            {step === 3 && "Secure your account with a new password."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            isAuthenticated ? (
              /* Logged-in view: No input needed */
              <div className="py-4 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Account Email</p>
                  <p className="text-lg font-bold text-foreground">{user?.email}</p>
                </div>
                <p className="text-xs text-muted-foreground px-6">
                  Click the button below to receive a 6-digit verification code at this address.
                </p>
              </div>
            ) : (
              /* Guest view: Standard form */
              <form id="email-form" onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </form>
            )
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form id="otp-form" onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="number"
                    placeholder="123456"
                    className="pl-9 tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form id="reset-form" onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-pass">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-pass"
                    type="password"
                    placeholder="********"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-pass"
                    type="password"
                    placeholder="********"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

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
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">All Set!</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Your password has been successfully reset. 
                  {isAuthenticated ? " Your account is now updated." : " You can now log in with your new credentials."}
                </p>
              </div>

              <Button 
                onClick={() => navigate(isAuthenticated ? '/account' : '/login')} 
                className="w-full mt-6 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground font-bold"
              >
                {isAuthenticated ? "Back to Account" : "Back to Login"}
              </Button>
            </div>
          )}
        </CardContent>

        {step !== 4 && (
          <CardFooter>
            <Button 
              type={isAuthenticated && step === 1 ? "button" : "submit"} 
              form={(!isAuthenticated && step === 1) ? "email-form" : step === 2 ? "otp-form" : "reset-form"}
              onClick={isAuthenticated && step === 1 ? handleSendAuthenticatedCode : undefined}
              className="w-full font-bold bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  {step === 1 && "Send Verification Code"}
                  {step === 2 && "Verify Code"}
                  {step === 3 && "Reset Password"}
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;