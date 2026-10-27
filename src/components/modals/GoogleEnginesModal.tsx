import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { api } from '../../services/api';

interface GoogleEnginesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export const GoogleEnginesModal: React.FC<GoogleEnginesModalProps> = ({
  isOpen,
  onClose,
  currentPath,
}) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'cpp' | 'go' | 'python' | 'java'>('overview');
  const [loading, setLoading] = React.useState(false);
  const [statusData, setStatusData] = React.useState<any>(null);
  const [executionOutput, setExecutionOutput] = React.useState<string | null>(null);

  // C++ Search inputs
  const [cppQuery, setCppQuery] = React.useState('core');
  // Go Sync inputs
  const [goWorkers, setGoWorkers] = React.useState(4);
  // Python inputs
  const [pyPath, setPyPath] = React.useState(currentPath || '.');
  // Java inputs
  const [javaOp, setJavaOp] = React.useState('ACID_WRITE_AUDIT');

  React.useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getEnginesStatus();
      setStatusData(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runCppSearch = async () => {
    try {
      setLoading(true);
      setExecutionOutput('Executing C++ high-speed inverted index binary...');
      const res = await api.cppSearch(cppQuery);
      setExecutionOutput(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setExecutionOutput(`C++ Engine Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runGoSync = async () => {
    try {
      setLoading(true);
      setExecutionOutput(`Spawning ${goWorkers} concurrent Goroutines for parallel directory scan...`);
      const res = await api.goSync(undefined, goWorkers);
      setExecutionOutput(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setExecutionOutput(`Go Engine Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runPythonDuplicates = async () => {
    try {
      setLoading(true);
      setExecutionOutput('Running Python 3.10 SHA-256 content hashing & duplicate analysis...');
      const res = await api.pythonDuplicates(pyPath);
      setExecutionOutput(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setExecutionOutput(`Python Engine Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runJavaTransaction = async () => {
    try {
      setLoading(true);
      setExecutionOutput('Dispatching Java 17 Write-Ahead Log (WAL) & Android MTP sync handshake...');
      const res = await api.javaTransaction(currentPath, javaOp);
      setExecutionOutput(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setExecutionOutput(`Java Engine Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white dark:bg-[#1e1f20] w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MaterialIcon name="terminal" size={24} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                Google Core Engineering Languages
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  4 Active Compilers
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Performance-critical C++, Scalable Go, Data Science Python, and Enterprise Java
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close dialog"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/20 text-xs">
          {[
            { id: 'overview', label: 'All Engines', icon: 'dashboard' },
            { id: 'cpp', label: 'C++ (Search & Speed)', icon: 'memory' },
            { id: 'go', label: 'Go (Cloud & Goroutines)', icon: 'cloud_sync' },
            { id: 'python', label: 'Python (ML & Duplicates)', icon: 'terminal' },
            { id: 'java', label: 'Java (Enterprise & Android)', icon: 'coffee' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setExecutionOutput(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <MaterialIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* C++ Card */}
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 text-sm">
                      <MaterialIcon name="memory" size={18} /> C++ Core Indexer
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      GCC 12.3.0
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                    Used for performance-critical systems, core search algorithms, Google File System, and execution speed.
                  </p>
                  <button
                    onClick={() => setActiveTab('cpp')}
                    className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Run C++ Inverted Index Search →
                  </button>
                </div>

                {/* Go Card */}
                <div className="p-4 rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/30 dark:bg-cyan-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 text-sm">
                      <MaterialIcon name="cloud_sync" size={18} /> Go Cloud Microservice
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                      go1.19.8
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                    Developed internally by Google for scalability, concurrency goroutines, and cloud backend microservices.
                  </p>
                  <button
                    onClick={() => setActiveTab('go')}
                    className="text-xs font-medium text-cyan-600 hover:underline flex items-center gap-1"
                  >
                    Run Go Parallel Sync Benchmark →
                  </button>
                </div>

                {/* Python Card */}
                <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-sm">
                      <MaterialIcon name="terminal" size={18} /> Python Data Science & ML
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      Python 3.10.12
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                    The preferred language for data science, machine learning models, SHA-256 duplicate analysis, and automation tooling.
                  </p>
                  <button
                    onClick={() => setActiveTab('python')}
                    className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    Run Python Duplicate & Metadata Scan →
                  </button>
                </div>

                {/* Java Card */}
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 text-sm">
                      <MaterialIcon name="coffee" size={18} /> Java Enterprise & Android
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      OpenJDK 17
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                    Heavily utilized for enterprise systems, backend networking, and foundational Android MTP sync protocols.
                  </p>
                  <button
                    onClick={() => setActiveTab('java')}
                    className="text-xs font-medium text-amber-600 hover:underline flex items-center gap-1"
                  >
                    Run Java Enterprise WAL & Android Sync →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cpp' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="memory" size={20} className="text-blue-500" />
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    C++ 17 Inverted Index Search Engine
                  </h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Scans directories at raw machine speed, computes token overlap BM25 scores, and returns sub-millisecond results.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cppQuery}
                    onChange={(e) => setCppQuery(e.target.value)}
                    placeholder="Search query token..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                  <button
                    onClick={runCppSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    {loading ? 'Searching in C++...' : 'Execute C++ Search'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'go' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="cloud_sync" size={20} className="text-cyan-500" />
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    Go Concurrent Microservice Engine
                  </h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Spawns concurrent worker Goroutines through Go channels to calculate SHA-256 cloud checksums in parallel.
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    Goroutines Pool:
                  </label>
                  <select
                    value={goWorkers}
                    onChange={(e) => setGoWorkers(Number(e.target.value))}
                    className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <option value={2}>2 Goroutines</option>
                    <option value={4}>4 Goroutines (Optimal)</option>
                    <option value={8}>8 Goroutines (High Parallelism)</option>
                    <option value={16}>16 Goroutines (Massive Scale)</option>
                  </select>
                  <button
                    onClick={runGoSync}
                    disabled={loading}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-medium transition-colors ml-auto"
                  >
                    {loading ? 'Syncing via Go...' : 'Run Parallel Go Sync'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="terminal" size={20} className="text-emerald-500" />
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    Python 3.10 Data Science & Duplicate Analysis
                  </h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Performs byte-for-byte SHA-256 hash checks, identifies duplicate media files, and extracts rich metadata.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pyPath}
                    onChange={(e) => setPyPath(e.target.value)}
                    placeholder="Directory path to scan for duplicates..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                  <button
                    onClick={runPythonDuplicates}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    {loading ? 'Analyzing with Python...' : 'Run Python Duplicate Scan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'java' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="coffee" size={20} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    Java 17 OpenJDK Enterprise & Android Dispatcher
                  </h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Enterprise ACID Write-Ahead Logging (WAL) and Android MTP/ADB protocol channel simulator.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={javaOp}
                    onChange={(e) => setJavaOp(e.target.value)}
                    placeholder="Transaction operation name..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                  <button
                    onClick={runJavaTransaction}
                    disabled={loading}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    {loading ? 'Dispatching in Java...' : 'Execute Java Transaction'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Execution Output Terminal */}
          {executionOutput && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-mono text-[11px] font-medium flex items-center gap-1.5">
                  <MaterialIcon name="code" size={14} className="text-emerald-500" /> Live Engine Output
                </span>
                <button
                  onClick={() => setExecutionOutput(null)}
                  className="hover:underline text-[11px]"
                >
                  Clear Output
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-neutral-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-60 border border-neutral-800">
                {executionOutput}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex items-center justify-between text-xs text-neutral-500">
          <span>Files Studio Multi-Language Architecture Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
