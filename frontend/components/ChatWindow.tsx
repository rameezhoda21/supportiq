'use client';
import { useState } from 'react';
import MessageBubble from './MessageBubble';
import { BASE_URL } from '../lib/api';

interface Message {
  role: 'user' | 'ai';
  content: string;
  confidenceScore?: number;
  sources?: string[];
}

export default function ChatWindow({ businessId }: { businessId: string }) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'ai', content: 'Hello! How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    
    // Optimistic user update
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use business_id = 1 for MVP local testing overrides incoming string if needed, 
        // though incoming is likely default passing. Ensuring 1 as a number
        body: JSON.stringify({ business_id: 1, question: currentInput }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch response");
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.answer, 
        confidenceScore: data.confidence_score, 
        sources: data.sources 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-gray-200 rounded-lg bg-white overflow-hidden shadow">
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} confidenceScore={m.confidenceScore} sources={m.sources} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="px-4 py-2 rounded-lg shadow-sm bg-gray-100 text-gray-500 italic rounded-bl-none">
              Typing...
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 bg-white flex">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={isLoading}
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          placeholder="Ask a question..."
        />
        <button onClick={send} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}