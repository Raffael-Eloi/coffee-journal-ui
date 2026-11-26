import { TestBed } from '@angular/core/testing';
import {
  AccountInfo,
  IPublicClientApplication,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { AuthService, MSAL_CLIENT } from './auth.service';

const account = {
  homeAccountId: 'h',
  environment: 'e',
  tenantId: 't',
  localAccountId: 'l',
  username: 'ana@example.com',
  name: 'Ana',
  idTokenClaims: {},
} as AccountInfo;

function fakeMsal(overrides: Record<string, unknown> = {}) {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    handleRedirectPromise: vi.fn().mockResolvedValue(null),
    getActiveAccount: vi.fn().mockReturnValue(null),
    getAllAccounts: vi.fn().mockReturnValue([]),
    setActiveAccount: vi.fn(),
    acquireTokenSilent: vi.fn().mockResolvedValue({ accessToken: 'tok' }),
    acquireTokenRedirect: vi.fn().mockResolvedValue(undefined),
    loginRedirect: vi.fn().mockResolvedValue(undefined),
    logoutRedirect: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function setup(msal: ReturnType<typeof fakeMsal>) {
  TestBed.configureTestingModule({
    providers: [{ provide: MSAL_CLIENT, useValue: msal as unknown as IPublicClientApplication }],
  });
  return TestBed.inject(AuthService);
}

describe('AuthService', () => {
  it('is signed out when there is no account', async () => {
    const auth = setup(fakeMsal());
    await auth.init();
    expect(auth.isSignedIn()).toBe(false);
  });

  it('uses the account that comes back from the sign-in redirect', async () => {
    const msal = fakeMsal({ handleRedirectPromise: vi.fn().mockResolvedValue({ account }) });
    const auth = setup(msal);
    await auth.init();

    expect(auth.isSignedIn()).toBe(true);
    expect(auth.displayName()).toBe('Ana');
    expect(auth.email()).toBe('ana@example.com');
    expect(msal.setActiveAccount).toHaveBeenCalledWith(account);
  });

  it('has no email when the token and the user name have none', async () => {
    const noEmail = { ...account, username: 'ana' } as AccountInfo;
    const auth = setup(fakeMsal({ getAllAccounts: vi.fn().mockReturnValue([noEmail]) }));
    await auth.init();
    expect(auth.email()).toBeNull();
  });

  it('marks the sign-in as failed instead of throwing when MSAL fails to start', async () => {
    const auth = setup(fakeMsal({ initialize: vi.fn().mockRejectedValue(new Error('boom')) }));
    await auth.init();
    expect(auth.failed()).toBe(true);
    expect(auth.isSignedIn()).toBe(false);
  });

  it('gets a token silently, and redirects when the session needs the user', async () => {
    const msal = fakeMsal({ getAllAccounts: vi.fn().mockReturnValue([account]) });
    const auth = setup(msal);
    await auth.init();
    expect(await auth.getToken()).toBe('tok');

    const needsUser = new InteractionRequiredAuthError('interaction_required', 'cid');
    msal.acquireTokenSilent.mockRejectedValueOnce(needsUser);
    await expect(auth.getToken()).rejects.toBe(needsUser);
    expect(msal.acquireTokenRedirect).toHaveBeenCalled();
  });
});
