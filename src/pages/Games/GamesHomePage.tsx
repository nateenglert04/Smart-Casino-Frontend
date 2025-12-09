import { Link } from 'react-router-dom';
import { Spade, Club, ArrowRight, Users, Info, Lock,} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

// Configuration array to make adding future games easy
const gamesData = [
  {
    id: 'blackjack',
    name: 'Classic Blackjack',
    description: 'Race to 21 against the dealer. Dealer stands on 17.',
    icon: Spade,
    path: '/games/blackjack',
    color: 'text-sidebar-primary',
    accent: 'bg-sidebar-primary/10',
    tags: ['Single Player', 'Strategy'],
    stats: { minBet: 10, payout: '3:2' },
    status: 'active'
  },
  {
    id: 'poker',
    name: 'Texas Hold\'em',
    description: 'No limit multiplayer action. Bluff your way to the pot.',
    icon: Club,
    path: '/games/poker',
    color: 'text-[hsl(var(--chart-3))]',
    accent: 'bg-[hsl(var(--chart-3))]/10',
    tags: ['Multiplayer', 'High Stakes'],
    stats: { minBet: 50, payout: 'Pot' },
    status: 'active'
  },
];

export default function GamesHome() {
  return (
    <div className="space-y-8 fade-in-10">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">The Casino Floor</h2>
        <p className="text-muted-foreground">
          Choose your table. Good luck.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {gamesData.map((game) => (
          <Card 
            key={game.id} 
            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg
              ${game.status === 'coming-soon' ? 'opacity-75 border-dashed' : 'border-sidebar-primary/20 hover:border-sidebar-primary'}
            `}
          >
            {game.status === 'active' && (
               <div className="absolute inset-0 bg-felt-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
            )}

            <CardHeader>
              <div className="flex justify-between items-start">
                {/* Icon Box */}
                <div className={`p-3 rounded-lg ${game.accent} ${game.color} mb-2`}>
                   <game.icon className="h-6 w-6" />
                </div>
                {/* Status Badges */}
                {game.status === 'active' ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    Min: {game.stats.minBet}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-mono text-xs">
                    Soon
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-xl">{game.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {game.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Game Tags/Attributes */}
              <div className="flex flex-wrap gap-2 mb-4">
                {game.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded"
                  >
                    {tag === 'Multiplayer' && <Users className="w-3 h-3 mr-1" />}
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats Row*/}
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="w-4 h-4 mr-2" />
                <span>Payout: <span className="text-foreground font-medium">{game.stats.payout}</span></span>
              </div>
            </CardContent>

            <CardFooter>
              {game.status === 'active' ? (
                <Button asChild className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-white group-hover:translate-y-[-2px] transition-transform">
                  <Link to={game.path}>
                    Play Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button disabled variant="outline" className="w-full cursor-not-allowed">
                  <Lock className="mr-2 h-4 w-4" /> Locked
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
        
      </div>
    </div>
  );
}