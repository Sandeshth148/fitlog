import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeightInputComponent } from '../../components/height-input/height-input.component';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, HeightInputComponent],
  template: `
    <div class="setup-container">
      <div class="setup-content">
        <h1>Welcome to FitLog</h1>
        <p class="setup-intro">
          Let's set up your profile to get started tracking your weight and health metrics.
        </p>
        
        <app-height-input (heightSaved)="onHeightSaved($event)"></app-height-input>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background-color: var(--color-bg);
    }
    
    .setup-content {
      width: 100%;
      max-width: 500px;
    }
    
    h1 {
      color: var(--color-primary);
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .setup-intro {
      text-align: center;
      margin-bottom: 2rem;
      color: var(--color-text-secondary);
    }
  `]
})
export class SetupComponent {
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}
  
  async onHeightSaved(heightCm: number) {
    try {
      // Recalculate BMI for all existing entries
      await this.storageService.recalculateAllBmi(heightCm);
      
      // Navigate to home page
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during setup completion:', error);
    }
  }
}
