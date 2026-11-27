import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { CurrentUserService } from './current-user.service';

/**
 * Lets a signed-in user with a profile through (equipment belongs to a profile) and sends everyone else
 * to `redirectTo`. It waits while the profile is still loading. The API enforces the same rule.
 */
export function profileGuard(redirectTo: string): CanActivateFn {
  return () => {
    const currentUser = inject(CurrentUserService);
    const router = inject(Router);
    return toObservable(currentUser.status).pipe(
      filter((status) => status !== 'loading'),
      take(1),
      map(() => currentUser.hasProfile() || router.parseUrl(redirectTo)),
    );
  };
}
