import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isModalOpen = signal(false);
  avatarPreview = signal<string | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isSubmitting = signal(false);
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
  }
  
  private initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      avatar: ['']
    });
  }
  
  private async loadUserProfile(): Promise<void> {
    const profile = await this.userService.getUserProfile();
    this.userProfile.set(profile);
    
    if (profile) {
      this.profileForm.patchValue({
        name: profile.name || ''
      });
      
      if (profile.avatar) {
        this.avatarPreview.set(profile.avatar);
      }
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
      return 'Name is required';
    }
    if (this.nameControl?.errors?.['minlength']) {
      return 'Name must be at least 2 characters';
    }
    if (this.nameControl?.errors?.['maxlength']) {
      return 'Name cannot exceed 50 characters';
    }
    return '';
  }
}
