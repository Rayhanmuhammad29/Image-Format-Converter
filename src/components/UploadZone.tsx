import React, { useState, useRef } from 'react';
import { UploadCloud, Image, ArrowRightLeft, FileImage, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndProcessFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const imageRegex = /^image\/(jpeg|png|webp|svg\+xml|eps|tiff|gif)$/;
    
    // Also support checking the extension file name
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.eps', '.gif', '.tif', '.tiff'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImgType = imageRegex.test(file.type);
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isImgExt = allowedExtensions.includes(ext);

      if (isImgType || isImgExt) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setErrorMsg(null);
      onFilesSelected(validFiles);
    } else {
      setErrorMsg('Unsupported format. Please upload JPG, PNG, WEBP, or SVG files.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full" 
      id="upload-zone-wrapper"
    >
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative group cursor-pointer transition-all duration-300 rounded-3xl border-2 border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[360px] overflow-hidden ${
          isDragActive
            ? 'border-cyan-400 bg-white/10 shadow-[0_0_40px_rgba(6,182,212,0.35)] scale-[0.99] backdrop-blur-xl'
            : 'border-white/15 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] backdrop-blur-xl'
        }`}
        id="drag-and-drop-container"
      >
        {/* Decorative background pulse glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
        
        {/* Modern Vector/Image Format Graphics decoration */}
        <div className="flex items-center justify-center gap-4 mb-6 relative">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg transform group-hover:-rotate-6 group-hover:scale-105 transition-all duration-300 text-cyan-300">
            <FileImage className="w-7 h-7" />
          </div>
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 text-cyan-200">
            <span className="font-mono text-xs font-bold tracking-wide">SVG/EPS</span>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 relative z-10 font-sans tracking-tight">
          Instant Format Transformation
        </h3>
        <p className="text-sm text-gray-400 max-w-md mb-8 relative z-10 leading-relaxed font-normal">
          Drag and drop high-resolution assets here to initiate premium format optimization. Supports <span className="text-cyan-300 font-mono font-bold">PNG, JPG, WEBP</span> to vector tracing and re-indexing.
        </p>

        <button
          type="button"
          className="relative z-10 font-sans text-xs bg-cyan-500 text-white hover:bg-cyan-400 transition-all font-extrabold px-10 py-4 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center gap-2 tracking-wide cursor-pointer hover:scale-105 active:scale-95 duration-200"
          id="select-files-btn"
        >
          <UploadCloud className="w-4.5 h-4.5 text-white" />
          CHOOSE LOCAL IMAGES
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,.eps"
          onChange={handleChange}
          id="file-input-element"
        />

        {errorMsg && (
          <div 
            className="mt-6 flex items-center gap-2 text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 px-5 py-3 rounded-xl backdrop-blur-md"
            id="upload-error-message"
            onClick={(e) => e.stopPropagation()} // Guard click propagation
          >
            <ShieldAlert className="w-4 h-4 text-rose-300 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-8 text-[11px] font-mono text-gray-500 tracking-widest font-semibold uppercase">
          100% Client-Side Engine &bull; Zero Quality Loss
        </div>
      </div>
    </motion.div>
  );
}
