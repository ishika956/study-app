import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

import {
  Save,
  CloudCog,
  FileText,
  Eye,
  Edit3,
  HelpCircle,
} from 'lucide-react';

const TabNotes = ({ courseId }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState('saved');
  const [viewMode, setViewMode] = useState('split');
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const timerRef = useRef(null);

  // Fetch notes
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/notes/${courseId}`);

        if (response.data?.content) {
          setContent(response.data.content);
        } else {
          setContent('');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [courseId]);

  // Handle typing
  const handleContentChange = (e) => {
    const value = e.target.value;

    setContent(value);
    setSaveStatus('unsaved');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveNotes(value);
    }, 1200);
  };

  // Save notes
  const saveNotes = async (text = content) => {
    try {
      setSaveStatus('saving');

      await api.post(`/notes/${courseId}`, {
        content: text,
      });

      setSaveStatus('saved');
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
      toast.error('Autosave failed');
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Markdown parser
  const parseMarkdown = (md) => {
    if (!md || md.trim() === '') {
      return `
        <p class="text-slate-400 italic text-center py-10">
          Start writing notes here...
        </p>
      `;
    }

    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>'
    );

    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>'
    );

    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-black mt-6 mb-4">$1</h1>'
    );

    // Bold
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong>$1</strong>'
    );

    // Italics
    html = html.replace(
      /\*(.*?)\*/g,
      '<em>$1</em>'
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-100 px-1 rounded">$1</code>'
    );

    // Code blocks
    html = html.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-slate-100 p-4 rounded-xl overflow-x-auto my-4"><code>$1</code></pre>'
    );

    // Lists
    html = html.replace(
      /^\s*-\s+(.*)/gim,
      '<li class="ml-6 list-disc">$1</li>'
    );

    // Horizontal line
    html = html.replace(
      /^---$/gim,
      '<hr class="my-4 border-slate-300" />'
    );

    // Paragraphs
    html = html
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();

        if (
          trimmed.startsWith('<h') ||
          trimmed.startsWith('<li') ||
          trimmed.startsWith('<pre') ||
          trimmed.startsWith('<hr')
        ) {
          return line;
        }

        if (trimmed === '') {
          return '<br />';
        }

        return `<p class="my-2">${line}</p>`;
      })
      .join('');

    return html;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4">

        {/* View mode */}
        <div className="flex items-center gap-2">

          <button
            onClick={() => setViewMode('split')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              viewMode === 'split'
                ? 'bg-violet-100'
                : 'bg-slate-100'
            }`}
          >
            <FileText className="inline mr-1 h-4 w-4" />
            Split
          </button>

          <button
            onClick={() => setViewMode('write')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              viewMode === 'write'
                ? 'bg-violet-100'
                : 'bg-slate-100'
            }`}
          >
            <Edit3 className="inline mr-1 h-4 w-4" />
            Editor
          </button>

          <button
            onClick={() => setViewMode('preview')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              viewMode === 'preview'
                ? 'bg-violet-100'
                : 'bg-slate-100'
            }`}
          >
            <Eye className="inline mr-1 h-4 w-4" />
            Preview
          </button>
        </div>

        {/* Cheat sheet */}
        <button
          onClick={() =>
            setShowCheatSheet(!showCheatSheet)
          }
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <HelpCircle className="inline mr-1 h-4 w-4" />
          {showCheatSheet ? 'Hide Guide' : 'Markdown Guide'}
        </button>

        {/* Save area */}
        <div className="ml-auto flex items-center gap-3">

          <div className="flex items-center gap-2 text-sm">

            {saveStatus === 'saving' && (
              <>
                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                Saving...
              </>
            )}

            {saveStatus === 'saved' && (
              <>
                <CloudCog className="h-4 w-4 text-green-500" />
                Saved
              </>
            )}

            {saveStatus === 'unsaved' && (
              <>
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Editing...
              </>
            )}

            {saveStatus === 'error' && (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                Error
              </>
            )}
          </div>

          <button
            onClick={() => saveNotes(content)}
            className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Cheat Sheet */}
      {showCheatSheet && (
        <div className="grid gap-4 rounded-2xl border bg-slate-50 p-4 text-sm md:grid-cols-2 lg:grid-cols-4">

          <div>
            <h4 className="font-bold mb-2">Headers</h4>
            <p># Title</p>
            <p>## Subtitle</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Formatting</h4>
            <p>**Bold**</p>
            <p>*Italic*</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Lists</h4>
            <p>- Item 1</p>
            <p>- Item 2</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Code</h4>
            <p>`inline code`</p>
            <p>```code block```</p>
          </div>
        </div>
      )}

      {/* Workspace */}
      <div className="grid h-[550px] gap-4 md:grid-cols-2">

        {/* Editor */}
        {(viewMode === 'split' ||
          viewMode === 'write') && (
          <div className="flex flex-col overflow-hidden rounded-2xl border bg-white">

            <div className="border-b bg-slate-50 px-4 py-2 text-xs font-bold">
              EDITOR
            </div>

            <textarea
              value={content}
              onChange={handleContentChange}
              className="flex-1 resize-none p-6 font-mono text-sm outline-none"
              placeholder="Write markdown notes here..."
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'split' ||
          viewMode === 'preview') && (
          <div className="flex flex-col overflow-hidden rounded-2xl border bg-white">

            <div className="border-b bg-slate-50 px-4 py-2 text-xs font-bold">
              PREVIEW
            </div>

            <div
              className="prose max-w-none flex-1 overflow-y-auto p-6"
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(content),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabNotes;