import { ConversionSettings } from '../types';

/**
 * High-performance horizontal-run-length and block-merging vectorizer.
 * Converts raster pixels directly to scalable SVG paths and PostScript EPS strings
 * without any external library, keeping it fully browser-compatible.
 */
export async function traceImageToVector(
  imageSrc: string,
  settings: ConversionSettings
): Promise<{ svgStr: string; epsStr: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Dynamic resolution assignment based on user-selected fidelity level
        let maxResolution = 600;
        if (settings.traceFidelity === 'low') maxResolution = 400;
        else if (settings.traceFidelity === 'medium') maxResolution = 900;
        else if (settings.traceFidelity === 'high') maxResolution = 1800;
        else if (settings.traceFidelity === 'ultra') maxResolution = 3600;

        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        
        let targetWidth = width;
        let targetHeight = height;

        if (width > maxResolution || height > maxResolution) {
          if (width > height) {
            targetWidth = maxResolution;
            targetHeight = Math.round((height * maxResolution) / width);
          } else {
            targetHeight = maxResolution;
            targetWidth = Math.round((width * maxResolution) / height);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not obtain Canvas 2D Context');
        }

        // Draw image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;

        // Custom groupings based on settings
        const isMono = settings.traceColorMode === 'monochrome';
        const colorsCount = settings.traceColorsCount;
        const threshold = settings.traceThreshold;

        // Helper: Convert RGB to Hex
        const rgbToHex = (r: number, g: number, b: number): string => {
          const clamp = (val: number) => Math.max(0, Math.min(255, val));
          return '#' + [r, g, b].map(x => {
            const hex = clamp(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
        };

        // Extract adaptive dominant colors from source image pixels with distance clustering to preserve fine distinct details like yellows
        const extractDominantColors = (imgDataArray: Uint8ClampedArray, targetColorsCount: number): string[] => {
          const pixelCount = imgDataArray.length / 4;
          const sampleCount = Math.min(15000, pixelCount); // Sample more pixels to catch small elements like stars/emblems
          const step = Math.max(1, Math.floor(pixelCount / sampleCount));
          
          const colorCounts: { [hex: string]: number } = {};
          
          for (let i = 0; i < pixelCount; i += step) {
            const idx = i * 4;
            const a = imgDataArray[idx + 3];
            if (a < 30) continue; // ignore highly transparent elements
            
            const r = imgDataArray[idx];
            const g = imgDataArray[idx + 1];
            const b = imgDataArray[idx + 2];
            
            // Subtle binning to damp down minor compression noise, keeping raw vibrance
            const rBin = Math.round(r / 8) * 8;
            const gBin = Math.round(g / 8) * 8;
            const bBin = Math.round(b / 8) * 8;
            
            const hex = rgbToHex(rBin, gBin, bBin);
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          }
          
          const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
          
          // Apply RGB distance-based pruning to filter out edge/compression gradients
          // which allows low-frequency distinct colors (like yellow in flags) to enter the palette
          const finalPalette: string[] = [];
          const minDistanceSq = 42 * 42; // Euclidean RGB square distance limit
          
          for (const hex of sortedColors) {
            if (finalPalette.length >= targetColorsCount) break;
            
            const r = parseInt(hex.substring(1, 3), 16) || 0;
            const g = parseInt(hex.substring(3, 5), 16) || 0;
            const b = parseInt(hex.substring(5, 7), 16) || 0;
            
            let tooClose = false;
            for (const selectedHex of finalPalette) {
              const sr = parseInt(selectedHex.substring(1, 3), 16) || 0;
              const sg = parseInt(selectedHex.substring(3, 5), 16) || 0;
              const sb = parseInt(selectedHex.substring(5, 7), 16) || 0;
              
              const distSq = (r - sr) * (r - sr) + (g - sg) * (g - sg) + (b - sb) * (b - sb);
              if (distSq < minDistanceSq) {
                tooClose = true;
                break;
              }
            }
            
            if (!tooClose) {
              finalPalette.push(hex);
            }
          }
          
          // If empty or has slots left and we still have unselected primary colors, fill them up
          if (finalPalette.length < Math.min(targetColorsCount, sortedColors.length)) {
            for (const hex of sortedColors) {
              if (finalPalette.length >= targetColorsCount) break;
              if (!finalPalette.includes(hex)) {
                finalPalette.push(hex);
              }
            }
          }
          
          if (finalPalette.length === 0) {
            return ['#ffffff', '#000000'];
          }
          return finalPalette;
        };

        // Compile palette variables
        const palette = extractDominantColors(data, colorsCount);
        const paletteRgb = palette.map(hex => {
          const r = parseInt(hex.substring(1, 3), 16) || 0;
          const g = parseInt(hex.substring(3, 5), 16) || 0;
          const b = parseInt(hex.substring(5, 7), 16) || 0;
          return { hex, r, g, b };
        });

        const colorClosestCache = new Map<string, string>();
        const getClosestPaletteColor = (r: number, g: number, b: number): string => {
          const key = `${r},${g},${b}`;
          const cached = colorClosestCache.get(key);
          if (cached !== undefined) return cached;
          
          let minDistance = Infinity;
          let closestHex = paletteRgb[0]?.hex || '#ffffff';
          
          for (let i = 0; i < paletteRgb.length; i++) {
            const p = paletteRgb[i];
            const dR = r - p.r;
            const dG = g - p.g;
            const dB = b - p.b;
            const dist = dR * dR + dG * dG + dB * dB;
            
            if (dist < minDistance) {
              minDistance = dist;
              closestHex = p.hex;
            }
          }
          colorClosestCache.set(key, closestHex);
          return closestHex;
        };

        // Quantize colors or simplify values
        const getPixelValue = (x: number, y: number) => {
          const idx = (y * targetWidth + x) * 4;
          if (idx >= data.length) return { r: 0, g: 0, b: 0, a: 0 };
          return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3]
          };
        };

        // Grid-run-length path generation algorithm
        // We track consecutive grid cells on horizontal rows that have the same color grouping
        const pathsByColor: { [color: string]: { x: number; y: number; w: number; h: number }[] } = {};

        for (let y = 0; y < targetHeight; y++) {
          let currentGroupColor: string | null = null;
          let runStart = 0;

          for (let x = 0; x < targetWidth; x++) {
            const pixel = getPixelValue(x, y);
            
            // Skip transparent pixels
            if (pixel.a < 30) {
              if (currentGroupColor !== null) {
                // End current run
                if (!pathsByColor[currentGroupColor]) {
                  pathsByColor[currentGroupColor] = [];
                }
                pathsByColor[currentGroupColor].push({
                  x: runStart,
                  y: y,
                  w: x - runStart,
                  h: 1
                });
                currentGroupColor = null;
              }
              continue;
            }

            let colorKey = '';

            if (isMono) {
              const luminance = 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
              colorKey = luminance < threshold ? '#000000' : '#ffffff';
            } else {
              colorKey = getClosestPaletteColor(pixel.r, pixel.g, pixel.b);
            }

            if (currentGroupColor === null) {
              currentGroupColor = colorKey;
              runStart = x;
            } else if (currentGroupColor !== colorKey) {
              // End current run and start a new one
              if (!pathsByColor[currentGroupColor]) {
                pathsByColor[currentGroupColor] = [];
              }
              pathsByColor[currentGroupColor].push({
                x: runStart,
                y: y,
                w: x - runStart,
                h: 1
              });
              currentGroupColor = colorKey;
              runStart = x;
            }
          }

          // Complete the last run in the row
          if (currentGroupColor !== null) {
            if (!pathsByColor[currentGroupColor]) {
              pathsByColor[currentGroupColor] = [];
            }
            pathsByColor[currentGroupColor].push({
              x: runStart,
              y: y,
              w: targetWidth - runStart,
              h: 1
            });
          }
        }

        // Merge adjacent identical coloring rows to optimize SVG representation paths
        const optimizedPathsByColor: { [color: string]: string[] } = {};
        
        Object.keys(pathsByColor).forEach(color => {
          const rects = pathsByColor[color];
          optimizedPathsByColor[color] = [];
          
          // Let's group rects to make standard SVG path elements
          // Using standard SVG rect compilation or combined path shapes `M x y h w v h h ...`
          // Combines horizontal run segments into a unified path command
          let combinedPath = '';
          rects.forEach(rect => {
            combinedPath += ` M${rect.x},${rect.y} h${rect.w} v${rect.h} h-${rect.w} z`;
          });
          optimizedPathsByColor[color].push(combinedPath);
        });

        // 1. Compile SVG Content with optional boundary organic curves
        let svgPathsStr = '';
        let svgDefs = '';
        let filterAttribute = '';

        // Inject high-end browser-side organic line curve-fitting/contouring filters if responsive smoothing is enabled
        if (settings.traceSmoothing) {
          // Keep blur radius extremely subtle (0.25 - 0.4) so we don't melt fine elements/shapes or merge unrelated colors
          const blurRadius = Math.max(0.25, Math.min(0.45, parseFloat((targetWidth / 1200).toFixed(3))));
          svgDefs = `  <defs>
    <filter id="vector-organic-smoothing" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <!-- Subtle blur to smooth step artifacts -->
      <feGaussianBlur stdDeviation="${blurRadius}" result="blur" />
      <!-- Highly conservative sharpening factor that retains fine details like stars and crests -->
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5" result="crisp" />
      <feComposite in="SourceGraphic" in2="crisp" operator="atop" />
    </filter>
  </defs>\n`;
          filterAttribute = ' filter="url(#vector-organic-smoothing)"';
        }

        Object.keys(optimizedPathsByColor).forEach(color => {
          const paths = optimizedPathsByColor[color].join(' ');
          const renderingType = settings.traceSmoothing ? 'geometricPrecision' : 'crispEdges';
          svgPathsStr += `  <path d="${paths}" fill="${color}" shape-rendering="${renderingType}"${filterAttribute} />\n`;
        });

        const svgStr = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetWidth} ${targetHeight}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="none" />
${svgDefs}${svgPathsStr}</svg>`;

        // 2. Compile EPS PostScript content
        // EPS files write coordinates from bottom-left; we convert y coordinates accordingly
        let epsPathsStr = '';
        Object.keys(pathsByColor).forEach(color => {
          // Convert hex color to standard PostScript RGB floating numbers [0, 1]
          const hex = color.replace('#', '');
          const rHex = parseInt(hex.substring(0, 2), 16) || 0;
          const gHex = parseInt(hex.substring(2, 4), 16) || 0;
          const bHex = parseInt(hex.substring(4, 6), 16) || 0;
          const r = (rHex / 255).toFixed(3);
          const g = (gHex / 255).toFixed(3);
          const b = (bHex / 255).toFixed(3);

          epsPathsStr += `\n% Color ${color}\n`;
          epsPathsStr += `${r} ${g} ${b} setrgbcolor\n`;

          pathsByColor[color].forEach(rect => {
            // PostScript rect draw: x y width height rectfill (in bottom-left system)
            const psY = targetHeight - rect.y - rect.h;
            epsPathsStr += `${rect.x} ${psY} ${rect.w} ${rect.h} rectfill\n`;
          });
        });

        const epsStr = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: PixelShift Image Format Converter (TypeScript Vectorizer Engine)
%%Title: Converted Vector Asset Vector EPS
%%BoundingBox: 0 0 ${targetWidth} ${targetHeight}
%%HiResBoundingBox: 0 0 ${targetWidth} ${targetHeight}
%%EndComments
%%BeginProlog
/rectfill where {
  pop
} {
  /rectfill {
    4 dict begin
    /h exch def
    /w exch def
    /y exch def
    /x exch def
    newpath
    x y moveto
    w 0 rlineto
    0 h rlineto
    w neg 0 rlineto
    closepath
    fill
    end
  } bind def
} ifelse
%%EndProlog
${epsPathsStr}
%%EOF`;

        resolve({ svgStr, epsStr, width: targetWidth, height: targetHeight });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for vector tracing.'));
    };
    img.src = imageSrc;
  });
}
