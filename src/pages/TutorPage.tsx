import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bot,
  Briefcase,
  CircleStop,
  Copy,
  Layers,
  Loader2,
  MessageSquare,
  Mic,
  RotateCcw,
  Send,
  Sparkles,
  Speech,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateTutorReply, type TutorMessage } from '@/lib/aiTutor';
import { getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useSpeech } from '@/hooks/useSpeech';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

const TUTOR_TRACKS = [
  {
    id: 'vocab',
    label: 'Vocabulary & Nuance',
    desc: 'High-yield words, collocations, and memory anchors',
    icon: Sparkles,
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
  },
  {
    id: 'fluency',
    label: 'Conversational Fluency',
    desc: 'Natural expressions, spoken rhythm, and confidence',
    icon: Speech,
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
  },
  {
    id: 'business',
    label: 'Business & Leadership',
    desc: 'Workplace pitches, email diplomacy, and interviews',
    icon: Briefcase,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  {
    id: 'grammar',
    label: 'Grammar & Polishing',
    desc: 'Natural sentence structures and error corrections',
    icon: Layers,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation & Accent',
    desc: 'Vowel length, word stress, and phonetic clarity',
    icon: Volume2,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  {
    id: 'free',
    label: 'Open Practice Lab',
    desc: 'Discuss anything freely with instant coaching',
    icon: MessageSquare,
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
];

export function TutorPage() {
  usePageMeta(
    'AI English Tutor',
    'Interactive conversational English mentoring. Get real-time grammatical corrections, vocabulary expansion, and audio coaching.',
    '/tutor'
  );

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const { speak, stop: stopSpeech } = useSpeech();
  const { play } = useSoundEffects();

  const [started, setStarted] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('vocab');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [voiceRate, setVoiceRate] = useState<number>(0.9);

  const [speechSupported] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition setup
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
        .trim();
      setInput(transcript);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const handleStartSession = (trackId: string) => {
    play('click');
    setSelectedTrack(trackId);
    setStarted(true);
    setMessages([]);
    setError(null);

    const track = TUTOR_TRACKS.find(t => t.id === trackId) ?? TUTOR_TRACKS[0];
    const greeting = `Hello! I'm your AI English language mentor. Today we are focusing on ${track.label} at CEFR ${defaultLevel}. ${track.desc}. What question or topic would you like to explore first?`;

    const initialMessage: TutorMessage = { role: 'tutor', text: greeting };
    setMessages([initialMessage]);

    if (autoVoice) {
      stopSpeech();
      speak(greeting, voiceRate);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    play('click');
    setInput('');
    setError(null);

    const userMsg: TutorMessage = { role: 'user', text: content };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      const reply = await generateTutorReply(provider, apiKey, model, defaultLevel, updatedHistory);
      const tutorMsg: TutorMessage = { role: 'tutor', text: reply };
      setMessages(prev => [...prev, tutorMsg]);

      if (autoVoice) {
        stopSpeech();
        speak(reply, voiceRate);
      }
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
      toast.error('Could not get tutor reply');
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Microphone recognition not available in this browser');
      return;
    }
    play('click');
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      setInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleCopy = (text: string) => {
    play('click');
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="page-container pb-28 lg:pb-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ─── Hero Header ─── */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15 shadow-sm">
              <MessageSquare className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                AI English Tutor
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Interactive dialogue, grammatical coaching, vocabulary expansion, and speech feedback
              </p>
            </div>
          </div>

        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Track Setup Screen (Before Starting) ─── */}
        {!started && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <Card className="p-6 border-slate-200/90 dark:border-white/10 shadow-xl">
              <div className="mb-4">
                <h2 className="text-base font-black text-slate-950 dark:text-white">
                  Choose a Mentoring Track
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Select your learning focus. Your AI tutor will adapt grammatical explanations to CEFR {defaultLevel}.
                </p>
              </div>

              {/* Mentoring Tracks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {TUTOR_TRACKS.map(track => {
                  const TrackIcon = track.icon;
                  const isSelected = selectedTrack === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrack(track.id)}
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-500/20 shadow-md ring-2 ring-teal-500/20'
                          : 'border-slate-200/90 bg-white hover:border-teal-500/50 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-3">
                        <TrackIcon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black text-slate-950 dark:text-white mb-1">
                        {track.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                        {track.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Start Mentoring Button */}
              <Button
                id="tutor-start-btn"
                type="button"
                onClick={() => handleStartSession(selectedTrack)}
                size="lg"
                className="w-full gap-2 py-4 text-base font-bold shadow-xl cursor-pointer"
              >
                <Bot className="h-5 w-5" />
                <span>Start Mentoring Session</span>
              </Button>
            </Card>
          </motion.div>
        )}

        {/* ─── Active Chat Mentoring Room ─── */}
        {started && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Room Top Bar */}
            <Card className="p-4 border-slate-200/90 dark:border-white/10 bg-gradient-to-r from-violet-500/10 via-slate-50 to-teal-500/10 dark:from-violet-500/15 dark:via-slate-900 dark:to-teal-500/15 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
                    <Bot className="h-5 w-5" />
                    {loading && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-950 dark:text-white">
                        AI English Mentor
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">
                      Track: {TUTOR_TRACKS.find(t => t.id === selectedTrack)?.label}
                    </p>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-[10px] font-bold dark:border-white/10 dark:bg-white/5">
                    {[0.8, 1.0, 1.2].map(rate => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => {
                          play('click');
                          setVoiceRate(rate);
                        }}
                        className={`rounded-lg px-2 py-0.5 transition-all cursor-pointer ${
                          voiceRate === rate
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      play('click');
                      setAutoVoice(prev => !prev);
                    }}
                    className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      autoVoice
                        ? 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-white/5'
                    }`}
                    title={autoVoice ? 'Voice auto-speech enabled' : 'Voice muted'}
                  >
                    {autoVoice ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{autoVoice ? 'Audio On' : 'Muted'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      play('click');
                      stopSpeech();
                      setStarted(false);
                      setMessages([]);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Change Track</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Conversation Feed */}
            <Card className="p-4 sm:p-6 min-h-[380px] max-h-[55vh] overflow-y-auto space-y-4 border-slate-200/90 dark:border-white/10 shadow-inner custom-scrollbar">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                        isUser ? 'bg-slate-800 dark:bg-slate-700' : 'bg-violet-600'
                      }`}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div
                      className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-tr-none'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-[#111827] dark:border-white/10 dark:text-gray-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {!isUser && (
                        <div className="mt-2.5 flex items-center gap-3 border-t border-slate-200/60 dark:border-white/5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              stopSpeech();
                              speak(msg.text, voiceRate);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-300 cursor-pointer"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>Listen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-300 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-gray-500 py-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-600 dark:text-violet-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-2.5 border border-slate-200 dark:border-white/10">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600 dark:text-violet-400" />
                    <span>Mentor is writing coaching response…</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </Card>

            {/* Input Console */}
            <Card className="p-3 sm:p-4 border-slate-200/90 dark:border-white/10 shadow-xl">
              {isListening && (
                <div className="mb-3 flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="font-bold">Listening to speech… Speak in English now</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className="font-bold underline cursor-pointer text-[11px]"
                  >
                    Done Speaking
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {speechSupported && (
                  <button
                    type="button"
                    id="tutor-mic-btn"
                    onClick={toggleListening}
                    disabled={loading}
                    className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border transition-all shadow-md active:scale-95 ${
                      isListening
                        ? 'border-red-500 bg-red-500 text-white animate-pulse shadow-red-500/30'
                        : 'border-violet-500/30 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/25'
                    }`}
                    title={isListening ? 'Stop recording' : 'Tap to speak'}
                    aria-label={isListening ? 'Stop recording' : 'Tap to speak'}
                  >
                    {isListening ? <CircleStop className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>
                )}

                <input
                  ref={inputRef}
                  id="tutor-chat-input"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') void handleSendMessage();
                  }}
                  placeholder={isListening ? 'Listening to speech…' : 'Ask your tutor anything or share a sentence…'}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                />

                <Button
                  id="tutor-send-btn"
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className="h-12 w-12 shrink-0 p-0 rounded-2xl font-bold shadow-md cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
