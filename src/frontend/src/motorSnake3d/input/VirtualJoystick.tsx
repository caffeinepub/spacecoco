import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useInputState } from './inputState';

export function VirtualJoystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const swipeZoneRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { setAnalogVector, setAcceleration } = useInputState();
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setActive(true);
    updatePosition(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!active) return;
    updatePosition(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    setAnalogVector(new THREE.Vector2(0, 0));
    setAcceleration(0);
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

    const normalizedX = x / maxDistance;
    const normalizedY = -y / maxDistance;
    const acceleration = clampedDistance / maxDistance;

    setAnalogVector(new THREE.Vector2(normalizedX, normalizedY));
    setAcceleration(acceleration);
  };

  const handleSwipeStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (!swipeStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;
    const deltaTime = Date.now() - swipeStartRef.current.time;
    
    if (deltaTime > 50 && (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20)) {
      const normalizedX = Math.max(-1, Math.min(1, deltaX / 100));
      const normalizedY = Math.max(-1, Math.min(1, -deltaY / 100));
      
      const swipeVec = new THREE.Vector2(normalizedX, normalizedY);
      if (swipeVec.length() > 0) {
        swipeVec.normalize();
      }
      
      setAnalogVector(swipeVec);
      setAcceleration(Math.min(1, swipeVec.length()));
      
      swipeStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }
  };

  const handleSwipeEnd = () => {
    swipeStartRef.current = null;
  };

  if (!isTouchDevice) return null;

  return (
    <>
      {/* Large swipe detection zone */}
      <div
        ref={swipeZoneRef}
        className="fixed inset-0 z-30 touch-none pointer-events-auto"
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
        style={{ touchAction: 'none' }}
      />
      
      {/* Virtual joystick */}
      <div
        ref={containerRef}
        className="fixed bottom-8 left-8 w-32 h-32 z-40 touch-none pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-primary/40 bg-black/30 backdrop-blur-sm" />
        
        <div
          className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 rounded-full bg-primary/80 border-2 border-primary shadow-lg shadow-primary/50 transition-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        />
        
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-accent" />
      </div>
    </>
  );
}
