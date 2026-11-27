import { Routes } from '@angular/router';
import { contributorGuard } from '../profile/contributor.guard';
import { CoffeeDetailPage } from './pages/coffee-detail-page/coffee-detail-page';
import { CoffeeFormPage } from './pages/coffee-form-page/coffee-form-page';
import { CoffeeListPage } from './pages/coffee-list-page/coffee-list-page';

export const COFFEES_ROUTES: Routes = [
  { path: '', component: CoffeeListPage, title: 'Coffees' },
  {
    path: 'new',
    component: CoffeeFormPage,
    canActivate: [contributorGuard('/coffees')],
    title: 'Add coffee',
  },
  { path: ':id', component: CoffeeDetailPage, title: 'Coffee' },
  {
    path: ':id/edit',
    component: CoffeeFormPage,
    canActivate: [contributorGuard('/coffees')],
    title: 'Edit coffee',
  },
];
