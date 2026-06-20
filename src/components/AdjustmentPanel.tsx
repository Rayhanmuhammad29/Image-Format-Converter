import React, { useEffect, useState } from 'react';
import { ConversionSettings } from '../types';
import { 
  Sliders, 
  Settings, 
  Maximize2, 
  HelpCircle,
  Eye, 
  ChevronRight, 
  Maximize,
  Grid
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdjustmentPanelProps {
  settings: ConversionSettings;
  onChangeSettings: (settings: ConversionSettings) => void;
  onConvert: () => void;
  isProcessing: boolean;
  filesCount: number;
}

export default function AdjustmentPanel({
  settings,
  onChangeSettings,
  onConvert,
  isProcessing,
  filesCount
}: AdjustmentPanelProps) {
  const isVector = settings.format === 'svg' || settings.format === 'eps';
  const hasQualitySlider = settings.format === 'jpeg' || settings.format === 'webp';
  
  const [widthInput, setWidthInput] = useState<string>('original');
  const [heightInput, setHeightInput] = useState<string>('original');

  const handleWidthChange = (val: string) => {
    setWidthInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onChangeSettings({ ...settings, width: num, scale: 1 });
    } else {
      onChangeSettings({ ...settings, width: -1 }); // Original fallback
    }
  };

  const handleHeightChange = (val: string) => {
    setHeightInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onChangeSettings({ ...settings, height: num, scale: 1 });
    } else {
      onChangeSettings({ ...settings, height: -1 }); // Original fallback
    }
  };

  const setResPreset = (w: number, h: number) => {
    setWidthInput(w.toString());
    setHeightInput(h.toString());
    onChangeSettings({ ...settings, width: w, height: h, scale: 1 });
  };

  const setOriginalSize = () => {
    setWidthInput('original');
    setHeightInput('original');
    onChangeSettings({ ...settings, width: -1, height: -1, scale: 1 });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6" 
      id="adjustment-controls-panel"
    >
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <h4 className="font-sans font-bold text-white tracking-tight text-base">
          Optimasi & Penyesuaian Format
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Dimensions Configuration Option */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold text-gray-300 flex items-center justify-between">
              <span>DIMENSI OUTPUT GAMBAR</span>
              <span className="text-[10px] text-gray-500 font-normal">Lebar &bull; Tinggi (piksel)</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <span className="text-[10px] font-mono text-gray-400 block mb-1">Lebar Target</span>
                <input
                  type="text"
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  placeholder="asli"
                  id="target-width-field"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 block mb-1">Tinggi Target</span>
                <input
                  type="text"
                  value={heightInput}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  placeholder="asli"
                  id="target-height-field"
                />
              </div>
            </div>
          </div>

          {/* Quick Res Presets */}
          <div>
            <span className="text-[10px] font-mono text-gray-400 block mb-1.5">Preset Konfigurasi Skala (Paling Kecil ke Terbesar)</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={setOriginalSize}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === -1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-original"
              >
                Ukuran Asli
              </button>
              <button
                onClick={() => setResPreset(512, 512)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 512 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-512x512"
              >
                512px (Ikon Kecil)
              </button>
              <button
                onClick={() => setResPreset(800, 800)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 800 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-800x800"
              >
                800px (Kotak Sedang)
              </button>
              <button
                onClick={() => setResPreset(1280, 720)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 1280 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-720p"
              >
                1280×720 (HD 720p)
              </button>
              <button
                onClick={() => setResPreset(1920, 1080)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 1920 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-1080p"
              >
                1920×1080 (Full HD)
              </button>
              <button
                onClick={() => setResPreset(2560, 1440)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 2560 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-2k"
              >
                2560×1440 (2K QHD)
              </button>
              <button
                onClick={() => setResPreset(3840, 2160)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 3840 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-4k"
              >
                3840×2160 (4K UHD)
              </button>
            </div>
          </div>

          {/* Scale Multiplier Feature for No-distortion Super-Resolution upscales */}
          <div>
            <span className="text-[10px] font-mono text-gray-400 block mb-1.5 font-bold uppercase tracking-wide">Faktor Perbesaran Piksel (Upscaling Pintar)</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onChangeSettings({ ...settings, scale: 1, width: -1, height: -1 });
                  setWidthInput('original');
                  setHeightInput('original');
                }}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  (settings.scale === 1 || !settings.scale) && settings.width === -1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-bold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="scale-1x"
              >
                1x (Ukuran Asli)
              </button>
              <button
                onClick={() => {
                  onChangeSettings({ ...settings, scale: 1.5, width: -1, height: -1 });
                  setWidthInput('1.5x');
                  setHeightInput('1.5x');
                }}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.scale === 1.5 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-bold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="scale-1.5x"
              >
                1.5x HD
              </button>
              <button
                onClick={() => {
                  onChangeSettings({ ...settings, scale: 2, width: -1, height: -1 });
                  setWidthInput('2x');
                  setHeightInput('2x');
                }}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.scale === 2 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-bold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="scale-2x"
              >
                2x Super-Res (Tajam)
              </button>
              <button
                onClick={() => {
                  onChangeSettings({ ...settings, scale: 4, width: -1, height: -1 });
                  setWidthInput('4x');
                  setHeightInput('4x');
                }}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.scale === 4 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-bold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="scale-4x"
              >
                4x Ultra-Res (Maksimalkan Detail)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="lock-aspect"
              checked={settings.keepAspectRatio}
              onChange={(e) => onChangeSettings({ ...settings, keepAspectRatio: e.target.checked })}
              className="rounded bg-white/5 border-white/15 text-cyan-400 focus:ring-cyan-500/30 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="lock-aspect" className="text-xs text-gray-400 font-mono select-none cursor-pointer">
              Kunci rasio aspek file sumber (proporsi stabil)
            </label>
          </div>

          {/* Upscaling Engine Controls (Visible only for raster outputs) */}
          {!isVector && (
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 block mb-1.5 flex items-center justify-between">
                  <span>FILTER RESOLUSI PERBESARAN PINTAR (UPSCALING)</span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.2 rounded font-bold uppercase">PREMIUM</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onChangeSettings({ ...settings, upscaleMode: 'hd-sharp' })}
                    className={`text-[9px] font-mono leading-tight py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                      settings.upscaleMode === 'hd-sharp'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/12'
                    }`}
                    id="upscale-hd-sharp"
                  >
                    HD Penajaman
                  </button>
                  <button
                    onClick={() => onChangeSettings({ ...settings, upscaleMode: 'artistic-smooth' })}
                    className={`text-[9px] font-mono leading-tight py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                      settings.upscaleMode === 'artistic-smooth'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/12'
                    }`}
                    id="upscale-artistic"
                  >
                    Karya Halus
                  </button>
                  <button
                    onClick={() => onChangeSettings({ ...settings, upscaleMode: 'original' })}
                    className={`text-[9px] font-mono leading-tight py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                      settings.upscaleMode === 'original'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/12'
                    }`}
                    id="upscale-original"
                  >
                    Langsung Standar
                  </button>
                </div>
              </div>

              {settings.upscaleMode === 'hd-sharp' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-300">
                    <span>INTENSITAS PENAJAMAN (KONTRAS TEPI)</span>
                    <span className="text-cyan-300 font-bold">{Math.round(settings.sharpenAmount * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={settings.sharpenAmount}
                    onChange={(e) => onChangeSettings({ ...settings, sharpenAmount: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-1"
                    id="sharpen-range-slider"
                  />
                  <span className="text-[9px] text-gray-500 block font-normal leading-relaxed">
                    Melenyapkan keburaman interpolasi (biasa terjadi saat memperbesar piksel) demi render tekstur ultra-tajam berketepatan tinggi.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Section: Quality or Vector Tracing Panel */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
          
          {hasQualitySlider && (
            <div className="space-y-4" id="raster-quality-controls">
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 flex items-center justify-between">
                  <span>KEKUATAN KOMPRESI & KUALITAS RE-INDEX</span>
                  <span className="text-cyan-300 font-mono text-xs">{Math.round(settings.quality * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.quality}
                  onChange={(e) => onChangeSettings({ ...settings, quality: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-3"
                  id="quality-slider"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono text-cyan-300 block font-semibold uppercase tracking-wider">SARAN OPTIMASI:</span>
                <span className="text-[10px] text-gray-400 mt-1 block leading-relaxed">
                  {settings.quality < 0.6 
                    ? 'Ukuran file sangat ringkas, cocok untuk pemuatan ikon web cepat tetapi dapat memunculkan sedikit degradasi atau gradien warna kasar.'
                    : settings.quality > 0.85
                    ? 'Kualitas gambar premium, direkomendasikan untuk layout fotografi produksi dengan objek detail atau teks tanpa blur.'
                    : 'Standar seimbang - konfigurasi paling optimal antara ukuran file terkompresi dengan kestabilan rentang dinamis warna.'
                  }
                </span>
              </div>
            </div>
          )}

          {isVector && (
            <div className="space-y-4" id="vector-tracing-controls">
              
              {/* Trace Mode Selection */}
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 block mb-1.5">
                  MODE KUANTISASI WARNA VEKTOR
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeSettings({ ...settings, traceColorMode: 'color' })}
                    className={`text-[10px] font-mono font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      settings.traceColorMode === 'color'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-400/40'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                    }`}
                    id="trace-color"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    Jalur Palet Warna
                  </button>
                  <button
                    onClick={() => onChangeSettings({ ...settings, traceColorMode: 'monochrome' })}
                    className={`text-[10px] font-mono font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      settings.traceColorMode === 'monochrome'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-400/40'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                    }`}
                    id="trace-mono"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Siluet Monokrom
                  </button>
                </div>
              </div>

              {/* Slider depends on mode */}
              {settings.traceColorMode === 'color' ? (
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                    <span>WARNA PALET MAKSIMUM</span>
                    <span className="text-purple-300 font-bold">{settings.traceColorsCount} warna</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="64"
                    step="1"
                    value={settings.traceColorsCount}
                    onChange={(e) => onChangeSettings({ ...settings, traceColorsCount: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400 mt-2"
                    id="vector-layers-slider"
                  />
                  <span className="text-[10px] text-gray-500 block mt-1 font-normal">
                    Jumlah warna lebih banyak (hingga 64) menghasilkan detail warna vektor yang lebih kaya dan berlesung halus (tidak pecah).
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                    <span>AMBANG BATAS SILUET (THRESHOLD)</span>
                    <span className="text-purple-300 font-bold">{settings.traceThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="240"
                    step="5"
                    value={settings.traceThreshold}
                    onChange={(e) => onChangeSettings({ ...settings, traceThreshold: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400 mt-2"
                    id="vector-threshold-slider"
                  />
                  <span className="text-[10px] text-gray-500 block mt-1 font-normal">
                    Ambang batas yang lebih tinggi menggelapkan jalur bayangan monokrom, mempertahankan detail kontur halus.
                  </span>
                </div>
              )}

              {/* Premium Tracing Options: Fidelity & Smoothing */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                
                {/* Tracing Fidelity (Dynamic input resolution map) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-gray-300 block flex items-center justify-between">
                    <span>KETEPATAN DETAIL PENELUSURAN (FIDELITY)</span>
                    <span className="text-[9px] text-purple-300 bg-purple-400/10 border border-purple-400/20 px-1.5 py-0.2 rounded font-bold uppercase">RENDER HD</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['low', 'medium', 'high', 'ultra'] as const).map((fid) => (
                      <button
                        key={fid}
                        onClick={() => onChangeSettings({ ...settings, traceFidelity: fid })}
                        className={`text-[9px] font-mono leading-tight py-2.5 rounded-xl text-center transition-all cursor-pointer border capitalize ${
                          settings.traceFidelity === fid
                            ? 'bg-purple-500/20 text-purple-300 border-purple-400/40 font-bold shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/12'
                        }`}
                        id={`trace-fid-${fid}`}
                      >
                        {fid === 'low' ? 'rendah' : fid === 'medium' ? 'sedang' : fid === 'high' ? 'tinggi' : 'ultra'}
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-500 block font-normal leading-relaxed">
                    Pilihan detail Ultra atau Tinggi memproses bentuk asli secara halus tanpa menyisakan gerigi tangga kasar.
                  </span>
                </div>

                {/* Sub-pixel organic smoothing toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="trace-smoothing"
                    checked={settings.traceSmoothing}
                    onChange={(e) => onChangeSettings({ ...settings, traceSmoothing: e.target.checked })}
                    className="rounded bg-white/5 border-white/15 text-purple-400 focus:ring-purple-500/30 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="trace-smoothing" className="text-xs text-gray-400 font-mono select-none cursor-pointer">
                    Aktifkan penghalusan lekukan kurva vektor organik adaptif
                  </label>
                </div>

              </div>

            </div>
          )}

          {/* Action trigger button */}
          <div className="pt-4 mt-auto">
            <button
              onClick={onConvert}
              disabled={isProcessing || filesCount === 0}
              className={`w-full py-4 px-4 rounded-full font-bold font-sans tracking-wide text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                filesCount === 0
                  ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                  : isProcessing
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/20 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] active:scale-95'
              }`}
              id="convert-trigger-button"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin" />
                  MENGONVERSI GAMBAR...
                </>
              ) : (
                <>
                  MULAI PROSES KONVERSI ({filesCount} {filesCount === 1 ? 'file' : 'file'})
                  <ChevronRight className="w-4.5 h-4.5 text-white" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
