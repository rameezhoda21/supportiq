'use client';
import { useState } from 'react';
import FileUploader from '../../../components/FileUploader';
import DocumentList from '../../../components/DocumentList';
import { Database } from 'lucide-react';

export default function DocumentsPage() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-950 text-white">
          <Database className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Knowledge base</p>
          <h1 className="text-3xl font-semibold text-gray-950">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Upload PDF or TXT files so SupportIQ can ground customer answers.</p>
        </div>
      </div>
      
      <FileUploader onUploadSuccess={() => setRefreshCounter(c => c + 1)} />
      <DocumentList refreshCounter={refreshCounter} />
    </div>
  );
}
