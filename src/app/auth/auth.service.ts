import { DOCUMENT } from '@angular/common';
import { computed, inject, InjectionToken, Service, signal } from '@angular/core';
import {
  AccountInfo,
  IPublicClientApplication,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from '@azure/msal-browser';
import { environment } from '../../environments/environment';

/** The MSAL client. Provided as a token so tests can replace it. */
export const MSAL_CLIENT = new InjectionToken<IPublicClientApplication>('MSAL_CLIENT', {
  providedIn: 'root',
  factory: () => {
    const origin = inject(DOCUMENT).location.origin;
    return new PublicClientApplication({
      auth: {
        clientId: environment.auth.clientId,
        authority: environment.auth.authority,
        knownAuthorities: environment.auth.knownAuthorities,
        redirectUri: origin,
        postLogoutRedirectUri: origin,
      },
      cache: { cacheLocation: 'sessionStorage' },
    });
  },
});

/** Sign-in with Entra External ID (authorization code with PKCE, full-page redirect). */
@Service()
export class AuthService {
  private readonly msal = inject(MSAL_CLIENT);

  private readonly currentAccount = signal<AccountInfo | null>(null);
  readonly account = this.currentAccount.asReadonly();
  readonly isSignedIn = computed(() => this.currentAccount() !== null);
  /** Name from the sign-in token, for the header. */
  readonly displayName = computed(() => {
    const account = this.currentAccount();
    return account?.name || account?.username || '';
  });
  /** Email from the sign-in token, or `null` when sign-in does not provide one. */
  readonly email = computed(() => {
    const account = this.currentAccount();
    if (!account) return null;
    const claims = (account.idTokenClaims ?? {}) as Record<string, unknown>;
    const fromClaims = claims['email'] ?? (claims['emails'] as unknown[] | undefined)?.[0];
    if (typeof fromClaims === 'string' && fromClaims !== '') return fromClaims;
    return account.username.includes('@') ? account.username : null;
  });
  /** Set when MSAL could not start or finish a sign-in. */
  readonly failed = signal(false);

  /** Finishes a sign-in redirect, if there is one, and restores the signed-in account. Never throws. */
  async init(): Promise<void> {
    try {
      await this.msal.initialize();
      const result = await this.msal.handleRedirectPromise();
      const account =
        result?.account ?? this.msal.getActiveAccount() ?? this.msal.getAllAccounts()[0] ?? null;
      this.msal.setActiveAccount(account);
      this.currentAccount.set(account);
    } catch {
      this.failed.set(true);
    }
  }

  async signIn(): Promise<void> {
    this.failed.set(false);
    try {
      await this.msal.loginRedirect({ scopes: environment.auth.scopes });
    } catch {
      this.failed.set(true);
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.msal.logoutRedirect({ account: this.currentAccount() });
    } catch {
      this.failed.set(true);
    }
  }

  /** An access token for the API. When the session needs the user, it redirects to sign in and then throws. */
  async getToken(): Promise<string> {
    const account = this.currentAccount();
    if (!account) throw new Error('Not signed in');
    try {
      const result = await this.msal.acquireTokenSilent({
        scopes: environment.auth.scopes,
        account,
      });
      return result.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await this.msal.acquireTokenRedirect({ scopes: environment.auth.scopes, account });
      }
      throw error;
    }
  }
}
