import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CoffeeShopForm } from '../../components/coffee-shop-form/coffee-shop-form';
import { CoffeeShop, CoffeeShopFormValue } from '../../coffee-shop.model';
import { CoffeeShopsService } from '../../coffee-shops.service';

function toFormValue({ id, images, roasterId, ...value }: CoffeeShop): CoffeeShopFormValue {
  return value;
}

@Component({
  selector: 'app-coffee-shop-form-page',
  imports: [RouterLink, CoffeeShopForm],
  template: `
    <a class="underline" routerLink="/coffee-shops">← Coffee shops</a>
    <h1 class="mt-4 mb-4 text-2xl font-semibold">
      {{ id() === undefined ? 'Add coffee shop' : 'Edit coffee shop' }}
    </h1>

    @if (shop.error()) {
      <p class="text-red-700" role="alert">Could not load this coffee shop.</p>
    } @else if (id() === undefined || initialValue()) {
      <app-coffee-shop-form
        [initialValue]="initialValue()"
        [saving]="saving()"
        (submitted)="save($event)"
      />
      @if (saveError()) {
        <p class="mt-2 text-red-700" role="alert">Could not save this coffee shop.</p>
      }
    } @else {
      <p role="status">Loading…</p>
    }
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
