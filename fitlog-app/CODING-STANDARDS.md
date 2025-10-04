# FitLog Coding Standards & Best Practices

## Overview
This document outlines the coding standards, architectural patterns, and best practices for the FitLog project. Following these guidelines ensures consistency, maintainability, and scalability.

---

## 🎨 **Styling Standards**

### SCSS/CSS Guidelines
```scss
// ✅ Good: Use CSS custom properties for theming
:root {
  --color-primary: #3b82f6;
  --color-bg: #ffffff;
  --color-text: #1f2937;
}

[data-theme="dark"] {
  --color-bg: #1f2937;
  --color-text: #f9fafb;
}

// ✅ Good: BEM-like naming convention
.component-name {
  &__element {
    &--modifier {
      // styles
    }
  }
}

// ❌ Avoid: Hardcoded colors
.button {
  background-color: #3b82f6; // Bad
  background-color: var(--color-primary); // Good
}
```

### Global Theming Strategy
```scss
// themes.scss - Central theme definitions
:root {
  // Light theme (default)
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-bg: #ffffff;
  --color-bg-offset: #f8fafc;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  // Spacing scale
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  // Typography scale
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
}

[data-theme="dark"] {
  --color-bg: #1f2937;
  --color-bg-offset: #374151;
  --color-text: #f9fafb;
  --color-text-muted: #d1d5db;
  --color-border: #4b5563;
}
```

### CSS Class-Based Styling
```scss
// ✅ Utility classes for common patterns
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &--primary {
    background-color: var(--color-primary);
    color: white;
    
    &:hover {
      background-color: var(--color-primary-hover);
    }
  }
  
  &--secondary {
    background-color: var(--color-bg-offset);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
  
  &--sm { padding: var(--spacing-xs) var(--spacing-sm); }
  &--lg { padding: var(--spacing-md) var(--spacing-lg); }
}

// ✅ Layout utilities
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
```

---

## 📝 **Documentation Standards**

