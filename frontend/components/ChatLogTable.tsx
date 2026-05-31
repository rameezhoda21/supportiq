'use client';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../lib/api';

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
      try {
        const res = await fetch(`${BASE_URL}/chat/logs/1`); // Hardcoded business_id=1 for MVP
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

  if (loading) return <div className="mt-8 text-gray-500">Loading logs...</div>;
  if (error) return <div className="mt-8 text-red-500">{error}</div>;
  if (logs.length === 0) return <div className="mt-8 text-gray-500">No chat logs found.</div>;

  return (
    <div className="mt-8 flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.customer_question}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-pre-wrap">{log.ai_answer}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.confidence_score !== null ? (log.confidence_score * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.was_answered ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Answered</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Unanswered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}