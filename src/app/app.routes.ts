import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'coffee-shops' },
  {
    path: 'coffee-shops',
    loadChildren: () =>
      import('./features/coffee-shops/coffee-shops.routes').then((m) => m.COFFEE_SHOPS_ROUTES),
  },
  {
    path: 'roasters',
    loadChildren: () =>
      import('./features/roasters/roasters.routes').then((m) => m.ROASTERS_ROUTES),
  },
  {
    path: 'coffees',
    loadChildren: () => import('./features/coffees/coffees.routes').then((m) => m.COFFEES_ROUTES),
  },
  {
    path: 'profile/setup',
    title: 'Create profile',
    loadComponent: () =>
      import('./features/profile/pages/profile-setup-page/profile-setup-page').then(
        (m) => m.ProfileSetupPage,
      ),
  },
  {
    path: 'equipment',
    loadChildren: () =>
      import('./features/equipment/equipment.routes').then((m) => m.EQUIPMENT_ROUTES),
  },
];
