import { Component, inject } from '@angular/core';
import {MatDivider } from '@angular/material/divider';
import {MatListOption, MatSelectionList } from '@angular/material/list';
import { ChefsquartersService } from '../../../core/services/chefsquarters.service';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-filters-dialog',
  standalone: true,
  imports: [
    MatDivider,
    MatSelectionList,
    MatListOption,
    MatButton,
    FormsModule
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss'
})
export class FiltersDialogComponent {
  cqService = inject(ChefsquartersService);
  private dialogRef = inject(MatDialogRef<FiltersDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  selectedCuisines: string[] = this.data.selectedCuisines;
  selectedMealTypes: string[] = this.data.selectedMealTypes;
  selectedDifficulty: string[] = this.data.selectedDifficulty;

  applyFilters(){
    this.dialogRef.close({
      selectedCuisines: this.selectedCuisines,
      selectedMealTypes: this.selectedMealTypes,
      selectedDifficulty: this.selectedDifficulty
    });
  }
}
