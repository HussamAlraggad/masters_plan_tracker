'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type Language = 'ar' | 'en';

export function LanguageToggle() {
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved) setLang(saved);
  }, []);

  const toggle = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg border',
        'bg-glass-dark border-glass-border text-white',
        'hover:bg-glass-light transition-colors',
        'focus-ring'
      )}
      aria-label="Toggle language"
    >
      {lang === 'ar' ? 'AR / EN' : 'EN / AR'}
    </button>
  );
}

export function useLanguage(): Language {
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved) setLang(saved);
  }, []);

  return lang;
}