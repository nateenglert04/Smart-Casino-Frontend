import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Wallet, Save, Loader2, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthenticationService } from '../services/AuthenticationService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

export default function AccountPage() {
  const { user, updateUser, logout, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
        const response = await AuthenticationService.updateProfile(formData);
        
        if (response.token) {
        login(response.token, response.user);
        } else {
        updateUser(response.user);
        }
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
        setIsUpdating(false);
    }
  };
  
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'SC';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h2>
        <p className="text-muted-foreground">Manage your profile information and security preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Sidebar Summary */}
        <Card className="md:col-span-1 border-sidebar-border/50 bg-sidebar/5">
        <CardHeader className="items-center text-center">
            {/* Container div with the border */}
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 mb-3 shadow-inner overflow-hidden">
            <Avatar className="w-full h-full text-primary rounded-none">
                <AvatarImage 
                src="https://github.com/shadcn.png" 
                alt={user?.username} 
                className="object-cover" 
                />
                <AvatarFallback className="text-xl font-bold bg-primary/5">
                {getInitials(user?.username || '')}
                </AvatarFallback>
            </Avatar>
            </div>
            <CardTitle className="text-xl font-bold">{user?.username}</CardTitle>
            <CardDescription className="truncate w-full">{user?.email}</CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border/50 shadow-sm">
               <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Wallet className="w-4 h-4 text-emerald-500" /> Wallet
               </div>
               <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                 {user?.balance?.toLocaleString()} Credits
               </span>
            </div>
          </CardContent>
          <CardFooter>
             <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive group" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Log Out
             </Button>
          </CardFooter>
        </Card>

        {/* Edit Profile Section */}
        <Card className="md:col-span-2 shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your public identity and contact email.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-6">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm border animate-in slide-in-from-top-2 ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      value={formData.username} 
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="pl-9 bg-muted/20"
                      placeholder="Enter new username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-9 bg-muted/20"
                      placeholder="yourname@example.com"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-tighter">
                  <Shield className="w-4 h-4" /> Security Management
                </h4>
                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl border border-dashed border-border/60">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Credential Reset</p>
                    <p className="text-xs text-muted-foreground">You will be sent a verification code to your email.</p>
                  </div>
                  <Button variant="secondary" size="sm" type="button" onClick={() => navigate('/reset-password')} className="shadow-sm">
                    <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end bg-muted/20 border-t p-4 rounded-b-xl gap-3">
              <Button type="submit" disabled={isUpdating} className="min-w-[140px] font-bold shadow-md">
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}