import React from 'react';
import { useUpdate } from '../context/UpdateContext';
import { Clock, RefreshCw, Zap, ArrowUpCircle } from 'lucide-react';

export const UpdateFloatingPill: React.FC = () => {
  const {
    isUpdateAvailable,
    isModalOpen,
    isDefinitive,
    isUpdating,
    remainingSeconds,
    formattedTimeRemaining,
    openUpdateModal,
    applyUpdateNow,
  } = useUpdate();

  // Only show the floating pill if update is available, modal is dismissed/postponed, and not yet definitive
  if (!isUpdateAvailable || isModalOpen || isDefinitive) {
    return null;
  }

  // Progress percentage (out of 300 seconds)
  const totalSeconds = 5 * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce-subtle max-w-xs sm:max-w-sm">
      <div className="p-3 bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center gap-3">
        {/* Animated Clock / Icon */}
        <button
          type="button"
          onClick={openUpdateModal}
          className="relative p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer shrink-0"
          title="Ver detalhes da atualização"
        >
          <Clock className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        </button>

        {/* Text info and live timer */}
        <div
          onClick={openUpdateModal}
          className="flex-1 min-w-0 cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-white truncate">
              Atualização pendente
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400">Tempo limite:</span>
            <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              {formattedTimeRemaining}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-rose-500 h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick update button */}
        <button
          type="button"
          onClick={applyUpdateNow}
          disabled={isUpdating}
          className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isUpdating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Atualizar</span>
        </button>
      </div>
    </div>
  );
};
