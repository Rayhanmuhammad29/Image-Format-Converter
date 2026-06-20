import React, { useState, useRef, useEffect } from 'react';
import { ImageFile, ConvertedFile } from '../types';
import { X, Sliders, Info, HardDrive, Minimize, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface PreviewModalProps {
  file: ImageFile;
  result: ConvertedFile;
  onClose: () => void;
}

export default function PreviewModal({ file, result, onClose }: PreviewModalProps) {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = () => {
    setIsDragging(true);
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const handleDrag = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleDrag(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleDrag(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('touchend', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('touchend', handleMouseUpGlobal);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      id="preview-comparison-lightbox"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col my-8"
      >
        
        {/* Lightbox Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
          <div>
            <h4 className="font-sans font-bold text-white tracking-tight flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Komparator Presisi Dinamis Gambar
            </h4>
            <p className="text-xs text-gray-400 mt-1 truncate max-w-md md:max-w-xl">
              Berkas: <strong className="text-gray-200 font-semibold">{file.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-400 transition-colors cursor-pointer"
            id="close-lightbox-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Dashboard Display */}
        <div className="p-6 flex flex-col md:flex-row gap-6">
          
          {/* Slider Comparator Interactive Area */}
          <div className="flex-1 flex flex-col items-center">
            
            <div 
              ref={containerRef}
              onMouseMove={onMouseMove}
              onTouchMove={onTouchMove}
              className="relative w-full aspect-[4/3] max-h-[460px] bg-slate-950 border border-white/10 rounded-2xl overflow-hidden select-none cursor-ew-resize"
              id="sliding-lens-stage"
            >
              {/* Background Original Image */}
              <img
                src={file.previewUrl}
                alt="Source Asli"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 z-20 bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-mono text-gray-300 font-bold uppercase">
                SUMBER: BITMAP (ASLI)
              </div>

              {/* Foreground Converted Image (Clipped dynamically by slider position) */}
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                <img
                  src={result.dataUrl}
                  alt="Converted output preview"
                  className="absolute inset-0 w-full h-full object-contain bg-slate-950"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-4 right-4 z-20 bg-cyan-950/90 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                TARGET HASIL: {result.format.toUpperCase()}
              </div>

              {/* Slider Grab handle line divider */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-30 pointer-events-none shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                style={{ left: `${sliderPos}%` }}
              />
              <div 
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                className={`absolute top-1/2 -translate-y-1/2 -ml-3.5 w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center cursor-ew-resize z-40 shadow-[0_0_20px_rgba(6,182,212,0.65)] border border-white/25 transition-transform ${
                  isDragging ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{ left: `${sliderPos}%` }}
                id="comparison-drag-node"
              >
                <Sliders className="w-3.5 h-3.5 text-white rotate-90" />
              </div>

            </div>

            <span className="text-[10px] font-mono text-gray-500 mt-3 block text-center font-semibold">
              GESER GAGANG TENGAH UNTUK MEMBANDINGKAN KUALITAS KOMPRESI ATAU RESOLUSI DETAIL GAMBAR
            </span>
          </div>

          {/* Right Metrics Specs block */}
          <div className="w-full md:w-80 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <h5 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">METRIK OPTIMALISASI</h5>
              
              <div className="space-y-3">
                {/* Source Stats */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block font-semibold">Berkas Asli (Bitmap)</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-sm font-sans font-bold text-gray-300">
                      {file.name.substring(file.name.lastIndexOf('.')).replace('.', '').toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-gray-400 font-semibold">
                      {Math.round(file.size / 1024)} KB
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 block mt-1 font-medium">
                    Resolusi: {file.width}×{file.height} px
                  </span>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-center my-1">
                  <span className="text-[9px] font-mono text-cyan-300/80 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    ▼ PROSES TRANSFORMASI ▼
                  </span>
                </div>

                {/* Target Stats */}
                <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-400/20">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase block font-semibold">Hasil Berkas Optimal</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-sm font-sans font-bold text-cyan-300">
                      {result.format.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-cyan-300 font-black">
                      {Math.round(result.size / 1024)} KB
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400/70 block mt-1 font-medium">
                    Resolusi: {result.width}×{result.height} px
                  </span>
                </div>
              </div>

              {/* Compression Percentage badge */}
              {result.compressionRatio !== undefined && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 block">MODIFIKASI FILE:</span>
                    <span className="text-xs text-gray-300 font-sans font-semibold mt-1 block">
                      {result.compressionRatio < 0 ? 'Ukuran file berkurang' : 'Ukuran file bertambah'}
                    </span>
                  </div>
                  <span className={`text-lg font-mono font-black ${result.compressionRatio < 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {result.compressionRatio}%
                  </span>
                </div>
              )}
            </div>

            {/* Information tips based on target format */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rekomendasi Format</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-normal">
                {result.format === 'svg' || result.format === 'eps'
                  ? 'Format vektor menggunakan perhitungan koordinat matematis geometris, bukan piksel biasa. Jalur lekukan kurva ini membuat gambar tidak akan pecah meski diperbesar tanpa batas.'
                  : 'Format web seperti WEBP & PNG yang paling optimal menggunakan algoritma pemadatan warna pintar untuk mereduksi ukuran file tanpa menurunkan detil ketajaman foto.'
                }
              </p>
            </div>

          </div>

        </div>

        {/* Lightbox Footer controls */}
        <div className="px-6 py-4.5 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-xs font-sans font-extrabold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white px-5 py-3 rounded-full cursor-pointer transition-all tracking-wide"
            id="lightbox-close-footer"
          >
            TUTUP KOMPARATOR
          </button>
        </div>

      </motion.div>
    </div>
  );
}
