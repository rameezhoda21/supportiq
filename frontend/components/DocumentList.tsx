'use client';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../lib/api';
import { CheckCircle2, FileText } from 'lucide-react';

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

  if (loading) return <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">Loading documents...</div>;
  if (error) return <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (documents.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-gray-950">No documents yet</h3>
        <p className="mt-1 text-sm text-gray-500">Upload your first PDF or TXT file to start powering answers.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-950">Indexed documents</h2>
        <p className="mt-1 text-sm text-gray-500">{documents.length} files available to the chatbot.</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {documents.map((doc) => (
          <li key={doc.id} className="px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-950">{doc.file_name}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(doc.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Processed
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
