import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../shared/models/pagination';
import { Recipe } from '../../shared/models/recipe';
import { QuarterParams } from '../../shared/models/quarterParams';

@Injectable({
  providedIn: 'root'
})
export class ChefsquartersService {
  baseUrl = 'https://localhost:7170/api/';
  private http = inject(HttpClient);
  cuisines: string[] = [];
  mealTypes: string[] = [];
  difficulty: string[] = [];
  
  getRecipes(quarterParams: QuarterParams){
    let params = new HttpParams();

    if(quarterParams.cuisines.length > 0) {
      params = params.append('cuisines', quarterParams.cuisines.join(','));
    }
    
    if(quarterParams.mealTypes.length > 0) {
      params = params.append('mealtypes', quarterParams.mealTypes.join(','));
    }
    
    if(quarterParams.difficulty.length > 0) {
      params = params.append('difficulty', quarterParams.difficulty.join(','));
    }

    if(quarterParams.sort) {
      params = params.append('sort', quarterParams.sort);
    }

    if(quarterParams.search) {
      params = params.append('search',quarterParams.search);
    }
    params = params.append('pageSize',quarterParams.pageSize);
    params = params.append('pageIndex',quarterParams.pageNumber);

    return this.http.get<Pagination<Recipe>>(this.baseUrl + 'recipes', {params});
  }

  getCuisines(){
    if(this.cuisines.length > 0) return;
    return this.http.get<string[]>(this.baseUrl + 'recipes/cuisines').subscribe({
      next: (response) => this.cuisines = response
    });
  }

  getMealTypes(){
    if(this.mealTypes.length > 0) return;
    return this.http.get<string[]>(this.baseUrl + 'recipes/mealtypes').subscribe({
      next: (response) => this.mealTypes = response
    });
  }

  getDifficulty(){
    if(this.difficulty.length > 0) return;
    return this.http.get<string[]>(this.baseUrl + 'recipes/difficulty').subscribe({
      next: (response) => this.difficulty = response
    });
  }
}
