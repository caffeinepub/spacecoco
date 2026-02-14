type VfxEvent = {
  name: string;
  payload?: any;
  timestamp: number;
};

class VfxBusClass {
  private listeners: Array<(event: VfxEvent) => void> = [];

  subscribe(callback: (event: VfxEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  trigger(name: string, payload?: any) {
    const event: VfxEvent = {
      name,
      payload,
      timestamp: Date.now(),
    };

    this.listeners.forEach(listener => listener(event));
  }
}

export const VfxBus = new VfxBusClass();
