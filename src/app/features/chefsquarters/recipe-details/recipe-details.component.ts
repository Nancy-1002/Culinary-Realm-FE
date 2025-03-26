import { Component, inject, OnInit } from '@angular/core';
import { ChefsquartersService } from '../../../core/services/chefsquarters.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../../../shared/models/recipe';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { CartService } from '../../../core/services/cart.service';
import { FavoriteService } from '../../../core/services/favorite.service';

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
  private favoriteService = inject(FavoriteService);
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

  toggleFavorite() {
    if (!this.recipe) return;
  
    if (!this.isFavorite) {
      this.favoriteService.createFavorite(this.recipe.id).subscribe({
        next: () => {
          this.isFavorite = true;
          console.log('Recipe added to favorites');
        },
        error: (err) => console.error('Failed to add favorite', err),
      });
    } else {
      this.favoriteService.deleteFavorite(this.recipe.id).subscribe({
        next: () => {
          this.isFavorite = false;
          console.log('Recipe removed from favorites');
        },
        error: (err) => console.error('Failed to remove favorite', err),
      });
    }
  }
  

  checkIfFavorite() {
    this.isFavorite = false; 
  }
}
