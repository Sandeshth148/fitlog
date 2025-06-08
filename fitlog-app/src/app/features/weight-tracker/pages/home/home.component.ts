import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  /**
   * feature: Manual Theming with CSS Variables + Theme Toggle
    Steps Recap:

    Created themes.scss with :root {} and [data-theme="dark"] blocks.

    Applied color variables in styles.scss using var(--color-xyz).

    Used a <button> in HomeComponent to toggle themes.

    The toggle method updated document.documentElement.dataset.theme.

    🧠 What It Does:

    We used CSS variables for theming because they’re lightweight, runtime-adjustable, and don’t need recompilation. The data-theme attribute switches between light and dark themes, and CSS updates dynamically.

    🎯 Design Principle:

    Separation of Style and Logic — no Angular bindings or JS DOM manipulation is needed for color changes.
   */
  toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }
}
