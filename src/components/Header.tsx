import React from 'react';
import { Sparkles, Layers, Sliders, Cpu, CloudLightning } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onReset: () => void;
  filesCount: number;
}

export default function Header({ onReset, filesCount }: HeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand identity featuring custom generated icon */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onReset}
          id="brand-logo-container"
        >
          <div className="relative w-11 h-11 rounded-xl p-0.5 overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 transition-transform group-hover:scale-105 duration-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <img 
              src="/src/assets/images/converter_icon_1781184947824.jpg" 
              alt="Image Format Converter Icon" 
              className="w-full h-full object-cover rounded-[10px]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-lg">
                OpticShift <span className="text-cyan-400 font-light">Pro</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-cyan-450/10 text-cyan-300 border border-cyan-400/30">
                Premium
              </span>
            </div>
            <p className="text-[11px] font-mono text-gray-400 leading-none mt-1 uppercase tracking-wider">
              MESIN VEKTOR & BITMAP PRO
            </p>
          </div>
        </div>

        {/* Real-time SaaS system stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </div>
            <span className="text-xs font-mono text-slate-400 font-medium">
              Mesin: <strong className="text-white font-semibold">Lokal v2.4</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-slate-400 font-medium">
              Mode Vektor: <strong className="text-white font-semibold">Tepi Presisi</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <CloudLightning className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-mono text-slate-400 font-medium">
              Privasi: <strong className="text-white font-semibold">100% Klien</strong>
            </span>
          </div>
        </div>

        {/* Counter & Action */}
        <div className="flex items-center gap-3">
          {filesCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs font-mono text-slate-400 hover:text-white transition-all px-3 py-1.5 rounded-md hover:bg-white/10 border border-transparent hover:border-white/10"
              id="header-clear-btn"
            >
              Kosongkan Ruang Kerja
            </button>
          )}
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 text-cyan-300 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.15)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Antrean Aktif: {filesCount}
          </span>
        </div>

      </div>
    </motion.header>
  );
}
