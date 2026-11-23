import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoasterCard } from '../../components/roaster-card/roaster-card';
import { RoastersService } from '../../roasters.service';

@Component({
  selector: 'app-roaster-list-page',
  imports: [RouterLink, RoasterCard],
  template: `
    <div class="flex items-center justify-between">
      <h1>Roasters</h1>
      <a class="btn btn-action" routerLink="/roasters/new">
        Add roaster
      </a>
    </div>

    @if (roasters.isLoading()) {
      <p class="mt-4 text-husk" role="status">Loading…</p>
    } @else if (roasters.error()) {
      <p class="mt-4 text-error" role="alert">Could not load roasters.</p>
      <button type="button" class="link mt-2" (click)="roasters.reload()">Try again</button>
    } @else {
      @let list = roasters.value() ?? [];
      @if (list.length === 0) {
        <p class="mt-6 text-husk">No roasters yet.</p>
      } @else {
        <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
