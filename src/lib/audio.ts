let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.1) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playNotes(notes: { freq: number; dur: number; delay?: number }[], type: OscillatorType = 'square') {
  const ctx = getCtx();
  notes.forEach(({ freq, dur, delay = 0 }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur);
  });
}

export const soundEffects = {
  taskComplete: () => playTone(880, 0.15, 'sine', 0.08),
  coin: () => playNotes([
    { freq: 1200, dur: 0.1 },
    { freq: 1600, dur: 0.15, delay: 0.08 },
  ], 'sine'),
  levelUp: () => playNotes([
    { freq: 523, dur: 0.15 },
    { freq: 659, dur: 0.15, delay: 0.1 },
    { freq: 784, dur: 0.15, delay: 0.2 },
    { freq: 1047, dur: 0.3, delay: 0.3 },
  ], 'sine'),
  achievement: () => playNotes([
    { freq: 660, dur: 0.1 },
    { freq: 880, dur: 0.1, delay: 0.1 },
    { freq: 1100, dur: 0.15, delay: 0.2 },
    { freq: 1320, dur: 0.15, delay: 0.3 },
    { freq: 1760, dur: 0.3, delay: 0.4 },
  ], 'triangle'),
  error: () => playNotes([
    { freq: 200, dur: 0.2 },
    { freq: 150, dur: 0.3, delay: 0.2 },
  ], 'sawtooth'),
  click: () => playTone(600, 0.05, 'square', 0.03),
};
