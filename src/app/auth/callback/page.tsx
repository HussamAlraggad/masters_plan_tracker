'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return;
      
      // Check if there's a hash fragment with tokens
      const hash = window.location.hash;
      console.log('Auth callback - hash:', hash);
      
      if (hash) {
        // Let Supabase process the hash fragment
        const { error: hashError } = await supabase.auth.getSession();
        if (hashError) {
          console.error('Hash processing error:', hashError);
        }
      }
      
      // Now get the session (should be established from hash)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Auth callback - session:', session?.user?.email);
      console.log('Auth callback - error:', error);
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=auth_failed');
        return;
      }
      
      if (session) {
        // Session established, redirect to dashboard
        console.log('Redirecting to dashboard');
        router.push('/');
        router.refresh();
      } else {
        // No session yet - wait a bit and retry (hash processing can be async)
        console.log('No session yet, retrying...');
        setTimeout(() => {
          handleAuthCallback();
        }, 1000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center">
          <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Completing Sign In</h1>
        <p className="text-slate-400 mt-2">Please wait while we verify your session...</p>
      </motion.div>
    </div>
  );
}