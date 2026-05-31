import DashboardCard from '../../components/DashboardCard';

export default function DashboardOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard title="Total Documents" value="5" />
          <DashboardCard title="Total Chats" value="128" />
          <DashboardCard title="Avg Context Confidence" value="92%" />
        </div>
      </div>
      <div className="mt-8 p-4 bg-white shadow rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Your Chatbot Link:</h2>
        <p className="mt-2 text-blue-600 underline">
          <a href="/chat/1" target="_blank">http://localhost:3000/chat/1</a>
        </p>
        <p className="text-sm text-gray-500 mt-2">Share this link with your customers or embed it on your website.</p>
      </div>
    </div>
  );
}