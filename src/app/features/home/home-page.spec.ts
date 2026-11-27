import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HomePage } from './home-page';

describe('HomePage', () => {
  const signedIn = signal(false);
  const signIn = vi.fn();

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isSignedIn: signedIn, signIn } },
      ],
    });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => {
    signedIn.set(false);
    signIn.mockClear();
  });

  it('shows why the app exists and links to the coffee shops', () => {
    const { el } = setup();

    expect(el.querySelector('h1')!.textContent).toContain('Specialty coffee isn’t about snobbery.');
    expect(el.querySelector('a[href="/coffee-shops"]')).not.toBeNull();
  });

  it('shows the community section with its photo', () => {
    const { el } = setup();

    const section = el.querySelector('#community')!;
    expect(section.textContent).toContain('Good coffee is even better when shared.');
    expect(section.querySelector('img')!.getAttribute('alt')).toContain('gooseneck kettle');
  });

  it('asks a signed-out visitor to sign in, and offers the shops to a signed-in one', async () => {
    const { fixture, el } = setup();
    const button = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Create your account'),
    )!;
    button.click();
    expect(signIn).toHaveBeenCalled();

    signedIn.set(true);
    fixture.detectChanges();
    expect(el.textContent).not.toContain('Create your account');
    expect(el.textContent).toContain('Browse coffee shops');
  });
});
