import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardPage() {
  // TODO: Implement leaderboard with backend
  const mockLeaderboard = [
    { rank: 1, name: 'SpaceAce', score: 2500, level: 25 },
    { rank: 2, name: 'CosmicSnake', score: 2100, level: 21 },
    { rank: 3, name: 'StarHunter', score: 1850, level: 18 },
    { rank: 4, name: 'GalaxyGamer', score: 1600, level: 16 },
    { rank: 5, name: 'NebulaNinja', score: 1400, level: 14 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-accent">Leaderboard</h1>
          <p className="text-lg text-muted-foreground">
            Top players across the galaxy
          </p>
        </div>

        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Global Top Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.rank <= 3 ? 'bg-accent/10 border border-accent/30' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-card/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Your Best Score</h3>
              <p className="text-muted-foreground text-sm">
                Sign in to track your personal best and compete on the leaderboard
              </p>
              <Badge variant="outline" className="mt-2">
                Coming Soon
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
