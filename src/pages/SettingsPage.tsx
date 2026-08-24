import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
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
import { LevelSelector } from '@/components/session/LevelSelector';
import { getSpeechDiagnostics, useSpeech } from '@/hooks/useSpeech';

export function SettingsPage() {
  const {
    provider, apiKey, theme, defaultLevel, voiceURI, model,
    setTheme, setDefaultLevel, setVoiceURI,
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
      log('4. ✅ Speech started successfully.');
      setVoiceTestState('ok');
    };
    utterance.onerror = e => {
      log(`4. ❌ Speech error: "${e.error}"${started ? ' (after starting)' : ' (before starting)'}`);
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
        log(`4. ⏱️ No sound and no error after 2.5s (engine is blocked or muted — common in Brave). Speaking status: ${synth.speaking ? 'speaking' : 'not speaking'}, pending: ${synth.pending}.`);
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
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Settings className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white sm:text-2xl">Settings</h1>
            <p className="text-xs text-gray-400 sm:text-sm">Configure your learning preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Provider summary → dedicated page */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Plug className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200 capitalize">{provider}</p>
                  <p className="text-xs text-gray-500">
                    {apiKey ? `Key configured · ${model}` : 'No API key yet'}
                  </p>
                </div>
              </div>
              <Link
                to="/provider"
                id="provider-page-link"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-500 active:scale-95"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Manage AI Provider
              </Link>
            </div>
          </Card>

          {/* Sound / Voice Check */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">Pronunciation</h2>
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex items-center gap-2">
                {diagnostics.supported ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span className="text-gray-400">
                  Browser speech engine: {diagnostics.supported ? 'supported' : 'not supported — cloud voice will be used'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {diagnostics.englishVoices > 0 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span className="text-gray-400">
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
            <div className="mt-4">
              <label htmlFor="voice-select" className="block text-xs text-gray-400 mb-1.5">
                Pronunciation voice
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  id="voice-select"
                  value={voiceURI}
                  onChange={e => setVoiceURI(e.target.value)}
                  className="input-base text-sm flex-1 min-w-0"
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
                  className="gap-2 shrink-0"
                >
                  <Volume2 className="h-4 w-4" />
                  Preview
                </Button>
              </div>
              {englishVoices.length === 0 && (
                <p className="mt-1.5 text-[11px] text-gray-500">
                  No English voices found on this device — the cloud voice will be used.
                </p>
              )}
            </div>

            {voiceTestState !== 'idle' && (
              <div className="mt-3">
                <p className={`text-xs font-semibold ${
                  voiceTestState === 'ok' ? 'text-emerald-400' :
                  voiceTestState === 'fallback' ? 'text-amber-400' :
                  'text-gray-400'
                }`}>
                  {voiceTestState === 'testing' && 'Testing…'}
                  {voiceTestState === 'ok' && '✅ Working! You should have heard the test sentence.'}
                  {voiceTestState === 'fallback' && '⚠️ Browser engine did not respond — playing via cloud voice instead.'}
                </p>
                {voiceTestReport.length > 0 && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 text-left text-[10px] leading-relaxed text-gray-300" dir="ltr">
{voiceTestReport.join('\n')}
                  </pre>
                )}
              </div>
            )}

            <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
              No permission is required for pronunciation — it uses your browser&apos;s built-in voices,
              with a free cloud voice as automatic backup.
            </p>
          </Card>

          {/* Default Level */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">Default Level</h2>
            <LevelSelector value={defaultLevel} onChange={setDefaultLevel} />
          </Card>

          {/* Theme */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">Theme</h2>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  id={`theme-${t}`}
                  onClick={() => setTheme(t)}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl border text-sm font-medium transition-all ${
                    theme === t
                      ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {t === 'dark' ? (
                    <>
                      <Moon className="w-4 h-4" />
                      Dark
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" />
                      Light
                    </>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
