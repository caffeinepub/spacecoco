import { useEffect, useState } from 'react';
import { VfxBus } from './VfxBus';

export function VfxScreenOverlay() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = VfxBus.subscribe((event) => {
      if (event.name === 'eatHit') {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 800);
      }
    });

    return unsubscribe;
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 animate-color-wave" />
    </div>
  );
}
