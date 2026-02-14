import { Card } from '@/components/ui/card';
import { useGameState } from '../state/gameState';
import { useEffect, useState } from 'react';

export function GhostOverlayHUD() {
  const { ghostActive, ghostInfluence, ghostReplaced } = useGameState();
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    if (ghostActive && !showSubtitle) {
      setShowSubtitle(true);
      setTimeout(() => setShowSubtitle(false), 5000);
    }
  }, [ghostActive, showSubtitle]);

  if (!ghostActive) return null;

  const influencePercent = Math.min(100, ghostInfluence);

  return (
    <>
      {/* Ghost Subtitle */}
      {showSubtitle && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <Card className="p-6 bg-black/90 backdrop-blur border-destructive/50">
            <p className="text-lg text-destructive font-bold text-center">
              "You are not you anymore, it's me now"
            </p>
          </Card>
        </div>
      )}

      {/* Influence Meter */}
      <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-black/70 backdrop-blur border-destructive/30 z-40 min-w-[300px]">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-destructive">Ghost Influence</h3>
            {ghostReplaced && (
              <span className="text-xs font-bold text-destructive animate-pulse">
                REPLACED
              </span>
            )}
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive transition-all"
              style={{ width: `${influencePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {influencePercent.toFixed(0)}% / 100%
          </p>
        </div>
      </Card>
    </>
  );
}
