import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { WeightEntry, WeightEntryUtils } from '../../features/weight-tracker/models/weight-entry.model';
import { BmiService } from './bmi.service';
import { UserService } from './user.service';
import { DateValidationService } from './date-validation.service';

const DB_NAME = 'fitlog-db';
const DB_VERSION = 2; // Increased version for schema updates
const STORE_NAME = 'weight-entries';

interface FitLogDb extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: WeightEntry;
    indexes: { 
      'createdAt': string;
      'date': string;
    };
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

  constructor(
    private bmiService: BmiService,
    private userService: UserService,
    private dateValidationService: DateValidationService
  ) {
    this.dbPromise = this.initDb();
  }

  private initDb(): Promise<IDBPDatabase<FitLogDb>> {
    return openDB<FitLogDb>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);
        
        // Create store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          console.log('Creating object store:', STORE_NAME);
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('date', 'date');
        }
        
        console.log('Database upgrade complete');
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
      
      // Validate date range
      if (entry.date && !this.dateValidationService.isDateInAllowedRange(entry.date)) {
        throw new Error('Date is outside the allowed range (5 years ago to today)');
      }
      
      // Ensure the entry has a valid ID
      if (!entry.id) {
        console.error('StorageService: Entry is missing an ID');
        entry.id = crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`;
        console.log('StorageService: Generated new ID', entry.id);
      }
      
      // Add updatedAt timestamp
      const updatedEntry = {
        ...entry,
        updatedAt: new Date().toISOString()
      };
      
      const db = await this.dbPromise;
      const result = await db.put(STORE_NAME, updatedEntry);
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
  
  /**
   * Adds a weight entry with BMI calculation
   * @param entry Partial weight entry
   * @returns Promise resolving to the saved entry
   */
  async addEntryWithBmi(entry: Partial<WeightEntry>): Promise<WeightEntry> {
    try {
      // Get user height
      const profile = await this.userService.getUserProfile();
      const heightCm = profile?.heightCm || 0;
      
      // Calculate BMI if height is available
      let bmi: number | undefined;
      if (heightCm > 0 && entry.weightKg) {
        bmi = this.bmiService.calculateBmi(entry.weightKg, heightCm);
        console.log(`StorageService: Calculated BMI ${bmi} for weight ${entry.weightKg}kg and height ${heightCm}cm`);
      }
      
      // Create complete entry with BMI
      const completeEntry = WeightEntryUtils.createEntry({
        ...entry,
        bmi
      });
      
      // Save to storage
      await this.addEntry(completeEntry);
      return completeEntry;
    } catch (error) {
      console.error('StorageService: Error adding entry with BMI', error);
      throw error;
    }
  }
  
  /**
   * Updates an existing entry
   * @param entry Entry to update
   * @returns Promise resolving to the updated entry ID
   */
  async updateEntry(entry: WeightEntry): Promise<string> {
    return this.addEntry(entry);
  }
  
  /**
   * Recalculates BMI for all entries when height changes
   * @param heightCm New height in centimeters
   * @returns Promise resolving when all entries are updated
   */
  async recalculateAllBmi(heightCm: number): Promise<void> {
    if (!heightCm || heightCm <= 0) return;
    
    try {
      console.log(`StorageService: Recalculating BMI for all entries with height ${heightCm}cm`);
      const entries = await this.getAllEntries();
      
      for (const entry of entries) {
        if (entry.weightKg) {
          entry.bmi = this.bmiService.calculateBmi(entry.weightKg, heightCm);
          entry.updatedAt = new Date().toISOString();
          await this.updateEntry(entry);
        }
      }
      
      console.log(`StorageService: Recalculated BMI for ${entries.length} entries`);
    } catch (error) {
      console.error('StorageService: Error recalculating BMI', error);
      throw error;
    }
  }
  
  /**
   * Gets entries within a specific date range
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Promise resolving to filtered entries
   */
  async getEntriesInDateRange(startDate: string, endDate: string): Promise<WeightEntry[]> {
    try {
      const allEntries = await this.getAllEntries();
      
      return allEntries.filter(entry => {
        return entry.date >= startDate && entry.date <= endDate;
      });
    } catch (error) {
      console.error('StorageService: Error getting entries in date range', error);
      return [];
    }
  }
}
