import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoffeeShopCard } from '../../components/coffee-shop-card/coffee-shop-card';
import { CoffeeShopsService } from '../../coffee-shops.service';

@Component({
  selector: 'app-coffee-shop-list-page',
  imports: [RouterLink, CoffeeShopCard],
  template: `
    <div class="flex items-center justify-between">
      <h1>Coffee shops</h1>
      <a class="btn btn-action" routerLink="/coffee-shops/new">
        Add coffee shop
      </a>
    </div>

    @if (shops.isLoading()) {
      <p class="mt-4 text-husk" role="status">Loading…</p>
    } @else if (shops.error()) {
      <p class="mt-4 text-error" role="alert">Could not load coffee shops.</p>
      <button type="button" class="link mt-2" (click)="shops.reload()">Try again</button>
    } @else {
      @let list = shops.value() ?? [];
      @if (list.length === 0) {
        <p class="mt-6 text-husk">No coffee shops yet.</p>
      } @else {
        <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
