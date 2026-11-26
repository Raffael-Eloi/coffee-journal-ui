import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../auth/auth.service';
import { CurrentUserService } from './current-user.service';
import { Profile } from './profile.model';
import { ProfilesService } from './profiles.service';

const profile = {
  id: 'p1',
  name: 'Ana',
  handle: 'ana',
  languagePref: 'pt-BR',
  roles: ['Contributor'],
} as Profile;

describe('CurrentUserService', () => {
  const signedIn = signal(true);
  const me = vi.fn<() => Promise<Profile>>();

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isSignedIn: signedIn } },
        { provide: ProfilesService, useValue: { me } },
      ],
    });
    return TestBed.inject(CurrentUserService);
  }

  beforeEach(() => {
    signedIn.set(true);
    me.mockReset();
  });

  it('stays signed out without calling the API', async () => {
    signedIn.set(false);
    const user = setup();
    await user.load();
    expect(user.status()).toBe('signed-out');
    expect(me).not.toHaveBeenCalled();
  });

  it('loads the profile and its roles', async () => {
    me.mockResolvedValue(profile);
    const user = setup();
    await user.load();

    expect(user.status()).toBe('ready');
    expect(user.profile()).toEqual(profile);
    expect(user.canContribute()).toBe(true);
    expect(user.isAdmin()).toBe(false);
  });

  it('switches the app to the language of the profile', async () => {
    me.mockResolvedValue({ ...profile, languagePref: 'en-US' });
    const user = setup();
    const transloco = TestBed.inject(TranslocoService);
    transloco.setActiveLang('pt');
    await user.load();
    expect(transloco.getActiveLang()).toBe('en');
  });

  it('keeps the language when the profile language is not supported', async () => {
    me.mockResolvedValue({ ...profile, languagePref: 'fr-FR' });
    const user = setup();
    const transloco = TestBed.inject(TranslocoService);
    transloco.setActiveLang('pt');
    await user.load();
    expect(transloco.getActiveLang()).toBe('pt');
  });

  it('needs a profile when the API answers 404', async () => {
    me.mockRejectedValue(new HttpErrorResponse({ status: 404 }));
    const user = setup();
    await user.load();
    expect(user.status()).toBe('needs-profile');
    expect(user.hasProfile()).toBe(false);
  });

  it('reports an error for other failures', async () => {
    me.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const user = setup();
    await user.load();
    expect(user.status()).toBe('error');
  });
});
