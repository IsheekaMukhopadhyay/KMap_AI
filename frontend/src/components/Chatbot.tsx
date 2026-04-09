import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_CONFIG } from '../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  isError?: boolean;
}

interface Props {
  sessionId: string;
}

export default function Chatbot({ sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const resp = await fetch(`${API_CONFIG.BASE_URL}/summary/${sessionId}`, {
            headers: { 'X-API-Key': API_CONFIG.API_KEY }
        });
        if (!resp.ok) throw new Error("Failed to load intro");
        const data = await resp.json();
        if (isMounted) {
          setMessages([{ role: 'assistant', content: data.summary }]);
        }
      } catch (err) {
        if (isMounted) {
          setMessages([{ role: 'assistant', content: 'Document loaded securely in memory. How can I help you regarding this paper?' }]);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const resp = await fetch(`${API_CONFIG.BASE_URL}/chat`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': API_CONFIG.API_KEY
        },
        body: JSON.stringify({ session_id: sessionId, query })
      });
      
      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.detail || "Chat request failed");
      }
      
      const data = await resp.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        sources: data.sources 
      }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h2 className="text-white font-medium">Contextual Chatbot</h2>
        </div>
        <div className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 flex gap-1 items-center">
          Strict RAG
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`max-w-[85%] rounded-xl p-3 ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : m.isError 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                
                {/* STRICT RAG: show warning if not found */}
                {m.role === 'assistant' && m.content.includes("not available in the provided document") && !m.isError && (
                   <div className="mt-3 text-xs flex items-center gap-1 text-amber-500">
                     <AlertTriangle className="w-4 h-4" /> Output blocked to prevent hallucination.
                   </div>
                )}
              </div>
            </motion.div>
          ))}
          {(isLoading || isInitializing) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="rounded-xl p-3 bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question strictly from the document..."
            className="flex-1 bg-slate-900 text-white rounded-lg px-4 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isInitializing}
            className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
