"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Bot, LockKeyhole, Mail, MessageSquareText, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-950">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold">SupportIQ</span>
            </Link>
            <div className="mt-16 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Welcome back</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">Keep your support answers sharp and grounded.</h1>
              <p className="mt-5 text-sm leading-6 text-gray-300">
                Sign in to manage documents, review conversations, and keep your customer support chatbot aligned with your business.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { icon: MessageSquareText, text: 'Review every customer question and AI answer.' },
              { icon: ShieldCheck, text: 'Keep responses tied to your uploaded documents.' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                  <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                  <p className="text-sm text-gray-200">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3 text-gray-950">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-lg font-semibold">SupportIQ</span>
              </Link>
            </div>
            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Sign in</p>
              <h2 className="mt-2 text-3xl font-semibold text-gray-950">Access your dashboard</h2>
              <p className="mt-2 text-sm text-gray-500">Manage your chatbot, knowledge base, and support logs.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-sm font-medium text-blue-700 hover:text-blue-800">Forgot password?</Link>
                </div>
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950" placeholder="Your password" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex w-full justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium text-blue-700 hover:text-blue-800">Create one</Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
