import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  GraduationCap,
  KeyRound,
  Moon,
  Plug,
  Settings,
  Sun,
  Volume2,
  XCircle,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSpeechDiagnostics, useSpeech } from '@/hooks/useSpeech';
import { usePageMeta } from '@/hooks/usePageMeta';

export function SettingsPage() {
  usePageMeta(
    'Settings',
    'Configure your learning preferences: theme, pronunciation voice and AI provider.',
    '/settings'
  );
  const {
    provider, apiKey, theme, defaultLevel, voiceURI, model,
    setTheme, setVoiceURI,
  } = useSettingsStore();

  const { speak } = useSpeech();
  const [voiceTestState, setVoiceTestState] = useState<'idle' | 'testing' | 'ok' | 'fallback'>('idle');
  const [voiceTestReport, setVoiceTestReport] = useState<string[]>([]);
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      setEnglishVoices(
        window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('en'))
      );
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const diagnostics = getSpeechDiagnostics();

  const handleVoiceTest = () => {
    setVoiceTestState('testing');
    const report: string[] = [];
    const log = (line: string) => {
      report.push(line);
      setVoiceTestReport([...report]);
    };

    if (!diagnostics.supported || !('speechSynthesis' in window)) {
      log('1. Browser has NO speechSynthesis support → using cloud voice.');
      speak('Sound test. Using cloud voice.');
      setVoiceTestState('fallback');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const voices = synth.getVoices();
    const english = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    log(`1. Engine supported. Total voices: ${voices.length}, English voices: ${english.length}`);
    if (english.length > 0) {
      log(`2. Voices found: ${english.slice(0, 5).map(v => `${v.name} (${v.lang})`).join(', ')}`);
    } else {
      log('2. NO English voices installed on this device.');
    }

    const utterance = new SpeechSynthesisUtterance('Sound test. Your pronunciation engine is working.');
    utterance.lang = 'en-US';
    const preferred = english.find(v => v.lang === 'en-US') ?? english[0];
    if (preferred) {
      utterance.voice = preferred;
      log(`3. Trying voice: ${preferred.name} (${preferred.lang})`);
    } else {
      log('3. Trying default voice (none selected).');
    }

    let started = false;
    let settled = false;
    utterance.onstart = () => {
      started = true;
      settled = true;
      log('4. Speech started successfully.');
      setVoiceTestState('ok');
    };
    utterance.onerror = e => {
      log(`4. Speech error: "${e.error}"${started ? ' (after starting)' : ' (before starting)'}`);
      console.error('[TTS] settings voice test error:', e.error);
      if (!started) {
        settled = true;
        log('5. Switching to cloud voice…');
        speak('Sound test. Using cloud voice.');
        setVoiceTestState('fallback');
      }
    };

    log('3b. Calling speechSynthesis.speak() now…');
    synth.speak(utterance);

    // If nothing started after 2.5s, engine is silently dead
    window.setTimeout(() => {
      if (!started && !settled) {
        log(`4. No sound and no error after 2.5s (engine is blocked or muted — common in Brave). Speaking status: ${synth.speaking ? 'speaking' : 'not speaking'}, pending: ${synth.pending}.`);
        log('5. Switching to cloud voice…');
        speak('Sound test. Using cloud voice.');
        setVoiceTestState('fallback');
      }
    }, 2500);
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Settings className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Settings</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Configure your learning preferences
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          {/* ─── Left: pronunciation (the deep card) ─── */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-3">
            <Card className="p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                <Volume2 className="h-4 w-4 text-teal-500 dark:text-teal-300" />
                Pronunciation
              </h2>

              {/* Engine diagnostics */}
              <div className="mb-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  {diagnostics.supported ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                  )}
                  <span className="text-slate-500 dark:text-gray-400">
                    Browser speech engine: {diagnostics.supported ? 'supported' : 'not supported — cloud voice will be used'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {diagnostics.englishVoices > 0 ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                  )}
                  <span className="text-slate-500 dark:text-gray-400">
                    English voices installed: {diagnostics.englishVoices}
                    {diagnostics.supported && diagnostics.englishVoices === 0 && ' (cloud voice will be used)'}
                  </span>
                </div>
              </div>

              <Button
                id="voice-test-btn"
                onClick={handleVoiceTest}
                size="sm"
                variant="secondary"
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Test sound
              </Button>

              {/* Voice picker */}
              <div className="mt-5">
                <label htmlFor="voice-select" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-gray-300">
                  Pronunciation voice
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    id="voice-select"
                    value={voiceURI}
                    onChange={e => setVoiceURI(e.target.value)}
                    className="input-base min-w-0 flex-1 text-sm"
                  >
                    <option value="">Auto (default English voice)</option>
                    {englishVoices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <Button
                    id="voice-preview-btn"
                    size="sm"
                    variant="secondary"
                    onClick={() => speak('This is how your words will sound.')}
                    disabled={englishVoices.length === 0 && !voiceURI}
                    className="shrink-0 gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
                {englishVoices.length === 0 && (
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-gray-500">
                    No English voices found on this device — the cloud voice will be used.
                  </p>
                )}
              </div>

              {voiceTestState !== 'idle' && (
                <div className="mt-4">
                  <p
                    className={`text-xs font-semibold ${
                      voiceTestState === 'ok'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : voiceTestState === 'fallback'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-gray-400'
                    }`}
                  >
                    {voiceTestState === 'testing' && 'Testing…'}
                    {voiceTestState === 'ok' && 'Working! You should have heard the test sentence.'}
                    {voiceTestState === 'fallback' && 'Browser engine did not respond — playing via cloud voice instead.'}
                  </p>
                  {voiceTestReport.length > 0 && (
                    <pre
                      className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-left text-[10px] leading-relaxed text-slate-600 dark:border-white/10 dark:bg-black/30 dark:text-gray-300"
                      dir="ltr"
                    >
{voiceTestReport.join('\n')}
                    </pre>
                  )}
                </div>
              )}

              <p className="mt-4 text-[11px] leading-relaxed text-slate-500 dark:text-gray-500">
                No permission is required for pronunciation — it uses your browser's built-in voices,
                with a free cloud voice as automatic backup.
              </p>
            </Card>
          </div>

          {/* ─── Right: quick configuration ─── */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            {/* AI Provider summary */}
            <Card className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                    <Plug className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize text-slate-800 dark:text-gray-200">{provider}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">
                      {apiKey ? `Key configured · ${model}` : 'No API key yet'}
                    </p>
                  </div>
                </div>
                <Link
                  to="/provider"
                  id="provider-page-link"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-500 active:scale-95"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Manage
                </Link>
              </div>
            </Card>

            {/* Default Level */}
            <Link to="/level" id="settings-level-link" className="block">
              <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-teal-500/40 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                    <GraduationCap className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-gray-200">Default Level</h2>
                    <p className="text-xs text-slate-500 dark:text-gray-500">
                      Manual or AI placement test
                    </p>
                  </div>
                </div>
                <span className="badge-teal">{defaultLevel}</span>
              </Card>
            </Link>

            {/* Theme */}
            <Card className="p-4 sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Theme</h2>
              <div className="grid grid-cols-2 gap-2">
                {(['dark', 'light'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    id={`theme-${t}`}
                    onClick={() => setTheme(t)}
                    aria-pressed={theme === t}
                    className={`inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98] ${
                      theme === t
                        ? 'border-teal-500 bg-teal-500/10 text-teal-700 shadow-md shadow-teal-500/10 dark:bg-teal-500/15 dark:text-teal-200'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20'
                    }`}
                  >
                    {t === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {t === 'dark' ? 'Dark' : 'Light'}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
