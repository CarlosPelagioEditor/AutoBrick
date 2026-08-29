import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, BrickItem, Client } from '../types';
import { storageService } from '../services/storage';
import { firebaseService, getFriendlyAuthErrorMessage } from '../services/firebaseService';
import { Unsubscribe } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  vehicles: BrickItem[];
  clients: Client[];
  isLoading: boolean;
  isCloudSyncing: boolean;
  cloudSyncStatus: 'online' | 'local_demo' | 'syncing' | 'offline';
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<User>;
  loginAs: (user: User) => void;
  switchUser: (userId: string) => void;
  register: (name: string, email: string, password?: string, storeName?: string, phone?: string, copyDemoData?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  saveVehicle: (vehicle: BrickItem) => Promise<BrickItem>;
  deleteVehicle: (id: string) => Promise<void>;
  refreshVehicles: () => void;
  saveClient: (client: Client) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  refreshClients: () => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  syncLocalToCloudNow: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_SESSION_KEY = 'autobrick_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<BrickItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'online' | 'local_demo' | 'syncing' | 'offline'>('local_demo');

  const unsubscribeItemsRef = useRef<Unsubscribe | null>(null);
  const unsubscribeClientsRef = useRef<Unsubscribe | null>(null);

  // Clean up subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (unsubscribeItemsRef.current) {
      unsubscribeItemsRef.current();
      unsubscribeItemsRef.current = null;
    }
    if (unsubscribeClientsRef.current) {
      unsubscribeClientsRef.current();
      unsubscribeClientsRef.current = null;
    }
  }, []);

  // Setup Real-time listeners for active user
  const setupRealtimeSync = useCallback((user: User) => {
    cleanupSubscriptions();

    // Check if user is a Cloud Firebase user (or if we sync in Firestore)
    const isCloudUser = user.id.length >= 20 || user.id.startsWith('usr_cloud_') || !user.id.startsWith('usr_carlos_');

    if (isCloudUser) {
      setCloudSyncStatus('syncing');
      setIsCloudSyncing(true);

      // Subscribe to Firestore vehicles
      unsubscribeItemsRef.current = firebaseService.subscribeItems(user.id, (cloudItems) => {
        setVehicles(cloudItems);
        setIsCloudSyncing(false);
        setCloudSyncStatus('online');
      });

      // Subscribe to Firestore clients
      unsubscribeClientsRef.current = firebaseService.subscribeClients(user.id, (cloudClients) => {
        setClients(cloudClients);
      });
    } else {
      // Local demo profile mode
      setCloudSyncStatus('local_demo');
      const userItems = storageService.getItemsByUserId(user.id);
      setVehicles(userItems);
      const userClients = storageService.getClientsByUserId(user.id);
      setClients(userClients);
    }
  }, [cleanupSubscriptions]);

  // Initial load
  useEffect(() => {
    const loadedUsers = storageService.getUsers();
    setUsers(loadedUsers);

    // Listen to Firebase Auth state
    const unsubscribeAuth = firebaseService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User logged in with Firebase
        const profile = await firebaseService.getUserProfile(firebaseUser.uid);
        const activeUser: User = profile || {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário Nuvem',
          email: firebaseUser.email || '',
          storeName: 'BRICK Multiuso & Negócios',
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
          createdAt: new Date().toISOString(),
        };

        setCurrentUser(activeUser);
        localStorage.setItem(CURRENT_USER_SESSION_KEY, activeUser.id);
        setupRealtimeSync(activeUser);
      } else {
        // No Firebase user logged in, check local session
        const savedUserId = localStorage.getItem(CURRENT_USER_SESSION_KEY);
        let activeUser = loadedUsers.find((u) => u.id === savedUserId);

        if (!activeUser && loadedUsers.length > 0) {
          activeUser = loadedUsers[0];
        }

        if (activeUser) {
          setCurrentUser(activeUser);
          localStorage.setItem(CURRENT_USER_SESSION_KEY, activeUser.id);
          setupRealtimeSync(activeUser);
        }
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      cleanupSubscriptions();
    };
  }, [setupRealtimeSync, cleanupSubscriptions]);

  const refreshVehicles = useCallback(() => {
    if (currentUser) {
      if (cloudSyncStatus === 'local_demo') {
        const userItems = storageService.getItemsByUserId(currentUser.id);
        setVehicles(userItems);
      }
    } else {
      setVehicles([]);
    }
  }, [currentUser, cloudSyncStatus]);

  const refreshClients = useCallback(() => {
    if (currentUser) {
      if (cloudSyncStatus === 'local_demo') {
        const userClients = storageService.getClientsByUserId(currentUser.id);
        setClients(userClients);
      }
    } else {
      setClients([]);
    }
  }, [currentUser, cloudSyncStatus]);

  const loginAs = useCallback(
    (user: User) => {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_SESSION_KEY, user.id);
      setupRealtimeSync(user);
    },
    [setupRealtimeSync]
  );

  const switchUser = useCallback(
    (userId: string) => {
      const found = users.find((u) => u.id === userId);
      if (found) {
        loginAs(found);
      }
    },
    [users, loginAs]
  );

  const login = useCallback(
    async (email: string, password?: string): Promise<boolean> => {
      // 1. Try Firebase Auth first if password provided
      if (password && password.length >= 6) {
        try {
          setIsCloudSyncing(true);
          const fbUser = await firebaseService.loginUser(email, password);
          const profile = await firebaseService.getUserProfile(fbUser.uid);
          const user: User = profile || {
            id: fbUser.uid,
            name: fbUser.email?.split('@')[0] || 'Usuário Nuvem',
            email: fbUser.email || email,
            storeName: 'Minha Loja & BRICK',
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
            createdAt: new Date().toISOString(),
          };
          loginAs(user);
          return true;
        } catch (e: any) {
          console.warn('Firebase login attempt:', e);
          // Check if it exists in local users before throwing
          const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (found) {
            loginAs(found);
            return true;
          }
          throw new Error(getFriendlyAuthErrorMessage(e));
        } finally {
          setIsCloudSyncing(false);
        }
      }

      // 2. Fallback to local accounts
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        loginAs(found);
        return true;
      }
      return false;
    },
    [users, loginAs]
  );

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    setIsCloudSyncing(true);
    try {
      const user = await firebaseService.loginWithGoogle();
      loginAs(user);
      return user;
    } catch (err: any) {
      console.error('Google login error:', err);
      throw new Error(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsCloudSyncing(false);
    }
  }, [loginAs]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password?: string,
      storeName?: string,
      phone?: string,
      copyDemoData = true
    ): Promise<User> => {
      let newUser: User;

      if (password && password.length >= 6) {
        try {
          setIsCloudSyncing(true);
          newUser = await firebaseService.registerUser(email, password, name, storeName, phone);
        } catch (e: any) {
          console.warn('Cloud registration notice, processing fallback:', e);
          const errCode = e?.code || '';
          if (errCode === 'auth/operation-not-allowed' || errCode === 'auth/unauthorized-domain' || errCode === 'auth/network-request-failed') {
            // Local fallback with cloud readiness
            newUser = {
              id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name,
              email,
              storeName: storeName || 'Negócios & BRICK',
              phone: phone || '',
              avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
              createdAt: new Date().toISOString(),
            };
            storageService.saveUser(newUser);
            const updatedUsers = storageService.getUsers();
            setUsers(updatedUsers);
          } else {
            throw new Error(getFriendlyAuthErrorMessage(e));
          }
        } finally {
          setIsCloudSyncing(false);
        }
      } else {
        // Local registration
        newUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name,
          email,
          storeName: storeName || 'Negócios & BRICK',
          phone: phone || '',
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          createdAt: new Date().toISOString(),
        };
        storageService.saveUser(newUser);
        const updatedUsers = storageService.getUsers();
        setUsers(updatedUsers);
      }

      // Seed initial sample inventory & clients if requested so user can immediately test database
      if (copyDemoData) {
        const demoItems = storageService.getItemsByUserId('usr_carlos_01');
        if (demoItems.length > 0) {
          demoItems.forEach((item) => {
            const clonedItem: BrickItem = {
              ...item,
              id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              userId: newUser.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            storageService.saveItem(clonedItem);
            if (newUser.id.length >= 20) {
              firebaseService.saveItem(clonedItem).catch(() => {});
            }
          });
        }

        const demoClients = storageService.getClientsByUserId('usr_carlos_01');
        if (demoClients.length > 0) {
          demoClients.forEach((client) => {
            const clonedClient: Client = {
              ...client,
              id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              userId: newUser.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            storageService.saveClient(clonedClient);
            if (newUser.id.length >= 20) {
              firebaseService.saveClient(clonedClient).catch(() => {});
            }
          });
        }
      }

      loginAs(newUser);
      return newUser;
    },
    [loginAs]
  );

  const logout = useCallback(async () => {
    cleanupSubscriptions();
    try {
      await firebaseService.logout();
    } catch (e) {
      console.error('Firebase logout error:', e);
    }
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    setCurrentUser(null);
    setVehicles([]);
    setClients([]);
    setCloudSyncStatus('local_demo');
  }, [cleanupSubscriptions]);

  const saveVehicle = useCallback(
    async (vehicle: BrickItem): Promise<BrickItem> => {
      if (!currentUser) throw new Error('Faça login para salvar itens.');
      const itemToSave = {
        ...vehicle,
        userId: currentUser.id,
      };

      // Always save locally
      storageService.saveItem(itemToSave);

      // If cloud syncing active or user is logged in
      if (cloudSyncStatus === 'online' || cloudSyncStatus === 'syncing') {
        try {
          await firebaseService.saveItem(itemToSave);
        } catch (e) {
          console.error('Failed to sync item to Firestore:', e);
        }
      } else {
        refreshVehicles();
      }

      return itemToSave;
    },
    [currentUser, cloudSyncStatus, refreshVehicles]
  );

  const deleteVehicle = useCallback(
    async (id: string) => {
      if (!currentUser) return;
      storageService.deleteItem(id);

      if (cloudSyncStatus === 'online' || cloudSyncStatus === 'syncing') {
        try {
          await firebaseService.deleteItem(id);
        } catch (e) {
          console.error('Failed to delete item in Firestore:', e);
        }
      } else {
        refreshVehicles();
      }
    },
    [currentUser, cloudSyncStatus, refreshVehicles]
  );

  const saveClient = useCallback(
    async (client: Client): Promise<Client> => {
      if (!currentUser) throw new Error('Faça login para salvar clientes.');
      const clientToSave = {
        ...client,
        userId: currentUser.id,
      };

      storageService.saveClient(clientToSave);

      if (cloudSyncStatus === 'online' || cloudSyncStatus === 'syncing') {
        try {
          await firebaseService.saveClient(clientToSave);
        } catch (e) {
          console.error('Failed to sync client to Firestore:', e);
        }
      } else {
        refreshClients();
      }

      return clientToSave;
    },
    [currentUser, cloudSyncStatus, refreshClients]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      if (!currentUser) return;
      storageService.deleteClient(id);

      if (cloudSyncStatus === 'online' || cloudSyncStatus === 'syncing') {
        try {
          await firebaseService.deleteClient(id);
        } catch (e) {
          console.error('Failed to delete client in Firestore:', e);
        }
      } else {
        refreshClients();
      }
    },
    [currentUser, cloudSyncStatus, refreshClients]
  );

  const syncLocalToCloudNow = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      setIsCloudSyncing(true);
      const localItems = storageService.getItemsByUserId(currentUser.id);
      const localClients = storageService.getClientsByUserId(currentUser.id);
      await firebaseService.syncLocalToCloud(currentUser.id, localItems, localClients);
      setupRealtimeSync(currentUser);
      setIsCloudSyncing(false);
      return true;
    } catch (e) {
      console.error('Manual sync to cloud failed:', e);
      setIsCloudSyncing(false);
      return false;
    }
  }, [currentUser, setupRealtimeSync]);

  const exportData = useCallback(() => {
    if (!currentUser) return;
    const dataStr = storageService.exportDataForUser(currentUser.id);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autobrick_backup_${currentUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentUser]);

  const importData = useCallback(
    (jsonStr: string): boolean => {
      if (!currentUser) return false;
      const ok = storageService.importDataForUser(jsonStr, currentUser.id);
      if (ok) {
        if (cloudSyncStatus === 'online' || cloudSyncStatus === 'syncing') {
          syncLocalToCloudNow();
        } else {
          refreshVehicles();
          refreshClients();
        }
      }
      return ok;
    },
    [currentUser, cloudSyncStatus, syncLocalToCloudNow, refreshVehicles, refreshClients]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        vehicles,
        clients,
        isLoading,
        isCloudSyncing,
        cloudSyncStatus,
        login,
        loginWithGoogle,
        loginAs,
        switchUser,
        register,
        logout,
        saveVehicle,
        deleteVehicle,
        refreshVehicles,
        saveClient,
        deleteClient,
        refreshClients,
        exportData,
        importData,
        syncLocalToCloudNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
