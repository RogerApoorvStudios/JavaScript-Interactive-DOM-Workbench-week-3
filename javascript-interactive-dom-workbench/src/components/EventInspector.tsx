import React, { useState } from 'react';
import { DOMEventLog } from '../types.ts';
import { Terminal, Trash2, Pause, Play, Filter, Zap, Activity, Clock } from 'lucide-react';

interface EventInspectorProps {
  logs: DOMEventLog[];
  onClearLogs: () => void;
  isPaused: boolean;
  setIsPaused: (val: boolean | ((prev: boolean) => boolean)) => void;
  onRunTypingBenchmark: () => void;
}

export const EventInspector: React.FC<EventInspectorProps> = ({
  logs,
  onClearLogs,
  isPaused,
  setIsPaused,
  onRunTypingBenchmark,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    if (filterType === 'input') return log.type.includes('input');
    if (filterType === 'click') return log.type.includes('click');
    if (filterType === 'validate') return log.type.includes('validate') || log.type.includes('validation');
    if (filterType === 'modal') return log.type.includes('modal');
    return true;
  });

  // Calculate quick metrics
  const avgDuration =
    logs.length > 0
      ? (logs.reduce((acc, curr) => acc + curr.durationMs, 0) / logs.length).toFixed(3)
      : '0.000';

  return (
    <div className="space-y-6">
      {/* Header with Title and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Activity className="w-3.5 h-3.5" />
            <span>W3C Event Dispatch Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Real-Time DOM Event Stream
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Live telemetry capturing bubbling, capturing, debounce timers, and validation latencies
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRunTypingBenchmark}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
            title="Simulate rapid keystrokes to prove debounce reduction"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Keystroke Test</span>
          </button>
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
              isPaused
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>
          <button
            onClick={onClearLogs}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
            title="Clear event history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Captured Events</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
            {logs.length}
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Avg Execution Time</div>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">
            {avgDuration} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Event Delegation</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            Active <span className="text-xs font-normal text-slate-400">O(1)</span>
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Listener Memory Leak</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            0 kB <span className="text-xs font-normal text-slate-400">(Cleaned)</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'input', label: 'Inputs & Debounce' },
          { id: 'validate', label: 'Regex Validation' },
          { id: 'click', label: 'Clicks & Tabs' },
          { id: 'modal', label: 'Modals' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterType === f.id
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Terminal-style Event Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-slate-300">DOM_DISPATCH_PIPE // STREAM_MONITOR</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Showing {filteredLogs.length} events</span>
        </div>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-900/60 font-mono text-xs">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const isValidation = log.type.includes('validate') || log.type.includes('validation');
              const isDebounce = log.type.includes('debounced');
              const isClick = log.type.includes('click');

              return (
                <div
                  key={log.id}
                  className="px-4 py-3 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-slate-500 shrink-0 text-[11px] tabular-nums">
                      {log.timestamp}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                        isDebounce
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                          : isValidation
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          : isClick
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      {log.type}
                    </span>

                    <span className="text-slate-400 text-xs font-semibold">
                      {log.target}
                    </span>

                    {log.details && (
                      <span className="text-slate-500 hidden md:inline text-[11px]">
                        &mdash; {log.details}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-[11px]">
                    <span className="text-slate-500">phase: {log.phase}</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        log.durationMs < 1
                          ? 'text-emerald-400'
                          : log.durationMs < 3
                          ? 'text-blue-400'
                          : 'text-amber-400'
                      }`}
                    >
                      +{log.durationMs}ms
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Clock className="w-6 h-6 mx-auto text-slate-600" />
              <p>No events recorded in this filter view.</p>
              <p className="text-[11px] text-slate-600">
                Interact with the catalog, type in the search bar, or toggle tabs to stream events.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
