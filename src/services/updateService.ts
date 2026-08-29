// AutoBrick Update Service: Code change detection & version synchronizer

export interface AppVersionInfo {
  version: string;
  buildId: string;
  buildTime: number;
  releaseNotes?: string;
  features?: string[];
}

const INITIAL_BUILD_KEY = 'autobrick_initial_build_id';
const INITIAL_VERSION_KEY = 'autobrick_initial_version';
const INSTALLED_BUILD_KEY = 'autobrick_installed_build_id';
const POSTPONED_UNTIL_KEY = 'autobrick_update_postponed_until';
const JUST_UPDATED_KEY = 'autobrick_just_updated_time';

export class UpdateService {
  private static instance: UpdateService;
  private currentBuildId: string | null = null;
  private currentVersion: string = '1.3.0';
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    // Check if we just updated within the last 30 seconds
    const justUpdatedTime = localStorage.getItem(JUST_UPDATED_KEY);
    if (justUpdatedTime && Date.now() - parseInt(justUpdatedTime, 10) < 30000) {
      // Clear flag after handling
      localStorage.removeItem(JUST_UPDATED_KEY);
    }

    const installedBuild = localStorage.getItem(INSTALLED_BUILD_KEY) || sessionStorage.getItem(INITIAL_BUILD_KEY);
    const storedVersion = sessionStorage.getItem(INITIAL_VERSION_KEY);
    if (installedBuild) {
      this.currentBuildId = installedBuild;
    }
    if (storedVersion) {
      this.currentVersion = storedVersion;
    }
  }

  public static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  // Register PWA service worker
  public registerServiceWorker(onUpdateFound?: (newVersion: AppVersionInfo) => void) {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            this.swRegistration = registration;
            console.log('[AutoBrick SW] Registered successfully');

            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[AutoBrick SW] New content available; update pending.');
                    if (onUpdateFound) {
                      onUpdateFound({
                        version: '1.3.1',
                        buildId: 'ab-sw-update-' + Date.now(),
                        buildTime: Date.now(),
                        releaseNotes: 'Novo pacote de código PWA baixado e pronto para instalação.',
                      });
                    }
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[AutoBrick SW] Registration error:', err);
          });
      });
    }
  }

  // Check if browser is online
  public isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  // Fetch current version from server (only if online)
  public async fetchServerVersion(): Promise<AppVersionInfo | null> {
    if (!this.isOnline()) {
      return null;
    }
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/app-version?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        // Fallback to static version.json if /api/app-version is unavailable
        const staticRes = await fetch(`/version.json?_t=${timestamp}`, { cache: 'no-store' });
        if (staticRes.ok) {
          return await staticRes.json();
        }
        return null;
      }

      const data: AppVersionInfo = await response.json();
      return data;
    } catch (err) {
      console.warn('[AutoBrick Update] Version check failed (network/offline):', err);
      return null;
    }
  }

  // Check if an update is available comparing initial build to current server build
  public async checkForUpdate(): Promise<{ hasUpdate: boolean; newVersion: AppVersionInfo | null }> {
    if (!this.isOnline()) {
      return { hasUpdate: false, newVersion: null };
    }

    const serverInfo = await this.fetchServerVersion();
    if (!serverInfo) {
      return { hasUpdate: false, newVersion: null };
    }

    // First time initializing? Record current server build as initial baseline
    if (!this.currentBuildId) {
      this.currentBuildId = serverInfo.buildId;
      this.currentVersion = serverInfo.version;
      sessionStorage.setItem(INITIAL_BUILD_KEY, serverInfo.buildId);
      sessionStorage.setItem(INITIAL_VERSION_KEY, serverInfo.version);
      localStorage.setItem(INSTALLED_BUILD_KEY, serverInfo.buildId);
      return { hasUpdate: false, newVersion: null };
    }

    // If server build matches current installed build or version, no update needed
    if (serverInfo.buildId === this.currentBuildId && serverInfo.version === this.currentVersion) {
      return { hasUpdate: false, newVersion: null };
    }

    // Check if user recently triggered an update to this target build
    const installedBuild = localStorage.getItem(INSTALLED_BUILD_KEY);
    if (installedBuild === serverInfo.buildId) {
      this.currentBuildId = serverInfo.buildId;
      this.currentVersion = serverInfo.version;
      sessionStorage.setItem(INITIAL_BUILD_KEY, serverInfo.buildId);
      sessionStorage.setItem(INITIAL_VERSION_KEY, serverInfo.version);
      return { hasUpdate: false, newVersion: null };
    }

    // Server build differs from client session build: update is genuinely available
    const isNewBuild = serverInfo.buildId !== this.currentBuildId;
    const isNewVersion = serverInfo.version !== this.currentVersion;

    if (isNewBuild || isNewVersion) {
      return {
        hasUpdate: true,
        newVersion: serverInfo,
      };
    }

    return { hasUpdate: false, newVersion: null };
  }

  // Perform a clean cache-busting reload and save new version to stop looping
  public async applyUpdateAndReload(targetVersion?: AppVersionInfo | null) {
    try {
      // 1. If target version was supplied, or fetch server info, immediately record as installed
      const targetBuildId = targetVersion?.buildId || (await this.fetchServerVersion())?.buildId || 'ab-build-v1.3.0';
      const targetVer = targetVersion?.version || '1.3.0';

      this.currentBuildId = targetBuildId;
      this.currentVersion = targetVer;
      localStorage.setItem(INSTALLED_BUILD_KEY, targetBuildId);
      sessionStorage.setItem(INITIAL_BUILD_KEY, targetBuildId);
      sessionStorage.setItem(INITIAL_VERSION_KEY, targetVer);
      localStorage.setItem(JUST_UPDATED_KEY, Date.now().toString());

      // 2. Clear postponed state
      localStorage.removeItem(POSTPONED_UNTIL_KEY);

      // 3. Clear caches if available
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // 4. Inform service worker to skip waiting if present
      if (this.swRegistration && this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // 5. Force hard reload with timestamp query to bypass browser disk cache
      const url = new URL(window.location.href);
      url.searchParams.set('v_sync', Date.now().toString());
      window.location.replace(url.toString());
    } catch (e) {
      console.warn('[AutoBrick Update] Cache clear error, falling back to location.reload():', e);
      window.location.reload();
    }
  }

  // Postpone update for 5 minutes (300,000 ms)
  public postponeUpdate(durationMs = 5 * 60 * 1000): number {
    const deadline = Date.now() + durationMs;
    localStorage.setItem(POSTPONED_UNTIL_KEY, deadline.toString());
    return deadline;
  }

  public getPostponedUntil(): number | null {
    const stored = localStorage.getItem(POSTPONED_UNTIL_KEY);
    if (!stored) return null;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? null : parsed;
  }

  public clearPostponedState() {
    localStorage.removeItem(POSTPONED_UNTIL_KEY);
  }

  // Simulate a test update
  public async simulateServerUpdate(version = '1.3.1'): Promise<AppVersionInfo> {
    try {
      const res = await fetch('/api/app-version/simulate-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          releaseNotes: 'Atualização simulada de teste: novas funcionalidades prontas para sincronização.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          version: data.version,
          buildId: data.buildId,
          buildTime: Date.now(),
          releaseNotes: data.message,
        };
      }
    } catch (e) {
      console.warn('Server simulation not reached, using local simulation:', e);
    }

    return {
      version: version,
      buildId: 'ab-simulated-' + Date.now(),
      buildTime: Date.now(),
      releaseNotes: 'Atualização de teste gerada no cliente.',
      features: [
        'Melhorias de desempenho no banco de dados',
        'Novo módulo de atualização automática',
        'Ajustes no cronômetro de 5 minutos',
      ],
    };
  }
}

export const updateService = UpdateService.getInstance();
