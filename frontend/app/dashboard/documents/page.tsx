'use client';
import { useState } from 'react';
import FileUploader from '../../../components/FileUploader';
import DocumentList from '../../../components/DocumentList';

export default function DocumentsPage() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
      <p className="text-gray-500 mt-2">Upload your business documents (PDF or TXT) so the AI can learn from them.</p>
      
      <FileUploader onUploadSuccess={() => setRefreshCounter(c => c + 1)} />
      <DocumentList refreshCounter={refreshCounter} />
    </div>
  );
}
