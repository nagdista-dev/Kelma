import { useState, useRef, useEffect, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertTriangle, ClipboardPaste, Plus, X } from 'lucide-react';
import { MAX_WORDS, MIN_WORDS } from '@/constants/index';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface WordInputProps {
  words: string[];
  onChange: (words: string[]) => void;
}

const ARABIC_RE = /[\u0600-\u06FF]/;

export function WordInput({ words, onChange }: WordInputProps) {
  const [input, setInput] = useState('');
  const [arabicWarn, setArabicWarn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { play } = useSoundEffects();
  const lastWarnRef = useRef(0);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(warnTimerRef.current), []);

  const showArabicWarning = () => {
    const now = Date.now();
    if (now - lastWarnRef.current < 3000) return;
    lastWarnRef.current = now;
    setArabicWarn(true);
    clearTimeout(warnTimerRef.current);
    warnTimerRef.current = setTimeout(() => setArabicWarn(false), 2800);
    toast('English words only — Kelma trains you on English terms', {
      id: 'arabic-blocked',
      duration: 2500,
      style: {
        background: 'rgba(15, 23, 42, 0.97)',
        color: '#f1f5f9',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600,
        direction: 'ltr',
      },
      iconTheme: { primary: '#f59e0b', secondary: '#0f172a' },
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (ARABIC_RE.test(raw)) showArabicWarning();
    setInput(raw.replace(/[^a-zA-Z\s-]/g, '').replace(/\s+/g, ' '));
  };

  const normalizeWord = (value: string) =>
    value.trim().toLowerCase().replace(/[^a-z\s-]/g, '').replace(/\s+/g, ' ');

  const parseWords = (value: string) =>
    value
      .split(/[\n,;\t]+/)
      .map(normalizeWord)
      .filter(w => w.length > 1 && w.length <= 24);

  const addWords = (values: string[]) => {
    if (words.length >= MAX_WORDS) return;

    const nextWords = [...words];
    let addedCount = 0;
    values.forEach(word => {
      if (nextWords.length < MAX_WORDS && !nextWords.includes(word)) {
        nextWords.push(word);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      play('next');
      onChange(nextWords);
      if (addedCount > 1) {
        toast.success(`Added ${addedCount} words!`);
      }
    }
  };

  const addWord = () => {
    const parsed = parseWords(input);
    if (parsed.length > 0) {
      addWords(parsed);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const removeWord = (w: string) => {
    play('click');
    onChange(words.filter(x => x !== w));
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseWords(text);
      if (parsed.length > 0) {
        addWords(parsed);
      } else {
        toast.error('Clipboard does not contain valid English words');
      }
    } catch {
      inputRef.current?.focus();
      toast('Paste your word list using Ctrl+V / Cmd+V');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addWord();
    }
    if (e.key === 'Backspace' && input === '' && words.length > 0) {
      removeWord(words[words.length - 1]);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (ARABIC_RE.test(pastedText)) showArabicWarning();
    const pastedWords = parseWords(pastedText);

    if (pastedWords.length > 1 || /[\n,;\t]/.test(pastedText)) {
      e.preventDefault();
      addWords(pastedWords);
      setInput('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-4">
      {/* Word Ledger Container — loaded cards stacked above the typing tray */}
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white cursor-text transition-all duration-200 dark:bg-white/[0.02] ${
          arabicWarn
            ? 'border-amber-400 ring-4 ring-amber-400/20 dark:border-amber-500/60 dark:ring-amber-500/20'
            : 'border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/15 dark:border-white/10 dark:focus-within:border-teal-400/60'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Empty-state hint */}
        {words.length === 0 && (
          <p className="px-5 pt-5 pb-1 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-slate-300 dark:text-gray-600">
            Loaded cards appear here
          </p>
        )}
        <AnimatePresence initial={false}>
          {words.map((w, index) => (
            <motion.div
              key={w}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: 'spring', damping: 24, stiffness: 350 }}
              className="flex items-center gap-3 border-b border-dashed border-slate-100 px-4 py-2.5 last:border-b-0 dark:border-white/5"
            >
              <span className="w-6 shrink-0 font-mono text-[11px] font-bold tabular-nums text-teal-600/70 dark:text-teal-400/70">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold lowercase tracking-tight text-slate-900 dark:text-white">
                {w}
              </span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  removeWord(w);
                }}
                aria-label={`Remove ${w}`}
                className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-slate-300 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 active:scale-90 dark:text-gray-600 dark:hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {words.length < MAX_WORDS && (
          <div
            className={`mt-auto flex items-center gap-2 px-4 py-3 ${
              words.length > 0 ? 'border-t-2 border-dashed border-slate-100 dark:border-white/5' : ''
            }`}
          >
            <Plus className="h-4 w-4 shrink-0 text-teal-500 dark:text-teal-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              enterKeyHint="done"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              lang="en"
              placeholder={
                words.length === 0
                  ? 'Type an English word and press Enter (or comma)…'
                  : 'Add next word…'
              }
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 placeholder-slate-400 outline-none dark:text-white dark:placeholder-gray-500"
              id="word-input"
            />
            {input.trim().length > 0 && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  addWord();
                }}
                className="ml-2 inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-teal-500 active:scale-95"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input Action Utilities (Paste List & Counter) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={pasteFromClipboard}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-teal-500/40 hover:text-teal-700 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-teal-300"
          >
            <ClipboardPaste className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Paste Word List</span>
          </button>
          <span className="text-[11px] text-slate-400 dark:text-gray-500 hidden sm:inline">
            (Accepts comma-separated words, lines, or notes)
          </span>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
          {words.length < MIN_WORDS ? (
            <span className="text-amber-600 dark:text-amber-400">
              Needs {MIN_WORDS - words.length} more
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">
              Ready for 6-round gauntlet
            </span>
          )}
        </div>
      </div>

      {/* Inline Arabic Warning */}
      <AnimatePresence>
        {arabicWarn && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>English only — Kelma will translate and explain your words in Arabic automatically!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
