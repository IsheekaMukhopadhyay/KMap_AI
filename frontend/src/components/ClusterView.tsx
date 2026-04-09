import { useState } from 'react';
import { Layers, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface NodeData {
  id: number;
  text: string;
  full_text: string;
  cluster: number;
}

interface ClusterData {
  [key: string]: {
    label: string;
    size: number;
  };
}

interface KDMapData {
  nodes: NodeData[];
  clusters: ClusterData;
}

interface Props {
  data: KDMapData | null;
}

const colorPalette = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 
  'bg-fuchsia-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-violet-500'
];

const sparkColors = [
  'bg-amber-300 shadow-[0_0_10px_orange]',
  'bg-fuchsia-400 shadow-[0_0_10px_fuchsia]',
  'bg-cyan-300 shadow-[0_0_10px_cyan]',
  'bg-emerald-300 shadow-[0_0_10px_lime]',
  'bg-violet-400 shadow-[0_0_10px_purple]',
  'bg-rose-400 shadow-[0_0_10px_red]'
];

function ClusterCard({ cluster, clusterId, colorClass, clusterNodes, idx }: any) {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const randomColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    const newSpark = { id: Date.now(), x, y, color: randomColor };
    
    setSparks(prev => [...prev, newSpark]);
    setTimeout(() => {
      setSparks(prev => prev.filter(s => s.id !== newSpark.id));
    }, 600);

    // Toggle expansion
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`relative bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden cursor-pointer hover:border-slate-600 hover:shadow-2xl transition-all duration-300 ${isExpanded ? 'col-span-1 lg:col-span-2 xl:col-span-3 h-max' : ''}`}
      style={{ fontFamily: '"Times New Roman", Times, serif' }} 
    >
      {/* Spark Particle Overlay */}
      {sparks.map(s => (
        <div key={s.id} className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute rounded-full bg-white/20"
            style={{ left: s.x - 20, top: s.y - 20, width: 40, height: 40 }}
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: s.x, y: s.y, scale: 1, opacity: 1 }}
              animate={{ 
                x: s.x + Math.cos((i * 30) * Math.PI / 180) * 100, 
                y: s.y + Math.sin((i * 30) * Math.PI / 180) * 100,
                scale: 0,
                opacity: 0
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`absolute w-2 h-2 rounded-full ${s.color}`}
              style={{ top: -4, left: -4 }}
            />
          ))}
        </div>
      ))}

      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className={`w-4 h-4 rounded-full ${colorClass} shadow-[0_0_12px_currentColor] shrink-0`} />
             <h3 className="text-white font-bold capitalize text-2xl leading-snug tracking-wide">
                {cluster.label || `Topic ${clusterId}`}
             </h3>
          </div>
          <div className="bg-slate-800 text-sm font-semibold px-3 py-1 rounded-md text-slate-300 shrink-0 border border-slate-700">
            {cluster.size} chunks
          </div>
        </div>
      </div>

      {/* Excerpts */}
      <div className="p-6 flex flex-col gap-5">
        {(isExpanded ? clusterNodes : clusterNodes.slice(0, 3)).map((node: any, i: number) => (
          <div key={i} className="flex gap-4 items-start group relative z-10">
            <AlignLeft className="w-5 h-5 text-slate-500 mt-1 group-hover:text-amber-400 transition-colors shrink-0" />
            <p className={`text-base text-slate-300 leading-relaxed font-serif transition-colors ${isExpanded ? '' : 'line-clamp-3'}`}>
              {isExpanded ? (node.full_text || node.text || "") : (node.text || node.full_text || "")}
            </p>
          </div>
        ))}
        {!isExpanded && clusterNodes.length > 3 && (
           <div className="text-sm text-indigo-300 font-semibold text-center pt-3 italic">
              + {clusterNodes.length - 3} additional text segments (Click to expand)
           </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ClusterView({ data }: Props) {
  if (!data || !data.clusters || Object.keys(data.clusters).length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <Layers className="w-20 h-20 mb-4 opacity-50" />
        <p className="text-2xl">No clusters found. Upload a document to generate topic clusters.</p>
      </div>
    );
  }

  const { nodes = [], clusters = {} } = data;

  return (
    <div className="w-full h-full overflow-y-auto pr-2 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {Object.keys(clusters).map((clusterId, idx) => {
          const cluster = clusters[clusterId];
          const clusterNodes = nodes.filter(n => n.cluster === parseInt(clusterId));
          const colorClass = colorPalette[idx % colorPalette.length];

          return (
             <ClusterCard 
                key={clusterId} 
                cluster={cluster} 
                clusterId={clusterId} 
                colorClass={colorClass} 
                clusterNodes={clusterNodes} 
                idx={idx} 
             />
          );
        })}
      </div>
    </div>
  );
}
