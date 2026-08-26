import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Ear,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateWordPronunciation } from '@/lib/wordInsights';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { useSpeech } from '@/hooks/useSpeech';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function sanitizeEnglish(v: string): string {
  return v.replace(/[^a-zA-Z\s\-']/g, '').trim();
}

interface PronunciationData {
  ipa: string;
  syllables: string[];
  stress: string;
}

export function PronouncePage() {
  usePageMeta(
    'Pronunciation Lab',
    'Phonetic IPA breakdowns, syllable stress visualizer, multi-speed audio playback, and live voice pronunciation assessment.',
    '/pronounce'
  );

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const startSession = useQuizStore(s => s.startSession);
  const setPhase = useQuizStore(s => s.setPhase);
  const { speak, stop } = useSpeech();
  const { play } = useSoundEffects();
  const navigate = useNavigate();

  const [word, setWord] = useState('');
  const [activeWord, setActiveWord] = useState('');
  const [result, setResult] = useState<PronunciationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Microphone Voice Assessment State
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<'perfect' | 'close' | 'mismatch' | null>(null);

  const [speechSupported] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Track if result was already processed from onresult to avoid double-processing in onend
  const resultProcessedRef = useRef(false);

  const processTranscript = (transcript: string) => {
    setSpokenTranscript(transcript);
    setIsListening(false);

    if (activeWord) {
      const cleanedActive = activeWord.toLowerCase().trim();
      if (transcript === cleanedActive) {
        setMatchScore('perfect');
        play('correct');
        toast.success('Flawless pronunciation!');
      } else if (transcript.includes(cleanedActive) || cleanedActive.includes(transcript)) {
        setMatchScore('close');
        play('correct');
        toast.success('Very close pronunciation!');
      } else {
        setMatchScore('mismatch');
        play('wrong');
        toast.error(`Recognized: "${transcript}". Listen & try again!`);
      }
    }
  };

  // Initialize Speech Recognition for live voice testing
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript?.trim().toLowerCase() || '';
      resultProcessedRef.current = true;
      processTranscript(transcript);
    };

    rec.onerror = () => {
      setIsListening(false);
      resultProcessedRef.current = true; // Prevent onend from double-processing
    };

    // Auto-submit when recording ends (no manual button needed)
    rec.onend = () => {
      if (!resultProcessedRef.current) {
        // Recording ended without a result (e.g., silence) — reset gracefully
        setIsListening(false);
        toast('No speech detected — try again and speak clearly.', { icon: '🎙️' });
      }
      resultProcessedRef.current = false;
    };

    recognitionRef.current = rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWord, play]);

  const handleLookup = async (lookupWord?: string) => {
    const target = sanitizeEnglish(lookupWord ?? word);
    if (!target) return;

    play('click');
    setWord(target);
    setActiveWord(target);
    setLoading(true);
    setError(null);
    setResult(null);
    setSpokenTranscript(null);
    setMatchScore(null);
    stop();

    try {
      const res = await generateWordPronunciation(provider, apiKey, model, target);
      setResult(res);
      // Auto-play audio on initial load
      handlePlayAudio(target, 1.0);
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
      toast.error('Failed to generate pronunciation breakdown');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (text: string, rate = 1.0) => {
    stop();
    setIsPlayingAudio(true);
    speak(text, rate);
    const durationEstimate = Math.max(800, (text.length * 90) / rate);
    setTimeout(() => setIsPlayingAudio(false), durationEstimate);
  };

  const handlePaste = async () => {
    try {
      play('click');
      const text = await navigator.clipboard.readText();
      const cleaned = sanitizeEnglish(text);
      if (!cleaned) {
        toast.error('No valid English word in clipboard');
        return;
      }
      setWord(cleaned);
      toast.success('Pasted from clipboard');
    } catch {
      toast.error('Clipboard access denied by browser');
    }
  };

  const startMicTest = () => {
    if (!recognitionRef.current) {
      toast.error('Microphone recognition not available on this device');
      return;
    }
    if (isListening) {
      // Manual stop
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    play('click');
    stop();
    setSpokenTranscript(null);
    setMatchScore(null);
    resultProcessedRef.current = false;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const handleLaunchQuiz = async () => {
    if (!activeWord) return;
    play('click');
    setGeneratingQuiz(true);
    try {
      setPhase('idle');
      const quizData = await generateSessionData([activeWord], defaultLevel, provider, apiKey, model);
      startSession([activeWord], defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      toast.error('Failed to launch practice gauntlet: ' + getFriendlyAIErrorMessage(err));
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="page-container pb-28 lg:pb-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ─── Hero Header ─── */}
        <div className="mb-6 flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 shadow-sm">
            <Volume2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            {isPlayingAudio && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              Pronunciation Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Phonetic IPA breakdowns, syllable stress visualizer, and live speech pronunciation testing
            </p>
          </div>
        </div>

        {/* ─── Search & Input Bar ─── */}
        <Card className="mb-6 p-5 sm:p-6 border-slate-200/90 dark:border-white/10 shadow-xl">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2 block">
            Enter Any English Word to Analyze
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="pron-word-input"
                type="text"
                value={word}
                onChange={e => setWord(sanitizeEnglish(e.target.value))}
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleLookup();
                }}
                placeholder="Type an English word (e.g. comfortable, articulate, hierarchy)…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-4 pr-10 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
              {word && (
                <button
                  type="button"
                  onClick={() => setWord('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer p-1"
                  aria-label="Clear word input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handlePaste()}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition-all hover:border-emerald-500 hover:text-emerald-600 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-emerald-300"
              title="Paste from clipboard"
              aria-label="Paste from clipboard"
            >
              <Clipboard className="h-5 w-5" />
            </button>

            <Button
              id="pron-lookup-btn"
              type="button"
              onClick={() => void handleLookup()}
              disabled={!word.trim() || loading}
              className="font-bold px-6 shrink-0 shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-1.5" />
                  <span>Analyze</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ─── Error Message Banner ─── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Loading Skeleton ─── */}
        {loading && (
          <Card className="p-8 text-center border-slate-200/90 dark:border-white/10 animate-pulse">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Deconstructing Phonetics & Syllable Stress…
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                Generating IPA transcriptions, acoustic vowel durations, and speech models.
              </p>
            </div>
          </Card>
        )}

        {/* ─── Pronunciation Canvas Breakdown ─── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Main Phonetic Hero Card */}
              <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-white/10 shadow-2xl bg-gradient-to-br from-emerald-500/5 via-white to-transparent dark:from-emerald-500/10 dark:via-[#0b1322]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Phonetic Target
                      </span>
                      <span className="text-xs font-semibold text-slate-400 dark:text-gray-500">
                        {result.syllables.length} Syllables
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                      {activeWord}
                    </h2>

                    {/* IPA Transcription */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-wide bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                        /{result.ipa}/
                      </span>
                    </div>
                  </div>

                  {/* Primary Audio Player Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      id="pron-speed-normal"
                      type="button"
                      onClick={() => handlePlayAudio(activeWord, 1.0)}
                      className="gap-2 font-bold px-4 py-3 shadow-md cursor-pointer"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Normal (1.0x)</span>
                    </Button>

                    <Button
                      id="pron-speed-slow"
                      type="button"
                      onClick={() => handlePlayAudio(activeWord, 0.7)}
                      variant="secondary"
                      className="gap-2 font-bold px-4 py-3 cursor-pointer"
                    >
                      <Ear className="h-4 w-4" />
                      <span>Slow (0.7x)</span>
                    </Button>
                  </div>
                </div>

                {/* ─── Syllable Breakdown Visualizer ─── */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                      Syllable Stress Breakdown (Tap any syllable to hear)
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Interactive Audio
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {result.syllables.map((syl, i) => {
                      const isStressed = result.stress.toLowerCase().includes(syl.toLowerCase()) || i === 0;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handlePlayAudio(syl, 0.85)}
                          className={`group flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all cursor-pointer ${
                            isStressed
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500/50 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className="text-base font-black tracking-wide">
                            {syl}
                          </span>
                          <Volume2 className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all text-emerald-600 dark:text-emerald-400" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Stress Explanation Note */}
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200/60 p-3 dark:bg-white/5 dark:border-white/5 text-xs text-slate-600 dark:text-gray-300">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">Acoustic Stress Guide:</strong> {result.stress}
                    </span>
                  </div>
                </div>

                {/* ─── Live Mic Voice Pronunciation Assessment ─── */}
                {speechSupported && (
                  <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/8 to-emerald-500/5 p-5 dark:from-teal-500/12 dark:to-emerald-500/8 dark:border-teal-500/20 mb-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-sm font-black text-slate-950 dark:text-white">
                        Test Your Pronunciation
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        Tap the mic, say <strong className="text-slate-800 dark:text-white">"{activeWord}"</strong> out loud — result appears automatically.
                      </p>
                    </div>

                    {/* Central Mic Button */}
                    <div className="flex flex-col items-center gap-4 py-2">
                      <button
                        type="button"
                        id="pron-mic-test-btn"
                        onClick={startMicTest}
                        aria-label={isListening ? 'Stop recording' : 'Start recording'}
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-xl ${
                          isListening
                            ? 'bg-red-500 shadow-red-500/40 ring-4 ring-red-500/30'
                            : matchScore === 'perfect' || matchScore === 'close'
                            ? 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500'
                            : matchScore === 'mismatch'
                            ? 'bg-amber-500 shadow-amber-500/30 hover:bg-amber-400'
                            : 'bg-teal-600 shadow-teal-600/30 hover:bg-teal-500'
                        }`}
                      >
                        {isListening && (
                          <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
                        )}
                        {isListening
                          ? <MicOff className="h-8 w-8 text-white relative z-10" />
                          : <Mic className="h-8 w-8 text-white relative z-10" />
                        }
                      </button>

                      {/* Status Label */}
                      <p className={`text-xs font-bold ${
                        isListening ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-500 dark:text-gray-400'
                      }`}>
                        {isListening ? '🎙️ Listening… speak now' : 'Tap to speak'}
                      </p>
                    </div>

                    {/* Result Feedback Banner */}
                    <AnimatePresence>
                      {spokenTranscript && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                You said:
                              </span>
                              <span className="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-white/10 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                                "{spokenTranscript}"
                              </span>
                            </div>

                            {matchScore === 'perfect' && (
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>100% Perfect Match!</span>
                              </div>
                            )}
                            {matchScore === 'close' && (
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-500/15 border border-teal-500/30 px-3 py-1 rounded-full">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Great Clarity (Close Match)</span>
                              </div>
                            )}
                            {matchScore === 'mismatch' && (
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                                <RotateCcw className="h-4 w-4" />
                                <span>Try again with slower rhythm</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ─── Practice in 6-Round Gauntlet CTA ─── */}
                <div className="pt-2">
                  <Button
                    id="pron-launch-quiz-btn"
                    type="button"
                    onClick={() => void handleLaunchQuiz()}
                    disabled={generatingQuiz}
                    size="lg"
                    className="w-full gap-2 py-4 text-base font-bold cursor-pointer"
                  >
                    {generatingQuiz ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Preparing 6-Round Practice Gauntlet…</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4.5 w-4.5 fill-current" />
                        <span>Practice "{activeWord}" in 6-Round Gauntlet</span>
                        <ArrowRight className="h-4.5 w-4.5 ml-auto" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
