import ChatWindow from '../../../components/ChatWindow';

export default function PublicChatPage({ params }: { params: { businessId: string } }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden border border-gray-300 p-6">
        <h1 className="text-2xl font-bold bg-white text-center mb-6">Customer Support Chat</h1>
        <p className="text-center text-gray-500 mb-4">We're here to help! Ask us about policies, shipping, and more.</p>
        <ChatWindow businessId={params.businessId} />
      </div>
    </div>
  );
}