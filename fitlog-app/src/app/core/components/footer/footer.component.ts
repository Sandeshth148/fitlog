import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <p class="copyright">
          © {{ currentYear }} FitLog. All rights reserved.
        </p>
        <p class="tagline">
          Track your fitness journey, one entry at a time.
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: var(--color-bg-offset);
      border-top: 1px solid var(--color-border);
      padding: 2rem 1rem;
      margin-top: auto;
    }
    
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    
    .copyright {
      margin: 0 0 0.5rem 0;
      color: var(--color-text);
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .tagline {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      font-style: italic;
    }
    
    @media (max-width: 640px) {
      .app-footer {
        padding: 1.5rem 1rem;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
