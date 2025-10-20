import { Injectable } from '@angular/core';
import { SosAlert } from '../models/sos-alert.type';

/**
 * Service SOS - stockage local via IndexedDB + retry automatique.
 * 100 % frontend (aucun backend).
 */
@Injectable({ providedIn: 'root' })
export class SOSService {
  private readonly DB_NAME = 'lecoride_sos_db';
  private readonly STORE = 'alerts';
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // ✅ le constructeur reste synchrone
    this.registerOnlineListener();
  }

  /**
   * Initialise la base après la création du service.
   * À appeler une seule fois (par exemple depuis AppComponent ou un composant SOS).
   */
  async init(): Promise<void> {
    if (!this.dbPromise) {
      this.dbPromise = this.openDB();
      await this.dbPromise; // on attend l’ouverture
    }
  }

  /** Écoute l'événement de retour en ligne */
  private registerOnlineListener(): void {
    window.addEventListener('online', () =>
      this.retryPendingAlerts().catch((err) => console.error('Retry failed', err))
    );
  }

  /** Ouverture ou création de la base IndexedDB */
  private openDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, 1);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.STORE)) {
          db.createObjectStore(this.STORE, { keyPath: 'id', autoIncrement: true });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new Error(req.error?.message ?? 'Erreur IndexedDB'));
    });
  }

  /** Retourne l’instance de DB */
  private async getDB(): Promise<IDBDatabase> {
    this.dbPromise ??= this.openDB();
    return this.dbPromise;
  }

  /** Ajoute une alerte dans la base */
  private async save(alert: SosAlert): Promise<SosAlert> {
    const db = await this.getDB();
    return new Promise<SosAlert>((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      const req = store.add(alert);
      req.onsuccess = () => resolve({ ...alert, id: req.result as number });
      req.onerror = () => reject(new Error(req.error?.message ?? 'Erreur IndexedDB'));
    });
  }

  /** Met à jour une alerte */
  private async update(id: number, partial: Partial<SosAlert>): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const current = getReq.result as SosAlert | undefined;
        if (!current) return resolve();
        const updated = { ...current, ...partial };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () =>
          reject(new Error(putReq.error?.message ?? 'Erreur update IndexedDB'));
      };

      getReq.onerror = () => reject(new Error(getReq.error?.message ?? 'Erreur lecture IndexedDB'));
    });
  }

  /** Récupère toutes les alertes */
  async getAllAlerts(): Promise<SosAlert[]> {
    const db = await this.getDB();
    return new Promise<SosAlert[]>((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readonly');
      const store = tx.objectStore(this.STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as SosAlert[]);
      req.onerror = () => reject(new Error(req.error?.message ?? 'Erreur lecture IndexedDB'));
    });
  }

  /** Récupère les alertes PENDING */
  private async getPendingAlerts(): Promise<SosAlert[]> {
    const all = await this.getAllAlerts();
    return all.filter((a) => a.status === 'PENDING');
  }

  /** Envoi d'une alerte */
  async sendAlert(payload: {
    userId?: string;
    message?: string;
    location?: string | null;
  }): Promise<{ offline?: boolean; alert: SosAlert }> {
    const base: SosAlert = {
      userId: payload.userId ?? 'local-user',
      message: payload.message ?? 'SOS déclenché',
      location: payload.location ?? null,
      timestamp: new Date().toISOString(),
      status: navigator.onLine ? 'SENT' : 'PENDING',
    };

    const saved = await this.save(base);

    if (navigator.onLine) {
      await this.update(saved.id!, { status: 'SENT' });
      return { alert: { ...saved, status: 'SENT' } };
    } else {
      return { offline: true, alert: saved };
    }
  }

  /** Retry automatique au retour réseau */
  async retryPendingAlerts(): Promise<void> {
    const pendings = await this.getPendingAlerts();
    if (pendings.length === 0) return;

    await Promise.all(
      pendings.map(async (a) => {
        try {
          await this.update(a.id!, { status: 'SENT', timestamp: new Date().toISOString() });
        } catch (err) {
          console.warn('Échec mise à jour alerte', err);
        }
      })
    );
  }
}
