import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="app-nav">
      <div class="app-nav-container">
        <div class="app-nav-logo">
          <a routerLink="/">FitLog</a>
        </div>
        
        <div class="app-nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/trends" routerLinkActive="active">Trends</a>
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .app-nav-logo a {
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      text-decoration: none;
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
    }
  `]
})
export class NavComponent {}
