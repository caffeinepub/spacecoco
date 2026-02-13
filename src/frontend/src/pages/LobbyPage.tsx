import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Users, Play } from 'lucide-react';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleLocalPlay = () => {
    navigate({ to: '/play', search: { mode: 'local' } });
  };

  const handleCreateLobby = () => {
    // TODO: Implement multiplayer lobby creation
    console.log('Create lobby - multiplayer not yet implemented');
  };

  const handleJoinLobby = () => {
    // TODO: Implement multiplayer lobby join
    console.log('Join lobby:', joinCode);
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-accent">Game Lobby</h1>
          <p className="text-lg text-muted-foreground">Choose your game mode and start playing!</p>
        </div>

        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Local Play</TabsTrigger>
            <TabsTrigger value="multiplayer">Multiplayer</TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-accent" />
                  Single Player
                </CardTitle>
                <CardDescription>
                  Practice your skills and climb the leaderboard in solo mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    • Face alien planets with unique hazards
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Battle penguin bosses every 5 levels
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Unlock the Supreme Cow at 1000 points
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                  onClick={handleLocalPlay}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Local Game
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiplayer" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-accent/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Create Lobby
                  </CardTitle>
                  <CardDescription>
                    Host a game for up to 8 players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleCreateLobby}
                    disabled
                  >
                    Create Lobby (Coming Soon)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Multiplayer features are under development
                  </p>
                </CardContent>
              </Card>

              <Card className="border-accent/30">
                <CardHeader>
                  <CardTitle>Join Lobby</CardTitle>
                  <CardDescription>
                    Enter a lobby code to join friends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinCode">Lobby Code</Label>
                    <Input
                      id="joinCode"
                      placeholder="Enter code..."
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      disabled
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleJoinLobby}
                    disabled
                  >
                    Join Game (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="border-primary/30 bg-card/50">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Use arrow keys, WASD, or swipe on mobile to control your snake</p>
            <p>• Collect flying cows dropped by UFOs to gain laser powers</p>
            <p>• Red lasers burn, blue lasers freeze, green lasers poison</p>
            <p>• Each planet has unique hazards - adapt your strategy!</p>
            <p>• Circle penguin bosses 3 times to defeat them</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
