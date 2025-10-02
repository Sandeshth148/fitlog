import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeightEntry } from '../../models/weight-entry.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BmiDisplayComponent } from '../bmi-display/bmi-display.component';
import { UserService } from '../../../../core/services/user.service';
import { BmiService } from '../../../../core/services/bmi.service';

@Component({
  selector: 'app-entry-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BmiDisplayComponent],
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryListComponent implements OnInit {
  @Input() entries: WeightEntry[] = [];
  @Output() entryEdited = new EventEmitter<WeightEntry>();
  @Output() entryDeleted = new EventEmitter<string>();
  
  userHeight: number = 0;
  hasHeight: boolean = false;
  showBmi: boolean = true; // Can be made configurable later

  constructor(
    private userService: UserService,
    private bmiService: BmiService
  ) {}
  
  async ngOnInit() {
    // Load user height for BMI display
    const profile = await this.userService.getUserProfile();
    this.userHeight = profile?.heightCm || 0;
    this.hasHeight = this.userHeight > 0;
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
