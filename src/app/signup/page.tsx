'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

function SignupForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent, useMagicLink = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = useMagicLink ? '/api/auth/magic-link' : '/api/auth/otp';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.error?.includes('rate limit')) {
          setRateLimited(true);
          setError('Rate limited. Try the magic link below, or wait a moment.');
        } else {
          setError(data.error || 'Failed to send');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setRateLimited(false);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-2">Enter your email to get started</p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300"
          >
            {rateLimited ? (
              'Magic link sent! Check your email and click the link to create your account.'
            ) : (
              'Check your email for the 6-digit code, then <a href="/verify" className="underline hover:text-emerald-200">click here to verify</a>.'
            )}
          </motion.div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-glass-dark border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              placeholder="you@university.edu"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || email.length === 0}
            className="w-full py-3 bg-accent text-slate-950 font-semibold rounded-lg hover:bg-accent-hover transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>

        {rateLimited && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 text-sm text-center mb-3">
              OTP rate limited. Use magic link instead:
            </p>
            <form onSubmit={(e) => handleSubmit(e, true)}>
              <button
                type="submit"
                disabled={loading || email.length === 0}
                className="w-full py-3 bg-slate-700 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50"
              >
                {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <a href="/login" className="text-accent hover:underline">Sign in</a>
        </p>
        
        <p className="mt-6 text-center text-sm text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}