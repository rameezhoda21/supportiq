import ChatLogTable from '../../../components/ChatLogTable';

export default function ChatLogsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Customer Chat Logs</h1>
      <p className="text-gray-500 mt-2">Review questions your customers have asked and how the AI responded.</p>
      
      <ChatLogTable />
    </div>
  );
}