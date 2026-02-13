import { Card } from '@/components/ui/card';
import { Keyboard, Smartphone, Mouse } from 'lucide-react';

export function ControlsHintOverlay() {
  return (
    <div className="absolute top-4 right-4 z-10">
      <Card className="p-3 bg-black/70 backdrop-blur border-accent/30">
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Keyboard className="h-3 w-3 text-accent" />
            <span>Arrow Keys / WASD</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-3 w-3 text-accent" />
            <span>Swipe to Move</span>
          </div>
          <div className="flex items-center gap-2">
            <Mouse className="h-3 w-3 text-accent" />
            <span>Follow Cursor</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
