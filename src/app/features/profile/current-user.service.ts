import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../auth/auth.service';
import { Profile } from './profile.model';
import { ProfilesService } from './profiles.service';

export type CurrentUserStatus = 'signed-out' | 'loading' | 'needs-profile' | 'ready' | 'error';

/** The signed-in user's profile and roles. The roles only show or hide UI: the API enforces permissions. */
@Service()
export class CurrentUserService {
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(ProfilesService);
  private readonly transloco = inject(TranslocoService);

  private readonly state = signal<CurrentUserStatus>('signed-out');
  private readonly current = signal<Profile | null>(null);

  readonly status = this.state.asReadonly();
  readonly profile = this.current.asReadonly();
  readonly roles = computed(() => this.current()?.roles ?? []);
  readonly isAdmin = computed(() => this.roles().includes('Admin'));
  /** Roasters, coffees and coffee shops can be written by Contributors and Admins. */
  readonly canContribute = computed(() => this.isAdmin() || this.roles().includes('Contributor'));
  /** Equipment can be written by any signed-in user that has a profile. */
  readonly hasProfile = computed(() => this.current() !== null);

  /** Loads the profile of the signed-in user. A 404 means the user still has to create one. */
  async load(): Promise<void> {
    this.current.set(null);
    if (!this.auth.isSignedIn()) {
      this.state.set('signed-out');
      return;
    }
    this.state.set('loading');
    try {
      const profile = await this.profiles.me();
      this.current.set(profile);
      this.applyLanguage(profile.languagePref);
      this.state.set('ready');
    } catch (error) {
      this.state.set(
        error instanceof HttpErrorResponse && error.status === 404 ? 'needs-profile' : 'error',
      );
    }
  }

  /** Switches the app to the language of the profile (`pt-BR` uses `pt`); an unsupported language changes nothing. */
  private applyLanguage(languagePref: string): void {
    const language = languagePref.split('-')[0].toLowerCase();
    if (this.transloco.getAvailableLangs().some((available) => available === language)) {
      this.transloco.setActiveLang(language);
    }
  }
}
