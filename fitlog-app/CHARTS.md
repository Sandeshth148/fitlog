# FitLog Charts Implementation

This document details the implementation of interactive charts in FitLog for visualizing weight trends, BMI changes, and ideal weight comparisons over time.

## Table of Contents

- [Overview](#overview)
- [Library Selection](#library-selection)
- [Implementation](#implementation)
- [Chart Types](#chart-types)
- [Features](#features)
- [Accessibility](#accessibility)
- [Performance Considerations](#performance-considerations)
- [Code Examples](#code-examples)

## Overview

FitLog uses interactive charts to visualize a user's weight journey over time. The charts display:

- Weight trends over time
- BMI calculation and visualization
- Ideal weight range comparison
- Interactive data points with detailed information

## Library Selection

After evaluating several charting libraries, we selected **Chart.js** for the following reasons:

1. **Popularity & Industry Adoption**: Chart.js is one of the most widely used charting libraries in the industry, appearing in numerous job descriptions and production applications.

2. **Angular Integration**: Excellent integration with Angular through the ngx-charts or ng2-charts wrapper libraries.

3. **Responsive Design**: Built-in responsiveness for various screen sizes, essential for our PWA.

4. **Accessibility**: Strong accessibility features including ARIA attributes and keyboard navigation.

5. **Performance**: Optimized rendering using HTML5 Canvas with minimal overhead.

6. **Customization**: Extensive customization options for colors, animations, tooltips, and interactions.

7. **Active Maintenance**: Regular updates and a large community for support.

8. **Bundle Size**: Relatively small bundle size with modular imports available.

### Alternatives Considered

- **D3.js**: More powerful but steeper learning curve and larger bundle size
- **Highcharts**: Excellent features but requires commercial licensing
- **ApexCharts**: Good option but larger bundle size than Chart.js
- **ECharts**: Powerful but more complex API

## Implementation

### Integration with Angular

We use the ng2-charts library to integrate Chart.js with Angular:

```bash
npm install chart.js ng2-charts
```

### Component Structure

- **WeightChartComponent**: Standalone component for displaying weight trends
- **BmiChartComponent**: Specialized chart for BMI visualization
- **ChartService**: Service for data processing and chart configuration

### Data Flow

1. **Data Retrieval**: The chart components retrieve data from the StorageService
2. **Data Processing**: Data is processed and formatted for the charts
3. **Chart Rendering**: Charts are rendered with appropriate configurations
4. **Interactivity**: User interactions trigger updates and display detailed information

## Chart Types

### 1. Weight Trend Line Chart

A line chart showing weight measurements over time with the following features:

- X-axis: Date timeline (restricted to 5 years)
- Y-axis: Weight in kg/lbs (user preference)
- Interactive data points showing exact measurements
- Option to toggle between different time ranges (1 month, 3 months, 6 months, 1 year, all)

### 2. BMI Chart

A combination chart showing BMI changes over time:

- Line representing the user's calculated BMI
- Color-coded background zones for BMI categories:
  - Underweight: < 18.5
  - Normal weight: 18.5 - 24.9
  - Overweight: 25 - 29.9
  - Obesity: ≥ 30
- Tooltips showing BMI value and category

### 3. Weight Comparison Chart

A chart comparing actual weight with ideal weight range:

- Line representing actual weight
- Shaded area representing ideal weight range based on height and age
- Option to display different ideal weight calculation methods (BMI-based, HAMWI formula, etc.)

## Features

### Interactive Elements

- **Tooltips**: Detailed information on hover
- **Zoom**: Ability to zoom in on specific time periods
- **Pan**: Navigate through the timeline
- **Click Events**: Show detailed entry information when clicking data points

### Customization Options

- **Theme Integration**: Charts adapt to the app's light/dark theme
- **Color Schemes**: Customizable color schemes for different chart elements
- **Unit Toggle**: Switch between metric (kg, cm) and imperial (lbs, inches) units

### Export Options

- **Image Export**: Save charts as PNG/JPEG
- **Data Export**: Export data as CSV/JSON

## Accessibility

The chart implementation follows WCAG 2.1 guidelines:

- **Screen Reader Support**: ARIA labels for chart elements
- **Keyboard Navigation**: Navigate between data points using keyboard
- **Focus Indicators**: Visible focus states for interactive elements
- **Alternative Text**: Text summaries of chart data
- **Color Contrast**: Sufficient contrast for all chart elements

## Performance Considerations

To ensure optimal performance, especially on mobile devices:

1. **Lazy Loading**: Charts are loaded only when needed
2. **Data Sampling**: Large datasets are sampled for smoother rendering
3. **Debounced Updates**: Chart updates are debounced to prevent excessive re-renders
4. **Canvas Rendering**: Using Canvas instead of SVG for better performance with large datasets
5. **Virtualization**: Only visible data points are rendered for large datasets

## Code Examples

### Basic Chart Component

```typescript
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { StorageService } from '../../../core/services/storage.service';
import { WeightEntry } from '../../models/weight-entry.model';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-weight-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="chart-container">
      <canvas baseChart
        [type]="'line'"
        [data]="chartData"
        [options]="chartOptions"
        [plugins]="chartPlugins">
      </canvas>
    </div>
  `,
  styleUrls: ['./weight-chart.component.scss']
})
export class WeightChartComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  public chartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Weight',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
        fill: 'origin',
      }
    ],
    labels: []
  };
  
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        position: 'left',
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      }
    },
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };
  
  constructor(
    private storageService: StorageService,
    private themeService: ThemeService
  ) {}
  
  async ngOnInit() {
    // Load entries from storage
    const entries = await this.storageService.getAllEntries();
    this.processChartData(entries);
    
    // Update chart theme when app theme changes
    this.themeService.theme$.subscribe(theme => {
      this.updateChartTheme(theme);
    });
  }
  
  private processChartData(entries: WeightEntry[]) {
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Extract data for chart
    this.chartData.labels = sortedEntries.map(entry => entry.date);
    this.chartData.datasets[0].data = sortedEntries.map(entry => entry.weightKg);
    
    // Update chart
    this.chart?.update();
  }
  
  private updateChartTheme(isDark: boolean) {
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    if (this.chartOptions && this.chartOptions.scales) {
      // Update axis colors
      Object.values(this.chartOptions.scales).forEach(scale => {
        if (scale.ticks) {
          scale.ticks.color = textColor;
        }
        if (scale.grid) {
          scale.grid.color = gridColor;
        }
        if (scale.title) {
          scale.title.color = textColor;
        }
      });
    }
    
    if (this.chartOptions && this.chartOptions.plugins && this.chartOptions.plugins.legend) {
      this.chartOptions.plugins.legend.labels = { 
        color: textColor 
      };
    }
    
    this.chart?.update();
  }
}
```

### BMI Calculation Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class BmiService {
  
  /**
   * Calculate BMI based on weight (kg) and height (cm)
   */
  calculateBmi(weightKg: number, heightCm: number): number {
    // Convert height from cm to meters
    const heightM = heightCm / 100;
    // BMI formula: weight (kg) / height² (m)
    return weightKg / (heightM * heightM);
  }
  
  /**
   * Get BMI category based on BMI value
   */
  getBmiCategory(bmi: number): string {
    if (bmi < 18.5) {
      return 'Underweight';
    } else if (bmi < 25) {
      return 'Normal weight';
    } else if (bmi < 30) {
      return 'Overweight';
    } else {
      return 'Obesity';
    }
  }
  
  /**
   * Calculate ideal weight range based on height (cm)
   * Returns range for normal BMI (18.5-24.9)
   */
  getIdealWeightRange(heightCm: number): { min: number, max: number } {
    const heightM = heightCm / 100;
    return {
      min: 18.5 * (heightM * heightM),
      max: 24.9 * (heightM * heightM)
    };
  }
}
```

