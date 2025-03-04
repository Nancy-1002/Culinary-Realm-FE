import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { HttpClient } from '@angular/common/http';
import { Recipe } from './shared/models/recipe';
import { Pagination } from './shared/models/pagination';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  
  baseUrl = 'https://localhost:7170/api/';
  private http = inject(HttpClient)
  title = 'Culinary Realm';
  recipes: Recipe[] = [];

  ngOnInit(): void {
    this.http.get<Pagination<Recipe>>(this.baseUrl + 'recipes').subscribe({
      next: (response) => this.recipes = response.data,
      error: (error) => console.log(error),
      complete: () => console.log('Get recipes completed')
    });
  }
}
