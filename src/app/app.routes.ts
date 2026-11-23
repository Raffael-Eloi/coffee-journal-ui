import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'coffee-shops' },
  {
    path: 'coffee-shops',
    loadChildren: () =>
      import('./features/coffee-shops/coffee-shops.routes').then((m) => m.COFFEE_SHOPS_ROUTES),
  },
];
