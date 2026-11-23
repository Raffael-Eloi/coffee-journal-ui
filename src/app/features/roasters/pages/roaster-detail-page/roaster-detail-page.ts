import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoastersService } from '../../roasters.service';

@Component({
  selector: 'app-roaster-detail-page',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <a class="underline" routerLink="/roasters">← Roasters</a>

    @if (roaster.isLoading()) {
      <p class="mt-4" role="status">Loading…</p>
    } @else if (roaster.error()) {
      <p class="mt-4 text-red-700" role="alert">Could not load this roaster.</p>
    } @else if (roaster.value(); as r) {
      <h1 class="mt-4 text-2xl font-semibold">{{ r.name }}</h1>

      @if (r.logoUrl) {
        <img class="mt-2" [ngSrc]="r.logoUrl" width="120" height="120" [alt]="r.name + ' logo'" />
      }

      <dl class="mt-4 grid max-w-xl grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
        <dt class="font-semibold">Rate</dt>
        <dd>{{ r.rate }}</dd>
        <dt class="font-semibold">Recommended</dt>
        <dd>{{ r.recommend ? 'Yes' : 'No' }}</dd>
        <dt class="font-semibold">Membership option</dt>
        <dd>{{ r.hasMembershipOption ? 'Yes' : 'No' }}</dd>
        @if (r.website) {
          <dt class="font-semibold">Website</dt>
          <dd>{{ r.website }}</dd>
        }
        <dt class="font-semibold">Review</dt>
        <dd>{{ r.review }}</dd>
      </dl>

      <div class="mt-6 flex items-center gap-4">
        <a class="rounded bg-stone-900 px-4 py-2 text-white" [routerLink]="['/roasters', r.id, 'edit']">
          Edit
        </a>

        @if (confirmingDelete()) {
          <span>Delete this roaster?</span>
          <button type="button" class="rounded bg-red-800 px-4 py-2 text-white" (click)="remove()">
            Confirm delete
          </button>
          <button type="button" class="underline" (click)="confirmingDelete.set(false)">Cancel</button>
        } @else {
          <button type="button" class="underline" (click)="confirmingDelete.set(true)">Delete</button>
        }
      </div>

      @if (deleteError()) {
        <p class="mt-2 text-red-700" role="alert">Could not delete this roaster.</p>
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
