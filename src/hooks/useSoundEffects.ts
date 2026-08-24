import { useCallback, useRef } from 'react';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type SoundName =
  | 'correct'
  | 'wrong'
  | 'hint'
  | 'complete'
  | 'next'
  | 'click'
  | 'streak'
  | 'mastered'
  | 'speed';

interface Tone {
  frequency: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
  gain?: number;
  /** Optional glissando target — tone slides to this frequency */
  sweepTo?: number;
}

/** Number of interchangeable variations per sound so repeats never get stale */
const VARIANTS: Partial<Record<SoundName, number>> = {
  correct: 3,
  wrong: 3,
};

const SOUND_MAP: Record<SoundName, Tone[][]> = {
  correct: [
    // Bright major arpeggio
    [
      { frequency: 523.25, duration: 0.07, type: 'sine', gain: 0.045 },
      { frequency: 659.25, duration: 0.08, delay: 0.06, type: 'sine', gain: 0.045 },
      { frequency: 783.99, duration: 0.12, delay: 0.13, type: 'sine', gain: 0.04 },
    ],
    // Sus4 → resolution (feels like "solved it")
    [
      { frequency: 587.33, duration: 0.07, type: 'triangle', gain: 0.04 },
      { frequency: 698.46, duration: 0.07, delay: 0.07, type: 'triangle', gain: 0.04 },
      { frequency: 880, duration: 0.14, delay: 0.14, type: 'sine', gain: 0.038 },
    ],
    // Pentatonic pop with sparkle slide
    [
      { frequency: 659.25, duration: 0.06, type: 'sine', gain: 0.04 },
      { frequency: 987.77, duration: 0.06, delay: 0.06, type: 'sine', gain: 0.04 },
      { frequency: 1174.66, duration: 0.14, delay: 0.12, type: 'sine', gain: 0.04, sweepTo: 1567.98 },
    ],
  ],
  wrong: [
    // Soft descending pair
    [
      { frequency: 220, duration: 0.09, type: 'triangle', gain: 0.035 },
      { frequency: 164.81, duration: 0.11, delay: 0.08, type: 'triangle', gain: 0.03 },
    ],
    // Gentle wobble — "almost had it"
    [
      { frequency: 246.94, duration: 0.08, type: 'sine', gain: 0.032 },
      { frequency: 207.65, duration: 0.08, delay: 0.09, type: 'sine', gain: 0.03 },
      { frequency: 185, duration: 0.12, delay: 0.18, type: 'sine', gain: 0.028 },
    ],
    // Warm minor third
    [
      { frequency: 261.63, duration: 0.09, type: 'triangle', gain: 0.032 },
      { frequency: 220, duration: 0.13, delay: 0.09, type: 'triangle', gain: 0.03 },
    ],
  ],
  hint: [
    [
      { frequency: 440, duration: 0.05, type: 'sine', gain: 0.025 },
      { frequency: 880, duration: 0.06, delay: 0.05, type: 'sine', gain: 0.025 },
    ],
  ],
  complete: [
    [
      { frequency: 523.25, duration: 0.08, type: 'sine', gain: 0.04 },
      { frequency: 659.25, duration: 0.08, delay: 0.08, type: 'sine', gain: 0.04 },
      { frequency: 783.99, duration: 0.08, delay: 0.16, type: 'sine', gain: 0.04 },
      { frequency: 1046.5, duration: 0.16, delay: 0.24, type: 'sine', gain: 0.035 },
    ],
  ],
  next: [[{ frequency: 392, duration: 0.04, type: 'sine', gain: 0.02 }]],
  click: [[{ frequency: 620, duration: 0.03, type: 'sine', gain: 0.015 }]],
  streak: [
    [
      { frequency: 659.25, duration: 0.07, type: 'square', gain: 0.02 },
      { frequency: 880, duration: 0.07, delay: 0.07, type: 'square', gain: 0.02 },
      { frequency: 1174.66, duration: 0.14, delay: 0.14, type: 'square', gain: 0.022 },
    ],
  ],
  mastered: [
    [
      { frequency: 523.25, duration: 0.09, type: 'triangle', gain: 0.03 },
      { frequency: 659.25, duration: 0.09, delay: 0.08, type: 'triangle', gain: 0.03 },
      { frequency: 783.99, duration: 0.09, delay: 0.16, type: 'triangle', gain: 0.03 },
      { frequency: 1046.5, duration: 0.1, delay: 0.24, type: 'sine', gain: 0.03 },
      { frequency: 1318.51, duration: 0.2, delay: 0.33, type: 'sine', gain: 0.028 },
    ],
  ],
  speed: [
    [
      { frequency: 700, duration: 0.1, type: 'square', gain: 0.025, sweepTo: 1400 },
      { frequency: 1760, duration: 0.1, delay: 0.1, type: 'sine', gain: 0.028 },
    ],
  ],
};

export interface PlayOptions {
  /** Pick a specific variation (wraps around). Random when omitted. */
  variant?: number;
  /** Multiplies all frequencies — used to escalate streak sounds */
  pitch?: number;
}

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
      // Warm up immediately so the very first tap already carries sound
      void audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback(
    (name: SoundName, options?: PlayOptions) => {
      const context = getAudioContext();
      if (!context) return;

      void context.resume();
      const startAt = context.currentTime + 0.01;
      const pitch = options?.pitch ?? 1;

      const variations = SOUND_MAP[name];
      const variantCount = VARIANTS[name] ?? 1;
      const chosen =
        options?.variant !== undefined
          ? options.variant % variantCount
          : Math.floor(Math.random() * variantCount);
      const tones = variations[Math.min(chosen, variations.length - 1)] ?? [];

      tones.forEach(tone => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const toneStart = startAt + (tone.delay ?? 0);
        const toneEnd = toneStart + tone.duration;

        oscillator.type = tone.type ?? 'sine';
        oscillator.frequency.setValueAtTime(tone.frequency * pitch, toneStart);
        if (tone.sweepTo !== undefined) {
          oscillator.frequency.exponentialRampToValueAtTime(
            tone.sweepTo * pitch,
            toneStart + tone.duration
          );
        }

        gain.gain.setValueAtTime(0.0001, toneStart);
        gain.gain.exponentialRampToValueAtTime(tone.gain ?? 0.03, toneStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(toneStart);
        oscillator.stop(toneEnd + 0.02);
      });
    },
    [getAudioContext]
  );

  return { play };
}
