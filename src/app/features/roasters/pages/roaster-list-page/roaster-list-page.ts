import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoasterCard } from '../../components/roaster-card/roaster-card';
import { RoastersService } from '../../roasters.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-roaster-list-page',
  imports: [TranslocoPipe, RouterLink, RoasterCard],
  template: `
    <div class="flex items-center justify-between">
      <h1>{{ 'nav.roasters' | transloco }}</h1>
      <a class="btn btn-action" routerLink="/roasters/new">
        {{ 'roasters.list.add' | transloco }}
      </a>
    </div>

    @if (roasters.isLoading()) {
      <p class="mt-4 text-husk" role="status">{{ 'common.loading' | transloco }}</p>
    } @else if (roasters.error()) {
      <p class="mt-4 text-error" role="alert">{{ 'roasters.list.loadError' | transloco }}</p>
      <button type="button" class="link mt-2" (click)="roasters.reload()">
        {{ 'common.tryAgain' | transloco }}
      </button>
    } @else {
      @let list = roasters.value() ?? [];
      @if (list.length === 0) {
        <p class="mt-6 text-husk">{{ 'roasters.list.empty' | transloco }}</p>
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
