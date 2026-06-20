export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'svg' | 'eps';

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ConversionSettings {
  format: ImageFormat;
  quality: number; // 0.1 to 1.0 (for JPEG/WEBP format matching)
  width: number; // custom width or -1 for original
  height: number; // custom height or -1 for original
  scale: number; // custom scale multiplier (e.g., 1, 1.5, 2, 4)
  keepAspectRatio: boolean;
  // Advanced Upscaling engine parameters
  upscaleMode: 'hd-sharp' | 'artistic-smooth' | 'original';
  sharpenAmount: number; // 0 (none) to 1.0 (maximum sharpening)
  // SVG Custom tracing parameters (real vectorizer)
  traceColorMode: 'color' | 'monochrome';
  traceThreshold: number; // 0 to 255
  traceColorsCount: number; // 2 to 16
  traceFidelity: 'low' | 'medium' | 'high' | 'ultra';
  traceSmoothing: boolean; // Enables SVG organic vector boundary smoothing
}

export interface ConvertedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  format: ImageFormat;
  dataUrl: string; // contains the blob/data URL representing converted output
  width: number;
  height: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  compressionRatio?: number; // comparison ratio (e.g., -45% for optimization)
}
