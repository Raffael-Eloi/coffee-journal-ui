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
      <h1>Coffees</h1>
      <a class="btn btn-action" routerLink="/coffees/new">Add coffee</a>
    </div>

    @if (coffees.isLoading()) {
      <p class="mt-4 text-husk" role="status">Loading…</p>
    } @else if (coffees.error()) {
      <p class="mt-4 text-error" role="alert">Could not load coffees.</p>
      <button type="button" class="link mt-2" (click)="coffees.reload()">Try again</button>
    } @else {
      @let list = coffees.value() ?? [];
      @if (list.length === 0) {
        <p class="mt-6 text-husk">No coffees yet.</p>
      } @else {
        <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
