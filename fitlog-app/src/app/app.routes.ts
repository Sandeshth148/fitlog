import { Routes } from '@angular/router';
import { HeightSetupGuard } from './core/guards/height-setup.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/weight-tracker/pages/home/home.component').then(
        (m) => m.HomeComponent
      ),
    canActivate: [HeightSetupGuard]
  },
  {
    path: 'charts',
    loadComponent: () =>
      import('./features/weight-tracker/pages/charts/charts.component').then(
        (m) => m.ChartsComponent
      ),
    canActivate: [HeightSetupGuard]
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/weight-tracker/pages/setup/setup.component').then(
        (m) => m.SetupComponent
      )
  },
  {
    // Fallback route
    path: '**',
    redirectTo: ''
  }
];
