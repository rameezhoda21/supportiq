"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Bot, CheckCircle2, LockKeyhole, Mail, UserRound } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Link href="/" className="inline-flex items-center gap-3 text-gray-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold">SupportIQ</span>
            </Link>

            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Create workspace</p>
              <h2 className="mt-2 text-3xl font-semibold text-gray-950">Start answering customers from your documents</h2>
              <p className="mt-2 text-sm text-gray-500">Create your account, add a business, and upload your first knowledge file.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Full name</label>
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950" placeholder="Rameez Hoda" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950" placeholder="Create a password" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex w-full justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">Sign in</Link>
              </p>
            </form>
          </div>
        </section>

        <section className="hidden bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Launch faster</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Turn policies, PDFs, and FAQs into instant support.</h1>
            <p className="mt-5 text-sm leading-6 text-gray-300">
              SupportIQ gives small businesses a practical AI support desk: document upload, grounded answers, chat logs, and admin visibility.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              'Upload PDFs and TXT files as your knowledge base.',
              'Share a customer chatbot link in minutes.',
              'Track questions, sources, and answer quality.',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="h-5 w-5 text-blue-300" aria-hidden="true" />
                <p className="text-sm text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
