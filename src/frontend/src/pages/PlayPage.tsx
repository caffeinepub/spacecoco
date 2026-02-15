import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { MotorSnakeGameRoot } from '@/motorSnake3d/MotorSnakeGameRoot';
import { useAudioContextMusic } from '@/game/audio/useAudioContextMusic';
import { useBeatClock } from '@/game/audio/useBeatClock';
import { AudioDirector } from '@/motorSnake3d/audio/AudioDirector';
import { VfxBus } from '@/motorSnake3d/vfx/VfxBus';
import { useMatchEvents } from '@/multiplayer/useMatchEvents';
import { NeonStartCoverOverlay } from '@/components/start/NeonStartCoverOverlay';

export default function PlayPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/play' }) as { mode?: string; lobbyId?: string };
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [gameplayIntensity, setGameplayIntensity] = useState(0);

  const lobbyId = search.lobbyId ? BigInt(search.lobbyId) : null;
  const { submitAction } = useMatchEvents(lobbyId);

  const audioDirectorRef = useRef<AudioDirector | null>(null);

  const { audioContext, unlockAudioContext } = useAudioContextMusic(
    isPlaying && !isPaused,
    isMuted,
    gameplayIntensity,
    0
  );

  const { beatPhase } = useBeatClock(isPlaying && !isPaused, audioContext);

  useEffect(() => {
    audioDirectorRef.current = new AudioDirector((state) => {
      console.log('Music intensity state:', state);
    });
  }, []);

  const handleUserGesture = async () => {
    if (!audioUnlocked) {
      await unlockAudioContext();
      setAudioUnlocked(true);
    }
  };

  const handleStartGame = async () => {
    await handleUserGesture();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = async () => {
    await handleUserGesture();
    setIsPaused(false);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleIntensityChange = (intensity: number) => {
    setGameplayIntensity(intensity);
    audioDirectorRef.current?.setGameplayIntensity(intensity);
  };

  const handleVfxTrigger = (event: string, payload?: any) => {
    VfxBus.trigger(event, payload);
    audioDirectorRef.current?.triggerVfxSound(event);
  };

  return (
    <div className="min-h-screen py-8 relative z-10">
      <div className="container-custom max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/lobby' })}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lobby
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleMuteToggle}
              className="neon-button-outline"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            {isPlaying && (
              <Button
                variant="outline"
                onClick={isPaused ? handleResume : handlePause}
                className="gap-2 neon-button-outline"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <Card className="relative overflow-hidden p-0 neon-card h-[800px]">
          {!isPlaying && (
            <div className="absolute inset-0 z-50">
              <NeonStartCoverOverlay />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-6 pointer-events-auto">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-primary neon-text-glow drop-shadow-2xl">
                    Motor Snake 3D
                  </h2>
                  <p className="text-lg text-foreground max-w-md mx-auto drop-shadow-lg backdrop-blur-sm bg-black/30 p-4 rounded-xl border border-accent/30">
                    Navigate a hollow sphere, survive extreme physics, collect anomalies, and escape the ghost!
                  </p>
                  <Button
                    size="lg"
                    onClick={handleStartGame}
                    className="neon-button text-lg px-8 py-6 shadow-2xl"
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isPaused && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-display font-bold text-primary neon-text-glow">
                  Paused
                </h2>
                <Button
                  size="lg"
                  onClick={handleResume}
                  className="neon-button text-lg px-8 py-6"
                >
                  Resume Game
                </Button>
              </div>
            </div>
          )}

          <MotorSnakeGameRoot
            isPaused={isPaused}
            onIntensityChange={handleIntensityChange}
            onVfxTrigger={handleVfxTrigger}
          />
        </Card>

        <Card className="mt-6 p-6 space-y-4 neon-card">
          <h3 className="text-lg font-display font-bold text-primary">Motor Snake 3D Controls</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Desktop:</strong> Arrow keys or WASD for analog movement</li>
            <li>• <strong>Mobile:</strong> Virtual joystick (bottom-left)</li>
            <li>• <strong>Brake:</strong> Spacebar (triggers tail whip)</li>
            <li>• <strong>Shake:</strong> Shift+S (removes baby penguins)</li>
            <li>• Navigate inside/outside the hollow sphere</li>
            <li>• Survive gravity cycles, wind portals, fog, and acid rain</li>
            <li>• Collect anomalies for power-ups with tradeoffs</li>
            <li>• Beware the ghost that grows stronger over time</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
