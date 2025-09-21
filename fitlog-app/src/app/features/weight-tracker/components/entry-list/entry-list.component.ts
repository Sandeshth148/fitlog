import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeightEntry } from '../../models/weight-entry.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-entry-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryListComponent {
  @Input() entries: WeightEntry[] = [];
  @Output() entryEdited = new EventEmitter<WeightEntry>();
  @Output() entryDeleted = new EventEmitter<string>();

  // TrackBy function for ngFor to improve performance
  trackById(index: number, entry: WeightEntry): string {
    return entry.id;
  }
}
