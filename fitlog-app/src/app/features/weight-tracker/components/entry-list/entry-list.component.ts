import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeightEntry } from '../../models/weight-entry.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BmiDisplayComponent } from '../bmi-display/bmi-display.component';
import { UserService } from '../../../../core/services/user.service';
import { BmiService } from '../../../../core/services/bmi.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-entry-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BmiDisplayComponent, TranslatePipe],
  template: `
    <div class="entry-list-container">
      @if (entries.length > 0) {
        <h3>{{ 'home.recentEntries' | translate }}</h3>
        <ul class="entry-list">
          @for (entry of entries; track entry.id) {
            <li class="entry-item">
              <div class="entry-details">
                <div class="entry-date-time">
                  <span class="entry-date">{{ entry.date | date: 'mediumDate' }}</span>
                  @if (entry.time) {
                    <span class="entry-time">{{ entry.time }}</span>
                  }
                </div>
                <span class="entry-weight" [attr.data-unit]="entry.units || 'kg'">
                  {{ entry.weightKg.toFixed(1) }}
                </span>
                
                @if (hasHeight && entry.bmi && showBmi) {
                  <div class="entry-bmi">
                    <app-bmi-display 
                      [bmi]="entry.bmi" 
                      [heightCm]="userHeight"
                      [showIdealWeight]="false">
                    </app-bmi-display>
                  </div>
                }
                
                @if (entry.notes) {
                  <span class="entry-notes">{{ entry.notes }}</span>
                }
              </div>
              <div class="entry-actions">
                <app-button (clicked)="entryEdited.emit(entry)" variant="ghost" size="sm">
                  {{ 'form.edit' | translate }}
                </app-button>
                <app-button (clicked)="entryDeleted.emit(entry.id)" variant="ghost" size="sm" class="delete-btn">
                  {{ 'form.delete' | translate }}
                </app-button>
              </div>
            </li>
          }
        </ul>
      } @else {
        <div class="no-entries-placeholder">
          <p>{{ 'home.noEntries' | translate }}</p>
          <p>{{ 'home.getStarted' | translate }}</p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./entry-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryListComponent implements OnInit, OnDestroy {
  @Input() entries: WeightEntry[] = [];
  @Output() entryEdited = new EventEmitter<WeightEntry>();
  @Output() entryDeleted = new EventEmitter<string>();
  
  userHeight: number = 0;
  hasHeight: boolean = false;
  showBmi: boolean = true; // Can be made configurable later
  private langSubscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private bmiService: BmiService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}
  
  async ngOnInit() {
    // Load user height for BMI display
    const profile = await this.userService.getUserProfile();
    this.userHeight = profile?.heightCm || 0;
    this.hasHeight = this.userHeight > 0;
    
    // Subscribe to language changes
    this.langSubscription = this.translationService.currentLanguage$.subscribe(() => {
      // Trigger change detection when language changes
      this.cdr.markForCheck();
    });
  }
  
  ngOnDestroy() {
    // Clean up subscription
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  
  // TrackBy function for ngFor to improve performance
  trackById(index: number, entry: WeightEntry): string {
    return entry.id;
  }
  
  // Get BMI class for styling
  getBmiClass(bmi: number): string {
    return this.bmiService.getBmiColorClass(bmi);
  }
}
