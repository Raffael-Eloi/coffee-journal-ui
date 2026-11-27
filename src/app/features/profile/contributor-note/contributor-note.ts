import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../auth/auth.service';
import { CurrentUserService } from '../current-user.service';

/** Takes the place of the Add and Edit buttons for someone who cannot write: sign in, or ask for the contributor role. */
@Component({
  selector: 'app-contributor-note',
  imports: [TranslocoPipe],
  template: `
    @if (auth.isSignedIn() && !currentUser.canContribute()) {
      <p class="text-sm text-husk">{{ 'access.contributorOnly' | transloco }}</p>
    }
  `,
})
export class ContributorNote {
  protected readonly auth = inject(AuthService);
  protected readonly currentUser = inject(CurrentUserService);
}
