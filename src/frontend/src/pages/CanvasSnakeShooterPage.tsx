import { useEffect, useRef } from 'react';
import { useCanvasSnakeShooter } from '@/canvasSnakeShooter/useCanvasSnakeShooter';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function CanvasSnakeShooterPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { gameState, restart } = useCanvasSnakeShooter(canvasRef);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full h-screen bg-black overflow-hidden focus:outline-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Score Display */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm border border-accent/50 rounded-lg px-6 py-3">
          <div className="text-accent text-3xl font-bold tracking-wider" style={{ textShadow: '0 0 20px currentColor' }}>
            {gameState.score}
          </div>
          <div className="text-accent/70 text-xs uppercase tracking-widest">Score</div>
        </div>
      </div>

      {/* Home Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => navigate({ to: '/' })}
          variant="outline"
          size="icon"
          className="bg-black/60 backdrop-blur-sm border-accent/50 hover:bg-accent/20"
        >
          <Home className="h-5 w-5 text-accent" />
        </Button>
      </div>

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-6 px-4">
            <h1
              className="text-6xl md:text-8xl font-bold text-accent uppercase tracking-wider"
              style={{ textShadow: '0 0 40px currentColor, 0 0 80px currentColor' }}
            >
              Game Over
            </h1>
            <div className="text-4xl text-accent/80">
              Final Score: <span className="font-bold text-accent">{gameState.score}</span>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Button
                onClick={restart}
                size="lg"
                className="bg-accent hover:bg-accent/80 text-black font-bold px-8 py-6 text-xl"
                style={{ boxShadow: '0 0 30px currentColor' }}
              >
                <RotateCcw className="mr-2 h-6 w-6" />
                Restart
              </Button>
              <Button
                onClick={() => navigate({ to: '/' })}
                size="lg"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 font-bold px-8 py-6 text-xl"
              >
                <Home className="mr-2 h-6 w-6" />
                Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
