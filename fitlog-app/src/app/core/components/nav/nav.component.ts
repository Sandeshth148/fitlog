import { Component, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent, ThemeSelectorComponent, TranslatePipe, UserProfileComponent],
  template: `
    <nav class="app-nav">
      <div class="app-nav-container">
        <div class="app-nav-logo">
          <a routerLink="/">FitLog</a>
        </div>
        
        <!-- Mobile menu toggle button -->
        <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" aria-label="Toggle menu">
          <span class="menu-bar"></span>
          <span class="menu-bar"></span>
          <span class="menu-bar"></span>
        </button>
        
        <!-- Navigation links and controls -->
        <div class="app-nav-links" [class.mobile-open]="mobileMenuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">{{ 'nav.home' | translate }}</a>
          <a routerLink="/trends" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.trends' | translate }}</a>
          
          <div class="nav-controls">
            <app-theme-selector></app-theme-selector>
            <app-language-switcher></app-language-switcher>
            <button class="profile-button" (click)="openProfile()" [attr.aria-label]="'nav.profile' | translate">
              <div class="avatar-container" *ngIf="userProfile && userProfile.avatarUrl">
                <img [src]="userProfile.avatarUrl" alt="User avatar" class="user-avatar" />
              </div>
              <div class="avatar-placeholder" *ngIf="!userProfile || !userProfile.avatarUrl">
                {{ getProfileInitials() }}
              </div>
            </button>
          </div>
        </div>
        
        <!-- Overlay for mobile menu -->
        <div class="mobile-menu-overlay" *ngIf="mobileMenuOpen" (click)="closeMobileMenu()"></div>
      </div>
    </nav>
    
    <!-- User Profile Modal -->
    <app-user-profile #userProfileModal></app-user-profile>
  `,
  styles: [`
    .app-nav {
      background-color: var(--color-primary);
      color: white;
      padding: 0.75rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 100;
    }
    
    .app-nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 auto;
      padding: 0 1rem;
      max-width: 1200px;
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
    
    /* Mobile menu toggle button */
    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      height: 21px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      z-index: 10;
    }
    
    .menu-bar {
      width: 100%;
      height: 3px;
      background-color: white;
      border-radius: 3px;
      transition: all 0.3s ease-in-out;
    }
    
    /* Mobile menu overlay */
    .mobile-menu-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 90;
    }
    
    .app-nav-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      
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
      
      .profile-button {
        background: none;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255, 255, 255, 0.7);
        transition: transform 0.2s, border-color 0.2s;
        
        &:hover {
          transform: scale(1.05);
          border-color: white;
        }
      }
      
      .avatar-container {
        width: 100%;
        height: 100%;
      }
      
      .user-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-primary-dark);
        color: white;
        font-weight: bold;
        font-size: 14px;
      }
    }
    
    /* Responsive styles */
    @media (max-width: 768px) {
      .mobile-menu-toggle {
        display: flex;
      }
      
      .app-nav-links {
        position: fixed;
        top: 0;
        right: -250px;
        width: 250px;
        height: 100vh;
        background-color: var(--color-primary-dark);
        flex-direction: column;
        padding: 5rem 1.5rem 1.5rem;
        transition: right 0.3s ease;
        z-index: 95;
        gap: 2rem;
        overflow-y: auto;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      }
      
      .app-nav-links.mobile-open {
        right: 0;
      }
      
      .mobile-menu-overlay {
        display: block;
      }
      
      .app-nav-links a {
        font-size: 1.1rem;
        padding: 0.5rem 0;
      }
      
      .nav-controls {
        flex-direction: column;
        width: 100%;
        margin-top: 1rem;
      }
    }
    
    /* Small mobile devices */
    @media (max-width: 480px) {
      .app-nav-container {
        padding: 0 0.75rem;
      }
      
      .app-nav-logo a {
        font-size: 1.25rem;
      }
    }
  `]
})
export class NavComponent {
  mobileMenuOpen = false;
  userProfile: UserProfile | null = null;
  
  @ViewChild('userProfileModal') userProfileModal!: UserProfileComponent;
  
  constructor(private userService: UserService) {
    this.loadUserProfile();
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    // Prevent scrolling when mobile menu is open
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  
  closeMobileMenu(): void {
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  }
  
  @HostListener('window:resize')
  onResize(): void {
    // Close mobile menu on window resize (e.g., orientation change)
    if (window.innerWidth > 768 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
  
  async loadUserProfile(): Promise<void> {
    try {
      this.userProfile = await this.userService.getUserProfile();
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }
  
  openProfile(): void {
    if (this.userProfileModal) {
      this.userProfileModal.open();
    }
  }
  
  getProfileInitials(): string {
    if (!this.userProfile || !this.userProfile.displayName) {
      return '👤';
    }
    
    return this.userProfile.displayName
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
