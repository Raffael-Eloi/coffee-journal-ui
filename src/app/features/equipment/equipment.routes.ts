import { Routes } from '@angular/router';
import { profileGuard } from '../profile/profile.guard';
import { EquipmentDetailPage } from './pages/equipment-detail-page/equipment-detail-page';
import { EquipmentFormPage } from './pages/equipment-form-page/equipment-form-page';
import { EquipmentListPage } from './pages/equipment-list-page/equipment-list-page';

export const EQUIPMENT_ROUTES: Routes = [
  { path: '', component: EquipmentListPage, title: 'Equipment' },
  {
    path: 'new',
    component: EquipmentFormPage,
    canActivate: [profileGuard('/equipment')],
    title: 'Add equipment',
  },
  { path: ':id', component: EquipmentDetailPage, title: 'Equipment' },
  {
    path: ':id/edit',
    component: EquipmentFormPage,
    canActivate: [profileGuard('/equipment')],
    title: 'Edit equipment',
  },
];
