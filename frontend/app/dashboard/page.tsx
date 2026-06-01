"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCard from '../../components/DashboardCard';
import { apiFetch } from '@/lib/api';

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        localStorage.setItem('selected_business_id', data[0].id.toString());
        localStorage.setItem('selected_business_slug', data[0].business_slug);
      }
    } catch (err) {
      console.error('Failed to fetch businesses', err);
    } finally {
      setLoading(false);
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
    } catch (err: any) {
      setError(err.message || 'Failed to create business');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (businesses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome! Let's create your first business</h1>
        <form className="mt-8 space-y-6 bg-white p-6 shadow sm:rounded-lg" onSubmit={handleCreateBusiness}>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Slug (for URL)</label>
            <input type="text" required value={businessSlug} onChange={e => setBusinessSlug(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website URL (optional)</label>
            <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <button type="submit" disabled={createLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50">
            {createLoading ? 'Creating...' : 'Create Business'}
          </button>
        </form>
      </div>
    );
  }

  const selectedBusiness = businesses[0]; // Simple MVP logic

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard - {selectedBusiness.business_name}</h1>
      <div className="mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard title="Total Documents" value="0" />
          <DashboardCard title="Total Chats" value="0" />
          <DashboardCard title="Avg Context Confidence" value="N/A" />
        </div>
      </div>
      <div className="mt-8 p-4 bg-white shadow rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Your Chatbot Link:</h2>
        <p className="mt-2 text-blue-600 underline">
          <a href={`/chat/${selectedBusiness.id}`} target="_blank">http://localhost:3000/chat/{selectedBusiness.id}</a>
        </p>
        <p className="text-sm text-gray-500 mt-2">Share this link with your customers or embed it on your website.</p>
      </div>
    </div>
  );
}
