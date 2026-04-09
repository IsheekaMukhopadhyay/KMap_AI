import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BrainCircuit, Lock, Network, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 -z-10"></div>
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight">KMap<span className="text-indigo-400">.ai</span></span>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-medium transition-colors border border-indigo-500/50 shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          Go to App
        </button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-24 pb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-sm font-medium text-indigo-300">Strict RAG Hallucination-Free</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Decode Research Papers <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Instantly with AI
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 max-w-2xl leading-relaxed">
            Upload any academic PDF and watch it transform into an interactive knowledge map. Chat directly with the document and get precise, verified answers.
          </p>

          <button 
            onClick={() => navigate('/dashboard')}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-full overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.4)] cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2">
              Start Analyzing Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left relative z-10">
          <FeatureCard 
            icon={<Network className="w-8 h-8 text-cyan-400" />}
            title="Visual Knowledge Mapping"
            description="Our ML engine automatically clusters document concepts and projects them onto an interactive 2D map."
            delay={0.2}
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-8 h-8 text-indigo-400" />}
            title="Strict Contextual Chat"
            description="Ask questions and get answers derived strictly from the uploaded PDF. No hallucinations, guaranteed."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Lock className="w-8 h-8 text-emerald-400" />}
            title="Privacy First"
            description="Files are processed entirely in-memory and deleted immediately when your session ends."
            delay={0.6}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors"
    >
      <div className="mb-4 bg-slate-800/50 w-14 h-14 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
