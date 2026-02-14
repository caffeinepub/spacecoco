type IntensityState = 'danger' | 'attack' | 'pre-explosion' | 'normal';

export class AudioDirector {
  private currentIntensity: IntensityState = 'normal';
  private onIntensityChange?: (state: IntensityState) => void;

  constructor(onIntensityChange?: (state: IntensityState) => void) {
    this.onIntensityChange = onIntensityChange;
  }

  setGameplayIntensity(value: number) {
    let newState: IntensityState = 'normal';

    if (value > 0.8) {
      newState = 'danger';
    } else if (value > 0.5) {
      newState = 'attack';
    }

    if (newState !== this.currentIntensity) {
      this.currentIntensity = newState;
      this.onIntensityChange?.(newState);
    }
  }

  triggerPreExplosion() {
    this.currentIntensity = 'pre-explosion';
    this.onIntensityChange?.('pre-explosion');
  }

  triggerVfxSound(event: string) {
    // Placeholder for VFX sound triggers
    console.log('VFX Sound:', event);
  }
}
