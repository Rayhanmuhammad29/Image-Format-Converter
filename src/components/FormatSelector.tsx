import React from 'react';
import { ImageFormat } from '../types';
import { 
  FileImage, 
  ArrowRightLeft, 
  Sparkle, 
  Disc, 
  Layers, 
  Workflow, 
  Cpu,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface FormatSelectorProps {
  selectedFormat: ImageFormat;
  onChangeFormat: (format: ImageFormat) => void;
}

export default function FormatSelector({ selectedFormat, onChangeFormat }: FormatSelectorProps) {
  
  // Format configurations with premium descriptions
  const formats: { id: ImageFormat; label: string; tag: string; desc: string; color: string; bg: string; border: string; detail: string }[] = [
    {
      id: 'png',
      label: 'PNG',
      tag: 'Raster / Lossless',
      desc: 'Preserves full transparency and crisp graphic details.',
      color: 'text-cyan-400',
      bg: 'bg-white/10',
      border: 'border-cyan-400/40',
      detail: 'Portable Network Graphics - optimal for icons, UI shots and designs.'
    },
    {
      id: 'jpeg',
      label: 'JPG',
      tag: 'Raster / Standard',
      desc: 'Lossy, optimized file sizes for photographs & clean web load.',
      color: 'text-blue-305',
      bg: 'bg-white/10',
      border: 'border-blue-400/40',
      detail: 'Joint Photographic Experts Group - standard file sharing.'
    },
    {
      id: 'webp',
      label: 'WEBP',
      tag: 'Raster / Next-Gen',
      desc: 'Highly advanced web optimization with high compression ratio.',
      color: 'text-emerald-300',
      bg: 'bg-white/10',
      border: 'border-emerald-400/40',
      detail: 'Google Next-Gen Format - 30% smaller than JPG with transparent support.'
    },
    {
      id: 'svg',
      label: 'SVG',
      tag: 'Vector / XML Stencil',
      desc: 'Converts bitmaps into interactive browser vector paths.',
      color: 'text-purple-400',
      bg: 'bg-white/10',
      border: 'border-purple-400/40',
      detail: 'Scalable Vector Graphics - unlimited scalability, fully editable in illustrator.'
    },
    {
      id: 'eps',
      label: 'EPS',
      tag: 'Vector / PostScript',
      desc: 'Encapsulated PostScript vector output for high-res printing.',
      color: 'text-violet-305',
      bg: 'bg-white/10',
      border: 'border-violet-400/40',
      detail: 'Encapsulated PostScript - legacy/distribution graphic print layouts.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6" 
      id="format-selection-group"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-sans font-bold text-white tracking-tight flex items-center gap-2 text-base">
            <Workflow className="w-5 h-5 text-cyan-400" />
            Target Conversion Format
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Choose output structure. Converting to vector triggers the tracing engine.
          </p>
        </div>
        <span className="font-mono text-[10px] tracking-wider text-cyan-300 bg-white/10 border border-white/10 px-3 py-1 rounded-full font-semibold uppercase">
          {selectedFormat.toUpperCase()} Mode Active
        </span>
      </div>

      {/* Dynamic graphic mapping representation of format transformations */}
      <div className="relative w-full aspect-[21/6] md:aspect-[24/5] bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 overflow-hidden flex items-center justify-center shadow-inner" id="live-transformation-diagram">
        {/* Vector graph dots background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
        
        {/* Blueprint grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.02]" />

        {/* Dynamic conversion flow components */}
        <div className="relative z-10 w-full flex items-center justify-between px-6 md:px-12">
          
          {/* Source node representing physical photograph */}
          <div className="flex flex-col items-center">
            <div className="relative w-14 h-14 rounded-2xl bg-white/5 border-2 border-white/20 flex items-center justify-center text-white shadow-xl">
              <FileImage className="w-7 h-7 text-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] font-sans font-bold text-white shadow-md">
                IN
              </div>
            </div>
            <span className="text-[10px] font-mono text-gray-400 mt-2 font-medium">BITMAP SOURCE</span>
          </div>

          {/* Connected Dynamic Glowing Arrow system */}
          <div className="flex-1 px-4 flex flex-col items-center justify-center relative">
            <div className="w-full flex items-center justify-between relative group h-6">
              
              {/* Active path glowing lines */}
              <div className="absolute left-0 right-0 h-0.5 bg-white/10" />
              <div 
                className={`absolute left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.7)]`}
                style={{
                  width: selectedFormat === 'svg' || selectedFormat === 'eps' ? '100%' : '80%',
                }}
              />

              {/* Central vector tracer chip matrix */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-[0_0_15px_rgba(34,211,238,0.25)] select-none">
                <Cpu className={`w-3.5 h-3.5 text-cyan-400 ${selectedFormat === 'svg' || selectedFormat === 'eps' ? 'animate-spin [animation-duration:12s]' : ''}`} />
                <span className="text-[9px] font-mono font-black text-cyan-300 tracking-wider">
                  {selectedFormat === 'svg' || selectedFormat === 'eps' ? 'VECTOR TRACER' : 'RE-INDEXER'}
                </span>
              </div>

              {/* Dynamic status arrow tips */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-2 h-2 border-t-2 border-r-2 border-cyan-400 rotate-45 transform -translate-x-1" />
              </div>

              {/* Background ripple loops */}
              <div className="absolute left-1/4 w-3 h-3 rounded-full bg-cyan-400/20 {selectedFormat === 'svg' || selectedFormat === 'eps' ? 'animate-ping' : ''}" />
              <div className="absolute right-1/4 w-3 h-3 rounded-full bg-blue-500/20 active-glow [animation-delay:0.5s]" />
            </div>
            <span className="text-[9px] font-mono text-gray-500 uppercase mt-2 tracking-widest text-center font-medium">
              {selectedFormat === 'svg' || selectedFormat === 'eps' ? 'Tracing curves, nodes & sub-paths' : 'Quantizing and scaling pixels'}
            </span>
          </div>

          {/* Destination node */}
          <div className="flex flex-col items-center">
            <div className="relative w-14 h-14 rounded-2xl bg-white/5 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              
              {/* Dynamic inner label based on selection */}
              <span className="font-mono text-sm font-black tracking-wide text-cyan-400">
                {selectedFormat.toUpperCase()}
              </span>

              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-sans font-bold text-white shadow-md">
                OUT
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 mt-2 font-bold tracking-tight">
              {selectedFormat === 'svg' || selectedFormat === 'eps' ? 'VECTOR ASSET' : 'OPTIMIZED IMAGE'}
            </span>
          </div>

        </div>
      </div>

      {/* Format Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3" id="format-selection-buttons-grid">
        {formats.map((format) => {
          const isActive = selectedFormat === format.id;
          return (
            <motion.button
              key={format.id}
              onClick={() => onChangeFormat(format.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col justify-between p-4 rounded-2xl text-left border transition-all duration-300 relative group overflow-hidden cursor-pointer ${
                isActive
                  ? `${format.bg} ${format.border} shadow-[0_0_20px_rgba(6,182,212,0.25)] border-opacity-100`
                  : 'bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5'
              }`}
              id={`format-btn-${format.id}`}
            >
              {/* Left indicator bar for active focus */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
              )}
              
              <div className="flex items-center justify-between w-full mb-3">
                <span className={`font-sans text-lg font-extrabold ${isActive ? format.color : 'text-slate-300'}`}>
                  {format.label}
                </span>

                {isActive ? (
                  <Sparkle className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
                )}
              </div>

              <div>
                <span className="text-[9px] font-mono text-gray-400 tracking-wider font-semibold uppercase">
                  {format.tag}
                </span>
                <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">
                  {format.desc}
                </p>
              </div>

            </motion.button>
          );
        })}
      </div>

      {/* Interactive Info Footer */}
      <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <span className="text-[11px] font-sans text-gray-400 leading-relaxed font-normal">
          <strong>Configuration Note:</strong> {formats.find(f => f.id === selectedFormat)?.detail}
        </span>
      </div>
    </motion.div>
  );
}
