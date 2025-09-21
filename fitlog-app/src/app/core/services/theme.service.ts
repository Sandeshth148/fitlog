import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'fitlog.theme';

/**
 * Service for managing application theming
 * 
 * Handles theme switching between light/dark modes and persists user preference
 * using localStorage. Integrates with the document's data-theme attribute.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSignal = signal<Theme>('light');

  constructor() {
    this.init();
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  init(): void {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Use saved theme or system preference
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
    
    // Listen for system theme changes if no user preference is set
    if (!savedTheme) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        });
    }
  }

  /**
   * Get the current theme
   */
  getTheme(): Theme {
    return this.themeSignal();
  }

  /**
   * Set theme and update DOM and localStorage
   */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}
