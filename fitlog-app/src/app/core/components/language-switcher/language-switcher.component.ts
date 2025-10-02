import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <button class="language-btn" (click)="toggleDropdown()">
        <span class="current-flag">{{ getCurrentLanguage().flag }}</span>
        <span class="current-name">{{ getCurrentLanguage().name }}</span>
        <span class="dropdown-arrow" [class.open]="isOpen">▼</span>
      </button>
      
      <div class="language-dropdown" [class.open]="isOpen">
        <button 
          *ngFor="let language of supportedLanguages" 
          class="language-option"
          [class.active]="language.code === currentLanguageCode"
          (click)="selectLanguage(language.code)">
          <span class="flag">{{ language.flag }}</span>
          <span class="name">{{ language.name }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .language-switcher {
      position: relative;
    }
    
    .language-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    
    .language-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .current-flag {
      font-size: 1rem;
    }
    
    .current-name {
      font-weight: 500;
    }
    
    .dropdown-arrow {
      font-size: 0.75rem;
      transition: transform 0.2s ease;
    }
    
    .dropdown-arrow.open {
      transform: rotate(180deg);
    }
    
    .language-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      min-width: 150px;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
    }
    
    .language-dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .language-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      color: var(--color-text);
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s ease;
    }
    
    .language-option:hover {
      background-color: var(--color-bg-offset);
    }
    
    .language-option.active {
      background-color: var(--color-primary);
      color: white;
    }
    
    .language-option:first-child {
      border-radius: 8px 8px 0 0;
    }
    
    .language-option:last-child {
      border-radius: 0 0 8px 8px;
    }
    
    .flag {
      font-size: 1rem;
    }
    
    .name {
      font-weight: 500;
    }
    
    @media (max-width: 640px) {
      .current-name {
        display: none;
      }
      
      .language-btn {
        padding: 0.5rem;
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  isOpen = false;
  currentLanguageCode: string;
  supportedLanguages: Language[];

  constructor(private translationService: TranslationService) {
    this.supportedLanguages = this.translationService.supportedLanguages;
    this.currentLanguageCode = this.translationService.getCurrentLanguageCode();
    
    this.translationService.currentLanguage.subscribe(lang => {
      this.currentLanguageCode = lang;
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(languageCode: string) {
    this.translationService.setLanguage(languageCode);
    this.isOpen = false;
  }

  getCurrentLanguage(): Language {
    return this.supportedLanguages.find(lang => lang.code === this.currentLanguageCode) || this.supportedLanguages[0];
  }
}
