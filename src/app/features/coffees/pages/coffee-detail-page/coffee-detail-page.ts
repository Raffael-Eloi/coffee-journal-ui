import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { PhotoGallery } from '../../../../shared/ui/photo-gallery/photo-gallery';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeesService } from '../../coffees.service';

@Component({
  selector: 'app-coffee-detail-page',
  imports: [TranslocoPipe, OptionLabelPipe, RouterLink, CurrencyPipe, PhotoGallery],
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
      <p class="mt-2 whitespace-pre-line">{{ c.description }}</p>

      <dl class="spec-list mt-6 max-w-3xl">
        <div>
          <dt class="spec-label">{{ 'coffees.detail.classification' | transloco }}</dt>
          <dd class="spec-value">{{ c.classification + '' | optionLabel: 'classification' }}</dd>
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
        @if (c.productUrl) {
          <div>
            <dt class="spec-label">{{ 'coffees.detail.productUrl' | transloco }}</dt>
            <dd class="spec-value">
              <a class="link" [href]="c.productUrl" target="_blank" rel="noopener noreferrer">
                {{ 'coffees.detail.productLink' | transloco }}
                <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
              </a>
            </dd>
          </div>
        }
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

      <div class="mt-6">
        <app-photo-gallery [urls]="c.imageUrls" [name]="c.name" />
      </div>

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
