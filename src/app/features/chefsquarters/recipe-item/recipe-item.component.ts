import { Component, inject, Input } from '@angular/core';
import { Recipe } from '../../../shared/models/recipe';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../../core/services/favorite.service';

@Component({
  selector: 'app-recipe-item',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
    RouterLink
  ],
  templateUrl: './recipe-item.component.html',
  styleUrl: './recipe-item.component.scss'
})
export class RecipeItemComponent {
  favoriteService = inject(FavoriteService);
  @Input() recipe?: Recipe;

  favoriteAdded = new Set<number>();

  addToFavorites(recipeId: number) {
    if (this.favoriteAdded.has(recipeId)) return;

    this.favoriteService.createFavorite(recipeId).subscribe({
      next: () => {
        console.log('Added to favorites!');
        this.favoriteAdded.add(recipeId); 
      },
      error: (err) => console.error('Failed to add to favorites:', err)
    });
  }
}