### JSDoc Comments
```typescript
/**
 * Service for managing user authentication and session state
 * 
 * @example
 * ```typescript
 * constructor(private auth: AuthService) {}
 * 
 * async login() {
 *   const result = await this.auth.signIn(email, password);
 *   if (result.success) {
 *     this.router.navigate(['/dashboard']);
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 * @author FitLog Team
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  
  /**
   * Authenticates user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password (min 8 characters)
   * @returns Promise resolving to authentication result
   * 
   * @throws {ValidationError} When email format is invalid
   * @throws {AuthError} When credentials are incorrect
   * 
   * @example
   * ```typescript
   * const result = await authService.signIn('user@example.com', 'password123');
   * console.log(result.user.name); // "John Doe"
   * ```
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    // Implementation
  }
}
```

### Code Comments Best Practices
```typescript
export class WeightTrackerComponent {
  
  // ✅ Good: Explain WHY, not WHAT
  // Using BehaviorSubject to maintain current weight state across components
  // and provide immediate value to late subscribers
  private currentWeight$ = new BehaviorSubject<number>(0);
  
  // ✅ Good: Document complex business logic
  calculateBMI(weight: number, height: number): number {
    // BMI formula: weight (kg) / height (m)²
    // Height is stored in cm, so convert to meters first
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }
  
  // ❌ Avoid: Obvious comments
  // Set the weight value
  setWeight(weight: number) { // Bad comment
    this.weight = weight;
  }
}
```

---

## 📋 **Reactive Forms Standards**

### Form Builder Patterns
```typescript
/**
 * Weight entry form component using reactive forms with comprehensive validation
 * 
 * Features:
 * - Real-time validation with custom validators
 * - Dynamic form arrays for multiple entries
 * - Cross-field validation (date cannot be in future)
 * - Accessibility support with ARIA labels
 */
@Component({
  selector: 'app-weight-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class WeightEntryFormComponent implements OnInit {
  
  /**
   * Main form group containing all weight entry fields
   * Uses FormBuilder for type safety and validation
   */
  weightForm: FormGroup;
  
  /**
   * Form array for handling multiple weight measurements in a single entry
   * Useful for tracking morning/evening weights
   */
  measurementsArray: FormArray;
  
  constructor(
    private fb: FormBuilder,
    private weightService: WeightService
  ) {
    this.initializeForm();
  }
  
  /**
   * Initializes the reactive form with validation rules
   * 
   * Validation Rules:
   * - Weight: Required, min 1kg, max 500kg
   * - Date: Required, cannot be in future
   * - Notes: Optional, max 500 characters
   * - Measurements: At least one measurement required
   */
  private initializeForm(): void {
    this.weightForm = this.fb.group({
      // Basic weight entry fields
      weight: [
        '', 
        [
          Validators.required,
          Validators.min(1),
          Validators.max(500),
          this.decimalValidator // Custom validator
        ]
      ],
      
      // Date with custom validator to prevent future dates
      date: [
        new Date().toISOString().split('T')[0],
        [
          Validators.required,
          this.futureDateValidator // Custom validator
        ]
      ],
      
      // Optional notes with character limit
      notes: [
        '',
        [Validators.maxLength(500)]
      ],
      
      // Nested form group for user preferences
      preferences: this.fb.group({
        unit: ['kg', Validators.required],
        visibility: ['private', Validators.required],
        notifications: [true]
      }),
      
      // Form array for multiple measurements
      measurements: this.fb.array([
        this.createMeasurementGroup() // Start with one measurement
      ], [this.minArrayLengthValidator(1)]) // Custom array validator
    });
    
    // Store reference to measurements array for easier access
    this.measurementsArray = this.weightForm.get('measurements') as FormArray;
  }
  
  /**
   * Creates a new measurement form group
   * Used for adding multiple weight measurements
   * 
   * @returns FormGroup with time and weight fields
   */
  private createMeasurementGroup(): FormGroup {
    return this.fb.group({
      time: [
        '09:00',
        [Validators.required, this.timeFormatValidator]
      ],
      weight: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(500)
        ]
      ],
      type: [
        'morning',
        [Validators.required]
      ]
    });
  }
  
  /**
   * Adds a new measurement to the form array
   * Demonstrates dynamic form manipulation
   */
  addMeasurement(): void {
    this.measurementsArray.push(this.createMeasurementGroup());
  }
  
  /**
   * Removes measurement at specified index
   * Includes validation to prevent removing last measurement
   * 
   * @param index - Index of measurement to remove
   */
  removeMeasurement(index: number): void {
    if (this.measurementsArray.length > 1) {
      this.measurementsArray.removeAt(index);
    }
  }
  
  // ===== CUSTOM VALIDATORS =====
  
  /**
   * Custom validator for decimal numbers
   * Ensures weight has maximum 1 decimal place
   * 
   * @param control - Form control to validate
   * @returns Validation error object or null if valid
   */
  private decimalValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const value = control.value.toString();
    const decimalPlaces = value.split('.')[1]?.length || 0;
    
    return decimalPlaces > 1 
      ? { invalidDecimal: { maxDecimals: 1, actual: decimalPlaces } }
      : null;
  }
  
  /**
   * Custom validator to prevent future dates
   * Business rule: Cannot log weight for future dates
   * 
   * @param control - Form control containing date
   * @returns Validation error or null
   */
  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    return selectedDate > today 
      ? { futureDate: { selectedDate: control.value, maxDate: today.toISOString().split('T')[0] } }
      : null;
  }
  
  /**
   * Custom validator for form arrays minimum length
   * Ensures at least specified number of items in array
   * 
   * @param minLength - Minimum required array length
   * @returns Validator function
   */
  private minArrayLengthValidator(minLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const array = control as FormArray;
      return array.length < minLength 
        ? { minArrayLength: { required: minLength, actual: array.length } }
        : null;
    };
  }
  
  /**
   * Validates time format (HH:MM)
   * 
   * @param control - Form control with time value
   * @returns Validation error or null
   */
  private timeFormatValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(control.value) 
      ? null 
      : { invalidTimeFormat: { pattern: 'HH:MM', actual: control.value } };
  }
  
  // ===== FORM SUBMISSION =====
  
  /**
   * Handles form submission with comprehensive validation
   * Demonstrates error handling and user feedback
   */
  async onSubmit(): Promise<void> {
    if (this.weightForm.valid) {
      try {
        const formData = this.weightForm.value;
        
        // Transform form data for API
        const weightEntry: WeightEntry = {
          ...formData,
          measurements: formData.measurements.map((m: any) => ({
            ...m,
            timestamp: new Date(`${formData.date}T${m.time}`)
          }))
        };
        
        await this.weightService.saveEntry(weightEntry);
        
        // Reset form after successful submission
        this.weightForm.reset();
        this.initializeForm(); // Reinitialize with default values
        
      } catch (error) {
        console.error('Failed to save weight entry:', error);
        // Handle error (show toast, etc.)
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.weightForm);
    }
  }
  
  /**
   * Recursively marks all form controls as touched
   * Used to display validation errors on submit attempt
   * 
   * @param formGroup - Form group to mark as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }
  
  // ===== HELPER METHODS =====
  
  /**
   * Gets error message for a specific form field
   * Centralizes error message logic for consistency
   * 
   * @param fieldName - Name of the form field
   * @param arrayIndex - Optional index for form array fields
   * @returns Human-readable error message
   */
  getFieldError(fieldName: string, arrayIndex?: number): string {
    let control: AbstractControl | null;
    
    if (arrayIndex !== undefined) {
      control = this.measurementsArray.at(arrayIndex).get(fieldName);
    } else {
      control = this.weightForm.get(fieldName);
    }
    
    if (!control?.errors || !control.touched) return '';
    
    const errors = control.errors;
    
    // Return first error message found
    if (errors['required']) return `${fieldName} is required`;
    if (errors['min']) return `${fieldName} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${fieldName} cannot exceed ${errors['max'].max}`;
    if (errors['maxlength']) return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['futureDate']) return 'Date cannot be in the future';
    if (errors['invalidDecimal']) return 'Weight can have maximum 1 decimal place';
    if (errors['invalidTimeFormat']) return 'Time must be in HH:MM format';
    
    return 'Invalid value';
  }
  
  /**
   * Checks if a specific field has validation errors and is touched
   * Used in template for conditional error styling
   * 
   * @param fieldName - Name of the form field
   * @param arrayIndex - Optional index for form array fields
   * @returns True if field has errors and is touched
   */
  hasFieldError(fieldName: string, arrayIndex?: number): boolean {
    let control: AbstractControl | null;
    
    if (arrayIndex !== undefined) {
      control = this.measurementsArray.at(arrayIndex).get(fieldName);
    } else {
      control = this.weightForm.get(fieldName);
    }
    
    return !!(control?.errors && control.touched);
  }
}
```

---

## 🚀 **Angular 20+ Syntax Standards**

### Control Flow Syntax
```typescript
// ✅ Use new @if, @for, @switch syntax
@Component({
  template: `
    <!-- Conditional rendering -->
    @if (user.isAuthenticated) {
      <div class="user-dashboard">
        <h2>Welcome, {{ user.name }}!</h2>
        
        <!-- Iterating over collections -->
        @for (entry of weightEntries; track entry.id) {
          <div class="entry-card">
            <span>{{ entry.date | date }}</span>
            <span>{{ entry.weight }} kg</span>
            
            <!-- Nested conditions -->
            @if (entry.notes) {
              <p class="notes">{{ entry.notes }}</p>
            }
          </div>
        } @empty {
          <div class="empty-state">
            <p>No weight entries yet.</p>
            <button (click)="addFirstEntry()">Add Entry</button>
          </div>
        }
      </div>
    } @else {
      <app-login-form></app-login-form>
    }
    
    <!-- Switch statements -->
    @switch (user.theme) {
      @case ('light') {
        <div class="theme-light">Light theme active</div>
      }
      @case ('dark') {
        <div class="theme-dark">Dark theme active</div>
      }
      @case ('system') {
        <div class="theme-system">Following system preference</div>
      }
      @default {
        <div class="theme-default">Default theme</div>
      }
    }
  `
})
```

### Signals and Modern Reactivity
```typescript
/**
 * Modern Angular component using signals for state management
 * Demonstrates reactive patterns with computed values and effects
 */
