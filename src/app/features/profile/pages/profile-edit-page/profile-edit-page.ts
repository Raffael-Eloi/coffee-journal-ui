import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, pattern, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../../auth/auth.service';
import { FieldErrors, fieldErrors, validationErrors } from '../../../../shared/api/validation-errors';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { Icon } from '../../../../shared/ui/icon/icon';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { LogoUploader } from '../../../../shared/ui/logo-uploader/logo-uploader';
import { SymbolIcon } from '../../../../shared/ui/symbol/symbol';
import { CurrentUserService } from '../../current-user.service';
import { Profile, ProfileUpdateInput } from '../../profile.model';
import { ProfilesService } from '../../profiles.service';

/** The values edited in the form: every optional field is an empty string when it has no value. */
interface ProfileEditDraft {
  name: string;
  handle: string;
  nickname: string;
  photoUrl: string;
  bio: string;
  languagePref: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedInUrl: string;
  xUrl: string;
  website: string;
}

type LinkField = 'instagramUrl' | 'facebookUrl' | 'linkedInUrl' | 'xUrl' | 'website';

const LANGUAGES = [
  { code: 'pt-BR', label: 'profile.setup.languagePt' },
  { code: 'en-US', label: 'profile.setup.languageEn' },
];

const LINKS: { key: LinkField; label: string; placeholder: string }[] = [
  { key: 'instagramUrl', label: 'common.instagram', placeholder: 'https://instagram.com/…' },
  { key: 'facebookUrl', label: 'profile.edit.facebook', placeholder: 'https://facebook.com/…' },
  { key: 'linkedInUrl', label: 'profile.edit.linkedIn', placeholder: 'https://linkedin.com/in/…' },
  { key: 'xUrl', label: 'profile.edit.x', placeholder: 'https://x.com/…' },
  { key: 'website', label: 'common.website', placeholder: 'https://…' },
];

/** The step (1 to 3) that shows each field. */
const STEP_OF: Record<keyof ProfileEditDraft, number> = {
  name: 1,
  handle: 1,
  nickname: 1,
  photoUrl: 2,
  bio: 2,
  languagePref: 2,
  instagramUrl: 3,
  facebookUrl: 3,
  linkedInUrl: 3,
  xUrl: 3,
  website: 3,
};

const STEPS = [
  { number: 1, label: 'profile.edit.steps.identity' },
  { number: 2, label: 'profile.edit.steps.persona' },
  { number: 3, label: 'profile.edit.steps.links' },
];

function toDraft(profile: Profile): ProfileEditDraft {
  return {
    name: profile.name,
    handle: profile.handle,
    nickname: profile.nickname ?? '',
    photoUrl: profile.photoUrl ?? '',
    bio: profile.bio ?? '',
    languagePref: profile.languagePref,
    instagramUrl: profile.instagramUrl ?? '',
    facebookUrl: profile.facebookUrl ?? '',
    linkedInUrl: profile.linkedInUrl ?? '',
    xUrl: profile.xUrl ?? '',
    website: profile.website ?? '',
  };
}

function toInput(draft: ProfileEditDraft): ProfileUpdateInput {
  return {
    name: draft.name.trim(),
    handle: draft.handle,
    languagePref: draft.languagePref,
    nickname: draft.nickname.trim() || null,
    photoUrl: draft.photoUrl || null,
    bio: draft.bio.trim() || null,
    instagramUrl: draft.instagramUrl.trim() || null,
    facebookUrl: draft.facebookUrl.trim() || null,
    linkedInUrl: draft.linkedInUrl.trim() || null,
    xUrl: draft.xUrl.trim() || null,
    website: draft.website.trim() || null,
  };
}

