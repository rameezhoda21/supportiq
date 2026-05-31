interface MessageProps {
  role: 'user' | 'ai';
  content: string;
  confidenceScore?: number;
  sources?: string[];
}

export default function MessageBubble({ role, content, confidenceScore, sources }: MessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-sm ${role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
        <p className="whitespace-pre-wrap">{content}</p>
        
        {role === 'ai' && confidenceScore !== undefined && (
          <div className="mt-2 text-xs text-gray-500 border-t border-gray-200 pt-2">
            <span className="font-semibold block">Confidence: {(confidenceScore * 100).toFixed(1)}%</span>
            {sources && sources.length > 0 && (
              <span className="block mt-1">
                Sources: {sources.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}