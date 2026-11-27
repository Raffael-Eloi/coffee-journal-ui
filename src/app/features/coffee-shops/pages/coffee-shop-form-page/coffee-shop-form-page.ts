import { Component, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { FieldErrors, validationErrors } from '../../../../shared/api/validation-errors';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeeShopForm } from '../../components/coffee-shop-form/coffee-shop-form';
import { CoffeeShopInput } from '../../coffee-shop.model';
import { CoffeeShopsService } from '../../coffee-shops.service';
import { BackLink } from '../../../../shared/ui/back-link/back-link';

@Component({
  selector: 'app-coffee-shop-form-page',
  imports: [BackLink, TranslocoPipe, FormPageHeader, CoffeeShopForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <app-back-link to="/coffee-shops" label="coffeeShops.form.back" />
      <app-form-page-header
        eyebrow="coffeeShops.form.eyebrow"
        [title]="id() === undefined ? 'coffeeShops.form.addTitle' : 'coffeeShops.form.editTitle'"
        description="coffeeShops.form.description"
      />

      @if (shop.error() || roasters.error()) {
        <p class="text-error" role="alert">{{ 'coffeeShops.form.loadError' | transloco }}</p>
      } @else if (roasters.value(); as roasterList) {
        @if (id() === undefined || shop.value()) {
          <app-coffee-shop-form
            [roasters]="roasterList"
            [initialValue]="shop.value()"
            [saving]="saving()"
            [serverErrors]="fieldErrors()"
            (submitted)="save($event)"
          />
          @if (saveError()) {
            <p class="mt-2 text-error" role="alert">
              {{ 'coffeeShops.form.saveError' | transloco }}
            </p>
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
export class CoffeeShopFormPage {
  private readonly service = inject(CoffeeShopsService);
  private readonly roastersService = inject(RoastersService);
  private readonly router = inject(Router);

  /** Present on `/coffee-shops/:id/edit`, absent on `/coffee-shops/new`. */
  readonly id = input<string>();

  protected readonly shop = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly roasters = resource({ loader: () => this.roastersService.list() });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly fieldErrors = signal<FieldErrors>({});

  protected async save(value: CoffeeShopInput): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    this.fieldErrors.set({});
    try {
      const id = this.id();
      if (id === undefined) {
        const created = await this.service.create(value);
        await this.router.navigate(['/coffee-shops', created.id]);
      } else {
        await this.service.update(id, value);
        await this.router.navigate(['/coffee-shops', id]);
      }
    } catch (error) {
      const problems = validationErrors(error);
      if (problems) this.fieldErrors.set(problems);
      else this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
