import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { WeightEntry } from '../../features/weight-tracker/models/weight-entry.model';

const DB_NAME = 'fitlog-db';
const DB_VERSION = 1;
const STORE_NAME = 'weight-entries';

interface FitLogDb extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: WeightEntry;
    indexes: { 'createdAt': string };
  };
}

/**
 * Service for persisting weight entries to IndexedDB.
 * Uses the 'idb' library for a more convenient API.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbPromise: Promise<IDBPDatabase<FitLogDb>>;

  constructor() {
    this.dbPromise = this.initDb();
  }

  private initDb(): Promise<IDBPDatabase<FitLogDb>> {
    return openDB<FitLogDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }

  /**
   * Adds or updates a weight entry in the database.
   * @param entry The WeightEntry to save.
   * @returns A promise that resolves with the saved entry's id.
   */
  async addEntry(entry: WeightEntry): Promise<string> {
    try {
      console.log('StorageService: Adding entry', JSON.stringify(entry));
      
      // Ensure the entry has a valid ID
      if (!entry.id) {
        console.error('StorageService: Entry is missing an ID');
        entry.id = crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`;
        console.log('StorageService: Generated new ID', entry.id);
      }
      
      const db = await this.dbPromise;
      const result = await db.put(STORE_NAME, entry);
      console.log('StorageService: Entry saved successfully', result);
      return result;
    } catch (error) {
      console.error('StorageService: Error saving entry', error);
      console.error('StorageService: Problem entry data:', JSON.stringify(entry));
      throw error;
    }
  }

  /**
   * Retrieves all weight entries, sorted by creation date descending.
   * @returns A promise that resolves with an array of all WeightEntry objects.
   */
  async getAllEntries(): Promise<WeightEntry[]> {
    try {
      console.log('StorageService: Getting all entries');
      const db = await this.dbPromise;
      const entries = await db.getAll(STORE_NAME);
      console.log(`StorageService: Retrieved ${entries.length} entries`);
      return entries;
    } catch (error) {
      console.error('StorageService: Error getting entries', error);
      return [];
    }
  }

  /**
   * Retrieves a single weight entry by its ID.
   * @param id The ID of the entry to retrieve.
   * @returns A promise that resolves with the WeightEntry or undefined if not found.
   */
  async getEntryById(id: string): Promise<WeightEntry | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, id);
  }

  /**
   * Deletes a weight entry by its ID.
   * @param id The ID of the entry to delete.
   * @returns A promise that resolves when the entry is deleted.
   */
  async deleteEntry(id: string): Promise<void> {
    const db = await this.dbPromise;
    return db.delete(STORE_NAME, id);
  }

  /**
   * Clears all entries from the store.
   * @returns A promise that resolves when the store is cleared.
   */
  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    return db.clear(STORE_NAME);
  }
}