@Component({
  selector: 'app-weight-dashboard',
  standalone: true
})
export class WeightDashboardComponent {
  
  // ✅ Use signals for reactive state
  private weightEntries = signal<WeightEntry[]>([]);
  private selectedTimeRange = signal<TimeRange>('1M');
  
  // ✅ Computed signals for derived state
  protected filteredEntries = computed(() => {
    const entries = this.weightEntries();
    const range = this.selectedTimeRange();
    return this.filterEntriesByTimeRange(entries, range);
  });
  
  protected averageWeight = computed(() => {
    const entries = this.filteredEntries();
    if (entries.length === 0) return 0;
    
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    return total / entries.length;
  });
  
  protected weightTrend = computed(() => {
    const entries = this.filteredEntries();
    if (entries.length < 2) return 'stable';
    
    const first = entries[0].weight;
    const last = entries[entries.length - 1].weight;
    
    return last > first ? 'increasing' : 'decreasing';
  });
  
  constructor() {
    // ✅ Use effects for side effects
    effect(() => {
      const trend = this.weightTrend();
      console.log(`Weight trend: ${trend}`);
      
      // Update analytics or notifications based on trend
      this.updateTrendAnalytics(trend);
    });
  }
}
```

---

## 🔧 **Reusable Components & Styles**

### Component Architecture
```typescript
/**
 * Base button component demonstrating reusability patterns
 * Supports multiple variants, sizes, and states
 */
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      [class]="buttonClasses()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      (click)="handleClick($event)">
      
      @if (loading()) {
        <span class="btn__spinner" aria-hidden="true"></span>
      }
      
      @if (icon() && !loading()) {
        <span class="btn__icon" [innerHTML]="icon()"></span>
      }
      
      <span class="btn__text">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  
  // ✅ Input signals for reactive props
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  icon = input<string>('');
  ariaLabel = input<string>('');
  
  // ✅ Output for events
  clicked = output<MouseEvent>();
  
  /**
   * Computed CSS classes based on component state
   * Demonstrates dynamic class generation
   */
  protected buttonClasses = computed(() => {
    const classes = ['btn'];
    
    classes.push(`btn--${this.variant()}`);
    classes.push(`btn--${this.size()}`);
    
    if (this.loading()) classes.push('btn--loading');
    if (this.disabled()) classes.push('btn--disabled');
    
    return classes.join(' ');
  });
  
  /**
   * Handles button click events with loading state management
   * 
   * @param event - Mouse click event
   */
  protected handleClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      return;
    }
    
    this.clicked.emit(event);
  }
}
```

### Reusable SCSS Mixins
```scss
// _mixins.scss - Reusable style patterns

