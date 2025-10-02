# FitLog BMI Tracking Implementation

This document details the implementation of height tracking, BMI calculation, and ideal weight range features in FitLog.

## Table of Contents

- [Overview](#overview)
- [User Flow](#user-flow)
- [Data Model](#data-model)
- [BMI Calculation](#bmi-calculation)
- [Ideal Weight Calculation](#ideal-weight-calculation)
- [UI Components](#ui-components)
- [Storage Implementation](#storage-implementation)
- [Unit Conversion](#unit-conversion)
- [Code Examples](#code-examples)

## Overview

FitLog implements BMI (Body Mass Index) tracking to provide users with a more comprehensive view of their health metrics. The implementation includes:

1. **Height Tracking**: One-time height input with unit options (cm/inches)
2. **BMI Calculation**: Automatic BMI calculation based on height and weight entries
3. **BMI Classification**: Categorization of BMI values (underweight, normal, overweight, obese)
4. **Ideal Weight Range**: Calculation of ideal weight range based on height
5. **Visual Representation**: Display of BMI and ideal weight in charts and entry lists

## User Flow

1. **First-time Setup**:
   - User is prompted to enter their height during first app use
   - Height can be entered in centimeters or inches
   - Height is stored in the user profile

2. **Weight Entry**:
   - User enters weight as usual
   - BMI is automatically calculated using the stored height
   - BMI category is determined and displayed

3. **Entry Display**:
   - Weight entries in the list show BMI alongside weight
   - Color coding indicates BMI category
   - Trend charts display BMI changes over time

4. **Profile Management**:
   - User can update height from profile settings
   - All BMI values are recalculated when height is updated

## Data Model

### User Profile

```typescript
interface UserProfile {
  id: string;
  heightCm: number;       // Height stored in cm for consistency
  preferredUnits: {
    height: 'cm' | 'in';  // User's preferred height unit
    weight: 'kg' | 'lb';  // User's preferred weight unit
  };
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
}
```

### Extended Weight Entry

```typescript
interface WeightEntry {
  id: string;
  date: string;           // ISO date string (YYYY-MM-DD)
  weightKg: number;       // Weight in kg (canonical unit)
  bmi?: number;           // Calculated BMI value
  notes?: string;
  time?: string;          // Time of day (optional)
  createdAt: string;      // ISO date string
  updatedAt?: string;     // ISO date string
}
```

## BMI Calculation

BMI is calculated using the standard formula:

```
BMI = weight(kg) / height(m)²
```

The implementation handles unit conversions internally:

```typescript
/**
 * Calculate BMI from weight in kg and height in cm
 */
function calculateBmi(weightKg: number, heightCm: number): number {
  // Convert height from cm to meters
  const heightM = heightCm / 100;
  
  // Calculate BMI
  const bmi = weightKg / (heightM * heightM);
  
  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
}
```

## BMI Classification

BMI values are classified according to the WHO international classification:

| BMI Range | Classification |
|-----------|----------------|
| < 18.5    | Underweight    |
| 18.5-24.9 | Normal weight  |
| 25.0-29.9 | Overweight     |
| 30.0-34.9 | Obesity class I |
| 35.0-39.9 | Obesity class II |
| ≥ 40.0    | Obesity class III |

```typescript
/**
 * Get BMI classification category
 */
function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) {
    return 'Underweight';
  } else if (bmi < 25) {
    return 'Normal weight';
  } else if (bmi < 30) {
    return 'Overweight';
  } else if (bmi < 35) {
    return 'Obesity class I';
  } else if (bmi < 40) {
    return 'Obesity class II';
  } else {
    return 'Obesity class III';
  }
}
```

## Ideal Weight Calculation

Several formulas are used to calculate ideal weight ranges:

### 1. BMI-based Ideal Weight

```typescript
/**
 * Calculate ideal weight range based on height and normal BMI range (18.5-24.9)
 */
function getIdealWeightRange(heightCm: number): { min: number, max: number } {
  const heightM = heightCm / 100;
  return {
    min: 18.5 * (heightM * heightM),
    max: 24.9 * (heightM * heightM)
  };
}
```

### 2. Alternative Formulas (Optional)

#### Hamwi Formula

```typescript
/**
 * Calculate ideal weight using Hamwi formula
 * Men: 48.0 kg + 2.7 kg per inch over 5 feet
 * Women: 45.5 kg + 2.2 kg per inch over 5 feet
 */
function getIdealWeightHamwi(heightCm: number, isMale: boolean): number {
  // Convert height to inches
  const heightInches = heightCm / 2.54;
  
  // Calculate inches over 5 feet
  const inchesOver5Feet = Math.max(0, heightInches - 60);
  
  // Calculate ideal weight
  if (isMale) {
    return 48.0 + (2.7 * inchesOver5Feet);
  } else {
    return 45.5 + (2.2 * inchesOver5Feet);
  }
}
```

## UI Components

### Height Input Component

```typescript
@Component({
  selector: 'app-height-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="height-input-container">
      <h2>Enter Your Height</h2>
      <p>We'll use this to calculate your BMI and ideal weight range.</p>
      
      <form [formGroup]="heightForm" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="height">Height</label>
          <div class="input-group">
            <input 
              id="height" 
              type="number" 
              formControlName="height" 
              [placeholder]="selectedUnit === 'cm' ? '175' : '69'"
              step="0.1"
              min="0"
              [attr.aria-invalid]="heightForm.get('height')?.invalid && heightForm.get('height')?.touched"
            >
            <div class="unit-selector">
              <button 
                type="button" 
                [class.active]="selectedUnit === 'cm'"
                (click)="setUnit('cm')"
              >cm</button>
              <button 
                type="button" 
                [class.active]="selectedUnit === 'in'"
                (click)="setUnit('in')"
              >in</button>
            </div>
          </div>
          <div class="validation-error" *ngIf="heightForm.get('height')?.invalid && heightForm.get('height')?.touched">
            Please enter a valid height.
          </div>
        </div>
        
        <button type="submit" [disabled]="heightForm.invalid" class="primary-button">
          Save Height
        </button>
      </form>
    </div>
  `,
  styleUrls: ['./height-input.component.scss']
})
export class HeightInputComponent implements OnInit {
  heightForm: FormGroup;
  selectedUnit: 'cm' | 'in' = 'cm';
  
  @Output() heightSaved = new EventEmitter<number>(); // Height in cm
  
  constructor(private fb: FormBuilder, private userService: UserService) {
    this.heightForm = this.fb.group({
      height: ['', [Validators.required, Validators.min(1)]]
    });
  }
  
  ngOnInit() {
    // Load user preferences
    this.userService.getUserProfile().then(profile => {
      if (profile?.preferredUnits?.height) {
        this.selectedUnit = profile.preferredUnits.height;
      }
    });
  }
  
  setUnit(unit: 'cm' | 'in') {
    // Convert current value when changing units
    const currentValue = this.heightForm.get('height')?.value;
    if (currentValue) {
      if (unit === 'cm' && this.selectedUnit === 'in') {
        // Convert inches to cm
        this.heightForm.get('height')?.setValue(Math.round(currentValue * 2.54 * 10) / 10);
      } else if (unit === 'in' && this.selectedUnit === 'cm') {
        // Convert cm to inches
        this.heightForm.get('height')?.setValue(Math.round(currentValue / 2.54 * 10) / 10);
      }
    }
    
    this.selectedUnit = unit;
  }
  
  onSubmit() {
    if (this.heightForm.valid) {
      const heightValue = this.heightForm.get('height')?.value;
      
      // Convert to cm if needed
      const heightCm = this.selectedUnit === 'in' 
        ? heightValue * 2.54 
        : heightValue;
      
      // Save to user profile
      this.userService.updateUserHeight(heightCm, this.selectedUnit);
      
      // Emit event
      this.heightSaved.emit(heightCm);
    }
  }
}
```

### BMI Display Component

```typescript
@Component({
  selector: 'app-bmi-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bmi-display" [ngClass]="getBmiCategoryClass()">
      <div class="bmi-value">
        <span class="label">BMI</span>
        <span class="value">{{ bmi.toFixed(1) }}</span>
      </div>
      <div class="bmi-category">{{ getBmiCategory() }}</div>
      <div class="ideal-weight" *ngIf="showIdealWeight">
        <span class="label">Ideal Weight Range</span>
        <span class="value">{{ idealWeightMin.toFixed(1) }} - {{ idealWeightMax.toFixed(1) }} kg</span>
      </div>
    </div>
  `,
  styleUrls: ['./bmi-display.component.scss']
})
export class BmiDisplayComponent implements OnInit {
  @Input() bmi: number = 0;
  @Input() heightCm: number = 0;
  @Input() showIdealWeight: boolean = false;
  
  idealWeightMin: number = 0;
  idealWeightMax: number = 0;
  
  constructor(private bmiService: BmiService) {}
  
  ngOnInit() {
    if (this.heightCm > 0 && this.showIdealWeight) {
      const idealRange = this.bmiService.getIdealWeightRange(this.heightCm);
      this.idealWeightMin = idealRange.min;
      this.idealWeightMax = idealRange.max;
    }
  }
  
  getBmiCategory(): string {
    return this.bmiService.getBmiCategory(this.bmi);
  }
  
  getBmiCategoryClass(): string {
    if (this.bmi < 18.5) {
      return 'underweight';
    } else if (this.bmi < 25) {
      return 'normal';
    } else if (this.bmi < 30) {
      return 'overweight';
    } else {
      return 'obese';
    }
  }
}
```

## Storage Implementation

### User Profile Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY = 'fitlog-user-profile';
  
  constructor() {}
  
  /**
   * Get user profile from storage
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const profileJson = localStorage.getItem(this.STORAGE_KEY);
    return profileJson ? JSON.parse(profileJson) : null;
  }
  
  /**
   * Create or update user profile
   */
  async saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile();
    
    const updatedProfile: UserProfile = {
      id: existingProfile?.id || crypto.randomUUID(),
      heightCm: profile.heightCm || existingProfile?.heightCm || 0,
      preferredUnits: {
        height: profile.preferredUnits?.height || existingProfile?.preferredUnits?.height || 'cm',
        weight: profile.preferredUnits?.weight || existingProfile?.preferredUnits?.weight || 'kg'
      },
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  }
  
  /**
   * Update user height
   */
  async updateUserHeight(heightCm: number, preferredUnit: 'cm' | 'in'): Promise<UserProfile> {
    return this.saveUserProfile({
      heightCm,
      preferredUnits: {
        height: preferredUnit
      }
    });
  }
  
  /**
   * Check if user has completed initial setup
   */
  async isProfileComplete(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return !!profile && profile.heightCm > 0;
  }
}
```

### Extended Storage Service

```typescript
// Add to existing StorageService
async addEntryWithBmi(entry: Partial<WeightEntry>): Promise<WeightEntry> {
  // Get user height
  const profile = await this.userService.getUserProfile();
  const heightCm = profile?.heightCm || 0;
  
  // Calculate BMI if height is available
  let bmi: number | undefined;
  if (heightCm > 0 && entry.weightKg) {
    bmi = this.bmiService.calculateBmi(entry.weightKg, heightCm);
  }
  
  // Create entry with BMI
  const completeEntry = WeightEntryUtils.createEntry({
    ...entry,
    bmi
  });
  
  // Save to storage
  return this.addEntry(completeEntry);
}

// Update all entries with BMI when height changes
async recalculateAllBmi(heightCm: number): Promise<void> {
  const entries = await this.getAllEntries();
  
  for (const entry of entries) {
    entry.bmi = this.bmiService.calculateBmi(entry.weightKg, heightCm);
    await this.updateEntry(entry);
  }
}
```

## Unit Conversion

```typescript
/**
 * Convert height between cm and inches
 */
function convertHeight(value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number {
  if (from === to) return value;
  
  if (from === 'cm' && to === 'in') {
    // cm to inches
    return value / 2.54;
  } else {
    // inches to cm
    return value * 2.54;
  }
}

/**
 * Convert weight between kg and pounds
 */
function convertWeight(value: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number {
  if (from === to) return value;
  
  if (from === 'kg' && to === 'lb') {
    // kg to pounds
    return value * 2.20462;
  } else {
    // pounds to kg
    return value / 2.20462;
  }
}
```

## Code Examples

### Height Setup Guard

```typescript
@Injectable({
  providedIn: 'root'
})
export class HeightSetupGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}
  
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const isProfileComplete = await this.userService.isProfileComplete();
    
    if (!isProfileComplete) {
      // Redirect to height setup page
      return this.router.parseUrl('/setup');
    }
    
    return true;
  }
}
```

### Setup Component

```typescript
@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, HeightInputComponent],
  template: `
    <div class="setup-container">
      <h1>Welcome to FitLog</h1>
      <p>Let's set up your profile to get started.</p>
      
      <app-height-input (heightSaved)="onHeightSaved($event)"></app-height-input>
    </div>
  `,
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent {
  constructor(private router: Router) {}
  
  onHeightSaved(heightCm: number) {
    // Navigate to home page after height is saved
    this.router.navigate(['/']);
  }
}
```

### Enhanced Entry List Component

```typescript
// Add to existing EntryListComponent
ngOnInit() {
  this.userService.getUserProfile().then(profile => {
    this.userHeight = profile?.heightCm || 0;
    this.hasHeight = this.userHeight > 0;
  });
}

// Add to template
<li *ngFor="let entry of entries; trackBy: trackById" class="entry-item">
  <div class="entry-details">
    <span class="entry-date">{{ entry.date | date: 'mediumDate' }}</span>
    <span class="entry-weight">{{ entry.weightKg.toFixed(1) }} kg</span>
    
    <div class="entry-bmi" *ngIf="hasHeight && entry.bmi">
      <span class="bmi-value" [ngClass]="getBmiClass(entry.bmi)">
        BMI: {{ entry.bmi.toFixed(1) }}
      </span>
    </div>
    
    <span class="entry-notes" *ngIf="entry.notes">{{ entry.notes }}</span>
  </div>
  <!-- ... rest of the component ... -->
</li>

// Add method for BMI styling
getBmiClass(bmi: number): string {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}
```

## Resources

- [WHO BMI Classification](https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight)
- [NIH BMI Calculator](https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm)
- [Ideal Weight Calculation Methods](https://www.calculator.net/ideal-weight-calculator.html)
