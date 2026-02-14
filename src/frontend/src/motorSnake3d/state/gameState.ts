import { create } from 'zustand';
import * as THREE from 'three';

export interface PlayerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  speed: number;
  isAlive: boolean;
}

export interface TailSegment {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
}

export interface Enemy {
  id: string;
  type: 'cow' | 'ufo' | 'penguin';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
}

export interface Anomaly {
  id: string;
  type: 'blackhole' | 'star' | 'mirror';
  position: THREE.Vector3;
  active: boolean;
}

export interface ActivePowerUp {
  type: 'blackhole' | 'star' | 'mirror';
  duration: number;
  elapsed: number;
}

export interface BabyPenguin {
  id: string;
  attachedSegment: number;
}

export interface GameState {
  // Player
  player: PlayerState;
  tailSegments: TailSegment[];
  
  // World
  worldMode: 'inside' | 'outside';
  abyssMode: boolean;
  coreIntact: boolean;
  
  // Environment
  gravityMultiplier: number;
  gravityCycleTime: number;
  windPortals: Array<{ position: THREE.Vector3; active: boolean }>;
  fogIntensity: number;
  acidRainActive: boolean;
  shieldActive: boolean;
  
  // Enemies & Anomalies
  enemies: Enemy[];
  anomalies: Anomaly[];
  babyPenguins: BabyPenguin[];
  
  // Power-ups
  activePowerUp: ActivePowerUp | null;
  
  // Ghost
  ghostActive: boolean;
  ghostInfluence: number;
  ghostReplaced: boolean;
  deathCount: number;
  
  // Gameplay
  speed: number;
  score: number;
  
  // Actions
  setPlayerPosition: (position: THREE.Vector3) => void;
  setPlayerVelocity: (velocity: THREE.Vector3) => void;
  setWorldMode: (mode: 'inside' | 'outside') => void;
  setAbyssMode: (active: boolean) => void;
  setCoreIntact: (intact: boolean) => void;
  setGravityMultiplier: (multiplier: number) => void;
  setFogIntensity: (intensity: number) => void;
  setAcidRainActive: (active: boolean) => void;
  setShieldActive: (active: boolean) => void;
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  addAnomaly: (anomaly: Anomaly) => void;
  removeAnomaly: (id: string) => void;
  setActivePowerUp: (powerUp: ActivePowerUp | null) => void;
  addBabyPenguin: (penguin: BabyPenguin) => void;
  removeBabyPenguin: (id: string) => void;
  setGhostActive: (active: boolean) => void;
  setGhostInfluence: (influence: number) => void;
  setGhostReplaced: (replaced: boolean) => void;
  incrementDeathCount: () => void;
  addTailSegment: (segment: TailSegment) => void;
  removeTailSegment: (index: number) => void;
  reset: () => void;
}

const initialPlayerState: PlayerState = {
  position: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  speed: 5,
  isAlive: true,
};

export const useGameState = create<GameState>((set) => ({
  // Initial state
  player: initialPlayerState,
  tailSegments: [],
  worldMode: 'inside',
  abyssMode: false,
  coreIntact: true,
  gravityMultiplier: 1,
  gravityCycleTime: 0,
  windPortals: [],
  fogIntensity: 0,
  acidRainActive: false,
  shieldActive: false,
  enemies: [],
  anomalies: [],
  babyPenguins: [],
  activePowerUp: null,
  ghostActive: false,
  ghostInfluence: 0,
  ghostReplaced: false,
  deathCount: 0,
  speed: 5,
  score: 0,

  // Actions
  setPlayerPosition: (position) => set((state) => ({
    player: { ...state.player, position: position.clone() }
  })),
  
  setPlayerVelocity: (velocity) => set((state) => ({
    player: { ...state.player, velocity: velocity.clone() }
  })),
  
  setWorldMode: (mode) => set({ worldMode: mode }),
  setAbyssMode: (active) => set({ abyssMode: active }),
  setCoreIntact: (intact) => set({ coreIntact: intact }),
  setGravityMultiplier: (multiplier) => set({ gravityMultiplier: multiplier }),
  setFogIntensity: (intensity) => set({ fogIntensity: intensity }),
  setAcidRainActive: (active) => set({ acidRainActive: active }),
  setShieldActive: (active) => set({ shieldActive: active }),
  
  addEnemy: (enemy) => set((state) => ({
    enemies: [...state.enemies, enemy]
  })),
  
  removeEnemy: (id) => set((state) => ({
    enemies: state.enemies.filter(e => e.id !== id)
  })),
  
  addAnomaly: (anomaly) => set((state) => ({
    anomalies: [...state.anomalies, anomaly]
  })),
  
  removeAnomaly: (id) => set((state) => ({
    anomalies: state.anomalies.filter(a => a.id !== id)
  })),
  
  setActivePowerUp: (powerUp) => set({ activePowerUp: powerUp }),
  
  addBabyPenguin: (penguin) => set((state) => ({
    babyPenguins: [...state.babyPenguins, penguin]
  })),
  
  removeBabyPenguin: (id) => set((state) => ({
    babyPenguins: state.babyPenguins.filter(p => p.id !== id)
  })),
  
  setGhostActive: (active) => set({ ghostActive: active }),
  setGhostInfluence: (influence) => set({ ghostInfluence: influence }),
  setGhostReplaced: (replaced) => set({ ghostReplaced: replaced }),
  incrementDeathCount: () => set((state) => ({ deathCount: state.deathCount + 1 })),
  
  addTailSegment: (segment) => set((state) => ({
    tailSegments: [...state.tailSegments, segment]
  })),
  
  removeTailSegment: (index) => set((state) => ({
    tailSegments: state.tailSegments.filter((_, i) => i !== index)
  })),
  
  reset: () => set({
    player: initialPlayerState,
    tailSegments: [],
    worldMode: 'inside',
    abyssMode: false,
    coreIntact: true,
    gravityMultiplier: 1,
    gravityCycleTime: 0,
    windPortals: [],
    fogIntensity: 0,
    acidRainActive: false,
    enemies: [],
    anomalies: [],
    babyPenguins: [],
    activePowerUp: null,
    speed: 5,
    score: 0,
  }),
}));
