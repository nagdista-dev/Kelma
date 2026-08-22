import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Text-to-speech with automatic fallback:
 * 1. Web Speech API (browser built-in, free)
 * 2. Google Translate TTS audio stream (free, no API key)
 */

let cachedVoice: SpeechSynthesisVoice | null = null;

export interface SpeechDiagnostics {
  supported: boolean;
  totalVoices: number;
  englishVoices: number;
}

export function getSpeechDiagnostics(): SpeechDiagnostics {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voices = supported ? window.speechSynthesis.getVoices() : [];
  return {
    supported,
    totalVoices: voices.length,
    englishVoices: voices.filter(v => v.lang.toLowerCase().startsWith('en')).length,
  };
}

function loadVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // User-selected voice wins, then sensible English defaults
    const preferredUri = useSettingsStore.getState().voiceURI;
    cachedVoice =
      voices.find(v => preferredUri && v.voiceURI === preferredUri) ??
      voices.find(v => v.lang === 'en-US' && v.default) ??
      voices.find(v => v.lang === 'en-US') ??
      voices.find(v => v.lang.startsWith('en')) ??
      null;
  }
  return cachedVoice;
}

if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    loadVoice();
    window.speechSynthesis.onvoiceschanged = () => loadVoice();

    // Unlock the speech engine on the first user interaction.
    // iOS/Safari refuse programmatic speak() outside a gesture until
    // the engine has been started by one; a silent utterance does it.
    const unlock = () => {
      const synth = window.speechSynthesis;
      synth.resume();
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0;
      synth.speak(silent);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }
}

const fallbackAudioRef: { current: HTMLAudioElement | null } = { current: null };

// Free cloud TTS used when the browser engine is missing or fails
function playFallbackAudio(text: string) {
  try {
    const clipped = text.length > 190 ? `${text.slice(0, 187)}…` : text;
    fallbackAudioRef.current?.pause();
    const audio = new Audio(
      `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(clipped)}`
    );
    fallbackAudioRef.current = audio;
    console.log('[TTS] playing cloud fallback audio (Google Translate TTS)');
    void audio.play().catch(err => {
      console.error('[TTS] cloud fallback FAILED to play:', err?.message ?? err);
    });
  } catch {
    /* audio is best-effort */
  }
}

function createUtterance(text: string, rate: number): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voice = loadVoice();
  if (voice) utterance.voice = voice;
  console.log(
    '[TTS] speak requested:',
    JSON.stringify({
      text,
      engine: 'web-speech',
      voice: voice ? `${voice.name} (${voice.lang})` : 'default (none set)',
      voicesLoaded: window.speechSynthesis.getVoices().length,
      rate,
    })
  );
  return utterance;
}

/**
 * Speaks via the Web Speech API and watches it: if the engine never
 * starts (blocked, missing voices, webview…) within ~1.2s or errors out,
 * the free cloud fallback takes over automatically.
 */
function speakWatched(text: string, rate: number) {
  if (!('speechSynthesis' in window)) {
    console.warn('[TTS] speechSynthesis NOT supported in this browser → cloud fallback');
    playFallbackAudio(text);
    return;
  }
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) synth.cancel();

  const utterance = createUtterance(text, rate);
  let started = false;
  let handled = false;

  const startFallback = () => {
    if (handled) return;
    handled = true;
    console.warn('[TTS] engine never started within 1.2s → switching to cloud fallback');
    synth.cancel();
    playFallbackAudio(text);
  };

  const watchdog = window.setTimeout(startFallback, 1200);

  utterance.onstart = () => {
    started = true;
    window.clearTimeout(watchdog);
    console.log('[TTS] started speaking OK');
  };
  utterance.onerror = event => {
    window.clearTimeout(watchdog);
    console.error(
      '[TTS] ERROR:',
      JSON.stringify({
        error: event.error,
        elapsedTime: event.elapsedTime,
        hadStarted: started,
      })
    );
    if (!started) startFallback();
  };

  // Called synchronously so it stays inside the user-gesture context
  synth.speak(utterance);
}

export function useSpeech() {
  const speak = useCallback((text: string, rate = 0.9) => {
    speakWatched(text, rate);
  }, []);

  // Queue several clips back-to-back (e.g. word, then its example sentence)
  const speakSequence = useCallback((texts: string[], rate = 0.9) => {
    if (texts.length === 0) return;
    texts.forEach(text => speakWatched(text, rate));
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    fallbackAudioRef.current?.pause();
    fallbackAudioRef.current = null;
  }, []);

  return { speak, speakSequence, stop };
}
