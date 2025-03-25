import { Component, OnInit } from '@angular/core';
import { FavoriteItemComponent } from './favorite-item/favorite-item.component';
import { FormsModule } from '@angular/forms';
import {UserFavoriteRecipe} from '../../shared/models/userFavoriteRecipe';
import { FavoriteService } from '../../core/services/favorite.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    FavoriteItemComponent,
    FormsModule,
    RouterLink
],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  favorites: UserFavoriteRecipe[] = [];

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favoriteService.getFavorites().subscribe({
      next: (res) => {
        this.favorites = res;
      },
      error: (err) => {
        console.error('Error fetching favorites:', err);
      }
    });
  }

  onFavoriteRemoved(id: number) {
    this.favorites = this.favorites.filter(f => f.id !== id);
  }
  trackByRecipeId(recipe: UserFavoriteRecipe) {
    return recipe.id;
  }
  
}



