import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ChefsquartersComponent } from './features/chefsquarters/chefsquarters.component';
import { RecipeDetailsComponent } from './features/chefsquarters/recipe-details/recipe-details.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'chefsquarters', component: ChefsquartersComponent},
    {path: 'chefsquarters/:id', component: RecipeDetailsComponent},
    {path: '**', redirectTo: '',pathMatch: 'full'},

];
