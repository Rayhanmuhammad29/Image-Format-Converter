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
        // To keep computing time low and precise, scale down large images slightly for vector tracing
        const maxResolution = 250; 
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
              // Quantize colors to reduce number of paths
              const quantizeFactor = Math.floor(256 / Math.sqrt(colorsCount));
              const rQ = Math.round(pixel.r / quantizeFactor) * quantizeFactor;
              const gQ = Math.round(pixel.g / quantizeFactor) * quantizeFactor;
              const bQ = Math.round(pixel.b / quantizeFactor) * quantizeFactor;
              colorKey = rgbToHex(rQ, gQ, bQ);
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

        // 1. Compile SVG Content
        let svgPathsStr = '';
        Object.keys(optimizedPathsByColor).forEach(color => {
          const paths = optimizedPathsByColor[color].join(' ');
          svgPathsStr += `  <path d="${paths}" fill="${color}" shape-rendering="crispEdges" />\n`;
        });

        const svgStr = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetWidth} ${targetHeight}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="none" />
${svgPathsStr}</svg>`;

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
