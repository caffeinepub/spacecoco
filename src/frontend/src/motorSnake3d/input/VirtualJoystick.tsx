import { useRef, useState, useEffect } from 'react';
import { useAnalogInput } from './useAnalogInput';

export function VirtualJoystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { setJoystickInput } = useAnalogInput();

  // Only show on touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setActive(true);
    updatePosition(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!active) return;
    updatePosition(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    setJoystickInput(0, 0, 0);
  };

  const updatePosition = (touch: React.Touch) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;

    const maxDistance = 50;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const clampedDistance = Math.min(distance, maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;

    setPosition({ x, y });

    // Normalize for input
    const normalizedX = x / maxDistance;
    const normalizedY = -y / maxDistance; // Invert Y for game coordinates
    const acceleration = clampedDistance / maxDistance;

    setJoystickInput(normalizedX, normalizedY, acceleration);
  };

  if (!isTouchDevice) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-8 w-32 h-32 z-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Outer circle */}
      <div className="absolute inset-0 rounded-full bg-accent/20 border-2 border-accent/50" />
      
      {/* Inner stick */}
      <div
        className="absolute w-12 h-12 rounded-full bg-accent/80 border-2 border-accent transition-transform"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  );
}
