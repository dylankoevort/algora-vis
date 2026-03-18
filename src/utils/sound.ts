/**
 * Algora Vis — Sound Engine
 * Uses the Web Audio API directly. No external dependencies.
 * All functions are safe to call even before user interaction —
 * the AudioContext is created lazily on first use.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!ctx) ctx = new AudioContext();
    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

/** Master gain — mute/unmute without stopping sounds */
let masterGain: GainNode | null = null;
function getMaster(): GainNode {
    const c = getCtx();
    if (!masterGain) {
        masterGain = c.createGain();
        masterGain.gain.value = 1;
        masterGain.connect(c.destination);
    }
    return masterGain;
}

export function setMuted(muted: boolean) {
    getMaster().gain.value = muted ? 0 : 1;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function playTone(
    frequency: number,
    type: OscillatorType,
    gainPeak: number,
    durationMs: number,
    delayMs = 0,
) {
    const c = getCtx();
    const now = c.currentTime + delayMs / 1000;
    const end = now + durationMs / 1000;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(getMaster());

    osc.start(now);
    osc.stop(end);
}

/** Map a bar value (1–100) to a frequency in a pentatonic scale (C4–C7) */
function barToFreq(value: number, maxValue: number): number {
    // Pentatonic scale intervals (semitones from C): 0,2,4,7,9 repeating
    const pentatonic = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36];
    const C4 = 261.63;
    const idx = Math.round((value / maxValue) * (pentatonic.length - 1));
    const semitones = pentatonic[Math.max(0, Math.min(idx, pentatonic.length - 1))];
    return C4 * Math.pow(2, semitones / 12);
}

// ─── Sorting sounds ───────────────────────────────────────────────────────────

let _sortMaxValue = 100;
export function setSortMaxValue(max: number) { _sortMaxValue = max; }

export function soundCompare(valueA: number, valueB: number) {
    const avg = (valueA + valueB) / 2;
    playTone(barToFreq(avg, _sortMaxValue), 'sine', 0.08, 80);
}

export function soundSwap(value: number) {
    playTone(barToFreq(value, _sortMaxValue), 'triangle', 0.15, 120);
}

export function soundSorted(value: number, delayMs = 0) {
    playTone(barToFreq(value, _sortMaxValue), 'sine', 0.12, 200, delayMs);
}

export function soundPivot(value: number) {
    playTone(barToFreq(value, _sortMaxValue), 'sawtooth', 0.1, 100);
}

export function soundSortComplete() {
    // Ascending arpeggio
    const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
        playTone(freq, 'sine', 0.2, 300, i * 80);
    });
}

// ─── Search sounds ────────────────────────────────────────────────────────────

export function soundVisit() {
    // Soft, low tick
    playTone(220 + Math.random() * 40, 'sine', 0.04, 60);
}

export function soundFrontier() {
    // Slightly brighter
    playTone(440 + Math.random() * 80, 'sine', 0.05, 80);
}

export function soundPathFound() {
    // Warm ascending chord
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
        playTone(freq, 'sine', 0.18, 500, i * 100);
    });
}

export function soundNoPath() {
    // Descending minor
    playTone(440, 'sawtooth', 0.1, 200);
    playTone(370, 'sawtooth', 0.1, 200, 220);
    playTone(311, 'sawtooth', 0.08, 400, 440);
}