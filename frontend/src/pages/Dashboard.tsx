import React, { useState, useEffect } from 'react';
import { Home, Layers, Settings, LogOut, FileText, Database, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Dropzone from '../components/Dropzone';
import KnowledgeMap from '../components/KnowledgeMap';
import Chatbot from '../components/Chatbot';
import { API_CONFIG } from '../config';
import ErrorBoundary from '../components/ErrorBoundary';
import ClusterView from '../components/ClusterView';
import DocumentView from '../components/DocumentView';
import SettingsView from '../components/SettingsView';
import PdfReaderView from '../components/PdfReaderView';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapData, setMapData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      loadVisualizationData(sessionId);
    }
  }, [sessionId]);

  const loadVisualizationData = async (id: string) => {
    try {
      const resp = await fetch(`${API_CONFIG.BASE_URL}/visualize/${id}`, {
          headers: { 'X-API-Key': API_CONFIG.API_KEY }
      });
      if (!resp.ok) throw new Error("Failed to load map data");
      const data = await resp.json();
      setMapData(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md flex flex-col justify-between shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
            <Database className="w-8 h-8 text-indigo-400 shrink-0" />
            <span className="text-xl font-bold tracking-tight hidden md:block">KMap<span className="text-indigo-400">.ai</span></span>
          </div>

          <nav className="space-y-2">
            <NavItem icon={<Home />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
            <NavItem icon={<Layers />} label="My Clusters" active={activeTab === 'My Clusters'} onClick={() => setActiveTab('My Clusters')} />
            <NavItem icon={<FileText />} label="Documents" active={activeTab === 'Documents'} onClick={() => setActiveTab('Documents')} />
            <NavItem icon={<BookOpen />} label="Read PDF" active={activeTab === 'Read PDF'} onClick={() => setActiveTab('Read PDF')} />
            <NavItem icon={<Settings />} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <NavItem icon={<LogOut />} label="Logout" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10 pointer-events-none"></div>

        <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950/80 backdrop-blur-md shrink-0 z-10">
          <h1 className="text-xl font-semibold">Workspace</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-semibold border border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              US
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 flex flex-col overflow-y-auto z-10">
          {activeTab === 'My Clusters' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden w-full"
            >
              <ClusterView data={mapData} />
            </motion.div>
          ) : activeTab === 'Documents' ? (
            <div className="flex-1 h-full w-full">
              <DocumentView data={mapData} sessionId={sessionId} onClearSession={() => { setSessionId(null); setPdfUrl(null); }} />
            </div>
          ) : activeTab === 'Read PDF' ? (
            <div className="flex-1 h-full w-full">
               <PdfReaderView pdfUrl={pdfUrl} />
            </div>
          ) : activeTab === 'Settings' ? (
            <div className="flex-1 h-full w-full">
               <SettingsView />
            </div>
          ) : !sessionId ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
            >
              <h2 className="text-4xl font-extrabold mb-3">Upload a Document</h2>
              <p className="text-slate-400 mb-10 text-center text-lg leading-relaxed">
                No files are permanently saved. Upload a PDF research paper to visualize its architecture and start questioning it.
              </p>
              <Dropzone onUploadSuccess={(id, url) => { setSessionId(id); setPdfUrl(url); }} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col md:flex-row gap-6 h-full min-h-[600px]"
            >
              <div className="flex-1 h-full flex flex-col gap-4">
                <ErrorBoundary name="KnowledgeMap">
                  <KnowledgeMap data={mapData} />
                </ErrorBoundary>
              </div>
              <div className="w-full md:w-[400px] shrink-0 h-full">
                <Chatbot sessionId={sessionId} />
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
      active 
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-inner' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:shadow-lg'
    }`}>
      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
         {icon}
      </div>
      <span className="font-medium hidden md:block">{label}</span>
    </div>
  );
}
