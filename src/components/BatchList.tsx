import React from 'react';
import { ImageFile, ConvertedFile } from '../types';
import { 
  FileCheck, 
  ArrowRight, 
  Download, 
  Eye, 
  Loader2, 
  AlertTriangle,
  Play,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BatchListProps {
  files: ImageFile[];
  converted: { [id: string]: ConvertedFile };
  onRemove: (id: string) => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
}

export default function BatchList({
  files,
  converted,
  onRemove,
  onPreview,
  onDownload
}: BatchListProps) {
  
  // Format byte size to readable string
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6" 
      id="batch-list-wrapper"
    >
      
      {/* List Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-sans font-bold text-white tracking-tight flex items-center gap-2 text-base">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            Antrean Ruang Kerja Konversi Gambar
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Tinjau berkas yang dipilih, pantau progres optimalisasi, dan unduh aset hasil konversi secara instan.
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-white/10 border border-white/10 px-3 py-1 rounded-full font-bold">
          Antrean: <strong className="text-cyan-300">{files.length}</strong>
        </span>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/2">
          <p className="text-sm font-mono text-gray-500">
            Belum ada berkas gambar di antrean ruang kerja. Silakan seret dan lepas file untuk mengunggah.
          </p>
        </div>
      ) : (
        <div className="space-y-3" id="queue-items-container">
          <AnimatePresence initial={false}>
            {files.map((file) => {
              const result = converted[file.id];
              const isPending = !result;
              const isProcessing = result?.status === 'processing';
              const isSuccess = result?.status === 'success';
              const isError = result?.status === 'error';

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/15 transition-all duration-300 gap-4 overflow-hidden"
                  id={`queue-item-${file.id}`}
                >
                  {/* Left side info / Name metadata */}
                  <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                    
                    {/* Miniature Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex-shrink-0">
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover animate-fade-in"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-sans font-bold text-white truncate max-w-[150px] sm:max-w-[280px] md:max-w-xs lg:max-w-md">
                        {file.name}
                      </h5>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        {/* Original size */}
                        <span className="text-[10px] font-mono text-gray-400">
                          {formatBytes(file.size)}
                        </span>
                        
                        {/* Original Resolution dimensions */}
                        <span className="text-[10px] font-mono text-gray-400">
                          &bull; {file.width}×{file.height} px
                        </span>

                        {/* Source extension tag */}
                        <span className="text-[9px] font-mono bg-white/5 border border-white/15 px-1.5 py-0.5 rounded text-gray-400 font-semibold uppercase">
                          {file.name.substring(file.name.lastIndexOf('.')).replace('.', '').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transition State / Performance markers */}
                  <div className="flex flex-row items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t border-white/5 md:border-t-0 pt-3 md:pt-0 pl-[60px] md:pl-0">
                    
                    {/* Status Indicator / Conversion output specs */}
                    {isSuccess && result && (
                      <div className="flex items-center gap-2 min-w-0" id={`success-badge-${file.id}`}>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 hidden md:block" />
                        
                        <div className="text-left md:text-right min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                              {result.format.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-400/10 border border-cyan-400/25 px-1.5 py-0.2 rounded">
                              {result.width}×{result.height}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-mono text-gray-400 font-medium">
                              {formatBytes(result.size)}
                            </span>

                            {result.compressionRatio !== undefined && (
                              <span 
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                  result.compressionRatio < 0 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                }`}
                              >
                                {result.compressionRatio < 0 ? '' : '+'}{result.compressionRatio}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {isProcessing && (
                      <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-semibold animate-pulse" id={`processing-badge-${file.id}`}>
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span>Mengonversi...</span>
                      </div>
                    )}

                    {isPending && (
                      <div className="text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded" id={`pending-badge-${file.id}`}>
                        Siap
                      </div>
                    )}

                    {isError && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/35 px-2.5 py-1 rounded-xl" id={`error-badge-${file.id}`}>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-300 animate-bounce" />
                        <span>Gagal</span>
                      </div>
                    )}

                    {/* Operational Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">
                      {/* Preview comparison (completed rasters/vectors) */}
                      {isSuccess && result && (
                        <button
                          onClick={() => onPreview(file.id)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-colors text-cyan-400 cursor-pointer"
                          title="Bandingkan berkas asli dengan hasil konversi"
                          id={`preview-compare-btn-${file.id}`}
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                        </button>
                      )}

                      {/* Download target button */}
                      {isSuccess && result && (
                        <button
                          onClick={() => onDownload(file.id)}
                          className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 active:scale-95 transition-all text-white font-bold cursor-pointer shadow-lg hover:shadow-cyan-500/20"
                          title="Unduh aset konversi"
                          id={`download-complt-btn-${file.id}`}
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      )}

                      {/* Delete file from list */}
                      <button
                        onClick={() => onRemove(file.id)}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors text-gray-500 hover:text-rose-400 cursor-pointer"
                        title="Hapus gambar dari antrean konversi"
                        id={`delete-queue-btn-${file.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
