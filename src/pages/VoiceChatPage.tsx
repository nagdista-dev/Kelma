import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
} from 'lucide-react';
import { generateTutorReply, type VoiceMessage } from '@/lib/voiceChat';
import { useSettingsStore } from '@/store/settingsStore';
import { getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSpeech } from '@/hooks/useSpeech';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function VoiceChatPage() {
  usePageMeta('Voice Chat', 'Speak English with an AI tutor in real time. Tap mic, talk, get feedback. A low-pressure way to build fluency.', '/voice-chat');

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const { speak, stop: stopSpeech } = useSpeech();

  const [words, setWords] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript.trim();
      setInput(transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startChat = () => {
    const wordList = words
      .split(/[,;\s]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 1 && w.length <= 24);
    if (wordList.length < 1 || wordList.length > 10) {
      setError('Enter 1-10 words to practice');
      return;
    }
    setWords(wordList.join(', '));
    setChatStarted(true);
    setMessages([]);
    setError(null);
    const greeting = `Hello! Let's practice these words: ${wordList.join(', ')}. Tell me about your day, and I'll help you use them. What did you do today?`;
    setMessages([{ role: 'tutor', text: greeting }]);
    speak(greeting);
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setError(null);

    const userMsg: VoiceMessage = { role: 'user', text: content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const wordList = words.split(',').map(w => w.trim()).filter(Boolean);
      const reply = await generateTutorReply(provider, apiKey, model, wordList, defaultLevel, [...messages, userMsg]);
      const tutorMsg: VoiceMessage = { role: 'tutor', text: reply };
      setMessages(prev => [...prev, tutorMsg]);
      stopSpeech();
      speak(reply);
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container pb-28 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Volume2 className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Voice Chat</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Speak with an AI tutor using your target words
            </p>
          </div>
        </div>

        {/* Setup: words + start */}
        {!chatStarted && (
          <Card className="mb-6 p-4">
            <label htmlFor="vc-words" className="mb-2 block text-[11px] font-bold text-slate-500 dark:text-gray-500">
              Enter words to practice (1-10, comma-separated)
            </label>
            <input
              id="vc-words"
              type="text"
              value={words}
              onChange={e => setWords(e.target.value)}
              placeholder="e.g. journey, brave, improve"
              className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
            {!speechSupported && (
              <p className="mb-3 text-xs text-amber-600 dark:text-gold">
                Microphone not supported in this browser — you can type replies instead.
              </p>
            )}
            <Button
              id="vc-start-btn"
              onClick={startChat}
              size="lg"
              className="w-full gap-2"
              disabled={!words.trim()}
            >
              <Volume2 className="h-4 w-4" />
              Start conversation
            </Button>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Chat */}
        {chatStarted && (
          <>
            {/* Messages */}
            <div className="mb-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-teal-500 text-white'
                        : 'border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-500">
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex items-center gap-2">
              <input
                id="vc-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void sendMessage(); }}
                placeholder="Type or tap mic to speak…"
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
              {speechSupported && (
                <button
                  type="button"
                  id="vc-mic-btn"
                  onClick={toggleListening}
                  disabled={loading}
                  className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-all ${
                    isListening
                      ? 'border-red-500 bg-red-500/15 text-red-500 animate-pulse'
                      : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-500 dark:border-white/10 dark:text-gray-400'
                  }`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              )}
              <button
                type="button"
                id="vc-send-btn"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-teal-500 bg-teal-500 text-white transition-all hover:bg-teal-400 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}