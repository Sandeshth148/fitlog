import { Chart, registerables } from 'chart.js';

/**
 * Register all Chart.js components
 * This needs to be called once before using Chart.js
 */
export function registerChartComponents(): void {
  // Register all Chart.js components (Line, Bar, etc.)
  Chart.register(...registerables);
}
