import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  pdfUrl: string | null;
}

export default function PdfReaderView({ pdfUrl }: Props) {
  if (!pdfUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <BookOpen className="w-20 h-20 mb-4 opacity-30" />
        <p className="text-2xl mt-4">No PDF loaded.</p>
        <p className="text-slate-500 text-lg mt-2">Upload a document to read it here.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full flex flex-col items-center"
    >
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
        <iframe
          src={pdfUrl}
          className="w-full h-full border-none bg-white"
          title="PDF Reader"
        />
      </div>
    </motion.div>
  );
}
