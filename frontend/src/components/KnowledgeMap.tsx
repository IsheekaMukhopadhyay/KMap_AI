import { useState, useEffect } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

// We dynamically load Plotly inside the component to prevent early evaluation crashes in Vite.

interface NodeData {
  id: number;
  text: string;
  full_text: string;
  cluster: number;
  x: number;
  y: number;
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

export default function KnowledgeMap({ data }: Props) {
  const [Plot, setPlot] = useState<any>(null);

  useEffect(() => {
    import('plotly.js-dist-min').then((PlotlyModule) => {
      const Plotly = PlotlyModule.default || PlotlyModule;
      // Depending on Vite's CJS interop, createPlotlyComponent might be an object with a default property
      // @ts-ignore
      const factory = typeof createPlotlyComponent === 'function' ? createPlotlyComponent : createPlotlyComponent.default;
      setPlot(() => factory(Plotly));
    }).catch(err => console.error("Failed to load Plotly:", err));
  }, []);

  if (!data || !data.nodes || !data.nodes.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-lg">Map will appear here after upload.</p>
      </div>
    );
  }

  if (!Plot) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Helper to wrap text for Plotly hover
  const wrapText = (text: string, maxWidth: number = 50) => {
    if (!text) return "";
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        if (currentLine.length + words[i].length + 1 < maxWidth) {
            currentLine += ' ' + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines.join('<br>');
  };

  const { nodes = [], clusters = {} } = data;

  const traces = Object.keys(clusters || {}).map((clusterId) => {
    const clusterNodes = nodes.filter((n) => n.cluster === parseInt(clusterId));
    
    return {
      x: clusterNodes.map((n) => n.x),
      y: clusterNodes.map((n) => n.y),
      mode: 'markers',
      type: 'scatter',
      name: clusters[clusterId].label || `Topic ${clusterId}`,
      text: clusterNodes.map((n) => wrapText(n.text || n.full_text || "", 50)),
      hoverinfo: 'text',
      marker: {
        size: 14,
        line: {
          width: 1,
          color: 'rgba(255, 255, 255, 0.4)'
        }
      }
    };
  });

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
      <Plot
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={traces as any}
        layout={{
          autosize: true,
          margin: { l: 0, r: 0, t: 0, b: 0, pad: 0 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          showlegend: true,
          legend: {
            orientation: "h",
            yanchor: "bottom",
            y: 0.02,
            xanchor: "center",
            x: 0.5,
            font: { color: 'rgba(255,255,255,0.7)' }
          },
          xaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, showticklabels: false },
          yaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, showticklabels: false },
          hovermode: 'closest',
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: true, responsive: true, displaylogo: false }}
      />
    </div>
  );
}