/**
 * Button mixin for consistent button styling
 * @param $bg-color - Background color
 * @param $text-color - Text color
 * @param $hover-bg - Hover background color
 */
@mixin button-variant($bg-color, $text-color, $hover-bg) {
  background-color: $bg-color;
  color: $text-color;
  border: 1px solid $bg-color;
  
  &:hover:not(:disabled) {
    background-color: $hover-bg;
    border-color: $hover-bg;
  }
  
  &:focus {
    outline: 2px solid #{$bg-color}40; // 40 = 25% opacity
    outline-offset: 2px;
  }
}

/**
 * Card component mixin for consistent card styling
 */
@mixin card-base {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
}

/**
 * Responsive breakpoint mixin
 * @param $breakpoint - Breakpoint name (sm, md, lg, xl)
 */
@mixin responsive($breakpoint) {
  @if $breakpoint == sm {
    @media (min-width: 640px) { @content; }
  }
  @if $breakpoint == md {
    @media (min-width: 768px) { @content; }
  }
  @if $breakpoint == lg {
    @media (min-width: 1024px) { @content; }
  }
  @if $breakpoint == xl {
    @media (min-width: 1280px) { @content; }
  }
}

// Usage examples:
.btn {
  // Base button styles
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &--primary {
    @include button-variant(
      var(--color-primary),
      white,
      var(--color-primary-hover)
    );
  }
  
  &--secondary {
    @include button-variant(
      var(--color-bg-offset),
      var(--color-text),
      var(--color-border)
    );
  }
}

