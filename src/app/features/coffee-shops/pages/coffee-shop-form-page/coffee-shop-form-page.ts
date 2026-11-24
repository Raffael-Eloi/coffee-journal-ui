import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { CoffeeShopForm } from '../../components/coffee-shop-form/coffee-shop-form';
import { CoffeeShop, CoffeeShopFormValue } from '../../coffee-shop.model';
import { CoffeeShopsService } from '../../coffee-shops.service';

function toFormValue({ id, roasterId, ...value }: CoffeeShop): CoffeeShopFormValue {
  return value;
}

@Component({
  selector: 'app-coffee-shop-form-page',
  imports: [RouterLink, FormPageHeader, CoffeeShopForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <a class="link self-start" routerLink="/coffee-shops">← Coffee shops</a>
      <app-form-page-header
        eyebrow="Coffee shop"
        [title]="id() === undefined ? 'Add coffee shop' : 'Edit coffee shop'"
        description="Record a café and what you thought of it."
      />

      @if (shop.error()) {
        <p class="text-error" role="alert">Could not load this coffee shop.</p>
      } @else if (id() === undefined || initialValue()) {
        <app-coffee-shop-form
          [initialValue]="initialValue()"
          [saving]="saving()"
          (submitted)="save($event)"
        />
        @if (saveError()) {
          <p class="mt-2 text-error" role="alert">Could not save this coffee shop.</p>
        }
      } @else {
        <p role="status">Loading…</p>
      }
    </div>
  `,
})
export class CoffeeShopFormPage {
  private readonly service = inject(CoffeeShopsService);
  private readonly router = inject(Router);

  /** Present on `/coffee-shops/:id/edit`, absent on `/coffee-shops/new`. */
  readonly id = input<string>();

  protected readonly shop = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly initialValue = computed(() => {
    const shop = this.shop.value();
    return shop ? toFormValue(shop) : undefined;
  });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);

  protected async save(value: CoffeeShopFormValue): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    try {
      const id = this.id();
      if (id === undefined) {
        const created = await this.service.create({ ...value, roasterId: null });
        await this.router.navigate(['/coffee-shops', created.id]);
      } else {
        const roasterId = this.shop.value()?.roasterId ?? null;
        await this.service.update(id, { ...value, roasterId });
        await this.router.navigate(['/coffee-shops', id]);
      }
    } catch {
      this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
