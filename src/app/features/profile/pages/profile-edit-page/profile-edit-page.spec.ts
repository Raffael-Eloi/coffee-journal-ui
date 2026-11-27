import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../auth/auth.service';
import { CurrentUserService } from '../../current-user.service';
import { Profile } from '../../profile.model';
import { ProfileEditPage } from './profile-edit-page';

const URL = `${environment.apiUrl}/v1.0/profiles/me`;

const profile: Profile = {
  id: 'p1',
  name: 'Ana Eloi',
  nickname: null,
  photoUrl: null,
  email: 'ana@example.com',
  handle: 'ana_eloi',
  bio: null,
  instagramUrl: null,
  facebookUrl: null,
  linkedInUrl: null,
  xUrl: null,
  website: null,
  languagePref: 'pt-BR',
  roles: ['Contributor'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ProfileEditPage', () => {
  const load = vi.fn(() => Promise.resolve());

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { isSignedIn: signal(true), signIn: vi.fn() } },
        {
          provide: CurrentUserService,
          useValue: { profile: signal(profile), status: signal('ready'), load },
        },
      ],
    });
    const fixture = TestBed.createComponent(ProfileEditPage);
    fixture.detectChanges();
    return {
      fixture,
      http: TestBed.inject(HttpTestingController),
      el: fixture.nativeElement as HTMLElement,
    };
  }

  function fill(el: HTMLElement, selector: string, value: string) {
    const control = el.querySelector<HTMLInputElement>(selector)!;
    control.value = value;
    control.dispatchEvent(new Event('input'));
  }

  function click(el: HTMLElement, text: string) {
    Array.from(el.querySelectorAll('button'))
      .find((b) => b.textContent?.includes(text))!
      .click();
  }

  async function goToLastStep(fixture: { whenStable(): Promise<unknown> }, el: HTMLElement) {
    click(el, 'Continue');
    await fixture.whenStable();
    click(el, 'Continue');
    await fixture.whenStable();
  }

  it('starts with the current values of the profile', () => {
    const { el } = setup();

    expect(el.querySelector<HTMLInputElement>('#handle')!.value).toBe('ana_eloi');
    expect(el.querySelector<HTMLInputElement>('#name')!.value).toBe('Ana Eloi');
  });

  it('stays on the first step while the username is not valid', async () => {
    const { fixture, el } = setup();

    fill(el, '#handle', 'Not Valid');
    await fixture.whenStable();
    click(el, 'Continue');
    await fixture.whenStable();

    expect(el.querySelector('#handle')).not.toBeNull();
    expect(el.textContent).toContain('Use 3 to 30 lowercase letters');
  });

  it('sends the whole profile, with empty optional fields as null', async () => {
    const { fixture, http, el } = setup();

    fill(el, '#nickname', 'Aninha');
    await fixture.whenStable();
    click(el, 'Continue');
    await fixture.whenStable();
    fill(el, '#bio', 'Washed Ethiopians');
    await fixture.whenStable();
    click(el, 'Continue');
    await fixture.whenStable();
    fill(el, '#website', 'https://ana.example');
    await fixture.whenStable();
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();

    const put = http.expectOne({ method: 'PUT', url: URL });
    expect(put.request.body).toEqual({
      name: 'Ana Eloi',
      handle: 'ana_eloi',
      languagePref: 'pt-BR',
      nickname: 'Aninha',
      photoUrl: null,
      bio: 'Washed Ethiopians',
      instagramUrl: null,
      facebookUrl: null,
      linkedInUrl: null,
      xUrl: null,
      website: 'https://ana.example',
    });
    put.flush(null, { status: 204, statusText: 'No Content' });
    await vi.waitFor(() => expect(load).toHaveBeenCalled());
  });

  it('goes back to the username step when the API says it is taken', async () => {
    const { fixture, http, el } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');

    await goToLastStep(fixture, el);
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    http
      .expectOne({ method: 'PUT', url: URL })
      .flush(
        { errors: { handle: ['That username is taken'] } },
        { status: 400, statusText: 'Bad Request' },
      );

    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(el.textContent).toContain('That username is taken');
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});