.card {
  @include card-base;
  
  @include responsive(md) {
    padding: var(--spacing-xl);
  }
}
```

---

## 📊 **Performance & Best Practices**

### Change Detection Strategy
```typescript
// ✅ Use OnPush for better performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ... other config
})
export class OptimizedComponent {
  
  // ✅ Use trackBy functions for *ngFor
  trackByEntryId(index: number, entry: WeightEntry): string {
    return entry.id;
  }
  
  // ✅ Use async pipe for observables
  entries$ = this.weightService.getEntries();
}
```

### Lazy Loading & Code Splitting
```typescript
// ✅ Feature module lazy loading
const routes: Routes = [
  {
    path: 'trends',
    loadComponent: () => import('./features/trends/trends.component')
      .then(m => m.TrendsComponent)
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes')
      .then(m => m.SETTINGS_ROUTES)
  }
];
```

---

## 🧪 **Testing Standards**

### Component Testing
```typescript
/**
 * Comprehensive component test demonstrating best practices
 */
describe('WeightEntryFormComponent', () => {
  let component: WeightEntryFormComponent;
  let fixture: ComponentFixture<WeightEntryFormComponent>;
  let mockWeightService: jasmine.SpyObj<WeightService>;
  
  beforeEach(async () => {
    const spy = jasmine.createSpyObj('WeightService', ['saveEntry']);
    
    await TestBed.configureTestingModule({
      imports: [WeightEntryFormComponent, ReactiveFormsModule],
      providers: [
        { provide: WeightService, useValue: spy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(WeightEntryFormComponent);
    component = fixture.componentInstance;
    mockWeightService = TestBed.inject(WeightService) as jasmine.SpyObj<WeightService>;
  });
  
  describe('Form Validation', () => {
    it('should require weight field', () => {
      const weightControl = component.weightForm.get('weight');
      
      weightControl?.setValue('');
      expect(weightControl?.hasError('required')).toBeTruthy();
      
      weightControl?.setValue('70.5');
      expect(weightControl?.hasError('required')).toBeFalsy();
    });
    
    it('should validate future dates', () => {
      const dateControl = component.weightForm.get('date');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      dateControl?.setValue(futureDate.toISOString().split('T')[0]);
      expect(dateControl?.hasError('futureDate')).toBeTruthy();
    });
  });
});
```

---

## 📋 **Code Review Checklist**

### Before Submitting PR
- [ ] All components use standalone architecture
- [ ] CSS uses custom properties for theming
- [ ] Forms use reactive forms with proper validation
- [ ] Components have comprehensive JSDoc comments
- [ ] New @if/@for syntax used instead of *ngIf/*ngFor
- [ ] Signals used for reactive state management
- [ ] Proper error handling implemented
- [ ] Accessibility attributes added (ARIA labels, roles)
- [ ] Unit tests written for new functionality
- [ ] Performance considerations addressed (OnPush, trackBy)

---

*Last Updated: January 4, 2025*
*Version: 1.0.0*
