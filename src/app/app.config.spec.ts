import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IPublicClientApplication } from '@azure/msal-browser';
import { appConfig } from './app.config';
import { MSAL_CLIENT } from './auth/auth.service';
import { CurrentUserService } from './features/profile/current-user.service';

describe('appConfig startup', () => {
  it('finishes the sign-in and loads the user before the app starts', async () => {
    const msal = {
      initialize: vi.fn().mockResolvedValue(undefined),
      handleRedirectPromise: vi.fn().mockResolvedValue(null),
      getActiveAccount: vi.fn().mockReturnValue(null),
      getAllAccounts: vi.fn().mockReturnValue([]),
      setActiveAccount: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        { provide: MSAL_CLIENT, useValue: msal as unknown as IPublicClientApplication },
      ],
    });

    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(msal.handleRedirectPromise).toHaveBeenCalled();
    expect(TestBed.inject(CurrentUserService).status()).toBe('signed-out');
  });
});
