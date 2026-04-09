import React, { useCallback, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { API_CONFIG } from '../config';

interface Props {
  onUploadSuccess: (sessionId: string, pdfUrl: string) => void;
}

export default function Dropzone({ onUploadSuccess }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsHovered(true);
    else setIsHovered(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError("Please upload a local PDF file.");
      return;
    }
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await fetch(`${API_CONFIG.BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            'X-API-Key': API_CONFIG.API_KEY
        },
        body: formData
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Upload failed");
      }
      const data = await resp.json();
      const url = URL.createObjectURL(file);
      onUploadSuccess(data.session_id, url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong uploading the file.";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-6 px-4 border border-slate-800 rounded-2xl bg-slate-900/50 backdrop-blur-sm shadow-xl">
      <div 
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={`w-full max-w-lg border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-4 transition-colors ${
          isHovered ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50 cursor-pointer'
        }`}
      >
        <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleChange} />
        <label htmlFor="file-upload" className="flex flex-col items-center gap-4 w-full h-full cursor-pointer">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          ) : (
             <UploadCloud className="w-12 h-12 text-indigo-400" />
          )}
          
          <div className="text-center">
            <p className="text-lg font-medium text-white">
              {isUploading ? "Parsing Document & Generating Embeddings..." : "Drop PDF here or click to browse"}
            </p>
            {!isUploading && <p className="text-sm text-slate-400 mt-1">Up to 20MB limit (Strict in-memory process)</p>}
          </div>
          
          {error && (
            <div className="mt-4 text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded w-full text-center border border-red-400/20">
              {error}
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
