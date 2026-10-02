import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, FileCode, Search, ExternalLink } from 'lucide-react';

interface DeliverableFile {
  name: string;
  language: string;
  path: string;
  description: string;
  content: string;
}

export const SourceCodeViewer: React.FC = () => {
  const [activeFileName, setActiveFileName] = useState<string>('app.js');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [files, setFiles] = useState<DeliverableFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch actual deliverable files from /deliverables/
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true);
        const [htmlRes, cssRes, jsRes, mdRes] = await Promise.all([
          fetch('/deliverables/index.html').then((r) => r.text()),
          fetch('/deliverables/styles.css').then((r) => r.text()),
          fetch('/deliverables/app.js').then((r) => r.text()),
          fetch('/deliverables/TECHNICAL_DOCUMENTATION.md').then((r) => r.text()),
        ]);

        setFiles([
          {
            name: 'app.js',
            language: 'javascript',
            path: '/deliverables/app.js',
            description: 'Core plain JavaScript engine (event delegation, debouncing, DOM fragment batching, validation)',
            content: jsRes,
          },
          {
            name: 'index.html',
            language: 'html',
            path: '/deliverables/index.html',
            description: 'Semantic HTML5 structure with accessible ARIA landmarks, dialogs, and controls',
            content: htmlRes,
          },
          {
            name: 'styles.css',
            language: 'css',
            path: '/deliverables/styles.css',
            description: 'Responsive CSS stylesheet with CSS custom properties for theming and hardware-accelerated transforms',
            content: cssRes,
          },
          {
            name: 'TECHNICAL_DOCUMENTATION.md',
            language: 'markdown',
            path: '/deliverables/TECHNICAL_DOCUMENTATION.md',
            description: 'Comprehensive technical report with quantitative benchmarks and challenge resolutions',
            content: mdRes,
          },
        ]);
      } catch (err) {
        console.error('Failed to load deliverable files:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, []);

  const activeFile = files.find((f) => f.name === activeFileName) || files[0];

  const handleCopyCode = (content: string, fileName: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredContent = activeFile?.content || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Internship Artifacts & Source Code
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Deliverable Files Inspector
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Inspect, copy, or download the exact standalone files for this Week 3 submission
          </p>
        </div>

        {activeFile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyCode(activeFile.content, activeFile.name)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              {copiedFile === activeFile.name ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedFile === activeFile.name ? 'Copied File' : 'Copy Source'}</span>
            </button>
            <button
              onClick={() => handleDownloadFile(activeFile.name, activeFile.content)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeFile.name}</span>
            </button>
          </div>
        )}
      </div>

      {/* File Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => setActiveFileName(file.name)}
            className={`p-3 text-left rounded-xl border transition-all ${
              activeFileName === file.name
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                {file.name}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {file.language}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
              {file.description}
            </div>
          </button>
        ))}
      </div>

      {/* Code Display Frame */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          Loading deliverable source files...
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          {/* File Top Bar */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="text-slate-200 font-bold">{activeFile?.path}</span>
              <span className="text-slate-500 hidden sm:inline">&middot; {activeFile?.description}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                {activeFile?.content.split('\n').length} lines
              </span>
              <a
                href={activeFile?.path}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-sans font-semibold"
              >
                <span>Raw File</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono leading-relaxed text-slate-200 select-all">
              <code>{filteredContent}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
