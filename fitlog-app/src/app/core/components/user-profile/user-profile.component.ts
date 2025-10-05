import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
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
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit, OnDestroy {
  visible = false;
  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  avatarUrl: string = '';
  userHeight: number = 0;
  showHeightInput = false;
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
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
