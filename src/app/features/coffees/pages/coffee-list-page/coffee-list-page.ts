import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeeCard } from '../../components/coffee-card/coffee-card';
import { CoffeesService } from '../../coffees.service';

@Component({
  selector: 'app-coffee-list-page',
  imports: [RouterLink, CoffeeCard],
  template: `
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Coffees</h1>
      <a class="rounded bg-stone-900 px-4 py-2 text-white" routerLink="/coffees/new">Add coffee</a>
    </div>

    @if (coffees.isLoading()) {
      <p class="mt-4" role="status">Loading…</p>
    } @else if (coffees.error()) {
      <p class="mt-4 text-red-700" role="alert">Could not load coffees.</p>
      <button type="button" class="mt-2 underline" (click)="coffees.reload()">Try again</button>
    } @else {
      @let list = coffees.value() ?? [];
      @if (list.length === 0) {
        <p class="mt-4">No coffees yet.</p>
      } @else {
        <ul class="mt-4 grid gap-4 sm:grid-cols-2">
          @for (coffee of list; track coffee.id) {
            <li>
              <app-coffee-card [coffee]="coffee" [roasterName]="roasterNames().get(coffee.roasterId)" />
            </li>
          }
        </ul>
      }
    }
  `,
})
export class CoffeeListPage {
  private readonly coffeesService = inject(CoffeesService);
  private readonly roastersService = inject(RoastersService);

  protected readonly coffees = resource({ loader: () => this.coffeesService.list() });
  private readonly roasters = resource({ loader: () => this.roastersService.list() });

  protected readonly roasterNames = computed(
    () => new Map((this.roasters.value() ?? []).map((roaster) => [roaster.id, roaster.name])),
  );
}
