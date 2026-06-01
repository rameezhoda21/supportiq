"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCard from '../../components/DashboardCard';
import { apiFetch, BASE_URL } from '@/lib/api';
import { Bot, CheckCircle2, Copy, ExternalLink, FileText, Globe2, MessageSquareText, Sparkles } from 'lucide-react';

interface Business {
  id: number;
  business_name: string;
  business_slug: string;
  website_url?: string | null;
}

interface ChatLog {
  confidence_score: number | null;
  was_answered: boolean;
}

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentCount, setDocumentCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState<string>('N/A');
  const [copied, setCopied] = useState(false);
  
  // Create business state
  const [businessName, setBusinessName] = useState('');
  const [businessSlug, setBusinessSlug] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    
    fetchBusinesses(parsedUser.id);
  }, [router]);

  const fetchBusinesses = async (userId: number) => {
    try {
      const data = await apiFetch(`/business/user/${userId}`);
      setBusinesses(data);
      if (data.length > 0) {
        const selected = data[0];
        localStorage.setItem('selected_business_id', selected.id.toString());
        localStorage.setItem('selected_business_slug', selected.business_slug);
        await fetchDashboardStats(selected.id);
      }
    } catch (err) {
      console.error('Failed to fetch businesses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (businessId: number) => {
    try {
      const [docsRes, logsRes] = await Promise.all([
        fetch(`${BASE_URL}/documents/${businessId}`),
        fetch(`${BASE_URL}/chat/logs/${businessId}`),
      ]);

      const docs = docsRes.ok ? await docsRes.json() : [];
      const logs: ChatLog[] = logsRes.ok ? await logsRes.json() : [];
      const confidenceValues = logs
        .map(log => log.confidence_score)
        .filter((score): score is number => typeof score === 'number');

      setDocumentCount(docs.length);
      setChatCount(logs.length);
      setAnsweredCount(logs.filter(log => log.was_answered).length);
      setAverageConfidence(
        confidenceValues.length
          ? `${Math.round((confidenceValues.reduce((sum, score) => sum + score, 0) / confidenceValues.length) * 100)}%`
          : 'N/A'
      );
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setCreateLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/business/create?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          business_slug: businessSlug,
          website_url: websiteUrl
        }),
      });
      
      setBusinesses([...businesses, data]);
      localStorage.setItem('selected_business_id', data.id.toString());
      localStorage.setItem('selected_business_slug', data.business_slug);
      setBusinessName('');
      setBusinessSlug('');
      setWebsiteUrl('');
      await fetchDashboardStats(data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create business');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(item => (
            <div key={item} className="h-32 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-950 text-white">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-gray-950">Set up your first support workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Create a business profile, upload your knowledge base, and share a chatbot link with customers.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Create workspace', 'Upload documents', 'Review answers'].map((step, index) => (
                <div key={step} className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Step {index + 1}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{step}</p>
                </div>
              ))}
            </div>
          </section>
          <form className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm" onSubmit={handleCreateBusiness}>
          <h2 className="text-lg font-semibold text-gray-950">Business details</h2>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Business name</label>
            <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="Acme Support" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business slug</label>
            <input type="text" required value={businessSlug} onChange={e => setBusinessSlug(e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="acme-support" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website URL (optional)</label>
            <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="https://example.com" />
          </div>
          <button type="submit" disabled={createLoading} className="flex w-full justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none disabled:opacity-50">
            {createLoading ? 'Creating...' : 'Create Business'}
          </button>
        </form>
        </div>
      </div>
    );
  }

  const selectedBusiness = businesses[0]; // Simple MVP logic
  const chatbotLink = `http://localhost:3000/chat/${selectedBusiness.id}`;
  const answerRate = chatCount > 0 ? `${Math.round((answeredCount / chatCount) * 100)}%` : 'N/A';
  const businessInitial = selectedBusiness.business_name.charAt(0).toUpperCase();

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(chatbotLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-950 text-xl font-semibold text-white">
            {businessInitial}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dashboard</p>
            <h1 className="text-3xl font-semibold text-gray-950">{selectedBusiness.business_name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedBusiness.website_url && (
            <a
              href={selectedBusiness.website_url}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              Website
            </a>
          )}
          <a
            href={`/chat/${selectedBusiness.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open chatbot
          </a>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <DashboardCard title="Documents" value={documentCount} caption="Knowledge files indexed" icon={FileText} tone="blue" />
        <DashboardCard title="Customer chats" value={chatCount} caption="Conversations captured" icon={MessageSquareText} tone="emerald" />
        <DashboardCard title="Answer rate" value={answerRate} caption={`${answeredCount} answered conversations`} icon={CheckCircle2} tone="amber" />
        <DashboardCard title="Avg confidence" value={averageConfidence} caption="Across recorded answers" icon={Bot} tone="blue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">Chatbot link</h2>
              <p className="mt-1 text-sm text-gray-500">Share this with customers or use it while testing your knowledge base.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Ready</span>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href={`/chat/${selectedBusiness.id}`} target="_blank" className="min-w-0 flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-950">
              {chatbotLink}
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">Next best action</h2>
          <div className="mt-4 space-y-3">
            <a href="/dashboard/documents" className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Upload or review documents
              <FileText className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </a>
            <a href="/dashboard/chat-logs" className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Audit recent answers
              <MessageSquareText className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
