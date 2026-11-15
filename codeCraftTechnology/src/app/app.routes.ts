import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { AdminComponent } from './pages/admin.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'CODECRAFTSOLUTION — Engineering without limits' },
  { path: 'admin', component: AdminComponent, title: 'Admin dashboard — CODECRAFTSOLUTION' },
  { path: '**', redirectTo: '' }
];
