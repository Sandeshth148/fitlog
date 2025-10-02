import { Injectable } from '@angular/core';
import { UserProfile, UserProfileUtils } from '../models/user-profile.model';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for managing user profile data
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY = 'fitlog-user-profile';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  
  /** Observable for user profile changes */
  userProfile$ = this.userProfileSubject.asObservable();
  
  constructor() {
    // Load profile from storage on initialization
    this.loadProfileFromStorage();
  }
  
  /**
   * Load user profile from localStorage
   */
  private loadProfileFromStorage(): void {
    try {
      const profileJson = localStorage.getItem(this.STORAGE_KEY);
      if (profileJson) {
        const profile = JSON.parse(profileJson) as UserProfile;
        this.userProfileSubject.next(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }
  
  /**
   * Get the current user profile
   * @returns Promise resolving to the user profile or null if not set
   */
  async getUserProfile(): Promise<UserProfile | null> {
    return this.userProfileSubject.value;
  }
  
  /**
   * Save or update user profile
   * @param profile Partial profile data to save
   * @returns Promise resolving to the updated profile
   */
  async saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const currentProfile = this.userProfileSubject.value;
      
      // Create new profile or update existing one
      const updatedProfile = UserProfileUtils.createProfile({
        ...currentProfile,
        ...profile,
        updatedAt: new Date().toISOString()
      });
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProfile));
      
      // Update subject
      this.userProfileSubject.next(updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw new Error('Failed to save user profile');
    }
  }
  
  /**
   * Update user height
   * @param heightCm Height in centimeters
   * @param preferredUnit Preferred height unit ('cm', 'in', or 'ft')
   * @returns Promise resolving to the updated profile
   */
  async updateUserHeight(heightCm: number, preferredUnit: 'cm' | 'in' | 'ft'): Promise<UserProfile> {
    return this.saveUserProfile({
      heightCm,
      preferredUnits: {
        ...(this.userProfileSubject.value?.preferredUnits || { weight: 'kg' }),
        height: preferredUnit
      }
    });
  }
  
  /**
   * Check if user has completed initial setup (has height set)
   * @returns Promise resolving to boolean indicating if profile is complete
   */
  async isProfileComplete(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return !!profile && profile.heightCm > 0;
  }
  
  /**
   * Clear user profile data (for testing or reset)
   */
  async clearUserProfile(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    this.userProfileSubject.next(null);
  }
}
