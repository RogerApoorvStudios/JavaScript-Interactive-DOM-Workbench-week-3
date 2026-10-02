import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, DOMEventLog } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { InteractiveExperience } from './components/InteractiveExperience.tsx';
import { EventInspector } from './components/EventInspector.tsx';
import { TechnicalDocumentationViewer } from './components/TechnicalDocumentationViewer.tsx';
import { SourceCodeViewer } from './components/SourceCodeViewer.tsx';
import { BenchmarkVisualizer } from './components/BenchmarkVisualizer.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('interactive');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Telemetry event log
  const [eventLogs, setEventLogs] = useState<DOMEventLog[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasCopiedMarkdown, setHasCopiedMarkdown] = useState<boolean>(false);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  // Log incoming DOM event with timestamp
  const logEvent = useCallback(
    (event: Omit<DOMEventLog, 'id' | 'timestamp' | 'timeMs'>) => {
      if (isPaused) return;

      const now = new Date();
      const timeMs = performance.now();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;

      const newLog: DOMEventLog = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        timeMs,
        ...event,
      };

      setEventLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    },
    [isPaused]
  );

  // Initial event logs seed
  useEffect(() => {
    logEvent({
      type: 'DOMContentLoaded',
      target: 'document',
      durationMs: 3.8,
      phase: 'target',
      details: 'DOM tree constructed; registered event delegation root on #catalogGrid',
    });
    logEvent({
      type: 'IntersectionObserver:connect',
      target: '#overview',
      durationMs: 0.6,
      phase: 'target',
      details: 'Connected viewport observer for requestAnimationFrame counters',
    });
  }, [logEvent]);

  // Clear event logs
  const handleClearLogs = () => {
    setEventLogs([]);
  };

  // Simulate typing benchmark
  const handleRunTypingBenchmark = () => {
    const sample = 'DocumentFragment';
    let delay = 0;

    sample.split('').forEach((char, index) => {
      delay += 80;
      setTimeout(() => {
        logEvent({
          type: 'input:raw_keystroke',
          target: '#catalogSearchInput',
          durationMs: 0.12,
          phase: 'target',
          details: `Character "${char}" typed (${index + 1}/${sample.length})`,
        });
      }, delay);
    });

    setTimeout(() => {
      logEvent({
        type: 'input:debounced_execution',
        target: '#catalogSearchInput',
        durationMs: 1.15,
        phase: 'target',
        details: 'Debounce window closed (300ms pause) ➔ 1 single atomic filter render executed',
      });
    }, delay + 300);
  };

  // Copy raw markdown report
  const handleCopyMarkdown = async () => {
    try {
      const res = await fetch('/deliverables/TECHNICAL_DOCUMENTATION.md');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setHasCopiedMarkdown(true);
      setTimeout(() => setHasCopiedMarkdown(false), 2000);
    } catch (e) {
      console.error('Failed to copy markdown:', e);
    }
  };

  // Download all deliverable files
  const handleDownloadAll = async () => {
    const fileNames = ['index.html', 'styles.css', 'app.js', 'TECHNICAL_DOCUMENTATION.md'];

    for (const name of fileNames) {
      try {
        const res = await fetch(`/deliverables/${name}`);
        const content = await res.text();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(`Failed to download ${name}:`, err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onDownloadAll={handleDownloadAll}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'interactive' && (
          <InteractiveExperience onLogEvent={logEvent} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'inspector' && (
          <EventInspector
            logs={eventLogs}
            onClearLogs={handleClearLogs}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onRunTypingBenchmark={handleRunTypingBenchmark}
          />
        )}

        {activeTab === 'documentation' && (
          <TechnicalDocumentationViewer
            onCopyMarkdown={handleCopyMarkdown}
            hasCopied={hasCopiedMarkdown}
          />
        )}

        {activeTab === 'source' && <SourceCodeViewer />}

        {activeTab === 'benchmarks' && <BenchmarkVisualizer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Apoorv Chaudhary</span>
            <span className="mx-2">&middot;</span>
            <span>Frontend Web Developer Intern &middot; Week 3 Integration</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">apoorvchaudhary16@gmail.com</span>
            <span className="text-slate-300 dark:text-slate-700">&middot;</span>
            <span>Plain JavaScript (ES6+)</span>
            <span className="text-slate-300 dark:text-slate-700">&middot;</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
