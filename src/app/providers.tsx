'use client';

import { createBrowserClient } from '@supabase/ssr';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className={cn('min-h-screen bg-slate-950 text-white transition-colors')}>
        {children}
      </div>
    </ThemeProvider>
  );
}