import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CoffeeShop, CoffeeShopInput } from './coffee-shop.model';

const API_URL = `${environment.apiUrl}/v1.0/coffee-shops`;

@Service()
export class CoffeeShopsService {
  private readonly http = inject(HttpClient);

  list(): Promise<CoffeeShop[]> {
    return firstValueFrom(this.http.get<CoffeeShop[]>(API_URL));
  }

  get(id: string): Promise<CoffeeShop> {
    return firstValueFrom(this.http.get<CoffeeShop>(`${API_URL}/${id}`));
  }

  create(input: CoffeeShopInput): Promise<CoffeeShop> {
    return firstValueFrom(this.http.post<CoffeeShop>(API_URL, input));
  }

  async update(id: string, input: CoffeeShopInput): Promise<void> {
    await firstValueFrom(this.http.put<unknown>(`${API_URL}/${id}`, input));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<unknown>(`${API_URL}/${id}`));
  }
}
