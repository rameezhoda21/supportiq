"use client";

import { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '@/lib/api';
import { Building2, Database, FileText, KeyRound, MessageSquareText, RefreshCw, Users } from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_businesses: number;
  total_documents: number;
  total_chats: number;
}

interface AdminBusiness {
  id: number;
  user_id: number;
  owner_name: string;
  owner_email: string;
  business_name: string;
  business_slug: string;
  website_url?: string | null;
  document_count: number;
  chat_count: number;
  created_at: string;
}

const statCards = [
  { key: 'total_users', label: 'Users', icon: Users },
  { key: 'total_businesses', label: 'Businesses', icon: Building2 },
  { key: 'total_documents', label: 'Documents', icon: FileText },
  { key: 'total_chats', label: 'Chats', icon: MessageSquareText },
] as const;

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState('Not checked');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('supportiq_admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      loadAdminData(savedKey);
    }
  }, []);

  const filteredBusinesses = useMemo(() => businesses, [businesses]);

  const adminHeaders = (key: string) => ({
    'X-Admin-Key': key,
  });

  const fetchAdminJson = async (endpoint: string, key: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: adminHeaders(key),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || response.statusText);
    }

    return data;
  };

  const loadAdminData = async (key = adminKey) => {
    if (!key.trim()) {
      setError('Enter the admin API key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [healthData, statsData, businessData] = await Promise.all([
        fetchAdminJson('/admin/health/database', key),
        fetchAdminJson('/admin/stats', key),
        fetchAdminJson('/admin/businesses', key),
      ]);

      localStorage.setItem('supportiq_admin_key', key);
      setDatabaseStatus(healthData.message);
      setStats(statsData);
      setBusinesses(businessData);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data.');
      setStats(null);
      setBusinesses([]);
      setDatabaseStatus('Unable to verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  const clearKey = () => {
    localStorage.removeItem('supportiq_admin_key');
    setAdminKey('');
    setStats(null);
    setBusinesses([]);
    setDatabaseStatus('Not checked');
    setError('');
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">SupportIQ Admin</p>
            <h1 className="text-3xl font-semibold text-gray-950">Registered businesses</h1>
            <p className="mt-2 text-sm text-gray-600">View every business, owner, document count, and chat count from the connected database.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="Admin API key"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:w-64"
              />
            </div>
            <button
              type="button"
              onClick={() => loadAdminData()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading ? 'Loading' : 'Load'}
            </button>
            <button
              type="button"
              onClick={clearKey}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Database className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-950">Database connection</h2>
              <p className="mt-1 text-sm text-gray-500">{databaseStatus}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-950">{stats ? stats[card.key] : '-'}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-700 ring-1 ring-blue-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-950">All registered businesses</h2>
            <p className="mt-1 text-sm text-gray-500">{filteredBusinesses.length} businesses loaded.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Business</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Owner</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Documents</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Chats</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredBusinesses.map(business => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-950">{business.business_name}</p>
                      <p className="mt-1 text-xs text-gray-500">{business.business_slug}</p>
                      {business.website_url && (
                        <a href={business.website_url} target="_blank" className="mt-1 block text-xs font-medium text-blue-700 hover:text-blue-800">
                          {business.website_url}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-950">{business.owner_name}</p>
                      <p className="mt-1 text-xs text-gray-500">{business.owner_email}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">{business.document_count}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">{business.chat_count}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{new Date(business.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredBusinesses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">
                      Enter the admin key and load data to view registered businesses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
