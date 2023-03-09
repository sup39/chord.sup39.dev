export async function getMIDIDevices(): Promise<any[]> {
  if (!('requestMIDIAccess' in navigator)) return [];
  const {inputs} = await (navigator.requestMIDIAccess as any)();
  return Array.from(inputs.values());
}

export class InputManager {
  public notes = new Set<number>();
  public pedals = new Set<number>();
  constructor(
    public callback: {
      noteOn?: (id: number) => void
      noteOff?: (id: number) => void
      noteChanged?: (id: number) => void
      pedalOn?: (id: number) => void
      pedalOff?: (id: number) => void
      pedalChanged?: (id: number) => void
    } = {}
  ) {}
  noteOn(id: number) {
    this.notes.add(id);
    this.callback.noteChanged?.(id);
    this.callback.noteOn?.(id);
  }
  noteOff(id: number) {
    this.notes.delete(id);
    this.callback.noteChanged?.(id);
    this.callback.noteOff?.(id);
  }
  pedal(id: number, v: number) {
    const state0 = this.pedals.has(id);
    const state1 = v > 0;
    if (state1 === state0) return;
    this.pedals[state1 ? 'add' : 'delete'](id);
    this.callback.pedalChanged?.(id);
    this.callback[state1 ? 'pedalOn' : 'pedalOff']?.(id);
  }
  clear() {
    this.notes.clear();
    this.pedals.clear();
  }
}
