import { Settings as SettingsIcon, ShieldCheck, Zap, Lock, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  return (
    <div className="w-full h-full overflow-y-auto pr-2 pb-10" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-4xl font-bold text-white mb-3">Platform Configuration</h2>
          <p className="text-slate-400 text-xl">Monitor your workspace AI integration and read-only security layers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Language Model</h3>
              <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                The current active semantic integration model used for chunk generation and chatbot responses.
              </p>
              
              <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-lg text-indigo-300 font-mono text-lg flex justify-between items-center">
                 <span>google/gemma-3-12b-it:free</span>
                 <span className="text-xs bg-indigo-500/20 px-2 py-1 rounded text-indigo-400 font-sans uppercase font-bold tracking-wider">Active</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Strict RAG Guardrail</h3>
              <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                Enables strict conversational blocking. The AI must explicitly respond with "Not available in the provided document" if an answer cannot be grounded directly in the PDF.
              </p>
              
              <div className="flex items-center gap-4">
                 <div className="w-14 h-8 bg-emerald-500 rounded-full flex items-center p-1 cursor-not-allowed">
                    <div className="w-6 h-6 bg-white rounded-full ml-auto shadow-sm"></div>
                 </div>
                 <span className="text-emerald-400 font-bold text-lg">Strict Mode Forced</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group md:col-span-2">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Lock className="w-48 h-48" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-6">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Privacy & Local Processing</h3>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                All uploaded documents are processed ephemerally using FAISS flat memory mapping. No external databases are persisted, and the semantic indices are cleanly wiped upon clearing the workspace or shutting down the application server. OpenRouter credentials are bound exclusively locally via your .env file.
              </p>
              
              <div className="inline-block bg-slate-950 border border-slate-800 px-6 py-3 rounded-xl text-amber-500 font-bold text-lg shadow-inner">
                 End-to-End Privacy Guaranteed
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
