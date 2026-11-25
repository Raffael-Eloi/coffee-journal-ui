import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeesService } from '../../coffees.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';

@Component({
  selector: 'app-coffee-detail-page',
  imports: [TranslocoPipe, OptionLabelPipe, RouterLink, NgOptimizedImage, CurrencyPipe],
  template: `
    <a class="link" routerLink="/coffees">{{ 'coffees.detail.back' | transloco }}</a>

    @if (coffee.isLoading()) {
      <p class="mt-4 text-husk" role="status">{{ 'common.loading' | transloco }}</p>
    } @else if (coffee.error()) {
      <p class="mt-4 text-error" role="alert">{{ 'coffees.detail.loadError' | transloco }}</p>
    } @else if (coffee.value(); as c) {
      <h1 class="mt-4">{{ c.name }}</h1>
      @if (roaster.value(); as r) {
        <p class="text-husk">
          {{ 'coffees.detail.by' | transloco }}
          <a class="link" [routerLink]="['/roasters', r.id]">{{ r.name }}</a>
        </p>
      }
      <p class="mt-2">{{ c.description }}</p>

      <dl class="spec-list mt-6 max-w-3xl">
        <div>
          <dt class="spec-label">{{ 'coffees.detail.rate' | transloco }}</dt>
          <dd class="spec-value">{{ c.rate }}</dd>
        </div>
        <div>
          <dt class="spec-label">{{ 'common.recommended' | transloco }}</dt>
          <dd class="spec-value">{{ (c.recommend ? 'common.yes' : 'common.no') | transloco }}</dd>
        </div>
        <div>
          <dt class="spec-label">{{ 'coffees.detail.origin' | transloco }}</dt>
          <dd class="spec-value">{{ c.origin }}</dd>
        </div>
        <div>
          <dt class="spec-label">{{ 'coffees.detail.process' | transloco }}</dt>
          <dd class="spec-value">{{ c.process | optionLabel: 'process' }}</dd>
        </div>
        <div>
          <dt class="spec-label">{{ 'coffees.detail.roastLevel' | transloco }}</dt>
          <dd class="spec-value">{{ c.roastLevel | optionLabel: 'roastLevel' }}</dd>
        </div>
        <div>
          <dt class="spec-label">{{ 'coffees.detail.variety' | transloco }}</dt>
          <dd class="spec-value">{{ c.variety }}</dd>
        </div>
        <div>
          <dt class="spec-label">{{ 'coffees.detail.tastingNotes' | transloco }}</dt>
          <dd class="spec-value font-normal">{{ c.tastingNotes }}</dd>
        </div>
        <div>
          <dt class="spec-label">{{ 'coffees.detail.review' | transloco }}</dt>
          <dd class="spec-value font-normal">{{ c.review }}</dd>
        </div>
      </dl>

      @if (c.prices.length > 0) {
        <h2 class="mt-8">{{ 'coffees.detail.prices' | transloco }}</h2>
        <ul>
          @for (price of c.prices; track price.id) {
            <li>
              {{ 'common.grams' | transloco: { grams: price.grams } }} —
              {{ price.price | currency: price.currency }}
            </li>
          }
        </ul>
      }

      @if (c.imageUrls.length > 0) {
        <ul class="mt-6 flex flex-wrap gap-4">
          @for (url of c.imageUrls; track $index) {
            <li>
              <img
                class="rounded-lg border border-hairline"
                [ngSrc]="url"
                width="240"
                height="180"
                [alt]="'coffees.detail.photoAlt' | transloco: { name: c.name }"
              />
            </li>
          }
        </ul>
      }

      <div class="mt-6 flex items-center gap-4">
        <a class="btn btn-primary" [routerLink]="['/coffees', c.id, 'edit']">{{
          'common.edit' | transloco
        }}</a>

        @if (confirmingDelete()) {
          <span>{{ 'coffees.detail.confirmDelete' | transloco }}</span>
          <button type="button" class="btn btn-danger" (click)="remove()">
            {{ 'common.confirmDelete' | transloco }}
          </button>
          <button type="button" class="link" (click)="confirmingDelete.set(false)">
            {{ 'common.cancel' | transloco }}
          </button>
        } @else {
          <button type="button" class="link" (click)="confirmingDelete.set(true)">
            {{ 'common.delete' | transloco }}
          </button>
        }
      </div>

      @if (deleteError()) {
        <p class="mt-2 text-error" role="alert">{{ 'coffees.detail.deleteError' | transloco }}</p>
      }
    }
  `,
})
export class CoffeeDetailPage {
  private readonly coffeesService = inject(CoffeesService);
  private readonly roastersService = inject(RoastersService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly coffee = resource({
    params: () => this.id(),
    loader: ({ params }) => this.coffeesService.get(params),
  });
  protected readonly roaster = resource({
    params: () => this.coffee.value()?.roasterId,
    loader: ({ params }) => this.roastersService.get(params),
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  protected async remove(): Promise<void> {
    this.deleteError.set(false);
    try {
      await this.coffeesService.remove(this.id());
      await this.router.navigate(['/coffees']);
    } catch {
      this.deleteError.set(true);
    }
  }
}
