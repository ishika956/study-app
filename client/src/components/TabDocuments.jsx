import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import Spinner from './Spinner';
import EmptyState from './EmptyState';
import toast from 'react-hot-toast';
import { Upload, Trash2, Download, FileText, FileImage, FileCode, File, Calendar } from 'lucide-react';

const TabDocuments = ({ courseId }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch documents list
  const fetchDocs = async () => {
    try {
      const response = await api.get(`/docs/${courseId}`);
      setDocs(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load documents list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [courseId]);

  // Handle file select and upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size limit (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds the 15MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading document...');
    
    try {
      const response = await api.post(`/docs/${courseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDocs([response.data, ...docs]);
      toast.success('Document uploaded successfully!', { id: toastId });
      
      // Reset input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Upload failed.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Securely download file using Axios blob streams
  const handleDownload = async (docId, originalName) => {
    const toastId = toast.loading('Retrieving file stream...');
    try {
      const response = await api.get(`/docs/download/${docId}`, {
        responseType: 'blob', // crucial to fetch binary streams securely
      });

      // Construct transient anchor and download trigger
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download finished!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('File download failed.', { id: toastId });
    }
  };

  // Delete a document
  const handleDelete = async (docId, originalName) => {
    if (window.confirm(`Delete document "${originalName}" permanently?`)) {
      try {
        await api.delete(`/docs/${courseId}/${docId}`);
        setDocs(docs.filter((d) => d._id !== docId));
        toast.success('Document deleted.');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete document.');
      }
    }
  };

  // Get specific file type icon
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return <FileImage className="h-6 w-6 text-emerald-500" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText className="h-6 w-6 text-rose-500" />;
    }
    if (['doc', 'docx', 'rtf', 'txt', 'pages'].includes(ext)) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <File className="h-6 w-6 text-amber-500" />;
    }
    if (['html', 'css', 'js', 'json', 'py', 'java', 'cpp'].includes(ext)) {
      return <FileCode className="h-6 w-6 text-indigo-500" />;
    }
    return <File className="h-6 w-6 text-slate-400" />;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* File Drop / Upload Trigger Area */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center hover:border-brand-400 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500 dark:hover:bg-slate-950/20 cursor-pointer transition-all duration-300 group ${
          isUploading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950/50 dark:text-brand-400 mb-4 group-hover:scale-110 active:scale-95 transition-all">
          {isUploading ? (
            <Spinner size="sm" className="text-brand-500" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>
        
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {isUploading ? 'Uploading file...' : 'Upload Study Documents'}
        </h4>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
          Select or drag any study PDF, Word document, slideshow or images (up to 15MB limit).
        </p>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Uploaded Files</span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 py-0.5 px-2.5 text-xs font-semibold text-slate-500">
            {docs.length}
          </span>
        </h3>

        {docs.length === 0 ? (
          <EmptyState
            icon="Upload"
            title="No documents uploaded"
            description="Keep your syllabi, slides, textbooks, or image sheets in one secure hub. Upload your first document file above!"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {docs.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between rounded-3xl border border-slate-200/60 bg-white p-4 shadow-sm hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 transition-all group"
              >
                {/* File Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/20 dark:border-slate-800">
                    {getFileIcon(doc.originalName)}
                  </div>
                  
                  <div className="min-w-0">
                    <h4
                      className="text-sm font-bold text-slate-850 dark:text-white truncate cursor-pointer hover:text-brand-500 transition-colors"
                      onClick={() => handleDownload(doc._id, doc.originalName)}
                      title={doc.originalName}
                    >
                      {doc.originalName}
                    </h4>
                    
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Download */}
                  <button
                    onClick={() => handleDownload(doc._id, doc.originalName)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/20 dark:hover:text-brand-400 transition-colors cursor-pointer"
                    title="Download File"
                  >
                    <Download className="h-4.5 w-4.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(doc._id, doc.originalName)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabDocuments;
