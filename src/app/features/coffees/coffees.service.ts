import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coffee, CoffeeInput } from './coffee.model';

const API_URL = `${environment.apiUrl}/v1.0/coffees`;

@Service()
export class CoffeesService {
  private readonly http = inject(HttpClient);

  list(): Promise<Coffee[]> {
    return firstValueFrom(this.http.get<Coffee[]>(API_URL));
  }

  get(id: string): Promise<Coffee> {
    return firstValueFrom(this.http.get<Coffee>(`${API_URL}/${id}`));
  }

  create(input: CoffeeInput): Promise<{ id: string }> {
    return firstValueFrom(this.http.post<{ id: string }>(API_URL, input));
  }

  async update(id: string, input: CoffeeInput): Promise<void> {
    await firstValueFrom(this.http.put<unknown>(`${API_URL}/${id}`, input));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<unknown>(`${API_URL}/${id}`));
  }
}
