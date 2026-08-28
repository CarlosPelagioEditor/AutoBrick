import React from 'react';
import { BrickItem } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatBRL } from '../utils/calculations';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: BrickItem | null;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
}) => {
  if (!isOpen || !item) return null;

  const categoryMeta = getCategoryInfo(item.category);

  return (
    <div
      id="confirm-delete-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="confirm-delete-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-slate-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title and Confirmation Details */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white">
            Excluir Item do BRICK?
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tem certeza que deseja excluir este item permanentemente? Esta ação removerá o produto e todo o histórico financeiro associado.
          </p>
        </div>

        {/* Item Summary Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryMeta.emoji}</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {categoryMeta.name.split('(')[0]}
            </span>
          </div>

          <div className="font-bold text-sm text-white">
            {item.model}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Valor de Compra:</span>
            <span className="font-bold text-slate-200">{formatBRL(item.purchasePrice)}</span>
          </div>

          {item.plate && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Placa:</span>
              <span className="font-mono text-slate-200 font-bold">{item.plate}</span>
            </div>
          )}

          {item.serialOrImei && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Serial / IMEI:</span>
              <span className="text-slate-300 font-mono text-[11px]">{item.serialOrImei}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 text-center"
          >
            <Trash2 className="w-4 h-4" />
            Sim, Excluir Item
          </button>
        </div>
      </div>
    </div>
  );
};
