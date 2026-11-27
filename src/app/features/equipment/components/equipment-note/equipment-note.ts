import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../../auth/auth.service';
import { Icon } from '../../../../shared/ui/icon/icon';
import { CurrentUserService } from '../../../profile/current-user.service';

/** Takes the place of the Add button for someone who cannot add equipment yet: sign in, or create a profile first. */
@Component({
  selector: 'app-equipment-note',
  imports: [TranslocoPipe, RouterLink, Icon],
  template: `
    @if (!auth.isSignedIn()) {
      <div
        class="flex w-full max-w-xs shrink-0 flex-col items-start gap-4 rounded-xl border border-hairline bg-container-low p-5"
      >
        <p class="flex items-start gap-3 text-espresso">
          <app-icon class="mt-0.5 text-terracotta" name="bean" [size]="20" />
          <span>{{ 'access.signInForEquipment' | transloco }}</span>
        </p>
        <button type="button" class="btn btn-action self-center" (click)="auth.signIn()">
          {{ 'auth.signIn' | transloco }}
        </button>
      </div>
    } @else if (!currentUser.hasProfile() && currentUser.status() !== 'loading') {
      <div
        class="flex w-full max-w-xs shrink-0 flex-col items-start gap-4 rounded-xl border border-hairline bg-container-low p-5"
      >
        <p class="flex items-start gap-3 text-espresso">
          <app-icon class="mt-0.5 text-terracotta" name="bean" [size]="20" />
          <span>{{ 'access.profileForEquipment' | transloco }}</span>
        </p>
        <a class="btn btn-action self-center" routerLink="/profile/setup">
          {{ 'access.createProfile' | transloco }}
        </a>
      </div>
    }
  `,
})
export class EquipmentNote {
  protected readonly auth = inject(AuthService);
  protected readonly currentUser = inject(CurrentUserService);
}