### Chart Service for Data Processing

```typescript
@Injectable({
  providedIn: 'root'
})
export class ChartService {
  constructor(
    private storageService: StorageService,
    private bmiService: BmiService
  ) {}
  
  /**
   * Get processed data for weight trend chart
   */
  async getWeightChartData(timeRange: number = 365): Promise<ChartData> {
    // Get all entries
    const entries = await this.storageService.getAllEntries();
    
    // Filter entries by date range (today to X days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    const filteredEntries = entries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );
    
    // Sort by date
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Format data for chart
    return {
      labels: sortedEntries.map(entry => entry.date),
      datasets: [
        {
          label: 'Weight',
          data: sortedEntries.map(entry => entry.weightKg),
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          fill: true
        }
      ]
    };
  }
  
  /**
   * Get processed data for BMI chart
   */
  async getBmiChartData(heightCm: number): Promise<ChartData> {
    // Get all entries
    const entries = await this.storageService.getAllEntries();
    
    // Calculate BMI for each entry
    const entriesWithBmi = entries.map(entry => ({
      ...entry,
      bmi: this.bmiService.calculateBmi(entry.weightKg, heightCm)
    }));
    
    // Sort by date
    const sortedEntries = [...entriesWithBmi].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Format data for chart
    return {
      labels: sortedEntries.map(entry => entry.date),
      datasets: [
        {
          label: 'BMI',
          data: sortedEntries.map(entry => entry.bmi),
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'transparent',
          fill: false
        }
      ]
    };
  }
}
```

## Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [ng2-charts GitHub Repository](https://github.com/valor-software/ng2-charts)
- [BMI Calculation Reference](https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm)
- [Ideal Weight Calculation Methods](https://www.calculator.net/ideal-weight-calculator.html)
