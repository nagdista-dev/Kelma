import { useCallback, useRef } from 'react';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type SoundName = 'correct' | 'wrong' | 'hint' | 'complete' | 'next' | 'click' | 'streak' | 'mastered';

interface Tone {
  frequency: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
  gain?: number;
}

const SOUND_MAP: Record<SoundName, Tone[]> = {
  correct: [
    { frequency: 523.25, duration: 0.07, type: 'sine', gain: 0.04 },
    { frequency: 659.25, duration: 0.08, delay: 0.06, type: 'sine', gain: 0.04 },
    { frequency: 783.99, duration: 0.1, delay: 0.13, type: 'sine', gain: 0.035 },
  ],
  wrong: [
    { frequency: 220, duration: 0.09, type: 'triangle', gain: 0.035 },
    { frequency: 164.81, duration: 0.11, delay: 0.08, type: 'triangle', gain: 0.03 },
  ],
  hint: [
    { frequency: 440, duration: 0.05, type: 'sine', gain: 0.025 },
    { frequency: 880, duration: 0.06, delay: 0.05, type: 'sine', gain: 0.025 },
  ],
  complete: [
    { frequency: 523.25, duration: 0.08, type: 'sine', gain: 0.04 },
    { frequency: 659.25, duration: 0.08, delay: 0.08, type: 'sine', gain: 0.04 },
    { frequency: 783.99, duration: 0.08, delay: 0.16, type: 'sine', gain: 0.04 },
    { frequency: 1046.5, duration: 0.16, delay: 0.24, type: 'sine', gain: 0.035 },
  ],
  next: [
    { frequency: 392, duration: 0.04, type: 'sine', gain: 0.02 },
  ],
  click: [
    { frequency: 620, duration: 0.03, type: 'sine', gain: 0.015 },
  ],
  streak: [
    { frequency: 659.25, duration: 0.07, type: 'square', gain: 0.02 },
    { frequency: 880, duration: 0.07, delay: 0.07, type: 'square', gain: 0.02 },
    { frequency: 1174.66, duration: 0.14, delay: 0.14, type: 'square', gain: 0.022 },
  ],
  mastered: [
    { frequency: 523.25, duration: 0.09, type: 'triangle', gain: 0.03 },
    { frequency: 659.25, duration: 0.09, delay: 0.08, type: 'triangle', gain: 0.03 },
    { frequency: 783.99, duration: 0.09, delay: 0.16, type: 'triangle', gain: 0.03 },
    { frequency: 1046.5, duration: 0.1, delay: 0.24, type: 'sine', gain: 0.03 },
    { frequency: 1318.51, duration: 0.2, delay: 0.33, type: 'sine', gain: 0.028 },
  ],
};

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    audioContextRef.current ??= new AudioContextClass();
    return audioContextRef.current;
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      const context = getAudioContext();
      if (!context) return;

      void context.resume();
      const startAt = context.currentTime + 0.01;

      SOUND_MAP[name].forEach(tone => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const toneStart = startAt + (tone.delay ?? 0);
        const toneEnd = toneStart + tone.duration;

        oscillator.type = tone.type ?? 'sine';
        oscillator.frequency.setValueAtTime(tone.frequency, toneStart);

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
