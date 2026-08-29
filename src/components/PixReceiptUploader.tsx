import React, { useState, useRef } from 'react';
import { compressAndResizeImage, formatFileSize, ProcessedFile } from '../utils/imageUtils';
import {
  FileCheck,
  Upload,
  Trash2,
  Eye,
  Download,
  FileText,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Loader2,
  X,
  Camera,
} from 'lucide-react';

interface PixReceiptUploaderProps {
  receiptUrl?: string;
  receiptName?: string;
  receiptDate?: string;
  transactionId?: string;
  onChange: (data: {
    receiptUrl?: string;
    receiptName?: string;
    receiptDate?: string;
    transactionId?: string;
  }) => void;
  onPreview?: (url: string, name?: string) => void;
  isReadOnly?: boolean;
}

export const PixReceiptUploader: React.FC<PixReceiptUploaderProps> = ({
  receiptUrl,
  receiptName,
  receiptDate,
  transactionId,
  onChange,
  onPreview,
  isReadOnly = false,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const processed: ProcessedFile = await compressAndResizeImage(file, 1600, 1600, 0.88);
      onChange({
        receiptUrl: processed.dataUrl,
        receiptName: file.name,
        receiptDate: new Date().toISOString(),
        transactionId: transactionId || '',
      });
    } catch (err) {
      console.error('Erro ao processar comprovante PIX:', err);
      alert('Houve um erro ao processar o arquivo do comprovante. Tente outro formato (JPG, PNG ou PDF).');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isReadOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      receiptUrl: undefined,
      receiptName: undefined,
      receiptDate: undefined,
      transactionId: undefined,
    });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!receiptUrl) return;
    const a = document.createElement('a');
    a.href = receiptUrl;
    a.download = receiptName || 'comprovante-pix.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isPdf = receiptName?.toLowerCase().endsWith('.pdf') || receiptUrl?.startsWith('data:application/pdf');

  return (
    <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg shadow-emerald-950/20">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            <Zap className="w-4 h-4 fill-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
              Comprovante de Pagamento PIX
              {receiptUrl && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Anexado
                </span>
              )}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Guarde a prova de liquidação bancária para segurança contábil e anti-golpe.
            </p>
          </div>
        </div>

        {receiptUrl && !isReadOnly && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover Comprovante</span>
          </button>
        )}
      </div>

      {/* Hidden File Inputs */}
      {!isReadOnly && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </>
      )}

      {/* Main Content Area */}
      {receiptUrl ? (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail */}
            <div
              onClick={() => onPreview && onPreview(receiptUrl, receiptName)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer relative group"
            >
              {isPdf ? (
                <div className="flex flex-col items-center justify-center text-rose-400">
                  <FileText className="w-7 h-7" />
                  <span className="text-[9px] font-black uppercase">PDF</span>
                </div>
              ) : (
                <img
                  src={receiptUrl}
                  alt="Comprovante PIX"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Receipt Info */}
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate max-w-xs sm:max-w-sm">
                {receiptName || 'comprovante-pix.jpg'}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Autenticação Bancária Registrada</span>
              </div>
              {receiptDate && (
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Anexado em {new Date(receiptDate).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onPreview && (
              <button
                type="button"
                onClick={() => onPreview(receiptUrl, receiptName)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Upload Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-500/30'
              : 'border-emerald-500/40 hover:border-emerald-400/80 bg-slate-950/80 hover:bg-slate-900/90'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-2 text-emerald-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-xs font-bold">Processando comprovante bancário...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm font-black text-white">
                Clique para subir o Comprovante PIX ou arraste aqui
              </div>
              <div className="text-[11px] text-slate-400 max-w-sm">
                Aceita prints da tela do banco (JPG, PNG, WEBP) ou PDF do comprovante.
              </div>

              {/* Camera Trigger on Mobile */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tirar Foto do Comprovante</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction ID / E2E Identifier Input */}
      <div>
        <label className="block text-[11px] font-bold text-slate-300 mb-1">
          ID da Transação / Autenticação Bancária (Opcional):
        </label>
        <input
          type="text"
          placeholder="Ex: E182361202608291038290192837..."
          value={transactionId || ''}
          onChange={(e) =>
            onChange({
              receiptUrl,
              receiptName,
              receiptDate,
              transactionId: e.target.value,
            })
          }
          disabled={isReadOnly}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

    </div>
  );
};
