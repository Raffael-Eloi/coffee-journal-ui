import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Adds `Authorization: Bearer <token>` to API calls while the user is signed in.
 * Reads are public, so a GET still goes out without a token when one cannot be obtained.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!auth.isSignedIn() || !req.url.startsWith(environment.apiUrl)) return next(req);

  return from(
    auth.getToken().then(
      (token) => token,
      (error: unknown) => {
        if (req.method === 'GET') return null;
        throw error;
      },
    ),
  ).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
  );
};
