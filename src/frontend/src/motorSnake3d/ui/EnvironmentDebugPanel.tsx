import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useGameState } from '../state/gameState';
import { useState } from 'react';

export function EnvironmentDebugPanel() {
  const {
    gravityMultiplier,
    fogIntensity,
    setFogIntensity,
    setAcidRainActive,
    setShieldActive,
    shieldActive,
  } = useGameState();

  const [localFog, setLocalFog] = useState(fogIntensity);

  const handleFogChange = (value: number[]) => {
    setLocalFog(value[0]);
    setFogIntensity(value[0]);
  };

  const triggerAcidRain = () => {
    setAcidRainActive(true);
    setTimeout(() => setAcidRainActive(false), 5000);
  };

  return (
    <Card className="absolute top-4 left-48 p-4 bg-black/70 backdrop-blur border-accent/30 z-40 w-64">
      <h3 className="text-sm font-bold text-accent mb-3">Environment</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Gravity: {gravityMultiplier.toFixed(2)}x
          </p>
          <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(gravityMultiplier / 3) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Fog Intensity</p>
          <Slider
            value={[localFog]}
            onValueChange={handleFogChange}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={triggerAcidRain}
          className="w-full text-xs"
        >
          Trigger Acid Rain
        </Button>

        <Button
          size="sm"
          variant={shieldActive ? 'default' : 'outline'}
          onClick={() => setShieldActive(!shieldActive)}
          className="w-full text-xs"
        >
          Shield: {shieldActive ? 'ON' : 'OFF'}
        </Button>
      </div>
    </Card>
  );
}
