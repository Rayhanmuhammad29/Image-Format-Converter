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
      onChangeSettings({ ...settings, width: num });
    } else {
      onChangeSettings({ ...settings, width: -1 }); // Original fallback
    }
  };

  const handleHeightChange = (val: string) => {
    setHeightInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onChangeSettings({ ...settings, height: num });
    } else {
      onChangeSettings({ ...settings, height: -1 }); // Original fallback
    }
  };

  const setResPreset = (w: number, h: number) => {
    setWidthInput(w.toString());
    setHeightInput(h.toString());
    onChangeSettings({ ...settings, width: w, height: h });
  };

  const setOriginalSize = () => {
    setWidthInput('original');
    setHeightInput('original');
    onChangeSettings({ ...settings, width: -1, height: -1 });
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
          Optimization & Adjustments
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Dimensions Configuration Option */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold text-gray-300 flex items-center justify-between">
              <span>OUTPUT DIMENSIONS</span>
              <span className="text-[10px] text-gray-500 font-normal">Width &bull; Height (pixels)</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <span className="text-[10px] font-mono text-gray-400 block mb-1">Target Width</span>
                <input
                  type="text"
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  placeholder="original"
                  id="target-width-field"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 block mb-1">Target Height</span>
                <input
                  type="text"
                  value={heightInput}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  placeholder="original"
                  id="target-height-field"
                />
              </div>
            </div>
          </div>

          {/* Quick Res Presets */}
          <div>
            <span className="text-[10px] font-mono text-gray-400 block mb-1.5">Preset Scale Configurations (Smallest to Highest)</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={setOriginalSize}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === -1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-original"
              >
                Original Size
              </button>
              <button
                onClick={() => setResPreset(512, 512)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 512 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-512x512"
              >
                512px (Small Icon)
              </button>
              <button
                onClick={() => setResPreset(800, 800)}
                className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  settings.width === 800 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-semibold' : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/15'
                }`}
                id="preset-800x800"
              >
                800px (Medium Square)
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

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="lock-aspect"
              checked={settings.keepAspectRatio}
              onChange={(e) => onChangeSettings({ ...settings, keepAspectRatio: e.target.checked })}
              className="rounded bg-white/5 border-white/15 text-cyan-400 focus:ring-cyan-500/30 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="lock-aspect" className="text-xs text-gray-400 font-mono select-none cursor-pointer">
              Lock aspect ratio of source file
            </label>
          </div>
        </div>

        {/* Dynamic Section: Quality or Vector Tracing Panel */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
          
          {hasQualitySlider && (
            <div className="space-y-4" id="raster-quality-controls">
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 flex items-center justify-between">
                  <span>COMPRESSION STRENGTH & QUALITY</span>
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
                <span className="text-[10px] font-mono text-cyan-300 block font-semibold uppercase tracking-wider">OPTIMIZATION SUGGESTION:</span>
                <span className="text-[10px] text-gray-400 mt-1 block leading-relaxed">
                  {settings.quality < 0.6 
                    ? 'Ultra compact payload size, appropriate for rapid web icons but might trigger fine color banding highlights.'
                    : settings.quality > 0.85
                    ? 'Premium image retention, recommended for production photography layouts with minimal artifacts.'
                    : 'Balanced standard - optimal configuration for file size compression versus dynamic range loss.'
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
                  COLOR QUANTIZATION MODE
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
                    Color Palette Trace
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
                    Silhouette Path
                  </button>
                </div>
              </div>

              {/* Slider depends on mode */}
              {settings.traceColorMode === 'color' ? (
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                    <span>MAX COHERENT COLORS</span>
                    <span className="text-purple-300 font-bold">{settings.traceColorsCount} layers</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="1"
                    value={settings.traceColorsCount}
                    onChange={(e) => onChangeSettings({ ...settings, traceColorsCount: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400 mt-2"
                    id="vector-layers-slider"
                  />
                  <span className="text-[10px] text-gray-500 block mt-1 font-normal">
                    Fewer colors produce more posterized, comic-style vector results.
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                    <span>SILHOUETTE THRESHOLD</span>
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
                    Higher threshold darkens the shadow paths, capturing finer detail.
                  </span>
                </div>
              )}

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
                  PROCESSING TRANSLATIONS...
                </>
              ) : (
                <>
                  INITIALIZE PROCESS ({filesCount} {filesCount === 1 ? 'file' : 'files'})
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
