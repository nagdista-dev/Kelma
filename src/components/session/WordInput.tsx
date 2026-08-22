import { useState, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { MAX_WORDS } from '@/constants/index';

interface WordInputProps {
  words: string[];
  onChange: (words: string[]) => void;
}

export function WordInput({ words, onChange }: WordInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
      onChange(nextWords);
    }
  };

  const addWord = () => {
    addWords(parseWords(input));
    setInput('');
    inputRef.current?.focus();
  };

  const removeWord = (w: string) => onChange(words.filter(x => x !== w));

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
        className="flex flex-wrap gap-2 mb-3 min-h-[44px] bg-white/5 border border-white/10 rounded-xl p-3 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {words.map(w => (
          <span
            key={w}
            className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 text-violet-200 px-3 py-1 rounded-lg text-sm font-medium"
          >
            {w}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeWord(w); }}
              aria-label={`Remove ${w}`}
              className="text-violet-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {words.length < MAX_WORDS && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={words.length === 0 ? 'Paste words or type one word…' : 'Add more…'}
            className="flex-1 min-w-[140px] bg-transparent outline-none text-white placeholder-gray-500 text-sm"
            id="word-input"
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {words.length}/{MAX_WORDS} words · Paste lines or comma-separated words
        </p>
        {input.trim() && words.length < MAX_WORDS && (
          <button
            type="button"
            onClick={addWord}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add words
          </button>
        )}
      </div>
    </div>
  );
}
