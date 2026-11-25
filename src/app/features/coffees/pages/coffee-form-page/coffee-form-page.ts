import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeeForm } from '../../components/coffee-form/coffee-form';
import { Coffee, CoffeeFormValue } from '../../coffee.model';
import { CoffeesService } from '../../coffees.service';
import { TranslocoPipe } from '@jsverse/transloco';

function toFormValue({ id, prices, ...rest }: Coffee): CoffeeFormValue {
  return {
    ...rest,
    prices: prices.map(({ grams, price, currency }) => ({ grams, price, currency })),
  };
}

@Component({
  selector: 'app-coffee-form-page',
  imports: [TranslocoPipe, RouterLink, FormPageHeader, CoffeeForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <a class="link self-start" routerLink="/coffees">{{ 'coffees.form.back' | transloco }}</a>
      <app-form-page-header
        eyebrow="coffees.form.eyebrow"
        [title]="id() === undefined ? 'coffees.form.addTitle' : 'coffees.form.editTitle'"
        description="coffees.form.description"
      />

      @if (coffee.error() || roasters.error()) {
        <p class="text-error" role="alert">{{ 'coffees.form.loadError' | transloco }}</p>
      } @else if (roasters.value(); as roasterList) {
        @if (id() === undefined || initialValue()) {
          <app-coffee-form
            [roasters]="roasterList"
            [initialValue]="initialValue()"
            [saving]="saving()"
            (submitted)="save($event)"
          />
          @if (saveError()) {
            <p class="mt-2 text-error" role="alert">{{ 'coffees.form.saveError' | transloco }}</p>
          }
        } @else {
          <p role="status">{{ 'common.loading' | transloco }}</p>
        }
      } @else {
        <p role="status">{{ 'common.loading' | transloco }}</p>
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
