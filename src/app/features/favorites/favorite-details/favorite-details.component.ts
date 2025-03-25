import { Component, inject, OnInit } from '@angular/core';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; 
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { CartService } from '../../../core/services/cart.service';
import { UserFavoriteRecipe } from '../../../shared/models/userFavoriteRecipe';

@Component({
  selector: 'app-favorite-details',
  standalone: true,
  imports: [
    MatIcon,
    MatAccordion,
    MatExpansionModule,
    CommonModule
  ],
  templateUrl: './favorite-details.component.html',
  styleUrl: './favorite-details.component.scss'
})
export class FavoriteDetailsComponent implements OnInit {
  favoriteService = inject(FavoriteService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router); 
  favorite?: UserFavoriteRecipe;
  selectedIngredients = new Set<number>(); 
  cartService = inject(CartService);
  addedIngredients = new Set<number>(); 

  ngOnInit(): void {
    this.loadRecipe();
  }

  loadRecipe() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;
    
    this.favoriteService.getFavorite(+id).subscribe({
      next: (response) => {
        this.favorite = response;
      },
      error: (error) => console.log(error)
    });
  }

  removeFavorite(id: number) {
    this.favoriteService.deleteFavorite(id).subscribe({
      next: () => {
        this.router.navigate(['/favorites']); 
      },
      error: (err) => console.error('Error removing favorite:', err)
    });
  }

  addIngredientToCart(ingId: number): void {
    this.addedIngredients.add(ingId);
    this.cartService.getIngredientProduct(ingId).subscribe({
      next: () => console.log('Product added successfully'),
      error: (err) => console.error('Error adding product:', err)
    });
  }

  removeIngredientFromCart(ingId: number): void {
    this.addedIngredients.delete(ingId);
    this.cartService.getIngredientProductId(ingId).subscribe({
      next: (productId) => {
        this.cartService.removeItemFromCart(productId, 1);
      },
      error: (err) => console.error('Error getting product ID:', err)
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
