import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  isModalOpen = signal(false);
  avatarPreview = signal<string | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isSubmitting = signal(false);
  
  private langSubscription!: Subscription;
  private profileSubscription!: Subscription;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
    
    // Subscribe to language changes to update the UI
    this.langSubscription = this.translationService.currentLanguage$.subscribe(() => {
      // Trigger change detection to update translations
      this.cdr.markForCheck();
    });
    
    // Subscribe to profile changes
    this.profileSubscription = this.userService.userProfile$.subscribe(profile => {
      if (profile) {
        console.log('UserProfileComponent: Profile updated from observable:', profile);
        this.userProfile.set(profile);
        
        // Update form values if modal is not open (to avoid overwriting user edits)
        if (!this.isModalOpen()) {
          this.profileForm.patchValue({
            name: profile.name || ''
          });
          
          if (profile.avatar) {
            this.avatarPreview.set(profile.avatar);
          }
        }
        
        this.cdr.markForCheck();
      }
    });
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }
  
  private initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      avatar: ['']
    });
  }
  
  private async loadUserProfile(): Promise<void> {
    try {
      console.log('UserProfileComponent: Loading user profile...');
      const profile = await this.userService.getUserProfile();
      console.log('UserProfileComponent: Profile loaded:', profile);
      
      this.userProfile.set(profile);
      
      if (profile) {
        this.profileForm.patchValue({
          name: profile.name || ''
        });
        
        if (profile.avatar) {
          this.avatarPreview.set(profile.avatar);
          console.log('UserProfileComponent: Avatar preview set');
        }
      }
      
      // Ensure UI updates
      this.cdr.detectChanges();
    } catch (error) {
      console.error('UserProfileComponent: Error loading profile:', error);
    }
  }
  
  openModal(): void {
    this.isModalOpen.set(true);
  }
  
  closeModal(): void {
    this.isModalOpen.set(false);
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.avatarPreview.set(result);
        this.profileForm.patchValue({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  }
  
  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      return;
    }
    
    this.isSubmitting.set(true);
    
    try {
      const formValues = this.profileForm.value;
      const updatedProfile = await this.userService.saveUserProfile({
        name: formValues.name,
        avatar: formValues.avatar || this.userProfile()?.avatar
      });
      
      this.userProfile.set(updatedProfile);
      this.closeModal();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
  
  get nameControl() {
    return this.profileForm.get('name');
  }
  
  get hasNameError(): boolean {
    return this.nameControl?.invalid && (this.nameControl?.dirty || this.nameControl?.touched) || false;
  }
  
  get nameErrorMessage(): string {
    if (this.nameControl?.errors?.['required']) {
      return 'profile.validation.nameRequired';
    }
    if (this.nameControl?.errors?.['minlength']) {
      return 'profile.validation.nameMinLength';
    }
    if (this.nameControl?.errors?.['maxlength']) {
      return 'profile.validation.nameMaxLength';
    }
    return '';
  }
}
