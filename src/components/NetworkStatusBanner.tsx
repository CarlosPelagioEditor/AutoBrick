import React, { useState, useEffect } from 'react';
import { useUpdate } from '../context/UpdateContext';
import { Wifi, WifiOff } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = useUpdate();
  const [showReconnectedBanner, setShowReconnectedBanner] = useState<boolean>(false);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // User just transitioned from offline to online!
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // If currently offline
  if (!isOnline) {
    return (
      <div className="bg-slate-800/95 border-b border-slate-700 text-slate-300 py-1.5 px-4 text-xs flex items-center justify-center gap-2 backdrop-blur-sm z-30 select-none">
        <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong className="text-white font-bold">Modo Offline ativo:</strong> O AutoBrick está funcionando normalmente com salvamento local. O sistema de atualização e a sincronização em nuvem serão ativados assim que a internet for restabelecida.
        </span>
      </div>
    );
  }

  // If recently reconnected
  if (showReconnectedBanner) {
    return (
      <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 py-1.5 px-4 text-xs flex items-center justify-center gap-2 backdrop-blur-sm z-30 animate-fadeIn select-none">
        <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
        <span>
          <strong className="text-emerald-100 font-bold">Internet reconectada:</strong> Verificando atualizações e sincronizando dados com o servidor...
        </span>
      </div>
    );
  }

  return null;
};
