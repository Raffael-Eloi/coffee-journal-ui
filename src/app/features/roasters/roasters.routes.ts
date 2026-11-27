import { Routes } from '@angular/router';
import { contributorGuard } from '../profile/contributor.guard';
import { RoasterDetailPage } from './pages/roaster-detail-page/roaster-detail-page';
import { RoasterFormPage } from './pages/roaster-form-page/roaster-form-page';
import { RoasterListPage } from './pages/roaster-list-page/roaster-list-page';

export const ROASTERS_ROUTES: Routes = [
  { path: '', component: RoasterListPage, title: 'Roasters' },
  {
    path: 'new',
    component: RoasterFormPage,
    canActivate: [contributorGuard('/roasters')],
    title: 'Add roaster',
  },
  { path: ':id', component: RoasterDetailPage, title: 'Roaster' },
  {
    path: ':id/edit',
    component: RoasterFormPage,
    canActivate: [contributorGuard('/roasters')],
    title: 'Edit roaster',
  },
];
