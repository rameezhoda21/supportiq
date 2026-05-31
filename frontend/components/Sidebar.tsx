import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200 h-[calc(100vh-4rem)]">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 bg-gray-50 space-y-1">
          <Link href="/dashboard" className="text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
            Overview
          </Link>
          <Link href="/dashboard/documents" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            Documents
          </Link>
          <Link href="/dashboard/chat-logs" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            Chat Logs
          </Link>
        </nav>
      </div>
    </div>
  );
}
