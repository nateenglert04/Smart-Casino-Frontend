import { Link } from 'react-router-dom';
import { ArrowRight, Spade, BookOpen, Trophy, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 fade-in-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.username || 'Player'}.
        </h2>
        <p className="text-muted-foreground">
          Ready to hit the tables? Your current balance is <span className="text-sidebar-primary font-bold">{user?.balance?.toLocaleString()} Credits</span>.
        </p>
      </div>

      {/* Quick Action Hub */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Play Card */}
        <Card className="group relative overflow-hidden border-sidebar-primary/20 hover:border-sidebar-primary transition-colors">
            {/* Using your custom CSS class here for the header background */}
          <div className="absolute inset-0 bg-felt-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Spade className="h-5 w-5 text-sidebar-primary" />
              Card Games
            </CardTitle>
            <CardDescription>Blackjack, Poker, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Dive into the action. Your seat at the table is waiting.</p>
            <Button asChild className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-white">
              <Link to="/games">
                Play Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Learn Card */}
        <Card className="group relative overflow-hidden border-sidebar-primary/20 hover:border-sidebar-primary transition-colors">
          <div className="absolute inset-0 bg-felt-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sidebar-primary" />
              Lessons
            </CardTitle>
            <CardDescription>Master the mechanics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Learn card counting, probabilities, and game rules.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/lessons">
                Start Learning
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card className="group relative overflow-hidden border-sidebar-primary/20 hover:border-sidebar-primary transition-colors">
          <div className="absolute inset-0 bg-felt-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Leaderboard
            </CardTitle>
            <CardDescription>See who is on top.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Compare your statistics against the best players.</p>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/leaderboard">
                View Rankings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stats or History (Placeholder) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3 bg-muted/40">
           <CardHeader>
            <CardTitle>Your Wallet</CardTitle>
            <CardDescription>Current funds available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm">Total Balance</span>
                    
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                        <Wallet className="w-4 h-4 mr-2" />
                        <span className="font-bold text-xl">{user?.balance?.toLocaleString()} Credits</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm">User ID</span>
                    <span className="font-mono text-xs text-muted-foreground">#{user?.id}</span>
                </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-muted/40">
           <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-bold text-sidebar-primary">58%</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm">Hands Played</span>
                    <span className="font-bold">142</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}