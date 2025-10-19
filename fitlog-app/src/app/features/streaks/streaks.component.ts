import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as StreakActions from './store/streaks.actions';
import * as StreakSelectors from './store/streaks.selectors';

@Component({
  selector: 'app-streaks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="streaks-container">
      <div class="streaks-header">
        <h1>🔥 Streaks</h1>
        <p class="subtitle">Track your consistency and earn badges!</p>
      </div>

      <div class="streak-display">
        <div class="streak-card">
          <div class="fire-icon">🔥</div>
          <h2>Current Streak</h2>
          <div class="streak-number">{{ currentStreak$ | async }} days</div>
          <p class="last-checkin">Last check-in: {{ lastCheckIn$ | async | date:'short' }}</p>
        </div>

        <div class="streak-card">
          <div class="trophy-icon">🏆</div>
          <h2>Longest Streak</h2>
          <div class="streak-number">{{ longestStreak$ | async }} days</div>
          <p class="subtitle-text">Your personal best!</p>
        </div>

        <div class="streak-card">
          <div class="freeze-icon">❄️</div>
          <h2>Freezes Available</h2>
          <div class="streak-number">{{ freezesAvailable$ | async }}</div>
          <p class="subtitle-text">Use when you miss a day</p>
        </div>
      </div>

      <div class="streak-actions">
        <button class="action-btn primary" (click)="incrementStreak()">
          ✅ Log Today's Weight
        </button>
        <button class="action-btn secondary" (click)="useFreeze()" [disabled]="(freezesAvailable$ | async) === 0">
          ❄️ Use Freeze
        </button>
      </div>

      <div class="ngrx-info">
        <h3>🎓 NGRX State Management Active!</h3>
        <p>Open Redux DevTools to see actions and state</p>
        <div class="loading-state" *ngIf="loading$ | async">
          <div class="spinner"></div>
          <span>Loading streaks...</span>
        </div>
      </div>

      <div class="info-cards">
        <div class="info-card">
          <div class="card-icon">📅</div>
          <h3>Daily Logging</h3>
          <p>Track your weight daily to maintain your streak</p>
        </div>
        <div class="info-card">
          <div class="card-icon">🏆</div>
          <h3>Earn Badges</h3>
          <p>Unlock achievements for consistency</p>
        </div>
        <div class="info-card">
          <div class="card-icon">📊</div>
          <h3>View Progress</h3>
          <p>See your streak history in a heatmap</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .streaks-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .streaks-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .streaks-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: var(--color-text-primary);
    }

    .subtitle {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
    }

    .streak-display {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .streak-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      color: white;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .streak-card:hover {
      transform: translateY(-4px);
    }

    .fire-icon, .trophy-icon, .freeze-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    .streak-card h2 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }

    .streak-number {
      font-size: 3rem;
      font-weight: bold;
      margin: 1rem 0;
    }

    .last-checkin, .subtitle-text {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .streak-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 1rem 2rem;
      font-size: 1.1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .action-btn.secondary {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border: 2px solid #667eea;
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ngrx-info {
      background: var(--color-surface);
      border-left: 4px solid #667eea;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 3rem;
    }

    .ngrx-info h3 {
      margin-bottom: 0.5rem;
      color: var(--color-text-primary);
    }

    .ngrx-info p {
      color: var(--color-text-secondary);
    }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      color: #667eea;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .info-card {
      background: var(--color-surface);
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .info-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .info-card h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
      color: var(--color-text-primary);
    }

    .info-card p {
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .streaks-container {
        padding: 1rem;
      }

      .streaks-header h1 {
        font-size: 2rem;
      }

      .mfe-placeholder {
        padding: 3rem 1.5rem;
      }

      .fire-icon {
        font-size: 4rem;
      }

      .placeholder-content h2 {
        font-size: 1.5rem;
      }

      .info-cards {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class StreaksComponent implements OnInit {
  // Observables from NGRX store
  currentStreak$: Observable<number>;
  longestStreak$: Observable<number>;
  freezesAvailable$: Observable<number>;
  lastCheckIn$: Observable<Date | undefined>;
  loading$: Observable<boolean>;

  constructor(private store: Store) {
    // Select data from store
    this.currentStreak$ = this.store.select(StreakSelectors.selectCurrentStreakCount);
    this.longestStreak$ = this.store.select(StreakSelectors.selectLongestStreak);
    this.freezesAvailable$ = this.store.select(StreakSelectors.selectFreezesAvailable);
    this.lastCheckIn$ = this.store.select(StreakSelectors.selectLastCheckIn);
    this.loading$ = this.store.select(StreakSelectors.selectStreaksLoading);
  }

  ngOnInit(): void {
    // Load streaks when component initializes
    this.store.dispatch(StreakActions.loadStreaks());
  }

  incrementStreak(): void {
    // Dispatch action to increment streak
    this.store.dispatch(StreakActions.incrementStreak({ streakId: '1' }));
  }

  useFreeze(): void {
    // Dispatch action to use a freeze
    this.store.dispatch(StreakActions.useFreeze({ streakId: '1' }));
  }
}
