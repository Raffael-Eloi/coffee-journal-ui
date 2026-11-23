import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoastersService } from '../../roasters.service';

@Component({
  selector: 'app-roaster-detail-page',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <a class="link" routerLink="/roasters">← Roasters</a>

    @if (roaster.isLoading()) {
      <p class="mt-4 text-husk" role="status">Loading…</p>
    } @else if (roaster.error()) {
      <p class="mt-4 text-error" role="alert">Could not load this roaster.</p>
    } @else if (roaster.value(); as r) {
      <h1 class="mt-4">{{ r.name }}</h1>

      @if (r.logoUrl) {
        <img class="mt-2 rounded-lg border border-hairline" [ngSrc]="r.logoUrl" width="120" height="120" [alt]="r.name + ' logo'" />
      }

      <dl class="spec-list mt-6 max-w-3xl">
        <div>
          <dt class="spec-label">Rate</dt>
          <dd class="spec-value">{{ r.rate }}</dd>
        </div>
        <div>
          <dt class="spec-label">Recommended</dt>
          <dd class="spec-value">{{ r.recommend ? 'Yes' : 'No' }}</dd>
        </div>
        <div>
          <dt class="spec-label">Membership option</dt>
          <dd class="spec-value">{{ r.hasMembershipOption ? 'Yes' : 'No' }}</dd>
        </div>
        @if (r.website) {
          <div>
            <dt class="spec-label">Website</dt>
            <dd class="spec-value">{{ r.website }}</dd>
          </div>
        }
        <div>
          <dt class="spec-label">Review</dt>
          <dd class="spec-value font-normal">{{ r.review }}</dd>
        </div>
      </dl>

      <div class="mt-6 flex items-center gap-4">
        <a class="btn btn-primary" [routerLink]="['/roasters', r.id, 'edit']">
          Edit
        </a>

        @if (confirmingDelete()) {
          <span>Delete this roaster?</span>
          <button type="button" class="btn btn-danger" (click)="remove()">
            Confirm delete
          </button>
          <button type="button" class="link" (click)="confirmingDelete.set(false)">Cancel</button>
        } @else {
          <button type="button" class="link" (click)="confirmingDelete.set(true)">Delete</button>
        }
      </div>

      @if (deleteError()) {
        <p class="mt-2 text-error" role="alert">Could not delete this roaster.</p>
      }
    }
  `,
})
export class RoasterDetailPage {
  private readonly service = inject(RoastersService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly roaster = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  protected async remove(): Promise<void> {
    this.deleteError.set(false);
    try {
      await this.service.remove(this.id());
      await this.router.navigate(['/roasters']);
    } catch {
      this.deleteError.set(true);
    }
  }
}
