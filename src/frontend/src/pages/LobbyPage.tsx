import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Users, Play, Loader2 } from 'lucide-react';
import { NeonStartScene } from '@/components/start/NeonStartScene';
import { useLobby } from '@/multiplayer/useLobby';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const { isAuthenticated, profileLoading } = useCurrentUser();
  const { createLobby, joinLobby, waitingLobbies, lobbiesLoading } = useLobby();

  const handleLocalPlay = () => {
    navigate({ to: '/play', search: { mode: 'local' } });
  };

  const handleCreateLobby = async () => {
    if (!isAuthenticated) {
      alert('Please log in to create a lobby');
      return;
    }

    try {
      const lobbyId = await createLobby.mutateAsync(maxPlayers);
      navigate({ to: '/play', search: { mode: 'multiplayer', lobbyId: lobbyId.toString() } });
    } catch (error) {
      console.error('Failed to create lobby:', error);
      alert('Failed to create lobby');
    }
  };

  const handleJoinLobby = async () => {
    if (!isAuthenticated) {
      alert('Please log in to join a lobby');
      return;
    }

    if (!joinCode) {
      alert('Please enter a lobby code');
      return;
    }

    try {
      await joinLobby.mutateAsync(BigInt(joinCode));
      navigate({ to: '/play', search: { mode: 'multiplayer', lobbyId: joinCode } });
    } catch (error) {
      console.error('Failed to join lobby:', error);
      alert('Failed to join lobby');
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Animated Banner */}
        <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-accent/30 shadow-neon-strong">
          <NeonStartScene />
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-accent neon-text-glow">Game Lobby</h1>
              <p className="text-lg text-foreground">Choose your game mode and start playing!</p>
            </div>
          </div>
        </div>

        {/* Game Mode Selection */}
        <Tabs defaultValue="solo" className="w-full">
          <TabsList className="grid w-full grid-cols-2 neon-tabs">
            <TabsTrigger value="solo" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Solo Play
            </TabsTrigger>
            <TabsTrigger value="multiplayer" className="gap-2">
              <Users className="h-4 w-4" />
              Multiplayer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solo" className="space-y-4">
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="text-accent">Solo Mode</CardTitle>
                <CardDescription>
                  Practice your skills in single-player mode. Navigate the hollow sphere, survive extreme physics, and escape the ghost!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  onClick={handleLocalPlay}
                  className="w-full neon-button"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Solo Game
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiplayer" className="space-y-4">
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="text-accent">Create Lobby</CardTitle>
                <CardDescription>
                  Host a new multiplayer game for up to 10 players
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPlayers">Max Players (2-10)</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min={2}
                    max={10}
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 10)}
                    className="neon-input"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleCreateLobby}
                  disabled={createLobby.isPending || profileLoading || !isAuthenticated}
                  className="w-full neon-button"
                >
                  {createLobby.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5" />
                      Create Lobby
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="text-accent">Join Lobby</CardTitle>
                <CardDescription>
                  Enter a lobby code to join an existing game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Lobby Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="Enter lobby code..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="neon-input"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleJoinLobby}
                  disabled={joinLobby.isPending || profileLoading || !isAuthenticated}
                  className="w-full neon-button"
                >
                  {joinLobby.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Join Lobby
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Waiting Lobbies */}
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="text-accent">Available Lobbies</CardTitle>
                <CardDescription>
                  Join an open lobby waiting for players
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lobbiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : waitingLobbies && waitingLobbies.length > 0 ? (
                  <div className="space-y-2">
                    {waitingLobbies.map((lobby) => (
                      <div
                        key={lobby.id.toString()}
                        className="flex items-center justify-between p-4 border border-accent/30 rounded-lg bg-card/50"
                      >
                        <div>
                          <p className="font-semibold">Lobby #{lobby.id.toString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {lobby.players.length} / {lobby.maxPlayers.toString()} players
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setJoinCode(lobby.id.toString());
                            handleJoinLobby();
                          }}
                          disabled={joinLobby.isPending}
                          className="neon-button"
                        >
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No lobbies available. Create one to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="border-accent/30 bg-gradient-to-br from-primary/10 to-accent/10 neon-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-accent">Motor Snake 3D Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Smooth joystick movement = elegant snake. Aggressive = chaotic twisting!</li>
              <li>• Brake to trigger tail whip for emergency boosts</li>
              <li>• Collect anomalies for powerful but risky abilities</li>
              <li>• The ghost grows stronger over time—don't let it replace you!</li>
              <li>• In multiplayer, steal opponent power-ups by eating their tail</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
