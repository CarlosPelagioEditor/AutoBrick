import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { BrickItem, Client, User } from '../types';

export const firebaseService = {
  // --- AUTHENTICATION ---
  onAuthChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  },

  async registerUser(email: string, password: string, name: string, storeName?: string, phone?: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    const userProfile: User = {
      id: fbUser.uid,
      name,
      email: fbUser.email || email,
      storeName: storeName || 'Minha Loja & BRICK',
      phone: phone || '',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    // Save profile in Firestore
    await setDoc(doc(db, 'users', fbUser.uid), {
      ...userProfile,
      updatedAt: new Date().toISOString(),
    });

    return userProfile;
  },

  async loginUser(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return docSnap.data() as User;
      }
      return null;
    } catch (e) {
      console.error('Error fetching user profile:', e);
      return null;
    }
  },

  async saveUserProfile(user: User): Promise<void> {
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  // --- REAL-TIME INVENTORY ITEMS (Vehicles, Electronics, etc.) ---
  subscribeItems(userId: string, onUpdate: (items: BrickItem[]) => void): Unsubscribe {
    const q = query(collection(db, 'vehicles'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items: BrickItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id } as BrickItem);
      });
      // Sort by newest first
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(items);
    }, (error) => {
      console.error('Firestore items subscription error:', error);
    });
  },

  async saveItem(item: BrickItem): Promise<BrickItem> {
    const itemId = item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const itemData: BrickItem = {
      ...item,
      id: itemId,
      updatedAt: now,
      createdAt: item.createdAt || now,
    };

    await setDoc(doc(db, 'vehicles', itemId), itemData, { merge: true });
    return itemData;
  },

  async deleteItem(itemId: string): Promise<void> {
    await deleteDoc(doc(db, 'vehicles', itemId));
  },

  // --- REAL-TIME CRM CLIENTS ---
  subscribeClients(userId: string, onUpdate: (clients: Client[]) => void): Unsubscribe {
    const q = query(collection(db, 'clients'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const clients: Client[] = [];
      snapshot.forEach((doc) => {
        clients.push({ ...doc.data(), id: doc.id } as Client);
      });
      clients.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      onUpdate(clients);
    }, (error) => {
      console.error('Firestore clients subscription error:', error);
    });
  },

  async saveClient(client: Client): Promise<Client> {
    const clientId = client.id || `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const clientData: Client = {
      ...client,
      id: clientId,
      updatedAt: now,
      createdAt: client.createdAt || now,
    };

    await setDoc(doc(db, 'clients', clientId), clientData, { merge: true });
    return clientData;
  },

  async deleteClient(clientId: string): Promise<void> {
    await deleteDoc(doc(db, 'clients', clientId));
  },

  // --- BATCH BACKUP / MIGRATION TO CLOUD ---
  async syncLocalToCloud(userId: string, items: BrickItem[], clients: Client[]): Promise<void> {
    const promises: Promise<any>[] = [];
    for (const item of items) {
      promises.push(this.saveItem({ ...item, userId }));
    }
    for (const client of clients) {
      promises.push(this.saveClient({ ...client, userId }));
    }
    await Promise.all(promises);
  },
};
