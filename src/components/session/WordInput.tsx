import { useState, useRef, useEffect, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertTriangle, ClipboardPaste, X, Plus } from 'lucide-react';
import { MAX_WORDS } from '@/constants/index';
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
    toast('English only — this list accepts English words', {
      id: 'arabic-blocked',
      duration: 2200,
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
      .filter(Boolean);

  const addWords = (values: string[]) => {
    if (words.length >= MAX_WORDS) return;

    const nextWords = [...words];
    values.forEach(word => {
      if (nextWords.length < MAX_WORDS && !nextWords.includes(word)) {
        nextWords.push(word);
      }
    });

    if (nextWords.length !== words.length) {
      play('next');
      onChange(nextWords);
    }
  };

  const addWord = () => {
    addWords(parseWords(input));
    setInput('');
    inputRef.current?.focus();
  };

  const removeWord = (w: string) => {
    play('click');
    onChange(words.filter(x => x !== w));
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      addWords(parseWords(text));
    } catch {
      inputRef.current?.focus();
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
    <div>
      {/* Word chips */}
      <div
        className={`flex flex-wrap items-center gap-2 mb-1 min-h-[56px] bg-white border rounded-xl p-2.5 cursor-text transition-colors dark:bg-white/5 ${
          arabicWarn
            ? 'border-amber-400 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:ring-amber-500/20'
            : 'border-slate-200 dark:border-white/10'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {words.map(w => (
          <span
            key={w}
            className="inline-flex items-center gap-1 bg-teal-500/20 border border-teal-500/30 text-teal-200 pl-3 pr-1.5 py-1 rounded-lg text-sm font-medium"
          >
            {w}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeWord(w); }}
              aria-label={`Remove ${w}`}
              className="-m-0.5 flex h-7 w-7 items-center justify-center rounded-md text-teal-300 transition-colors hover:bg-red-500/20 hover:text-red-300 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}

        {words.length < MAX_WORDS && (
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
            placeholder={words.length === 0 ? 'Type a word and press Enter…' : 'Add another…'}
            className="min-w-[120px] flex-1 bg-transparent outline-none text-slate-950 placeholder-slate-400 text-base sm:text-sm py-1.5 dark:text-white dark:placeholder-gray-500"
            id="word-input"
          />
        )}
      </div>

      {/* Inline Arabic warning */}
      <AnimatePresence>
        {arabicWarn && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 dark:border-amber-500/30 dark:bg-amber-500/10">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                English words only — Arabic characters are ignored
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-gray-500">
          {words.length}/{MAX_WORDS} words
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void pasteFromClipboard()}
            id="paste-words-btn"
            aria-label="Paste words from clipboard"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-teal-500/60 hover:text-teal-600 dark:border-white/10 dark:text-gray-300 dark:hover:text-teal-300 active:scale-95"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Paste
          </button>
          {input.trim() && words.length < MAX_WORDS && (
            <button
              type="button"
              onClick={addWord}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-500 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
