'use client';
import { useState, useEffect } from 'react';
import { BASE_URL } from '../lib/api';
import { FileUp, Loader2 } from 'lucide-react';

export default function FileUploader({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const bId = localStorage.getItem('selected_business_id');
    setBusinessId(bId);
  }, []);

  const handleUpload = async () => {
    if (!file || !businessId) {
       setErrorMsg("No file selected or business context missing.");
       return;
    }
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("business_id", businessId);
    formData.append("file", file);

    try {
      const response = await fetch(`${BASE_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setSuccessMsg(`Successfully uploaded ${data.file_name}. Chunks created: ${data.chunks_created}`);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An expected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <FileUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-950">Upload a knowledge file</h2>
            <p className="mt-1 text-sm text-gray-500">PDF and TXT files are processed into searchable chunks.</p>
            {file && <p className="mt-2 text-sm font-medium text-gray-700">{file.name}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            Choose file
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="sr-only"
            />
          </label>
          <button
            onClick={handleUpload}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
            disabled={!file || isLoading || !businessId}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {successMsg && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{successMsg}</p>}
      {errorMsg && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMsg}</p>}
    </div>
  );
}
