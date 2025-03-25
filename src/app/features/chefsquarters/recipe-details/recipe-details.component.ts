import { Component, inject, OnInit } from '@angular/core';
import { ChefsquartersService } from '../../../core/services/chefsquarters.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../../../shared/models/recipe';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { CartService } from '../../../core/services/cart.service';

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
  cartService = inject(CartService);

  recipe?: Recipe;
  selectedIngredients = new Set<number>();
  addedIngredients = new Set<number>();
  isFavorite = false; 

  ngOnInit(): void {
    this.loadRecipe();
    this.checkIfFavorite(); 
  }

  loadRecipe() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;

    this.cqService.getRecipe(+id).subscribe({
      next: (response) => {
        this.recipe = response;
      },
      error: (error) => console.log(error),
    });
  }

  addIngredientToCart(ingId: number): void {
    console.log('Adding ingredient:', ingId);
    this.addedIngredients.add(ingId);
    this.cartService.getIngredientProduct(ingId).subscribe({
      next: () => console.log('Product added successfully'),
      error: (err) => console.error('Error adding product:', err),
    });
  }

  removeIngredientFromCart(ingId: number): void {
    console.log('Removing ingredient:', ingId);
    this.addedIngredients.delete(ingId);
    this.cartService.getIngredientProductId(ingId).subscribe({
      next: (productId) => {
        console.log('Product ID to remove:', productId);
        this.cartService.removeItemFromCart(productId, 1);
      },
      error: (err) => console.error('Error getting product ID:', err),
    });
  }

  // Toggle favorite status
  toggleFavorite() {
    if (!this.recipe) return;

    this.isFavorite = !this.isFavorite;

    if (this.isFavorite) {
      console.log('Adding recipe to favorites...');
    } else {
      console.log('Removing recipe from favorites...');
    }
  }

  checkIfFavorite() {
    this.isFavorite = false; 
  }
}
