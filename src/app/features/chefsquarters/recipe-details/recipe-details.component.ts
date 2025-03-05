import { Component, inject, OnInit } from '@angular/core';
import { ChefsquartersService } from '../../../core/services/chefsquarters.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../../../shared/models/recipe';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    MatIcon,
    MatAccordion,
    MatExpansionModule,
    CommonModule 
  ],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss'
})
export class RecipeDetailsComponent implements OnInit {
  private cqService = inject(ChefsquartersService);
  private activatedRoute = inject(ActivatedRoute);
  recipe?: Recipe;
  selectedIngredients = new Set<number>(); // Track selected ingredients

  ngOnInit(): void {
    this.loadRecipe();
  }

  loadRecipe() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;
    
    this.cqService.getRecipe(+id).subscribe({
      next: (response) => {
        this.recipe = response;
      },
      error: (error) => console.log(error)
    });
  }

  toggleIngredient(id: number) {
    if (this.selectedIngredients.has(id)) {
      this.selectedIngredients.delete(id);
    } else {
      this.selectedIngredients.add(id);
    }
  }
}
