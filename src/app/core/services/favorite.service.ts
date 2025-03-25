import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserFavoriteRecipe } from '../../shared/models/userFavoriteRecipe';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
 
  getFavorites(){
    return this.http.get<UserFavoriteRecipe[]>(this.baseUrl + 'favorites/user-favorites');
  }

  getFavorite(id: number){
    return this.http.get<UserFavoriteRecipe>(this.baseUrl + 'favorites/favorite/' + id);
  }
  createFavorite(id: number){
    return this.http.post<void>(this.baseUrl + 'favorites/add-favorite/' + id,{});
  }
  deleteFavorite(id: number){
    return this.http.delete<void>(this.baseUrl + 'favorites/remove-favorite/' + id);
  }
}
