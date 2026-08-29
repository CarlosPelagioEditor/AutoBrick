import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  initialIndex?: number;
  title?: string;
  isPixReceipt?: boolean;
  fileName?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  photos = [],
  initialIndex = 0,
  title,
  isPixReceipt = false,
  fileName,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
  }, [initialIndex, isOpen]);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const isPdf = currentPhoto?.startsWith('data:application/pdf') || fileName?.toLowerCase().endsWith('.pdf');

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setZoomLevel(1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setZoomLevel(1);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentPhoto;
    a.download = fileName || (isPixReceipt ? 'comprovante-pix.jpg' : `foto-produto-${currentIndex + 1}.jpg`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="image-viewer-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-white z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isPixReceipt ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
              📸
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-white truncate">
              {title || (isPixReceipt ? 'Comprovante de Pagamento PIX' : 'Fotos do Produto')}
            </h3>
            <p className="text-[10px] text-slate-400 truncate">
              {photos.length > 1
                ? `Foto ${currentIndex + 1} de ${photos.length}`
                : isPixReceipt
                ? 'Visualização oficial de liquidação bancária'
                : 'Foto em alta definição'}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isPdf && (
            <>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.25))}
                title="Diminuir zoom"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.25))}
                title="Aumentar zoom"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleDownload}
            title="Baixar arquivo"
            className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Fechar"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? (
          <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-3xl border border-slate-800">
            <FileText className="w-16 h-16 text-rose-400 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">
              Documento PDF do Comprovante PIX
            </h4>
            <p className="text-xs text-slate-400 mb-4 text-center max-w-sm">
              {fileName || 'comprovante.pdf'}
            </p>
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Baixar / Abrir Documento PDF</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
            <img
              src={currentPhoto}
              alt={title || 'Foto'}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[82vh] max-w-full object-contain rounded-2xl transition-transform duration-150 shadow-2xl border border-slate-800"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Prev / Next Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              title="Foto anterior (Seta esquerda)"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-slate-700 transition-all shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === photos.length - 1}
              title="Próxima foto (Seta direita)"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-slate-700 transition-all shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip (if multiple photos) */}
      {photos.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar shrink-0 max-w-2xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
              }}
              className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                currentIndex === idx
                  ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                  : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={p}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
