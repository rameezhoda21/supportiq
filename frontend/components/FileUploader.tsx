'use client';
import { useState, useEffect } from 'react';
import { BASE_URL } from '../lib/api';

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
    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input 
        type="file" 
        accept=".pdf,.txt"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 block mx-auto"
      />
      <button 
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
        disabled={!file || isLoading || !businessId}
      >
        {isLoading ? "Uploading..." : "Upload Document"}
      </button>

      {successMsg && <p className="text-green-600 mt-4">{successMsg}</p>}
      {errorMsg && <p className="text-red-600 mt-4">{errorMsg}</p>}
    </div>
  );
}
