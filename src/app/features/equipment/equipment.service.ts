import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipment, EquipmentCategory, EquipmentInput } from './equipment.model';

const API_URL = `${environment.apiUrl}/v1.0/coffee-equipments`;
const CATEGORIES_URL = `${environment.apiUrl}/v1.0/coffee-equipment-categories`;

@Service()
export class EquipmentService {
  private readonly http = inject(HttpClient);

  listCategories(): Promise<EquipmentCategory[]> {
    return firstValueFrom(this.http.get<EquipmentCategory[]>(CATEGORIES_URL));
  }

  list(): Promise<Equipment[]> {
    return firstValueFrom(this.http.get<Equipment[]>(API_URL));
  }

  get(id: string): Promise<Equipment> {
    return firstValueFrom(this.http.get<Equipment>(`${API_URL}/${id}`));
  }

  create(input: EquipmentInput): Promise<{ id: string }> {
    return firstValueFrom(this.http.post<{ id: string }>(API_URL, input));
  }

  async update(id: string, input: EquipmentInput): Promise<void> {
    await firstValueFrom(this.http.put<unknown>(`${API_URL}/${id}`, input));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<unknown>(`${API_URL}/${id}`));
  }
}
