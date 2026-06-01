'use client';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../lib/api';

interface Document {
  id: number;
  file_name: string;
  created_at: string;
}

export default function DocumentList({ refreshCounter }: { refreshCounter?: number }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDocs() {
      const businessId = localStorage.getItem('selected_business_id');
      if (!businessId) {
        setError('No business selected.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/documents/${businessId}`);
        if (!res.ok) throw new Error('Failed to fetch documents');
        const data = await res.json();
        setDocuments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, [refreshCounter]);

  if (loading) return <div className="mt-8 text-gray-500">Loading documents...</div>;
  if (error) return <div className="mt-8 text-red-500">{error}</div>;
  if (documents.length === 0) return <div className="mt-8 text-gray-500">No documents uploaded yet.</div>;

  return (
    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li key={doc.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{doc.file_name}</p>
              <div className="ml-2 flex-shrink-0 flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleString()}
                </span>
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Processed
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
