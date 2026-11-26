import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { CurrentUserService } from '../../current-user.service';
import { ProfilesService } from '../../profiles.service';
import { ProfileSetupPage } from './profile-setup-page';

describe('ProfileSetupPage', () => {
  const create = vi.fn();
  const load = vi.fn().mockResolvedValue(undefined);

  async function setup(email: string | null) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isSignedIn: signal(true),
            displayName: signal('Ana Souza'),
            email: signal(email),
          },
        },
        { provide: CurrentUserService, useValue: { status: signal('needs-profile'), load } },
        { provide: ProfilesService, useValue: { create } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ProfileSetupPage);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement, navigate };
  }

  function fill(el: HTMLElement, selector: string, value: string) {
    const control = el.querySelector<HTMLInputElement>(selector)!;
    control.value = value;
    control.dispatchEvent(new Event('input'));
  }

  function submit(el: HTMLElement) {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  beforeEach(() => {
    create.mockReset().mockResolvedValue({ id: 'p1' });
    load.mockClear();
  });

  it('does not ask for the email when sign-in provides one', async () => {
    const { el } = await setup('ana@example.com');
    expect(el.querySelector('#email')).toBeNull();
  });

  it('asks for the email when sign-in does not provide one', async () => {
    const { el } = await setup(null);
    expect(el.querySelector('#email')).not.toBeNull();
  });

  it('rejects an invalid handle without calling the API', async () => {
    const { fixture, el } = await setup('ana@example.com');
    fill(el, '#handle', 'Ana Souza');
    submit(el);
    await fixture.whenStable();

    expect(create).not.toHaveBeenCalled();
    expect(el.textContent).toContain('3 to 30 lowercase letters');
  });

  it('creates the profile with the token name prefilled and goes home', async () => {
    const { fixture, el, navigate } = await setup('ana@example.com');
    fill(el, '#handle', 'ana_s');
    submit(el);
    await fixture.whenStable();

    expect(create).toHaveBeenCalledWith({
      name: 'Ana Souza',
      handle: 'ana_s',
      languagePref: 'pt-BR',
    });
    expect(load).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
