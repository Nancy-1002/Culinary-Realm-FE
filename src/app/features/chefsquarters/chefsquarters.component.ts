import { Component, inject, OnInit } from '@angular/core';
import { ChefsquartersService } from '../../core/services/chefsquarters.service';
import { Recipe } from '../../shared/models/recipe';
import { RecipeItemComponent } from "./recipe-item/recipe-item.component";
import { MatDialog } from '@angular/material/dialog';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { QuarterParams } from '../../shared/models/quarterParams';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-chefsquarters',
  standalone: true,
  imports: [
    RecipeItemComponent,
    MatButton,
    MatIcon,
    MatMenu,
    MatSelectionList,
    MatListOption,
    MatMenuTrigger,
    MatPaginator,
    FormsModule
  ],
  templateUrl: './chefsquarters.component.html',
  styleUrl: './chefsquarters.component.scss'
})
export class ChefsquartersComponent implements OnInit {
  private cqService = inject(ChefsquartersService);
  private dialogService = inject(MatDialog);

  recipes?: Pagination<Recipe>;
  selectedSort: string = 'title';
  searchQuery: string = ''; // Store search input value

  private searchSubject = new Subject<string>(); // RxJS Subject for search input

  sortOptions = [
    { name: 'Alphabetical', value: 'title' },
    { name: 'Calories (Low to High)', value: 'calAsc' },
    { name: 'Calories (High to Low)', value: 'calDesc' },
  ];

  quarterParams = new QuarterParams();
  pageSizeOptions = [4, 8, 12, 16, 20];

  ngOnInit(): void {
    this.initializeQuarters();

    // Debounced search mechanism
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after the last keystroke
      distinctUntilChanged() // Ignore if the new value is the same as the previous one
    ).subscribe(searchTerm => {
      this.quarterParams.search = searchTerm; // Assuming the API supports a "search" parameter
      this.quarterParams.pageNumber = 1;
      this.getRecipes();
    });
  }

  initializeQuarters() {
    this.cqService.getCuisines();
    this.cqService.getMealTypes();
    this.cqService.getDifficulty();
    this.getRecipes();
  }

  getRecipes() {
    this.cqService.getRecipes(this.quarterParams).subscribe({
      next: response => this.recipes = response,
      error: error => console.log(error)
    });
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.searchSubject.next(value); // Emit the new value
  }

  handlePageEvent(event: PageEvent) {
    this.quarterParams.pageNumber = event.pageIndex + 1;
    this.quarterParams.pageSize = event.pageSize;
    this.getRecipes();
  }

  onSortChange(event: MatSelectionListChange) {
    const selectedOption = event.options[0];
    if (selectedOption) {
      this.quarterParams.sort = selectedOption.value;
      this.quarterParams.pageNumber = 1;
      this.getRecipes();
    }
  }

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedCuisines: this.quarterParams.cuisines,
        selectedMealTypes: this.quarterParams.mealTypes,
        selectedDifficulty: this.quarterParams.difficulty
      }
    });
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.quarterParams.cuisines = result.selectedCuisines;
          this.quarterParams.mealTypes = result.selectedMealTypes;
          this.quarterParams.difficulty = result.selectedDifficulty;
          this.quarterParams.pageNumber = 1;
          this.getRecipes();
        }
      }
    });
  }
}
