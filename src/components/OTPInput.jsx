import React, { useState, useRef } from 'react';

export default function OTPInput({ onComplete, onCodeChange, length = 4 }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  function notify(next) {
    if (onCodeChange) onCodeChange(next.join(''));
    if (next.every(ch => ch) && onComplete) onComplete(next.join(''));
  }

  function applyDigits(startIndex, digits) {
    const next = [...values];
    let idx = startIndex;
    for (const d of digits) {
      if (idx >= length) break;
      next[idx] = d;
      idx += 1;
    }
    setValues(next);
    const lastFilled = Math.min(idx, length) - 1;
    if (lastFilled >= 0 && refs.current[lastFilled]) refs.current[lastFilled].focus();
    notify(next);
  }

  function handleChange(i, e) {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      const next = [...values];
      next[i] = '';
      setValues(next);
      notify(next);
      return;
    }
    if (raw.length === 1) {
      const next = [...values];
      next[i] = raw;
      setValues(next);
      if (i < length - 1 && refs.current[i + 1]) refs.current[i + 1].focus();
      notify(next);
    } else {
      applyDigits(i, raw.split(''));
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !values[i] && i > 0 && refs.current[i - 1]) refs.current[i - 1].focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const raw = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
    if (raw) applyDigits(0, raw.split('').slice(0, length));
  }

  return (
    <div className="flex justify-center gap-3 mb-4">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={v}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-school focus:outline-none"
        />
      ))}
    </div>
  );
}
