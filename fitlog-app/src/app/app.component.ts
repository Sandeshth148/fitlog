import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { registerChartComponents } from './core/config/chart-config';
import { NavComponent } from './core/components/nav/nav.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { PwaInstallComponent } from './core/components/pwa-install/pwa-install.component';
import { ToastComponent } from './core/components/toast/toast.component';
import { ToastService } from './core/services/toast.service';
import { StorageService } from './core/services/storage.service';
import { StreakCalculatorService } from './features/streaks/services/streak-calculator.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent, FooterComponent, PwaInstallComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fitlog-app';
  
  constructor(
    private toastService: ToastService,
    private storageService: StorageService,
    private streakCalculator: StreakCalculatorService
  ) {}
  
  async ngOnInit() {
    // Register Chart.js components
    registerChartComponents();
    
    // Show daily streak toast (once per session)
    await this.showDailyStreakToast();
  }

  /**
   * Show streak toast once when app loads (any page)
   */
  private async showDailyStreakToast(): Promise<void> {
    // Check if already shown today
    const lastShown = localStorage.getItem('streakToastLastShown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      return; // Already shown today
    }

    // Calculate streak
    const entries = await this.storageService.getAllEntries();
    
    // Only show if user has entries
    if (entries.length === 0) {
      return;
    }

    const result = this.streakCalculator.calculateStreak(entries);
    
    // Only show if there's an active streak
    if (result.currentStreak > 0) {
      setTimeout(() => {
        const isNewRecord = result.currentStreak === result.longestStreak && result.currentStreak > 1;
        this.toastService.streak(result.currentStreak, isNewRecord);
        
        // Mark as shown today
        localStorage.setItem('streakToastLastShown', today);
      }, 1500); // Show after 1.5s (after page loads)
    }
  }
}
