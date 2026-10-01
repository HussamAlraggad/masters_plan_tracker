'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const FORMATS = [
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: '📊' },
  { value: 'ods', label: 'OpenDocument (.ods)', icon: '📄' },
  { value: 'csv', label: 'CSV (.csv)', icon: '📝' },
  { value: 'json', label: 'JSON (.json)', icon: '🔧' },
] as const;

export function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: string) => {
    setOpen(false);
    try {
      const response = await fetch(`/api/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `masters-progress-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-lg border flex items-center gap-1',
          'bg-glass-dark border-glass-border text-white',
          'hover:bg-glass-light transition-colors',
          'focus-ring'
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 glass-card py-1 shadow-xl z-50 animate-in slide-in-from-top-2 duration-150">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => handleExport(fmt.value)}
              className={cn(
                'w-full px-4 py-2 text-sm text-left flex items-center gap-2',
                'hover:bg-glass-light transition-colors',
                'focus:outline-none focus:bg-glass-light'
              )}
            >
              <span>{fmt.icon}</span>
              <span>{fmt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}