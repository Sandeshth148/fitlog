# FitLog Date Restrictions Implementation

This document details the implementation of date restrictions in FitLog, ensuring users can only enter weight data within a reasonable time range (today to 5 years ago).

## Table of Contents

- [Overview](#overview)
- [Date Range Restrictions](#date-range-restrictions)
- [Implementation](#implementation)
- [UI Components](#ui-components)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

## Overview

FitLog implements date restrictions to ensure data integrity and provide a reasonable time frame for weight tracking. The key restrictions are:

1. **Maximum Date**: Users cannot enter weight data for future dates (beyond today)
2. **Minimum Date**: Users cannot enter weight data older than 5 years from the current date
3. **Visual Indicators**: The date input provides visual cues about valid date ranges
4. **Validation**: Both client-side and service-level validation ensure date restrictions are enforced

## Date Range Restrictions

### Maximum Date (Today)

- Users cannot select or enter dates in the future
- The maximum selectable date is dynamically set to the current date
- Attempts to enter future dates are prevented through input validation

### Minimum Date (5 Years Ago)

- Users cannot select or enter dates older than 5 years from the current date
- The minimum selectable date is dynamically calculated
- Historical data beyond this range is considered less relevant for current tracking

## Implementation

### Date Range Calculation

```typescript
/**
 * Calculate the minimum allowed date (5 years ago from today)
 */
function getMinDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 5);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

/**
 * Get today's date as string in YYYY-MM-DD format
 */
function getMaxDate(): string {
  return new Date().toISOString().split('T')[0];
}
```

### Date Validation Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class DateValidationService {
  
  /**
   * Check if a date is within the allowed range (5 years ago to today)
   */
  isDateInAllowedRange(dateStr: string): boolean {
    const inputDate = new Date(dateStr);
    
    // Calculate minimum date (5 years ago)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 5);
    
    // Get maximum date (today)
    const maxDate = new Date();
    maxDate.setHours(23, 59, 59, 999); // End of today
    
    // Check if date is within range
    return inputDate >= minDate && inputDate <= maxDate;
  }
  
  /**
   * Get the minimum allowed date string (YYYY-MM-DD)
   */
  getMinDateString(): string {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 5);
    return minDate.toISOString().split('T')[0];
  }
  
  /**
   * Get the maximum allowed date string (YYYY-MM-DD)
   */
  getMaxDateString(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  /**
   * Custom validator for reactive forms
   */
  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Empty values are handled by required validator
      }
      
      if (!this.isDateInAllowedRange(control.value)) {
        return { dateRange: true };
      }
      
      return null;
    };
  }
}
```

## UI Components

### Enhanced Date Input

```typescript
@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="date-input-container">
      <label [for]="id">{{ label }}</label>
      <div class="input-wrapper">
        <input
          [id]="id"
          type="date"
          [formControl]="dateControl"
          [min]="minDate"
          [max]="maxDate"
          [attr.aria-invalid]="dateControl.invalid && dateControl.touched"
          [attr.aria-describedby]="id + '-error'"
        >
        <div class="date-range-indicator">
          <span class="date-range-text">{{ minDate }} to {{ maxDate }}</span>
        </div>
      </div>
      <div 
        *ngIf="dateControl.invalid && dateControl.touched"
        [id]="id + '-error'"
        class="validation-error"
      >
        <span *ngIf="dateControl.errors?.['required']">
          Date is required.
        </span>
        <span *ngIf="dateControl.errors?.['dateRange']">
          Date must be between {{ formatDate(minDate) }} and {{ formatDate(maxDate) }}.
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements OnInit {
  @Input() label: string = 'Date';
  @Input() id: string = 'date-input';
  @Input() dateControl!: FormControl;
  
  minDate: string;
  maxDate: string;
  
  constructor(private dateValidationService: DateValidationService) {
    this.minDate = this.dateValidationService.getMinDateString();
    this.maxDate = this.dateValidationService.getMaxDateString();
  }
  
  ngOnInit() {
    // If no validators are set, add the date range validator
    if (!this.dateControl.validator) {
      this.dateControl.setValidators([
        Validators.required,
        this.dateValidationService.dateRangeValidator()
      ]);
    }
  }
  
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }
}
```

### Updated Entry Form Component

```typescript
// In EntryFormComponent
constructor(
  private fb: FormBuilder,
  private dateValidationService: DateValidationService
) {
  // Get today's date in YYYY-MM-DD format
  const today = this.dateValidationService.getMaxDateString();
  
  this.entryForm = this.fb.group({
    date: [
      today, 
      [
        Validators.required, 
        this.dateValidationService.dateRangeValidator()
      ]
    ],
    weight: ['', [Validators.required, Validators.min(0.1)]],
    units: ['kg'],
    time: [''],
    notes: ['']
  });
}
```

## Validation

### Client-side Validation

1. **HTML5 Validation**:
   - Using `min` and `max` attributes on date inputs
   - Prevents most invalid date selections in modern browsers

2. **Angular Reactive Form Validation**:
   - Custom validator function checks date range
   - Provides detailed error messages
   - Prevents form submission with invalid dates

3. **UI Feedback**:
   - Visual indicators show valid date range
   - Error messages explain restrictions
   - Invalid inputs are highlighted

### Service-level Validation

```typescript
// In StorageService
async addEntry(entry: Partial<WeightEntry>): Promise<WeightEntry> {
  // Validate date range
  if (!this.dateValidationService.isDateInAllowedRange(entry.date)) {
    throw new Error('Date is outside the allowed range (5 years ago to today)');
  }
  
  // Continue with adding entry...
}
```

## Error Handling

### Form Error Handling

```typescript
// In EntryFormComponent
onSubmit() {
  if (this.entryForm.invalid) {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.entryForm.controls).forEach(key => {
      const control = this.entryForm.get(key);
      control?.markAsTouched();
    });
    
    // Focus first invalid element
    const invalidElement = document.querySelector('[aria-invalid="true"]');
    if (invalidElement instanceof HTMLElement) {
      invalidElement.focus();
    }
    
    return;
  }
  
  // Continue with form submission...
}
```

### Service Error Handling

```typescript
// In HomeComponent
async saveEntry(entry: Partial<WeightEntry>) {
  try {
    const savedEntry = await this.storageService.addEntry(entry);
    this.entries = await this.storageService.getAllEntries();
    this.showSuccessMessage('Entry saved successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Date is outside')) {
      this.showErrorMessage('Please enter a date between 5 years ago and today');
    } else {
      this.showErrorMessage('Failed to save entry');
      console.error('Error saving entry:', error);
    }
  }
}
```

## Code Examples

### Date Range Directive

```typescript
@Directive({
  selector: '[appDateRange]',
  standalone: true
})
export class DateRangeDirective implements OnInit {
  @Input() appDateRange: boolean = true;
  
