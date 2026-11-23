import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoasterCard } from '../../components/roaster-card/roaster-card';
import { RoastersService } from '../../roasters.service';

@Component({
  selector: 'app-roaster-list-page',
  imports: [RouterLink, RoasterCard],
  template: `
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Roasters</h1>
      <a class="rounded bg-stone-900 px-4 py-2 text-white" routerLink="/roasters/new">
        Add roaster
      </a>
    </div>

    @if (roasters.isLoading()) {
      <p class="mt-4" role="status">Loading…</p>
    } @else if (roasters.error()) {
      <p class="mt-4 text-red-700" role="alert">Could not load roasters.</p>
      <button type="button" class="mt-2 underline" (click)="roasters.reload()">Try again</button>
    } @else {
      @let list = roasters.value() ?? [];
      @if (list.length === 0) {
        <p class="mt-4">No roasters yet.</p>
      } @else {
        <ul class="mt-4 grid gap-4 sm:grid-cols-2">
          @for (roaster of list; track roaster.id) {
            <li><app-roaster-card [roaster]="roaster" /></li>
          }
        </ul>
      }
    }
  `,
})
export class RoasterListPage {
  private readonly service = inject(RoastersService);

  protected readonly roasters = resource({ loader: () => this.service.list() });
}
