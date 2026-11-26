import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, pattern, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../../auth/auth.service';
import { FieldErrors, validationErrors } from '../../../../shared/api/validation-errors';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { CurrentUserService } from '../../current-user.service';
import { ProfilesService } from '../../profiles.service';

interface ProfileDraft {
  name: string;
  handle: string;
  email: string;
  languagePref: string;
}

const LANGUAGES = [
  { code: 'pt-BR', label: 'profile.setup.languagePt' },
  { code: 'en-US', label: 'profile.setup.languageEn' },
];

/** First sign-in: the user has no profile yet, so they choose a handle and name. */
@Component({
  selector: 'app-profile-setup-page',
  imports: [TranslocoPipe, FormField, FormRoot, FormPageHeader, FormSection, Icon, LabeledField],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <app-form-page-header
        eyebrow="profile.setup.eyebrow"
        title="profile.setup.title"
        description="profile.setup.description"
      />

      @if (!auth.isSignedIn()) {
        <div class="flex flex-col items-center gap-4">
          <p class="text-husk">{{ 'profile.setup.signInRequired' | transloco }}</p>
          <button type="button" class="btn btn-primary" (click)="auth.signIn()">
            {{ 'auth.signIn' | transloco }}
          </button>
        </div>
      } @else if (currentUser.status() === 'ready') {
        <p class="text-center text-husk" role="status">
          {{ 'profile.setup.alreadyDone' | transloco }}
        </p>
      } @else {
        <form class="flex flex-col gap-8" [formRoot]="profileForm">
          <app-form-section
            number="01"
            title="profile.setup.sectionTitle"
            caption="profile.setup.sectionCaption"
          >
            <div class="grid gap-4">
              <app-labeled-field
                label="profile.setup.name"
                controlId="name"
                icon="store"
                [errors]="errorsFor(profileForm.name(), 'name')"
              >
                <input
                  id="name"
                  type="text"
                  autocomplete="name"
                  class="field-input"
                  [formField]="profileForm.name"
                />
              </app-labeled-field>

              <app-labeled-field
                label="profile.setup.handle"
                controlId="handle"
                icon="note"
                [errors]="errorsFor(profileForm.handle(), 'handle')"
              >
                <input
                  id="handle"
                  type="text"
                  autocomplete="username"
                  autocapitalize="none"
                  class="field-input"
                  aria-describedby="handle-hint"
                  [formField]="profileForm.handle"
                />
              </app-labeled-field>
              <p id="handle-hint" class="-mt-2 text-xs text-husk">
                {{ 'profile.setup.handleHint' | transloco }}
              </p>

              @if (askEmail()) {
                <app-labeled-field
                  label="profile.setup.email"
                  controlId="email"
                  icon="link"
                  [errors]="errorsFor(profileForm.email(), 'email')"
                >
                  <input
                    id="email"
                    type="email"
                    autocomplete="email"
                    class="field-input"
                    [formField]="profileForm.email"
                  />
                </app-labeled-field>
              }

              <app-labeled-field
                label="profile.setup.language"
                controlId="languagePref"
                icon="globe"
                [errors]="errorsFor(profileForm.languagePref(), 'languagePref')"
              >
                <select
                  id="languagePref"
                  class="field-input"
                  [formField]="profileForm.languagePref"
                >
                  @for (language of languages; track language.code) {
                    <option [value]="language.code">{{ language.label | transloco }}</option>
                  }
                </select>
              </app-labeled-field>
            </div>
          </app-form-section>

          @if (saveError()) {
            <p class="field-error" role="alert">{{ 'profile.setup.saveError' | transloco }}</p>
          }

          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
              <app-icon name="check" [size]="16" />
              {{ (saving() ? 'common.saving' : 'profile.setup.submit') | transloco }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class ProfileSetupPage {
  protected readonly auth = inject(AuthService);
  protected readonly currentUser = inject(CurrentUserService);
  private readonly profiles = inject(ProfilesService);
  private readonly router = inject(Router);

  protected readonly languages = LANGUAGES;
  /** The API only reads the email from the form when the sign-in token has none. */
  protected readonly askEmail = computed(() => this.auth.email() === null);

  private readonly data = linkedSignal<ProfileDraft>(() => ({
    name: this.auth.displayName(),
    handle: '',
    email: '',
    languagePref: 'pt-BR',
  }));

  protected readonly profileForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      maxLength(path.name, 200, { message: 'errors.tooLong' });
      required(path.handle, { message: 'errors.handleRequired' });
      pattern(path.handle, /^[a-z0-9_]{3,30}$/, { message: 'errors.handleInvalid' });
    },
    {
      submission: {
        action: async (field) => {
          await this.save(field().value());
        },
      },
    },
  );

  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly fieldErrors = signal<FieldErrors>({});

  protected errorsFor(
    state: { touched(): boolean; errors(): readonly { kind: string; message?: string }[] },
    name: string,
  ): { kind: string; message?: string }[] {
    const client = state.touched() ? state.errors() : [];
    const server = (this.fieldErrors()[name] ?? []).map((message) => ({
      kind: `server-${message}`,
      message,
    }));
    return [...client, ...server];
  }

  private async save(draft: ProfileDraft): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    this.fieldErrors.set({});
    try {
      const email = draft.email.trim();
      await this.profiles.create({
        name: draft.name.trim(),
        handle: draft.handle,
        languagePref: draft.languagePref,
        ...(this.askEmail() && email !== '' ? { email } : {}),
      });
      await this.currentUser.load();
      await this.router.navigateByUrl('/');
    } catch (error) {
      const problems = validationErrors(error);
      if (problems) this.fieldErrors.set(problems);
      else this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
