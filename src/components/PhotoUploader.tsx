import React, { useState, useRef } from 'react';
import { compressAndResizeImage, formatFileSize } from '../utils/imageUtils';
import {
  Camera,
  Upload,
  Link,
  Trash2,
  Star,
  Plus,
  Eye,
  Image as ImageIcon,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  onPreviewPhoto?: (photoUrl: string, index: number) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos = [],
  onChange,
  maxPhotos = 8,
  onPreviewPhoto,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlInputValue, setUrlInputValue] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      alert(`Você já atingiu o limite máximo de ${maxPhotos} fotos para este item.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsProcessing(true);

    try {
      const newPhotoUrls: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const processed = await compressAndResizeImage(file, 1280, 1280, 0.82);
        newPhotoUrls.push(processed.dataUrl);
      }

      if (newPhotoUrls.length > 0) {
        onChange([...photos, ...newPhotoUrls]);
      }
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Houve um erro ao carregar a imagem. Tente novamente com outro arquivo.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleAddUrl = () => {
    if (!urlInputValue.trim()) return;
    if (photos.length >= maxPhotos) {
      alert(`Limite de ${maxPhotos} fotos atingido.`);
      return;
    }
    onChange([...photos, urlInputValue.trim()]);
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const handleRemovePhoto = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(photos.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverPhoto = (indexToCover: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (indexToCover === 0) return;
    const selected = photos[indexToCover];
    const rest = photos.filter((_, idx) => idx !== indexToCover);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-amber-400" />
            Fotos Reais do Produto (Opcional)
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {photos.length} / {maxPhotos}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-slate-400 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40"
          >
            <Link className="w-3 h-3" />
            <span>Colar Link / URL</span>
          </button>
        </div>
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="p-2.5 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center gap-2 animate-in fade-in duration-150">
          <input
            type="url"
            placeholder="Cole o link da imagem (ex: https://...)"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInputValue.trim()}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-lg transition-all"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInputValue('');
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Photo Gallery Grid & Dropzone */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2.5">
        
        {/* Render Existing Photos */}
        {photos.map((photoUrl, index) => {
          const isCover = index === 0;
          return (
            <div
              key={index}
              className={`group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 transition-all ${
                isCover
                  ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/30'
                  : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              <img
                src={photoUrl}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              {/* Top Badges */}
              <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                {isCover ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-slate-950" />
                    Capa
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300 text-[10px] font-bold border border-slate-700/60">
                    #{index + 1}
                  </span>
                )}
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => handleRemovePhoto(index, e)}
                    title="Excluir foto"
                    className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition-colors shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1">
                  {!isCover && (
                    <button
                      type="button"
                      onClick={(e) => handleSetCoverPhoto(index, e)}
                      title="Definir como foto principal (Capa)"
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[10px] font-bold transition-colors border border-amber-500/30 flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      <span>Capa</span>
                    </button>
                  )}

                  {onPreviewPhoto && (
                    <button
                      type="button"
                      onClick={() => onPreviewPhoto(photoUrl, index)}
                      title="Ver em tamanho grande"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add More Photos Card / Dropzone */}
        {photos.length < maxPhotos && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer select-none relative overflow-hidden ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-500/30'
                : 'border-slate-700/80 hover:border-amber-500/60 bg-slate-950/60 hover:bg-slate-900/90'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-1.5 text-amber-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-bold">Otimizando foto...</span>
              </div>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 mb-1.5 transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  Adicionar Foto
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Arraste ou clique
                </div>

                {/* Direct Camera Button on Mobile */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="mt-1.5 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1"
                  title="Tirar foto com a câmera"
                >
                  <Camera className="w-3 h-3" />
                  <span>Câmera</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        💡 <strong className="text-slate-300">Dica:</strong> Fotos reais aumentam as chances de venda em mais de 70% na OLX, Marketplace e WhatsApp. As fotos são otimizadas automaticamente para carregamento ultrarrápido.
      </p>
    </div>
  );
};
