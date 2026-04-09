import { FileText, Trash2, Database, Fingerprint, LayoutGrid, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  data: any;
  sessionId: string | null;
  onClearSession: () => void;
}

export default function DocumentView({ data, sessionId, onClearSession }: Props) {
  if (!sessionId || !data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <FileText className="w-20 h-20 mb-4 opacity-30" />
        <p className="text-2xl mt-4">No active document workspace.</p>
        <p className="text-slate-500 text-lg mt-2">Upload a PDF on the dashboard to populate this section.</p>
      </div>
    );
  }

  const numNodes = data.nodes ? data.nodes.length : 0;
  const numClusters = data.clusters ? Object.keys(data.clusters).length : 0;

  return (
    <div className="w-full h-full overflow-y-auto pr-2 pb-10" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Workspace Document</h2>
          <p className="text-slate-400 text-lg">Manage your currently active strictly-analyzed PDF document session.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <FileText className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
            
            <div className="flex-1 space-y-8">
              <div>
                <div className="flex items-center gap-3 text-indigo-400 mb-2">
                  <Fingerprint className="w-5 h-5" />
                  <span className="font-semibold text-lg tracking-wide uppercase">Session ID</span>
                </div>
                <p className="text-slate-300 font-mono text-lg bg-slate-950 border border-slate-800 px-4 py-3 rounded-lg overflow-x-auto">
                  {sessionId}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 font-medium text-sm">Semantic Nodes Parsed</h4>
                    <p className="text-white font-bold text-3xl">{numNodes}</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 font-medium text-sm">Topics Discovered</h4>
                    <p className="text-white font-bold text-3xl">{numClusters}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-300">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <p className="text-lg leading-relaxed">
                  For your privacy and data security, this document is strictly kept in secure ephemeral memory. Clearing the workspace or restarting the server permanently shreds this dataset from memory.
                </p>
              </div>
            </div>

            {/* Actions Side */}
            <div className="w-full md:w-auto shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
               <button 
                 onClick={onClearSession}
                 className="flex items-center justify-center gap-3 w-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg"
               >
                 <Trash2 className="w-5 h-5" />
                 Clear Workspace
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
