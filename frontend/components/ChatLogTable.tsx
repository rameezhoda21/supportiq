'use client';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../lib/api';
import { AlertCircle, CheckCircle2, MessageSquareText } from 'lucide-react';

interface ChatLog {
  id: number;
  customer_question: string;
  ai_answer: string;
  confidence_score: number | null;
  was_answered: boolean;
  created_at: string;
}

export default function ChatLogTable() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      const businessId = localStorage.getItem('selected_business_id');
      if (!businessId) {
        setError('No business selected.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/chat/logs/${businessId}`);
        if (!res.ok) throw new Error('Failed to fetch chat logs');
        const data = await res.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) return <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">Loading chat logs...</div>;
  if (error) return <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (logs.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <MessageSquareText className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-gray-950">No customer chats yet</h3>
        <p className="mt-1 text-sm text-gray-500">Chats will appear here after customers use your chatbot.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Question</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Answer</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Confidence</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {logs.map(log => (
                  <tr key={log.id} className="align-top hover:bg-gray-50">
                    <td className="max-w-xs px-5 py-4 text-sm font-medium text-gray-950">{log.customer_question}</td>
                    <td className="max-w-xl px-5 py-4 text-sm leading-6 text-gray-600">{log.ai_answer}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">
                      {log.confidence_score !== null ? (log.confidence_score * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {log.was_answered ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Unanswered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
