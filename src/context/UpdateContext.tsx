import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { updateService, AppVersionInfo } from '../services/updateService';

interface UpdateContextType {
  isOnline: boolean;
  isUpdateAvailable: boolean;
  isDefinitive: boolean;
  isModalOpen: boolean;
  isUpdating: boolean;
  isChecking: boolean;
  newVersionInfo: AppVersionInfo | null;
  postponedUntil: number | null;
  remainingSeconds: number;
  formattedTimeRemaining: string;
  applyUpdateNow: () => Promise<void>;
  postponeUpdate: () => void;
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
  checkForUpdatesManually: () => Promise<boolean>;
  triggerTestUpdate: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

// 5 minutes in seconds
const FIVE_MINUTES_SECONDS = 5 * 60;

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isDefinitive, setIsDefinitive] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [newVersionInfo, setNewVersionInfo] = useState<AppVersionInfo | null>(null);
  
  const [postponedUntil, setPostponedUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to mm:ss
  const formattedTimeRemaining = React.useMemo(() => {
    if (remainingSeconds <= 0) return '00:00';
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [remainingSeconds]);

  // Execute manual or scheduled check (ONLY WHEN ONLINE)
  const checkForUpdates = useCallback(async (showNotification = true): Promise<boolean> => {
    // If user is currently offline, never trigger or check updates
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[AutoBrick Update] Device is offline. Update check skipped, running in offline mode.');
      return false;
    }

    setIsChecking(true);
    try {
      const result = await updateService.checkForUpdate();
      if (result.hasUpdate && result.newVersion) {
        setIsUpdateAvailable(true);
        setNewVersionInfo(result.newVersion);

        // Check if there was already an active postpone timer
        const currentPostponed = updateService.getPostponedUntil();
        if (currentPostponed) {
          const diff = Math.ceil((currentPostponed - Date.now()) / 1000);
          if (diff > 0) {
            setPostponedUntil(currentPostponed);
            setRemainingSeconds(diff);
            setIsDefinitive(false);
          } else {
            // Expired! Make it definitive only if online
            setIsDefinitive(true);
            setRemainingSeconds(0);
            setIsModalOpen(true);
          }
        } else if (showNotification) {
          // First time seeing this update: open modal automatically
          setIsDefinitive(false);
          setIsModalOpen(true);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Update check error (network/offline):', e);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Postpone update for 5 minutes
  const postponeUpdate = useCallback(() => {
    if (isDefinitive) {
      // Cannot postpone once definitive!
      return;
    }
    const deadline = updateService.postponeUpdate(FIVE_MINUTES_SECONDS * 1000);
    setPostponedUntil(deadline);
    setRemainingSeconds(FIVE_MINUTES_SECONDS);
    setIsDefinitive(false);
    setIsModalOpen(false);
  }, [isDefinitive]);

  // Apply update now
  const applyUpdateNow = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      alert('Você está offline no momento. Conecte-se à internet para baixar e sincronizar a nova versão.');
      return;
    }
    setIsUpdating(true);
    setIsModalOpen(false);
    setIsUpdateAvailable(false);
    setIsDefinitive(false);
    try {
      await updateService.applyUpdateAndReload(newVersionInfo);
    } catch (err) {
      console.error('Failed to apply update, forcing reload:', err);
      window.location.reload();
    }
  }, [newVersionInfo]);

  // Open modal manually (only if online or test)
  const openUpdateModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Close modal if allowed (only when not definitive)
  const closeUpdateModal = useCallback(() => {
    if (!isDefinitive) {
      setIsModalOpen(false);
    }
  }, [isDefinitive]);

  // Trigger test update (for user/developer testing)
  const triggerTestUpdate = useCallback(async () => {
    setIsChecking(true);
    try {
      const simulated = await updateService.simulateServerUpdate();
      setNewVersionInfo(simulated);
      setIsUpdateAvailable(true);
      setIsDefinitive(false);
      setPostponedUntil(null);
      setRemainingSeconds(0);
      setIsModalOpen(true);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Setup countdown tick (runs only when online)
  useEffect(() => {
    if (postponedUntil && isUpdateAvailable && isOnline) {
      const calculateRemaining = () => {
        const now = Date.now();
        const diff = Math.ceil((postponedUntil - now) / 1000);
        if (diff <= 0) {
          setRemainingSeconds(0);
          setIsDefinitive(true);
          setIsModalOpen(true);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
        } else {
          setRemainingSeconds(diff);
        }
      };

      calculateRemaining();
      countdownIntervalRef.current = setInterval(calculateRemaining, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [postponedUntil, isUpdateAvailable, isOnline]);

  // Network Online/Offline Listeners & Automatic Sync when Reconnecting
  useEffect(() => {
    const handleOnline = () => {
      console.log('[AutoBrick Network] Device connected to the internet. Checking for updates automatically...');
      setIsOnline(true);
      
      // When connection is restored, immediately check for code updates and trigger the notification system if new version exists!
      checkForUpdates(true);
    };

    const handleOffline = () => {
      console.log('[AutoBrick Network] Device is offline. Operating with local data & caching.');
      setIsOnline(false);
      // Close update modal if open so the user can continue their work smoothly offline
      setIsModalOpen(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkForUpdates]);

  // Setup periodic polling for code changes (every 35 seconds, only when online)
  useEffect(() => {
    // Initial check after 2.5 seconds if online
    const initialTimer = setTimeout(() => {
      if (navigator.onLine) {
        checkForUpdates(true);
      }
    }, 2500);

    // Register service worker listener
    updateService.registerServiceWorker((newVer) => {
      if (navigator.onLine) {
        setNewVersionInfo(newVer);
        setIsUpdateAvailable(true);
        setIsModalOpen(true);
      }
    });

    // Polling every 35 seconds (only when online)
    checkIntervalRef.current = setInterval(() => {
      if (navigator.onLine) {
        checkForUpdates(false);
      }
    }, 35000);

    // Check on window focus / visibility change if online
    const handleFocus = () => {
      if (navigator.onLine) checkForUpdates(false);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        checkForUpdates(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdates]);

  return (
    <UpdateContext.Provider
      value={{
        isOnline,
        isUpdateAvailable,
        isDefinitive,
        isModalOpen,
        isUpdating,
        isChecking,
        newVersionInfo,
        postponedUntil,
        remainingSeconds,
        formattedTimeRemaining,
        applyUpdateNow,
        postponeUpdate,
        openUpdateModal,
        closeUpdateModal,
        checkForUpdatesManually: () => checkForUpdates(true),
        triggerTestUpdate,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = (): UpdateContextType => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
};
