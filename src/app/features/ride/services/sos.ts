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
    this.registerOnlineListener();
  }

  /** Initialise la base IndexedDB */
  async init(): Promise<void> {
    if (!this.dbPromise) {
      this.dbPromise = this.openDB();
      await this.dbPromise;
    }
  }

  /** Écoute le retour réseau */
  private registerOnlineListener(): void {
    globalThis.addEventListener('online', () =>
      this.retryPendingAlerts().catch((err) => console.error('Retry failed', err))
    );
  }

  /** Ouverture/création de la DB */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
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

  /** Retourne la DB existante ou l’ouvre */
  private async getDB(): Promise<IDBDatabase> {
    this.dbPromise ??= this.openDB();
    return this.dbPromise;
  }

  /** Méthodes helper pour IndexedDB */
  private getAlert(store: IDBObjectStore, id: number): Promise<SosAlert | undefined> {
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as SosAlert | undefined);
      req.onerror = () => reject(new Error(req.error?.message ?? 'Erreur lecture IndexedDB'));
    });
  }

  private putAlert(store: IDBObjectStore, alert: SosAlert): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = store.put(alert);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new Error(req.error?.message ?? 'Erreur update IndexedDB'));
    });
  }

  /** Sauvegarde une alerte */
  private async save(alert: SosAlert): Promise<SosAlert> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE, 'readwrite');
    const store = tx.objectStore(this.STORE);

    return new Promise((resolve, reject) => {
      const req = store.add(alert);
      req.onsuccess = () => resolve({ ...alert, id: req.result as number });
      req.onerror = () => reject(new Error(req.error?.message ?? 'Erreur IndexedDB'));
    });
  }

  /** Met à jour une alerte */
  private async update(id: number, partial: Partial<SosAlert>): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE, 'readwrite');
    const store = tx.objectStore(this.STORE);

    const current = await this.getAlert(store, id);
    if (!current) return;
    await this.putAlert(store, { ...current, ...partial });
  }

  /** Récupère toutes les alertes */
  async getAllAlerts(): Promise<SosAlert[]> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE, 'readonly');
    const store = tx.objectStore(this.STORE);

    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as SosAlert[]);
      req.onerror = () => reject(new Error(req.error?.message ?? 'Erreur lecture IndexedDB'));
    });
  }

  /** Filtre les alertes PENDING */
  private async getPendingAlerts(): Promise<SosAlert[]> {
    const all = await this.getAllAlerts();
    return all.filter((a) => a.status === 'PENDING');
  }

  /** Envoie d’une alerte */
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
    }
    return { offline: true, alert: saved };
  }

  /** Retry automatique */
  async retryPendingAlerts(): Promise<void> {
    const pendings = await this.getPendingAlerts();
    if (!pendings.length) return;

    await Promise.all(
      pendings.map((a) =>
        this.update(a.id!, { status: 'SENT', timestamp: new Date().toISOString() })
      )
    );
  }
}
