import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, DollarSign, Crown, Activity, Spade, LayoutGrid, Dices, RefreshCw, Info, ChevronUp, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { leaderboardService, type LeaderboardEntry, type RankInfo, type UserRankResponse } from '../services/LeaderboardService';
import { useAuth } from '../contexts/AuthContext';

type SortOption = 'xp' | 'balance' | 'winnings' | 'winRate' | 'games';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<UserRankResponse | null>(null);
  const [rankThresholds, setRankThresholds] = useState<RankInfo | null>(null); 
  const [sortBy, setSortBy] = useState<SortOption>('xp');
  const [gameType, setGameType] = useState<string>('global'); 
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [limit] = useState(50);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      let results: LeaderboardEntry[] = [];
      if (rankFilter === 'all') {

        const res = await leaderboardService.getGlobalLeaderboard(limit, 0, sortBy, gameType);
        results = res.leaderboard;
      } else {
        const rankPlayers = await leaderboardService.getPlayersByRank(rankFilter);
        results = sortData(rankPlayers, sortBy);
      }

      setData(results);

      if (user?.id) {
        const userRes = await leaderboardService.getUserRankPosition(user.id);
        setUserRank(userRes);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const sortData = (items: LeaderboardEntry[], criteria: SortOption) => {
    return [...items].sort((a, b) => {
      switch (criteria) {
        case 'balance': return b.balance - a.balance;
        case 'winnings': return b.totalWinnings - a.totalWinnings;
        case 'winRate': return b.winRate - a.winRate;
        case 'games': return b.gamesPlayed - a.gamesPlayed;
        case 'xp': default: return b.xp - a.xp;
      }
    });
  };

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const res = await leaderboardService.getAllRanks();
        setRankThresholds(res);
      } catch (e) { console.error(e); }
    };
    fetchRanks();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, limit, gameType, rankFilter]);

  const RankIcon = ({ pos }: { pos: number }) => {
    if (pos === 1) return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />;
    if (pos === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (pos === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold w-5 text-center">{pos}</span>;
  };

  const RankColor = (pos: number) => {
    if (pos === 1) return "text-yellow-500";
    if (pos === 2) return "text-gray-400";
    if (pos === 3) return "text-amber-700";
    return "text-muted-foreground";
  };

  const isUserVisible = data.some(p => p.userId === user?.id);   

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'SC';

  const PlayerRow = ({ player, isMe = false }: { player: LeaderboardEntry | UserRankResponse, isMe?: boolean }) => (
    <div className={`grid grid-cols-12 gap-4 p-3 items-center rounded-lg transition-colors
      ${isMe ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-sidebar-accent/50'}`}
    >
      <div className={`col-span-2 md:col-span-1 flex justify-center ${RankColor(player.position)}`}>
        <RankIcon pos={player.position} />
      </div>
      <div className="col-span-5 md:col-span-5 flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
            <AvatarFallback>{getInitials(user?.username || '')}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className={`font-medium text-sm truncate max-w-[120px] ${isMe ? 'text-amber-500 font-bold' : ''}`}>
            {player.username} {isMe && '(You)'}
          </span>
          <span className="text-[10px] text-muted-foreground md:hidden">
             Lvl {player.level} • {player.rank}
          </span>
        </div>
      </div>
      <div className="col-span-2 hidden md:flex justify-center">
        <Badge variant="outline" className="bg-background/50 font-mono text-xs">
          {player.rank}
        </Badge>
      </div>
      <div className="col-span-2 text-right hidden md:flex flex-col justify-center">
         <span className="text-xs text-muted-foreground">{player.gamesPlayed} Games</span>
         {gameType !== 'global' && <span className="text-[10px] text-muted-foreground/70">{player.winRate.toFixed(1)}% Win</span>}
      </div>
      <div className="col-span-5 md:col-span-2 text-right font-mono font-medium">
        {sortBy === 'xp' && <span className="text-amber-500">{player.xp.toLocaleString()} XP</span>}
        {sortBy === 'balance' && <span className="text-green-500">{player.balance} Credits</span>}
        {sortBy === 'winnings' && <span className="text-blue-400">{player.totalWinnings} Credits</span>}
        {sortBy === 'winRate' && <span className="text-purple-400">{player.winRate.toFixed(1)}%</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 relative">
      
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground">See who rules the casino floor.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchLeaderboard} className="mt-1" disabled={isRefreshing}>
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Rank Info Modal */}
              <Dialog>
                <DialogTrigger asChild>
                   <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                      <Info className="w-4 h-4" /> Rules
                   </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rank Requirements</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 mt-4">
                    {rankThresholds && Object.entries(rankThresholds)
                      .sort(([, a], [, b]) => a - b)
                      .map(([rank, xp]) => (
                      <div key={rank} className="flex justify-between items-center p-2 border-b last:border-0">
                         <div className="flex items-center gap-2">
                            <Badge variant="outline">{rank}</Badge>
                         </div>
                         <span className="font-mono text-sm">{xp.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* NEW: Rank Filter Selector */}
              <div className="w-full sm:w-[160px]">
                <Select value={rankFilter} onValueChange={setRankFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" /> 
                        <span>All Ranks</span>
                      </div>
                    </SelectItem>
                    {/* Dynamically generate rank items based on API data */}
                    {rankThresholds && Object.keys(rankThresholds).map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        Rank {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Game Selector */}
              <div className="w-full sm:w-[200px]">
                <Select value={gameType} onValueChange={setGameType}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select Game" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global"><div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-muted-foreground" /> Global Stats</div></SelectItem>
                    <SelectItem value="blackjack"><div className="flex items-center gap-2"><Spade className="w-4 h-4 text-muted-foreground" /> Blackjack</div></SelectItem>
                    <SelectItem value="poker" disabled><div className="flex items-center gap-2 opacity-50"><Dices className="w-4 h-4" /> Poker (Soon)</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
        </div>

        {/* Filters */}
        <div className="flex p-1 bg-muted/50 rounded-lg overflow-x-auto w-full md:w-auto">
          {[
            { id: 'xp', label: 'Top XP', icon: Crown },
            { id: 'balance', label: 'Richest', icon: DollarSign },
            { id: 'winnings', label: 'Total Winnings', icon: Trophy },
            { id: 'winRate', label: 'Win Rate', icon: TrendingUp },
          ].map((opt) => (
            <Button
              key={opt.id}
              variant={sortBy === opt.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy(opt.id as SortOption)}
              className={`gap-2 whitespace-nowrap flex-1 md:flex-none ${sortBy === opt.id ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              <opt.icon className="w-4 h-4" /> {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-sidebar-border bg-sidebar/30 backdrop-blur-sm overflow-hidden flex flex-col h-[60vh]">
        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
          <div className="col-span-2 md:col-span-1 text-center">#</div>
          <div className="col-span-5 md:col-span-5">Player</div>
          <div className="col-span-2 text-center hidden md:block">Rank</div>
          <div className="col-span-3 md:col-span-2 text-right hidden md:block">{gameType === 'global' ? 'Overall' : gameType}</div>
          <div className="col-span-5 md:col-span-2 text-right">Metric</div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
          {loading ? (
             <div className="flex items-center justify-center h-40"><Activity className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            data.map((player) => (
              <PlayerRow key={player.userId} player={player} isMe={player.userId === user?.id} />
            ))
          )}
        </div>
      </Card>

      {!isUserVisible && userRank && !loading && (
        <div className="fixed bottom-6 left-0 right-0 md:left-64 p-4 z-50 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <Card className="bg-background/95 backdrop-blur shadow-2xl border-t-2 border-primary animate-in slide-in-from-bottom-10">
               <div className="relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 uppercase font-bold tracking-wider">
                    <ChevronUp className="w-3 h-3" /> Your Ranking
                 </div>
                 <div className="p-2">
                    <PlayerRow player={userRank} isMe={true} />
                 </div>
               </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

