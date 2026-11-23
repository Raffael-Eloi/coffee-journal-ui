import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeeForm } from '../../components/coffee-form/coffee-form';
import { Coffee, CoffeeFormValue } from '../../coffee.model';
import { CoffeesService } from '../../coffees.service';

function toFormValue({ id, images, prices, ...rest }: Coffee): CoffeeFormValue {
  return { ...rest, prices: prices.map(({ grams, price }) => ({ grams, price })) };
}

@Component({
  selector: 'app-coffee-form-page',
  imports: [RouterLink, CoffeeForm],
  template: `
    <a class="underline" routerLink="/coffees">← Coffees</a>
    <h1 class="mt-4 mb-4 text-2xl font-semibold">
      {{ id() === undefined ? 'Add coffee' : 'Edit coffee' }}
    </h1>

    @if (coffee.error() || roasters.error()) {
      <p class="text-red-700" role="alert">Could not load the data for this form.</p>
    } @else if (roasters.value(); as roasterList) {
      @if (id() === undefined || initialValue()) {
        <app-coffee-form
          [roasters]="roasterList"
          [initialValue]="initialValue()"
          [saving]="saving()"
          (submitted)="save($event)"
        />
        @if (saveError()) {
          <p class="mt-2 text-red-700" role="alert">Could not save this coffee.</p>
        }
      } @else {
        <p role="status">Loading…</p>
      }
    } @else {
      <p role="status">Loading…</p>
    }
  `,
})
export class CoffeeFormPage {
  private readonly coffeesService = inject(CoffeesService);
  private readonly roastersService = inject(RoastersService);
  private readonly router = inject(Router);

  /** Present on `/coffees/:id/edit`, absent on `/coffees/new`. */
  readonly id = input<string>();

  protected readonly coffee = resource({
    params: () => this.id(),
    loader: ({ params }) => this.coffeesService.get(params),
  });
  protected readonly roasters = resource({ loader: () => this.roastersService.list() });
  protected readonly initialValue = computed(() => {
    const coffee = this.coffee.value();
    return coffee ? toFormValue(coffee) : undefined;
  });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);

  protected async save(value: CoffeeFormValue): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    try {
      const id = this.id();
      if (id === undefined) {
        const created = await this.coffeesService.create(value);
        await this.router.navigate(['/coffees', created.id]);
      } else {
        await this.coffeesService.update(id, value);
        await this.router.navigate(['/coffees', id]);
      }
    } catch {
      this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