  private minDate: string;
  private maxDate: string;
  
  constructor(
    private el: ElementRef<HTMLInputElement>,
    private dateValidationService: DateValidationService
  ) {
    this.minDate = this.dateValidationService.getMinDateString();
    this.maxDate = this.dateValidationService.getMaxDateString();
  }
  
  ngOnInit() {
    if (this.appDateRange && this.el.nativeElement.type === 'date') {
      // Set min and max attributes
      this.el.nativeElement.min = this.minDate;
      this.el.nativeElement.max = this.maxDate;
      
      // Add event listener to validate on change
      this.el.nativeElement.addEventListener('change', () => {
        this.validateDate();
      });
      
      // Initial validation
      this.validateDate();
    }
  }
  
  private validateDate() {
    const value = this.el.nativeElement.value;
    
    if (value) {
      const isValid = this.dateValidationService.isDateInAllowedRange(value);
      
      if (!isValid) {
        this.el.nativeElement.setCustomValidity('Date must be between 5 years ago and today');
      } else {
        this.el.nativeElement.setCustomValidity('');
      }
    }
  }
}
```

### Date Range Pipe

```typescript
@Pipe({
  name: 'dateRangeCheck',
  standalone: true
})
export class DateRangeCheckPipe implements PipeTransform {
  constructor(private dateValidationService: DateValidationService) {}
  
  transform(dateStr: string): boolean {
    return this.dateValidationService.isDateInAllowedRange(dateStr);
  }
}
```

### Chart Date Range Filter

```typescript
// In ChartService
async getFilteredEntries(timeRange: number = 5 * 365): Promise<WeightEntry[]> {
  // Get all entries
  const allEntries = await this.storageService.getAllEntries();
  
  // Calculate cutoff date (default: 5 years ago)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeRange);
  
  // Filter entries by date range
  const filteredEntries = allEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate && entryDate <= new Date();
  });
  
  // Sort by date
  return filteredEntries.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
```

## Resources

- [HTML5 Date Input Specification](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date)
- [Angular Reactive Forms Validation](https://angular.io/guide/form-validation)
- [Date Handling Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
