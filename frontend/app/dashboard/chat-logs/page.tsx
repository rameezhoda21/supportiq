import ChatLogTable from '../../../components/ChatLogTable';
import { MessagesSquare } from 'lucide-react';

export default function ChatLogsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-950 text-white">
          <MessagesSquare className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Quality review</p>
          <h1 className="text-3xl font-semibold text-gray-950">Customer chat logs</h1>
          <p className="mt-1 text-sm text-gray-500">Review customer questions, answer quality, and confidence scores.</p>
        </div>
      </div>
      
      <ChatLogTable />
    </div>
  );
}
