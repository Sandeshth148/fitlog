import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent, ThemeSelectorComponent, TranslatePipe],
  template: `
    <nav class="app-nav">
      <div class="app-nav-container">
        <div class="app-nav-logo">
          <a routerLink="/">FitLog</a>
        </div>
        
        <div class="app-nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">{{ 'nav.home' | translate }}</a>
          <a routerLink="/trends" routerLinkActive="active">{{ 'nav.trends' | translate }}</a>
          
          <div class="nav-controls">
            <app-theme-selector></app-theme-selector>
            <app-language-switcher></app-language-switcher>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .app-nav {
      background-color: var(--color-primary);
      color: white;
      padding: 0.75rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .app-nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .app-nav-logo a {
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: -0.025em;
      transition: opacity 0.2s;
    }

    .app-nav-logo a:hover {
      opacity: 0.9;
    }
    .app-nav-links {
      display: flex;
      gap: 1.5rem;
      
      a {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        font-weight: 500;
        padding: 0.25rem 0;
        position: relative;
        transition: color 0.2s ease;
        
        &:hover {
          color: white;
        }
        
        &.active {
          color: white;
          
          &:after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: white;
            border-radius: 2px;
          }
        }
      }

      .nav-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .theme-toggle-btn {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 6px;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .theme-toggle-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  `]
})
export class NavComponent {}
