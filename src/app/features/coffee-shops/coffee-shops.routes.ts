import { Routes } from '@angular/router';
import { contributorGuard } from '../profile/contributor.guard';
import { CoffeeShopDetailPage } from './pages/coffee-shop-detail-page/coffee-shop-detail-page';
import { CoffeeShopFormPage } from './pages/coffee-shop-form-page/coffee-shop-form-page';
import { CoffeeShopListPage } from './pages/coffee-shop-list-page/coffee-shop-list-page';

export const COFFEE_SHOPS_ROUTES: Routes = [
  { path: '', component: CoffeeShopListPage, title: 'Coffee shops' },
  {
    path: 'new',
    component: CoffeeShopFormPage,
    canActivate: [contributorGuard('/coffee-shops')],
    title: 'Add coffee shop',
  },
  { path: ':id', component: CoffeeShopDetailPage, title: 'Coffee shop' },
  {
    path: ':id/edit',
    component: CoffeeShopFormPage,
    canActivate: [contributorGuard('/coffee-shops')],
    title: 'Edit coffee shop',
  },
];
