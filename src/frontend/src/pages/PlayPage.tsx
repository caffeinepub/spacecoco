import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Pause, Play, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useGameLoop } from '@/game/hooks/useGameLoop';
import { ControlsHintOverlay } from '@/game/ui/ControlsHintOverlay';
import { GameHUD } from '@/game/ui/GameHUD';
import { useMusicTrack } from '@/game/audio/useMusicTrack';
import { useSfx } from '@/game/audio/useSfx';

export default function PlayPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/play' }) as { mode?: string };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { playSfx } = useSfx(isMuted);
  
  const {
    gameState,
    isGameOver,
    startGame,
    pauseGame,
    resumeGame,
    spritesLoaded,
    spriteLoadError,
  } = useGameLoop(
    canvasRef,
    search.mode || 'local',
    isMuted,
    () => playSfx('pew', 100),
    () => playSfx('muuuuh', 200)
  );

  // Use modern music track instead of chiptune
  useMusicTrack(isPlaying && !isPaused && !isGameOver, isMuted);

  useEffect(() => {
    if (spritesLoaded && !isPlaying) {
      console.log('🎮 Starting game after sprites loaded');
      startGame();
      setIsPlaying(true);
    }
  }, [spritesLoaded, isPlaying, startGame]);

  const handlePauseToggle = () => {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
    setIsPaused(!isPaused);
  };

  const handlePlayAgain = () => {
    startGame();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleBackToLobby = () => {
    setIsPlaying(false);
    navigate({ to: '/lobby' });
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBackToLobby}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lobby
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handlePauseToggle} disabled={!spritesLoaded}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Game HUD */}
        <GameHUD gameState={gameState} />

        {/* Game Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="game-canvas w-full bg-black"
            tabIndex={0}
          />
          <ControlsHintOverlay />
          
          {!spritesLoaded && !spriteLoadError && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg">
              <Card className="p-8 text-center space-y-4">
                <h2 className="text-2xl font-display font-bold text-accent">Loading Game Assets...</h2>
                <p className="text-muted-foreground">Please wait</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
              </Card>
            </div>
          )}

          {spriteLoadError && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg">
              <Card className="p-8 text-center space-y-4 max-w-md">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-2xl font-display font-bold text-destructive">Asset Loading Failed</h2>
                <p className="text-muted-foreground">
                  Failed to load game assets. Please check your connection and try refreshing the page.
                </p>
                <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {spriteLoadError}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => window.location.reload()} variant="default">
                    Refresh Page
                  </Button>
                  <Button onClick={handleBackToLobby} variant="outline">
                    Back to Lobby
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {isPaused && spritesLoaded && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <Card className="p-8 text-center space-y-4">
                <h2 className="text-3xl font-display font-bold text-accent">Game Paused</h2>
                <p className="text-muted-foreground">Press the play button to continue</p>
              </Card>
            </div>
          )}

          {isGameOver && spritesLoaded && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <Card className="p-8 text-center space-y-6">
                <h2 className="text-4xl font-display font-bold text-destructive">Game Over!</h2>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-accent">Final Score: {gameState.score}</p>
                  <p className="text-lg text-muted-foreground">Level: {gameState.level}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handlePlayAgain} size="lg">
                    Play Again
                  </Button>
                  <Button onClick={handleBackToLobby} variant="outline" size="lg">
                    Back to Lobby
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="text-xl font-display font-bold mb-4 text-accent">How to Play</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Controls</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Arrow Keys: Change direction</li>
                <li>• The snake moves automatically</li>
                <li>• Avoid walls and yourself</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Objectives</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Eat UFOs to grow (+3 segments)</li>
                <li>• Catch flying cows for bonus points</li>
                <li>• Defeat penguin bosses for big rewards</li>
                <li>• Watch out for crocodiles!</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
