/**
 * Utility functions for client-side image compression and document handling
 * Ensures fast uploads, compact localStorage / cloud persistence, and high visual clarity.
 */

export interface ProcessedFile {
  dataUrl: string;
  name: string;
  sizeBytes: number;
  type: string;
  isPdf?: boolean;
}

/**
 * Formats byte size into human readable string (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Resizes and compresses an image file using an HTML5 Canvas
 * Keeps maximum dimensions within maxWidth/maxHeight and encodes as JPEG/WebP.
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<ProcessedFile> {
  // If it's a PDF document (e.g. digital PIX bank receipt)
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          name: file.name,
          sizeBytes: file.size,
          type: 'application/pdf',
          isPdf: true,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // If it's an image
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas context fails
          resolve({
            dataUrl: readerEvent.target?.result as string,
            name: file.name,
            sizeBytes: file.size,
            type: file.type,
            isPdf: false,
          });
          return;
        }

        // Fill background with white in case of transparent PNGs converting to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG for high compression ratio
        const mimeType = 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);

        // Calculate approximate size in bytes of base64
        const stringLength = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = Math.round((stringLength * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          name: file.name.replace(/\.[^/.]+$/, '.jpg'),
          sizeBytes: sizeInBytes,
          type: mimeType,
          isPdf: false,
        });
      };

      img.onerror = () => {
        // If image object fails to parse, fallback to raw reader
        resolve({
          dataUrl: readerEvent.target?.result as string,
          name: file.name,
          sizeBytes: file.size,
          type: file.type,
          isPdf: false,
        });
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
