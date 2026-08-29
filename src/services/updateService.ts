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
const POSTPONED_UNTIL_KEY = 'autobrick_update_postponed_until';

export class UpdateService {
  private static instance: UpdateService;
  private currentBuildId: string | null = null;
  private currentVersion: string = '1.3.0';
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    // Initialize current build ID from storage or set it on first boot
    const storedBuild = sessionStorage.getItem(INITIAL_BUILD_KEY);
    const storedVersion = sessionStorage.getItem(INITIAL_VERSION_KEY);
    if (storedBuild) {
      this.currentBuildId = storedBuild;
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

  // Fetch current version from server
  public async fetchServerVersion(): Promise<AppVersionInfo | null> {
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
      console.warn('[AutoBrick Update] Version check failed:', err);
      return null;
    }
  }

  // Check if an update is available comparing initial build to current server build
  public async checkForUpdate(): Promise<{ hasUpdate: boolean; newVersion: AppVersionInfo | null }> {
    const serverInfo = await this.fetchServerVersion();
    if (!serverInfo) {
      return { hasUpdate: false, newVersion: null };
    }

    // First time initializing the session? Record current build as baseline
    if (!this.currentBuildId) {
      this.currentBuildId = serverInfo.buildId;
      this.currentVersion = serverInfo.version;
      sessionStorage.setItem(INITIAL_BUILD_KEY, serverInfo.buildId);
      sessionStorage.setItem(INITIAL_VERSION_KEY, serverInfo.version);
      return { hasUpdate: false, newVersion: null };
    }

    // If server buildId or version differs from current session's initial baseline, we have an update!
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

  // Perform a clean cache-busting reload
  public async applyUpdateAndReload() {
    try {
      // 1. Clear postponed state
      localStorage.removeItem(POSTPONED_UNTIL_KEY);

      // 2. Clear caches if available
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // 3. Inform service worker to skip waiting if present
      if (this.swRegistration && this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // 4. Force hard reload with timestamp query to bypass browser disk cache
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
