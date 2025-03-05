import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ChefsquartersComponent } from './features/chefsquarters/chefsquarters.component';
import { RecipeDetailsComponent } from './features/chefsquarters/recipe-details/recipe-details.component';
import { TestErrorsComponent } from './features/test-errors/test-errors.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ServerErrorComponent } from './shared/server-error/server-error.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'chefsquarters', component: ChefsquartersComponent},
    {path: 'chefsquarters/:id', component: RecipeDetailsComponent},
    {path: 'test-error', component: TestErrorsComponent},
    {path: 'not-found', component: NotFoundComponent},
    {path: 'server-error', component: ServerErrorComponent},
    {path: '**', redirectTo: 'not-found',pathMatch: 'full'},
];
