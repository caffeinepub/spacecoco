import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useGameLoop } from '@/game/hooks/useGameLoop';
import { ControlsHintOverlay } from '@/game/ui/ControlsHintOverlay';
import { GameHUD } from '@/game/ui/GameHUD';
import { useChiptuneLoop } from '@/game/audio/useChiptuneLoop';

export default function PlayPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/play' }) as { mode?: string };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const {
    gameState,
    isGameOver,
    startGame,
    pauseGame,
    resumeGame,
  } = useGameLoop(canvasRef, search.mode || 'local');

  // Initialize chiptune music
  useChiptuneLoop(isPlaying && !isPaused && !isGameOver, isMuted);

  useEffect(() => {
    startGame();
    setIsPlaying(true);
  }, []);

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
            <Button variant="outline" size="icon" onClick={handlePauseToggle}>
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
          />
          <ControlsHintOverlay />
          
          {isPaused && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
              <Card className="p-8 text-center space-y-4">
                <h2 className="text-3xl font-display font-bold text-accent">PAUSED</h2>
                <p className="text-muted-foreground">Press resume to continue</p>
                <Button onClick={handlePauseToggle} className="bg-accent hover:bg-accent/90">
                  Resume Game
                </Button>
              </Card>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <Card className="p-8 text-center space-y-4 max-w-md">
                <h2 className="text-4xl font-display font-bold text-accent">GAME OVER</h2>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">Score: {gameState.score}</p>
                  <p className="text-lg text-muted-foreground">Level: {gameState.level}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handlePlayAgain} className="flex-1 bg-accent hover:bg-accent/90">
                    Play Again
                  </Button>
                  <Button onClick={handleBackToLobby} variant="outline" className="flex-1">
                    Lobby
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card className="p-4 bg-card/50">
          <p className="text-sm text-muted-foreground text-center">
            Collect flying cows to gain laser powers • Circle penguin bosses 3 times • Reach 1000 points for Supreme Cow
          </p>
        </Card>
      </div>
    </div>
  );
}
