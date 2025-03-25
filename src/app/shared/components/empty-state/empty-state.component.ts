import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { UserFavoriteRecipe } from '../../models/userFavoriteRecipe';
import { FavoriteService } from '../../../core/services/favorite.service';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    RouterLink,
    CommonModule
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  favoriteRecipes: UserFavoriteRecipe[] = [];
  favoriteService = inject(FavoriteService);

  getFavoriteRecipes(){
    this.favoriteService.getFavorites().subscribe({
      next: (favorites) => this.favoriteRecipes = favorites,
      error: (error) => console.error('Error fetching favorites:', error)
    })
  }
}
