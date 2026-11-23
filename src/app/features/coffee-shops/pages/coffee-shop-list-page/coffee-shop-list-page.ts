import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoffeeShopCard } from '../../components/coffee-shop-card/coffee-shop-card';
import { CoffeeShopsService } from '../../coffee-shops.service';

@Component({
  selector: 'app-coffee-shop-list-page',
  imports: [RouterLink, CoffeeShopCard],
  template: `
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Coffee shops</h1>
      <a class="rounded bg-stone-900 px-4 py-2 text-white" routerLink="/coffee-shops/new">
        Add coffee shop
      </a>
    </div>

    @if (shops.isLoading()) {
      <p class="mt-4" role="status">Loading…</p>
    } @else if (shops.error()) {
      <p class="mt-4 text-red-700" role="alert">Could not load coffee shops.</p>
      <button type="button" class="mt-2 underline" (click)="shops.reload()">Try again</button>
    } @else {
      @let list = shops.value() ?? [];
      @if (list.length === 0) {
        <p class="mt-4">No coffee shops yet.</p>
      } @else {
        <ul class="mt-4 grid gap-4 sm:grid-cols-2">
          @for (shop of list; track shop.id) {
            <li><app-coffee-shop-card [shop]="shop" /></li>
          }
        </ul>
      }
    }
  `,
})
export class CoffeeShopListPage {
  private readonly service = inject(CoffeeShopsService);

  protected readonly shops = resource({ loader: () => this.service.list() });
}
