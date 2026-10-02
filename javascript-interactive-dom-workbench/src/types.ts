export type ActiveTab = 'interactive' | 'inspector' | 'documentation' | 'source' | 'benchmarks';

export interface DOMEventLog {
  id: string;
  type: string;
  target: string;
  timestamp: string;
  timeMs: number;
  durationMs: number;
  phase: 'bubble' | 'capture' | 'target';
  details?: string;
}

export interface CatalogModule {
  id: string;
  title: string;
  category: 'dom' | 'events' | 'animation';
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  description: string;
  codeSnippet: string;
  benchmark: string;
}
