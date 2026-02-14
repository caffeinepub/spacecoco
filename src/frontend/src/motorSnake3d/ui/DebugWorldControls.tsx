import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameState } from '../state/gameState';

export function DebugWorldControls() {
  const { worldMode, setWorldMode, setCoreIntact, setAbyssMode } = useGameState();

  const toggleWorldMode = () => {
    setWorldMode(worldMode === 'inside' ? 'outside' : 'inside');
  };

  const triggerCoreBreak = () => {
    setCoreIntact(false);
    setAbyssMode(true);
    
    setTimeout(() => {
      setAbyssMode(false);
      setCoreIntact(true);
    }, 3000);
  };

  return (
    <Card className="absolute top-4 left-4 p-4 bg-black/70 backdrop-blur border-accent/30 z-40">
      <h3 className="text-sm font-bold text-accent mb-2">World Controls</h3>
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={toggleWorldMode}
          className="w-full text-xs"
        >
          Toggle: {worldMode}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={triggerCoreBreak}
          className="w-full text-xs"
        >
          Break Core
        </Button>
      </div>
    </Card>
  );
}
