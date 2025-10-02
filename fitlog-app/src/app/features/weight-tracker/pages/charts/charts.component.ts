import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeightChartComponent } from '../../components/weight-chart/weight-chart.component';
import { BmiChartComponent } from '../../components/bmi-chart/bmi-chart.component';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, WeightChartComponent, BmiChartComponent],
  template: `
    <div class="charts-container">
      <h2>Health Trends</h2>
      <p class="charts-intro">
        Track your progress and visualize your fitness journey over time.
      </p>
      
      <app-weight-chart></app-weight-chart>
      <app-bmi-chart></app-bmi-chart>
    </div>
  `,
  styles: [`
    .charts-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h2 {
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }
    
    .charts-intro {
      color: var(--color-text-secondary);
      margin-bottom: 2rem;
    }
  `]
})
export class ChartsComponent {
  constructor() {}
}
