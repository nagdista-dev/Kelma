import { useState } from 'react';
import { Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
}

export function ApiKeyInput({
  value,
  onChange,
  placeholder = 'sk-…',
  id = 'api-key-input',
}: ApiKeyInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="input-base pl-10 pr-12 font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide API key' : 'Show API key'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