/** Edit or complete the signed-in user's profile in three steps (Stitch "First Sign-In Onboarding"). */
@Component({
  selector: 'app-profile-edit-page',
  imports: [
    TranslocoPipe,
    FormField,
    FormRoot,
    FormPageHeader,
    Icon,
    LabeledField,
    LogoUploader,
    SymbolIcon,
  ],
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-8">
      <app-form-page-header
        eyebrow="profile.edit.eyebrow"
        title="profile.edit.title"
        description="profile.edit.description"
      />

      @if (!auth.isSignedIn()) {
        <div class="flex flex-col items-center gap-4">
          <p class="text-husk">{{ 'profile.edit.signInRequired' | transloco }}</p>
          <button type="button" class="btn btn-primary" (click)="auth.signIn()">
            {{ 'auth.signIn' | transloco }}
          </button>
        </div>
      } @else if (!currentUser.profile()) {
        @if (currentUser.status() === 'loading') {
          <p class="text-center text-husk" role="status">{{ 'common.loading' | transloco }}</p>
        }
      } @else {
        <nav [attr.aria-label]="'profile.edit.stepsLabel' | transloco">
          <ol class="grid grid-cols-3 gap-3">
            @for (item of steps; track item.number) {
              <li>
                <button
                  type="button"
                  class="flex w-full flex-col gap-2 text-left"
                  [attr.aria-current]="step() === item.number ? 'step' : null"
                  (click)="step.set(item.number)"
                >
                  <span class="flex items-center gap-2">
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      [class.bg-espresso]="step() === item.number"
                      [class.text-surface]="step() === item.number"
                      [class.bg-container]="step() !== item.number"
                      [class.text-terracotta]="step() !== item.number"
                    >
                      0{{ item.number }}
                    </span>
                    <span
                      class="hidden text-[0.6875rem] font-semibold tracking-wider uppercase sm:inline"
                      [class.text-espresso]="step() === item.number"
                      [class.text-husk]="step() !== item.number"
                    >
                      {{ item.label | transloco }}
                    </span>
                    @if (stepHasError(item.number)) {
                      <span class="text-error" aria-hidden="true">!</span>
                      <span class="sr-only">{{ 'profile.edit.stepHasError' | transloco }}</span>
                    }
                  </span>
                  <span class="h-1 w-full rounded-full bg-container-low">
                    <span
                      class="block h-1 rounded-full bg-terracotta"
                      [style.width.%]="step() >= item.number ? 100 : 0"
                    ></span>
                  </span>
                </button>
              </li>
            }
          </ol>
        </nav>

        <form
          class="flex flex-col gap-6 rounded-xl border border-hairline bg-surface p-6 shadow-sm md:p-10"
          [formRoot]="profileForm"
        >
          @switch (step()) {
            @case (1) {
              <h2>{{ 'profile.edit.steps.identity' | transloco }}</h2>
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
              <p id="handle-hint" class="-mt-4 text-xs text-husk">
                {{ 'profile.setup.handleHint' | transloco }}
              </p>

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
                label="profile.edit.nickname"
                controlId="nickname"
                icon="coffee"
                [errors]="errorsFor(profileForm.nickname(), 'nickname')"
              >
                <input
                  id="nickname"
                  type="text"
                  class="field-input"
                  aria-describedby="nickname-hint"
                  [formField]="profileForm.nickname"
                />
              </app-labeled-field>
              <p id="nickname-hint" class="-mt-4 text-xs text-husk">
                {{ 'profile.edit.nicknameHint' | transloco }}
              </p>
            }
            @case (2) {
              <h2>{{ 'profile.edit.steps.persona' | transloco }}</h2>
              <app-logo-uploader textGroup="ui.photoUploader" [formField]="profileForm.photoUrl" />
              @for (error of errorsFor(profileForm.photoUrl(), 'photoUrl'); track error.kind) {
                <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
              }

              <app-labeled-field
                label="profile.edit.bio"
                controlId="bio"
                [errors]="errorsFor(profileForm.bio(), 'bio')"
              >
                <textarea
                  id="bio"
                  rows="4"
                  class="field-input"
                  aria-describedby="bio-hint"
                  [formField]="profileForm.bio"
                ></textarea>
              </app-labeled-field>
              <p id="bio-hint" class="-mt-4 flex justify-between gap-4 text-xs text-husk">
                <span>{{ 'profile.edit.bioHint' | transloco }}</span>
                <span>{{ profileForm.bio().value().length }} / 1000</span>
              </p>

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
                  @for (language of languages(); track language.code) {
                    <option [value]="language.code">{{ language.label | transloco }}</option>
                  }
                </select>
              </app-labeled-field>
            }
            @case (3) {
              <h2>{{ 'profile.edit.steps.links' | transloco }}</h2>
              <p class="-mt-4 text-on-surface-variant">{{ 'profile.edit.linksHint' | transloco }}</p>
              <div class="grid gap-4 sm:grid-cols-2">
                @for (link of links; track link.key) {
                  <app-labeled-field
                    [label]="link.label"
                    [controlId]="link.key"
                    icon="link"
                    [errors]="errorsFor(profileForm[link.key](), link.key)"
                  >
                    <input
                      [id]="link.key"
                      type="url"
                      inputmode="url"
                      autocapitalize="none"
                      class="field-input"
                      [placeholder]="link.placeholder"
                      [formField]="profileForm[link.key]"
                    />
                  </app-labeled-field>
                }
              </div>
            }
          }

          @if (saveError()) {
            <p class="field-error" role="alert">{{ 'profile.edit.saveError' | transloco }}</p>
          }

          <div class="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            @if (step() > 1) {
              <button type="button" class="link inline-flex items-center gap-1" (click)="back()">
                <app-symbol name="arrow_back" [size]="16" />
                {{ 'profile.edit.back' | transloco }}
              </button>
            } @else {
              <span></span>
            }

            @if (step() < 3) {
              <button type="button" class="btn btn-primary gap-2" (click)="next()">
                {{ 'profile.edit.next' | transloco }}
                <app-symbol name="arrow_forward" [size]="16" />
              </button>
            } @else {
              <button
                type="submit"
                class="btn btn-primary gap-2"
                [disabled]="saving()"
                (click)="showFirstInvalidStep()"
              >
                <app-icon name="check" [size]="16" />
                {{ (saving() ? 'common.saving' : 'profile.edit.save') | transloco }}
              </button>
            }
          </div>
        </form>
      }
    </div>
  `,
})
export class ProfileEditPage {
  protected readonly auth = inject(AuthService);
  protected readonly currentUser = inject(CurrentUserService);
  private readonly profiles = inject(ProfilesService);
  private readonly router = inject(Router);

  protected readonly steps = STEPS;
  protected readonly links = LINKS;
  protected readonly step = signal(1);

  /** The supported languages, plus the one already on the profile when it is not among them. */
  protected readonly languages = computed(() => {
    const current = this.currentUser.profile()?.languagePref;
    return current && !LANGUAGES.some((l) => l.code === current)
      ? [...LANGUAGES, { code: current, label: current }]
      : LANGUAGES;
  });

  private readonly data = linkedSignal<ProfileEditDraft>(() => {
    const profile = this.currentUser.profile();
    return profile ? toDraft(profile) : toDraft(EMPTY_PROFILE);
  });

  protected readonly profileForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      maxLength(path.name, 200, { message: 'errors.tooLong' });
      required(path.handle, { message: 'errors.handleRequired' });
      pattern(path.handle, /^[a-z0-9_]{3,30}$/, { message: 'errors.handleInvalid' });
      maxLength(path.nickname, 100, { message: 'errors.tooLong' });
      maxLength(path.photoUrl, 4000, { message: 'errors.tooLong' });
      maxLength(path.bio, 1000, { message: 'errors.tooLong' });
      for (const link of [
        path.instagramUrl,
        path.facebookUrl,
        path.linkedInUrl,
        path.xUrl,
        path.website,
      ]) {
        pattern(link, /^(https?:\/\/.+)?$/i, { message: 'errors.linkInvalid' });
        maxLength(link, 500, { message: 'errors.tooLong' });
      }
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
  protected readonly serverErrors = signal<FieldErrors>({});

  protected errorsFor(
    state: Parameters<typeof fieldErrors>[0],
    name: string,
  ): ReturnType<typeof fieldErrors> {
    return fieldErrors(state, this.serverErrors(), name);
  }

  protected stepHasError(step: number): boolean {
    return (Object.keys(STEP_OF) as (keyof ProfileEditDraft)[]).some(
      (key) =>
        STEP_OF[key] === step &&
        (this.profileForm[key]().invalid() || (this.serverErrors()[key] ?? []).length > 0),
    );
  }

  protected back(): void {
    this.step.update((n) => Math.max(1, n - 1));
  }

  /** Goes to the next step once the fields of this one are valid; otherwise shows their errors. */
  protected next(): void {
    const current = this.step();
    let valid = true;
    for (const key of Object.keys(STEP_OF) as (keyof ProfileEditDraft)[]) {
      if (STEP_OF[key] !== current) continue;
      const field = this.profileForm[key]();
      field.markAsTouched();
      if (field.invalid()) valid = false;
    }
    if (valid) this.step.set(current + 1);
  }

  /** Before a save that cannot go through, shows the first step that has a mistake. */
  protected showFirstInvalidStep(): void {
    const first = STEPS.find((s) => this.stepHasError(s.number));
    if (first && first.number !== this.step()) this.step.set(first.number);
  }

  private async save(draft: ProfileEditDraft): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    this.serverErrors.set({});
    try {
      await this.profiles.update(toInput(draft));
      await this.currentUser.load();
      await this.router.navigateByUrl('/');
    } catch (error) {
      const problems = validationErrors(error);
      if (problems) {
        this.serverErrors.set(problems);
        this.showFirstInvalidStep();
      } else {
        this.saveError.set(true);
      }
    } finally {
      this.saving.set(false);
    }
  }
}

/** Placeholder values while the profile is not loaded; the form is not shown then. */
const EMPTY_PROFILE: Profile = {
  id: '',
  name: '',
  nickname: null,
  photoUrl: null,
  email: '',
  handle: '',
  bio: null,
  instagramUrl: null,
  facebookUrl: null,
  linkedInUrl: null,
  xUrl: null,
  website: null,
  languagePref: 'pt-BR',
  roles: [],
  createdAt: '',
  updatedAt: '',
};
