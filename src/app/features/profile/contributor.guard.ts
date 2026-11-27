import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { CurrentUserService } from './current-user.service';

/**
 * Lets Contributors and Admins through to a write page (add or edit) and sends everyone else to
 * `redirectTo`. It waits while the profile is still loading, so a refresh does not turn a Contributor away.
 * The API enforces the same rule: this only avoids showing a form that cannot be saved.
 */
export function contributorGuard(redirectTo: string): CanActivateFn {
  return () => {
    const currentUser = inject(CurrentUserService);
    const router = inject(Router);
    return toObservable(currentUser.status).pipe(
      filter((status) => status !== 'loading'),
      take(1),
      map(() => currentUser.canContribute() || router.parseUrl(redirectTo)),
    );
  };
}
