import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { HeightInputComponent } from '../../../features/weight-tracker/components/height-input/height-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslatePipe, 
    HeightInputComponent,
    ButtonComponent,
    LanguageSwitcherComponent,
    ThemeSelectorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="profile-modal" [class.visible]="visible" (click)="onBackdropClick($event)">
      <div class="profile-content" (click)="$event.stopPropagation()">
        <header class="profile-header">
          <h2>{{ 'profile.title' | translate }}</h2>
          <button class="close-button" (click)="close()">&times;</button>
        </header>
        
        <div class="profile-body">
          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar-container" [class.has-avatar]="!!avatarUrl">
              <img *ngIf="avatarUrl" [src]="avatarUrl" alt="User avatar" class="user-avatar" />
              <div *ngIf="!avatarUrl" class="avatar-placeholder">
                {{ getInitials() }}
              </div>
              <div class="avatar-overlay">
                <button class="avatar-edit-button" (click)="triggerFileInput()">
                  {{ 'profile.changeAvatar' | translate }}
                </button>
              </div>
            </div>
            <input 
              type="file" 
              #fileInput 
              style="display: none" 
              accept="image/*"
              (change)="onFileSelected($event)"
            />
          </div>
          
          <!-- Profile Form -->
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
            <div class="form-group">
              <label for="displayName">{{ 'profile.displayName' | translate }}</label>
              <input 
                type="text" 
                id="displayName" 
                formControlName="displayName" 
                [placeholder]="'profile.namePlaceholder' | translate"
              />
            </div>
            
            <!-- Height Section -->
            <div class="height-section">
              <h3>{{ 'profile.height' | translate }}</h3>
              <app-height-input 
                *ngIf="showHeightInput"
                (heightSaved)="onHeightSaved($event)">
              </app-height-input>
              <div *ngIf="!showHeightInput && userHeight > 0" class="current-height">
                <p>{{ 'profile.currentHeight' | translate }}: {{ userHeight }} cm</p>
                <app-button 
                  (clicked)="showHeightInput = true" 
                  variant="secondary">
                  {{ 'profile.editHeight' | translate }}
                </app-button>
              </div>
            </div>
            
            <!-- Preferences Section -->
            <div class="preferences-section">
              <h3>{{ 'profile.preferences' | translate }}</h3>
              
              <div class="preference-item">
                <label>{{ 'profile.theme' | translate }}</label>
                <app-theme-selector></app-theme-selector>
              </div>
              
              <div class="preference-item">
                <label>{{ 'profile.language' | translate }}</label>
                <app-language-switcher></app-language-switcher>
              </div>
            </div>
            
            <div class="form-actions">
              <app-button 
                type="submit" 
                [disabled]="profileForm.invalid || !profileForm.dirty" 
                variant="primary">
                {{ 'profile.save' | translate }}
              </app-button>
              <app-button 
                type="button" 
                (clicked)="close()" 
                variant="ghost">
                {{ 'profile.cancel' | translate }}
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    
    .profile-modal.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .profile-content {
      background-color: var(--color-bg);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      transform: translateY(20px);
      transition: transform 0.3s;
    }
    
    .profile-modal.visible .profile-content {
      transform: translateY(0);
    }
    
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      
      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--color-text);
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        
        &:hover {
          background-color: var(--color-bg-hover);
        }
      }
    }
    
    .profile-body {
      padding: 1.5rem;
    }
    
    .avatar-section {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }
    
    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      background-color: var(--color-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--color-primary);
      
      &:hover .avatar-overlay {
        opacity: 1;
      }
    }
    
    .user-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .avatar-placeholder {
      font-size: 3rem;
      font-weight: bold;
      color: var(--color-primary);
    }
    
    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .avatar-edit-button {
      background-color: var(--color-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      
      &:hover {
        background-color: var(--color-primary-dark);
      }
    }
    
    .profile-form {
      .form-group {
        margin-bottom: 1.5rem;
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text);
        }
        
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background-color: var(--color-input-bg);
          color: var(--color-text);
          font-size: 1rem;
          
          &:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 2px var(--color-primary-light);
          }
        }
      }
    }
    
    .height-section {
      margin-bottom: 1.5rem;
      
      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.1rem;
      }
    }
    
    .current-height {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background-color: var(--color-bg-secondary);
      border-radius: 6px;
      
      p {
        margin: 0;
        font-weight: 500;
      }
    }
    
    .preferences-section {
      margin-bottom: 1.5rem;
      
      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.1rem;
      }
      
      .preference-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background-color: var(--color-bg-secondary);
        border-radius: 6px;
        
        label {
          font-weight: 500;
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    /* Responsive styles */
    @media (max-width: 480px) {
      .profile-content {
        width: 95%;
      }
      
      .avatar-container {
        width: 100px;
        height: 100px;
      }
      
      .form-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  visible = false;
  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  avatarUrl: string = '';
  userHeight: number = 0;
  showHeightInput = false;
  
  private langSubscription: Subscription = new Subscription();
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.maxLength(50)]]
    });
  }
  
  ngOnInit(): void {
    this.loadUserProfile();
    
    // Subscribe to language changes
    this.langSubscription = this.translationService.currentLanguage$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }
  
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  
  async loadUserProfile(): Promise<void> {
    try {
      this.userProfile = await this.userService.getUserProfile();
      
      if (this.userProfile) {
        this.avatarUrl = this.userProfile.avatarUrl || '';
        this.userHeight = this.userProfile.heightCm || 0;
        
        this.profileForm.patchValue({
          displayName: this.userProfile.displayName || ''
        });
      }
      
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }
  
  open(): void {
    this.visible = true;
    this.loadUserProfile();
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  close(): void {
    this.visible = false;
    document.body.style.overflow = '';
  }
  
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('profile-modal')) {
      this.close();
    }
  }
  
  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large. Maximum size is 2MB.');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.avatarUrl = e.target.result.toString();
          this.cdr.markForCheck();
        }
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;
    
    try {
      const displayName = this.profileForm.get('displayName')?.value;
      
      // Update display name if changed
      if (displayName !== this.userProfile?.displayName) {
        await this.userService.updateDisplayName(displayName);
      }
      
      // Update avatar if changed
      if (this.avatarUrl !== this.userProfile?.avatarUrl) {
        await this.userService.updateAvatar(this.avatarUrl);
      }
      
      // Reload profile
      await this.loadUserProfile();
      
      // Reset form state
      this.profileForm.markAsPristine();
      
      // Close modal
      this.close();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }
  
  onHeightSaved(heightCm: number): void {
    this.userHeight = heightCm;
    this.showHeightInput = false;
    this.cdr.markForCheck();
  }
  
  getInitials(): string {
    const name = this.profileForm.get('displayName')?.value || '';
    if (!name) return '?';
    
    return name
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
