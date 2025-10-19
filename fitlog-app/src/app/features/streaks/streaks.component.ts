import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

      <div class="mfe-placeholder">
        <div class="placeholder-content">
          <div class="fire-icon">🔥</div>
          <h2>Streaks Micro Frontend</h2>
          <p>This is a placeholder. The Streaks MFE will load here!</p>
          <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Setting up Micro Frontend...</p>
          </div>
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

    .mfe-placeholder {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 4rem 2rem;
      margin-bottom: 3rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .placeholder-content {
      text-align: center;
      color: white;
    }

    .fire-icon {
      font-size: 5rem;
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

    .placeholder-content h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .placeholder-content p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .loading-indicator {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
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
export class StreaksComponent {}
