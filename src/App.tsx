import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import FormatSelector from './components/FormatSelector';
import AdjustmentPanel from './components/AdjustmentPanel';
import BatchList from './components/BatchList';
import PreviewModal from './components/PreviewModal';
import { ImageFile, ConversionSettings, ConvertedFile, ImageFormat } from './types';
import { traceImageToVector } from './utils/imageTracer';
import { Sparkles, Sliders, CheckCircle, Info, RefreshCw } from 'lucide-react';

export default function App() {
  // Core state pointers
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [converted, setConverted] = useState<{ [id: string]: ConvertedFile }>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Selected file id for comparison lightbox
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Default premium conversion parameters
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'png',
    quality: 0.85,
    width: -1, // -1 means original size
    height: -1,
    keepAspectRatio: true,
    traceColorMode: 'color',
    traceThreshold: 128,
    traceColorsCount: 8
  });

  // Load state and clear workspace triggers
  const handleResetWorkspace = () => {
    // Revoke any existing object URLs to avoid memory leaks
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setConverted({});
    setPreviewId(null);
  };

  // Convert File list selection into ImageFile data structure
  const handleFilesSelected = (selectedFiles: File[]) => {
    const newImageFiles: ImageFile[] = [];

    // Map each selected file
    selectedFiles.forEach(file => {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      
      // Load image dimensions offscreen to populate metadata
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        const imageObj: ImageFile = {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl,
          width,
          height,
          aspectRatio: width / height
        };

        setFiles(prev => [...prev, imageObj]);
      };
      
      img.onerror = () => {
        // Fallback dimensions if image cannot be loaded offscreen
        const imageObj: ImageFile = {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl,
          width: 800,
          height: 600,
          aspectRatio: 800 / 600
        };
        setFiles(prev => [...prev, imageObj]);
      };

      img.src = previewUrl;
    });
  };

  // Trigger individual file removal from batch list
  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles(prev => prev.filter(f => f.id !== id));
    setConverted(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    if (previewId === id) {
      setPreviewId(null);
    }
  };

  // Core Conversion Engine: processes files sequentially client-side
  const handleConvertBatch = async () => {
    if (files.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      
      // Update state to show processing
      setConverted(prev => ({
        ...prev,
        [currentFile.id]: {
          id: currentFile.id,
          name: currentFile.name,
          size: 0,
          type: '',
          format: settings.format,
          dataUrl: '',
          width: currentFile.width,
          height: currentFile.height,
          status: 'processing'
        }
      }));

      try {
        // Target dimension mapping with aspect ratio lock
        let targetWidth = currentFile.width;
        let targetHeight = currentFile.height;

        if (settings.width !== -1 && settings.height !== -1) {
          targetWidth = settings.width;
          targetHeight = settings.height;
        } else if (settings.width !== -1) {
          targetWidth = settings.width;
          targetHeight = settings.keepAspectRatio 
            ? Math.round(settings.width / currentFile.aspectRatio)
            : currentFile.height;
        } else if (settings.height !== -1) {
          targetHeight = settings.height;
          targetWidth = settings.keepAspectRatio
            ? Math.round(settings.height * currentFile.aspectRatio)
            : currentFile.width;
        }

        // Output Muxer
        if (settings.format === 'svg' || settings.format === 'eps') {
          // Trigger Vectorization Tracing Engine
          const { svgStr, epsStr, width, height } = await traceImageToVector(
            currentFile.previewUrl,
            settings
          );

          let dataUrl = '';
          let outputSize = 0;
          let filenameExt = '';

          if (settings.format === 'svg') {
            // Encode pure SVG to base64 structure safely
            const utf8SafeBase64 = btoa(unescape(encodeURIComponent(svgStr)));
            dataUrl = `data:image/svg+xml;base64,${utf8SafeBase64}`;
            outputSize = svgStr.length;
            filenameExt = 'svg';
          } else {
            // Encode pure EPS (PostScript) text to base64
            const utf8SafeBase64 = btoa(unescape(encodeURIComponent(epsStr)));
            dataUrl = `data:application/postscript;base64,${utf8SafeBase64}`;
            outputSize = epsStr.length;
            filenameExt = 'eps';
          }

          const compressionRatio = Math.round(((outputSize - currentFile.size) / currentFile.size) * 100);

          setConverted(prev => ({
            ...prev,
            [currentFile.id]: {
              id: currentFile.id,
              name: currentFile.name,
              size: outputSize,
              type: settings.format === 'svg' ? 'image/svg+xml' : 'application/postscript',
              format: settings.format,
              dataUrl,
              width,
              height,
              status: 'success',
              compressionRatio
            }
          }));

        } else {
          // Trigger standard HTML5 Canvas Rasterization
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) throw new Error('Failed to retrieve canvas graphics context');

          // Draw the image onto the resized canvas
          const img = new Image();
          await new Promise<void>((resolveLoad, rejectLoad) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
              resolveLoad();
            };
            img.onerror = () => rejectLoad(new Error('Failed to load image element'));
            img.src = currentFile.previewUrl;
          });

          // Determine target mime types
          let mimeType = 'image/png';
          if (settings.format === 'jpeg') mimeType = 'image/jpeg';
          if (settings.format === 'webp') mimeType = 'image/webp';

          // Compress to DataURL
          const dataUrl = canvas.toDataURL(mimeType, settings.quality);
          
          // Calculate exact byte size from resulting base64 payload
          const base64Str = dataUrl.split(',')[1];
          const outputSize = Math.round((base64Str.length * 3) / 4);
          const compressionRatio = Math.round(((outputSize - currentFile.size) / currentFile.size) * 100);

          setConverted(prev => ({
            ...prev,
            [currentFile.id]: {
              id: currentFile.id,
              name: currentFile.name,
              size: outputSize,
              type: mimeType,
              format: settings.format,
              dataUrl,
              width: targetWidth,
              height: targetHeight,
              status: 'success',
              compressionRatio
            }
          }));
        }

      } catch (err: any) {
        setConverted(prev => ({
          ...prev,
          [currentFile.id]: {
            ...prev[currentFile.id],
            status: 'error',
            error: err.message || 'Unknown processing anomaly'
          }
        }));
      }
    }

    setIsProcessing(false);
  };

  // Trigger file download to local client disk
  const handleDownloadFile = (id: string) => {
    const result = converted[id];
    const originalFile = files.find(f => f.id === id);
    if (!result || !originalFile) return;

    const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.'));
    const targetExtension = result.format;
    const downloadName = `${baseName}_converted.${targetExtension}`;

    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Optional trigger: Download all processed files simultaneously in sequence
  const handleDownloadAll = () => {
    Object.keys(converted).forEach(id => {
      if (converted[id].status === 'success') {
        handleDownloadFile(id);
      }
    });
  };

  // Count success items
  const successCount = Object.values(converted).filter((c: ConvertedFile) => c.status === 'success').length;

  return (
    <div className="min-h-screen bg-[#050B18] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      
      {/* Decorative glass background blur circles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-150px] right-[-100px] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[130px] animate-pulse [animation-duration:12s]" />
        <div className="absolute bottom-[-150px] left-[-100px] w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse [animation-duration:15s]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Premium Header */}
        <Header onReset={handleResetWorkspace} filesCount={files.length} />

        {/* Main Container Area */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
          
          {/* Top showcase banner explaining our vector capabilities */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                Succeed With High-Detail Intelligent Tracing
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                Convert any standard raster photo into infinite scale vectors (SVG, EPS) using local pixel contours, or optimize web payload compression with next-gen WEBP/PNG re-indexing.
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 font-bold tracking-wide">
                ⚡ Local CPU Processing
              </span>
              <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 font-bold tracking-wide">
                🔒 No Data Leaks
              </span>
            </div>
          </div>

          {/* Dynamic Panel splitting layout */}
          {files.length === 0 ? (
            /* File Selector screen */
            <div className="w-full">
              <UploadZone onFilesSelected={handleFilesSelected} />
            </div>
          ) : (
            /* Processing workspace layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left/Main Column - Batch List & Formats selectors (span 2) */}
              <div className="lg:col-span-2 space-y-8 flex flex-col justify-between">
                
                <div className="space-y-8">
                  {/* 1. Target Format Selection */}
                  <FormatSelector 
                    selectedFormat={settings.format}
                    onChangeFormat={(fmt) => setSettings(prev => ({ ...prev, format: fmt }))}
                  />

                  {/* 2. Workspace Queue */}
                  <BatchList 
                    files={files}
                    converted={converted}
                    onRemove={handleRemoveFile}
                    onPreview={(id) => setPreviewId(id)}
                    onDownload={handleDownloadFile}
                  />
                </div>

                {/* Batch level controls if items are completed */}
                {successCount > 0 && (
                  <div className="mt-4 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono text-gray-300">
                        Completed <strong className="text-emerald-400 font-extrabold">{successCount}/{files.length}</strong> items successfully.
                      </span>
                    </div>
                    <button
                      onClick={handleDownloadAll}
                      className="w-full sm:w-auto font-sans text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-6 py-3.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      id="download-all-batch-btn"
                    >
                      DOWNLOAD COMPLETED BATCH ({successCount})
                    </button>
                  </div>
                )}

              </div>

              {/* Right Column - Adjustment Controls / Execution (span 1) */}
              <div className="lg:col-span-1 h-fit sticky top-24">
                <AdjustmentPanel 
                  settings={settings}
                  onChangeSettings={(sets) => setSettings(sets)}
                  onConvert={handleConvertBatch}
                  isProcessing={isProcessing}
                  filesCount={files.length}
                />
              </div>

            </div>
          )}

        </main>

        {/* Lightbox Side-by-Side comparator modal rendering */}
        {previewId && files.find(f => f.id === previewId) && converted[previewId] && (
          <PreviewModal 
            file={files.find(f => f.id === previewId)!}
            result={converted[previewId]}
            onClose={() => setPreviewId(null)}
          />
        )}

        {/* Footer System credits */}
        <footer className="border-t border-white/10 bg-white/2 px-6 py-8 mt-16 text-center text-xs font-mono text-gray-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>&copy; {new Date().getFullYear()} Image Format Converter. Premium Studio Kit. </span>
            <span className="text-gray-600 font-medium">Designed with absolute desktop high contrast and pixel safety.</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
