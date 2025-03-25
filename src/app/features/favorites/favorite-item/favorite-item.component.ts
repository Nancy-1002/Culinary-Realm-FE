import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { UserFavoriteRecipe } from '../../../shared/models/userFavoriteRecipe';
import { FavoriteService } from '../../../core/services/favorite.service';

@Component({
  selector: 'app-favorite-item',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
    RouterLink
  ],
  templateUrl: './favorite-item.component.html',
  styleUrl: './favorite-item.component.scss'
})
export class FavoriteItemComponent {
  favoriteService = inject(FavoriteService);

  @Input() favorite?: UserFavoriteRecipe;
  @Output() removed = new EventEmitter<number>(); 

  removeFavorite(id: number, event: Event) {
    event.stopPropagation(); 
    this.favoriteService.deleteFavorite(id).subscribe({
      next: () => {
        this.removed.emit(id); 
      },
      error: err => {
        console.error('Failed to remove favorite', err);
      }
    });
  }
}
