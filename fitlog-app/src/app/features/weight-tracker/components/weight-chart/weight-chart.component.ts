import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { ChartService } from '../../services/chart.service';
import { DateValidationService } from '../../../../core/services/date-validation.service';

@Component({
  selector: 'app-weight-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <h3>Weight Trend</h3>
      
      <div class="chart-controls">
        <button 
          *ngFor="let range of timeRanges" 
          [class.active]="selectedRange === range.days"
          (click)="setTimeRange(range.days)">
          {{ range.label }}
        </button>
      </div>
      
      <div class="chart-wrapper">
        <canvas #chartCanvas></canvas>
      </div>
      
      <div class="chart-empty" *ngIf="!hasData">
        <p>No weight data available for the selected time range.</p>
        <p>Add some weight entries to see your trend!</p>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background-color: var(--color-bg);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--color-border);
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--color-text);
      font-size: 1.25rem;
    }
    
    .chart-controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      
      button {
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        border: 1px solid var(--color-border);
        background-color: var(--color-bg);
        color: var(--color-text);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: var(--color-bg-offset);
        }
        
        &.active {
          background-color: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
      }
    }
    
    .chart-wrapper {
      height: 300px;
      position: relative;
    }
    
    .chart-empty {
      text-align: center;
      padding: 2rem 0;
      color: var(--color-text-secondary);
      
      p {
        margin: 0.5rem 0;
      }
    }
  `]
})
export class WeightChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  
  timeRanges = [
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
    { label: 'All', days: 5 * 365 } // 5 years max
  ];
  
  selectedRange = 90; // Default to 3 months
  hasData = false;
  
  chartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };
  
  constructor(
    private chartService: ChartService,
    private dateValidationService: DateValidationService
  ) {}
  
  async ngOnInit() {
    // We'll load data after view init
  }
  
  async ngAfterViewInit() {
    await this.loadChartData();
  }
  
  async setTimeRange(days: number) {
    this.selectedRange = days;
    await this.loadChartData();
  }
  
  private async loadChartData() {
    try {
      const chartData = await this.chartService.getWeightChartData(this.selectedRange);
      this.hasData = chartData.labels.length > 0;
      
      if (!this.hasData) {
        return;
      }
      
      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }
      
      // Create new chart
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: chartData,
        options: this.chartOptions
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
      this.hasData = false;
    }
  }
}
