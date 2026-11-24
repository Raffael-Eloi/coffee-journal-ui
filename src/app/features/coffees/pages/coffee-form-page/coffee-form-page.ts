import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeeForm } from '../../components/coffee-form/coffee-form';
import { Coffee, CoffeeFormValue, CoffeeInput } from '../../coffee.model';
import { CoffeesService } from '../../coffees.service';

function toFormValue({ id, images, prices, ...rest }: Coffee): CoffeeFormValue {
  return { ...rest, prices: prices.map(({ grams, price }) => ({ grams, price, currency: '$' })) };
}

@Component({
  selector: 'app-coffee-form-page',
  imports: [RouterLink, FormPageHeader, CoffeeForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <a class="link self-start" routerLink="/coffees">← Coffees</a>
      <app-form-page-header
        eyebrow="Coffee"
        [title]="id() === undefined ? 'Add coffee' : 'Edit coffee'"
        description="Record a coffee, its prices and your tasting notes."
      />

      @if (coffee.error() || roasters.error()) {
        <p class="text-error" role="alert">Could not load the data for this form.</p>
      } @else if (roasters.value(); as roasterList) {
        @if (id() === undefined || initialValue()) {
          <app-coffee-form
            [roasters]="roasterList"
            [initialValue]="initialValue()"
            [saving]="saving()"
            (submitted)="save($event)"
          />
          @if (saveError()) {
            <p class="mt-2 text-error" role="alert">Could not save this coffee.</p>
          }
        } @else {
          <p role="status">Loading…</p>
        }
      } @else {
        <p role="status">Loading…</p>
      }
    </div>
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

  protected async save(value: CoffeeInput): Promise<void> {
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
