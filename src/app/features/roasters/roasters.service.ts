import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Roaster, RoasterInput } from './roaster.model';

const API_URL = `${environment.apiUrl}/v1.0/coffee-roasters`;

@Service()
export class RoastersService {
  private readonly http = inject(HttpClient);

  list(): Promise<Roaster[]> {
    return firstValueFrom(this.http.get<Roaster[]>(API_URL));
  }

  get(id: string): Promise<Roaster> {
    return firstValueFrom(this.http.get<Roaster>(`${API_URL}/${id}`));
  }

  create(input: RoasterInput): Promise<Roaster> {
    return firstValueFrom(this.http.post<Roaster>(API_URL, input));
  }

  async update(id: string, input: RoasterInput): Promise<void> {
    await firstValueFrom(this.http.put<unknown>(`${API_URL}/${id}`, input));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<unknown>(`${API_URL}/${id}`));
  }
}
