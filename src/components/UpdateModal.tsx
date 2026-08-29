import React from 'react';
import { useUpdate } from '../context/UpdateContext';
import { Sparkles, RefreshCw, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';

export const UpdateModal: React.FC = () => {
  const {
    isUpdateAvailable,
    isModalOpen,
    isDefinitive,
    isUpdating,
    newVersionInfo,
    formattedTimeRemaining,
    remainingSeconds,
    applyUpdateNow,
    postponeUpdate,
    closeUpdateModal,
  } = useUpdate();

  if (!isUpdateAvailable || !isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all transform animate-scaleUp ${
          isDefinitive
            ? 'bg-slate-900 border-rose-500/50 shadow-rose-500/10'
            : 'bg-slate-900 border-amber-500/40 shadow-amber-500/10'
        }`}
      >
        {/* Top Accent Line */}
        <div
          className={`h-1.5 w-full ${
            isDefinitive
              ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500'
          }`}
        />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isDefinitive
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isDefinitive ? (
              <ShieldAlert className="w-7 h-7 animate-bounce" />
            ) : (
              <Sparkles className="w-7 h-7 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isDefinitive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isDefinitive ? 'Atualização Obrigatória' : 'Nova Versão Disponível'}
              </span>
              {newVersionInfo?.version && (
                <span className="text-[11px] font-mono text-slate-400">
                  v{newVersionInfo.version}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              {isDefinitive
                ? 'Sincronização de Código Obrigatória'
                : 'Mudanças no Código do Sistema Detectadas'}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Definitive Warning Alert */}
          {isDefinitive ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200 leading-relaxed">
                <strong className="font-bold text-rose-100 block mb-1">
                  Tempo limite de adiamento encerrado (5 minutos)
                </strong>
                Para evitar inconsistências no banco de dados e garantir o funcionamento correto de todas as novas ferramentas, a atualização precisa ser aplicada agora.
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Uma nova compilação com atualizações de sistema, novas funções de negociação e melhorias de sincronização do banco de dados está pronta para ser ativada.
            </div>
          )}

          {/* Release Highlights / Features */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Novidades e Melhorias Desta Versão:
            </span>
            <ul className="space-y-1.5">
              {(newVersionInfo?.features && newVersionInfo.features.length > 0
                ? newVersionInfo.features
                : [
                    'Sincronização em tempo real com o banco de dados na nuvem',
                    'Sistema automático de atualização e integridade de versão',
                    'Melhorias no Copiloto IA, cálculo de margens e recibos',
                    'Otimizações de performance e segurança',
                  ]
              ).map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Countdown timer feedback if postponed earlier */}
          {!isDefinitive && remainingSeconds > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Tempo restante até a atualização definitiva:</span>
              </div>
              <span className="font-mono font-black text-amber-400 text-sm">
                {formattedTimeRemaining}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          {/* Update Now Button (Available in both modes) */}
          <button
            type="button"
            onClick={applyUpdateNow}
            disabled={isUpdating}
            className={`w-full sm:flex-1 py-3 px-4 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              isDefinitive
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 shadow-rose-500/20'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Atualizando e Recarregando...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Atualizar Agora</span>
              </>
            )}
          </button>

          {/* Update Later Button (ONLY allowed before 5 minutes expire) */}
          {!isDefinitive && (
            <button
              type="button"
              onClick={postponeUpdate}
              disabled={isUpdating}
              className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Atualizar Mais Tarde (5 min)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
