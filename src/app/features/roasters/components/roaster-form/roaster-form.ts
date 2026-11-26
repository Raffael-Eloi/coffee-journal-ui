import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { GeoService } from '../../../../shared/geo/geo.service';
import { FieldErrors, fieldErrors } from '../../../../shared/api/validation-errors';
import {
  COFFEE_CLASSIFICATION_ICONS,
  COFFEE_CLASSIFICATIONS,
  CoffeeClassification,
} from '../../../../shared/models/coffee-classification';
import { CheckGroup, CheckOption } from '../../../../shared/ui/check-group/check-group';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { ImageUploader } from '../../../../shared/ui/image-uploader/image-uploader';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { LogoUploader } from '../../../../shared/ui/logo-uploader/logo-uploader';
import { PlaceFields } from '../../../../shared/ui/place-fields/place-fields';
import { YesNoToggle } from '../../../../shared/ui/yes-no-toggle/yes-no-toggle';
import { RoasterInput } from '../../roaster.model';

/** The values edited in the form: optional API fields are empty strings. */
interface RoasterDraft {
  name: string;
  description: string;
  website: string;
  instagramUrl: string;
  phoneNumber: string;
  hasMembershipOption: boolean;
  logoUrl: string;
  city: string;
  state: string;
  country: string;
  address: string;
  classifications: CoffeeClassification[];
  imageUrls: string[];
}

const EMPTY_DRAFT: RoasterDraft = {
  name: '',
  description: '',
  website: '',
  instagramUrl: '',
  phoneNumber: '',
  hasMembershipOption: false,
  logoUrl: '',
  city: '',
  state: '',
  country: '',
  address: '',
  classifications: [],
  imageUrls: [],
};

function toDraft(input: RoasterInput | undefined, defaultCountry: string): RoasterDraft {
  if (!input) return { ...EMPTY_DRAFT, country: defaultCountry };
  return {
    name: input.name,
    description: input.description ?? '',
    website: input.website ?? '',
    instagramUrl: input.instagramUrl ?? '',
    phoneNumber: input.phoneNumber ?? '',
    hasMembershipOption: input.hasMembershipOption,
    logoUrl: input.logoUrl ?? '',
    city: input.city,
    state: input.state,
    country: input.country,
    address: input.address ?? '',
    classifications: [...input.classifications],
    imageUrls: [...input.imageUrls],
  };
}

function toInput(draft: RoasterDraft): RoasterInput {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    website: draft.website.trim() || null,
    instagramUrl: draft.instagramUrl.trim() || null,
    phoneNumber: draft.phoneNumber.trim() || null,
    hasMembershipOption: draft.hasMembershipOption,
    logoUrl: draft.logoUrl || null,
    city: draft.city,
    state: draft.state,
    country: draft.country,
    address: draft.address.trim() || null,
    classifications: [...draft.classifications],
    imageUrls: [...draft.imageUrls],
  };
}

@Component({
  selector: 'app-roaster-form',
  imports: [
    TranslocoPipe,
    CheckGroup,
    FormField,
    FormRoot,
    FormSection,
    Icon,
    ImageUploader,
    LabeledField,
    LogoUploader,
    PlaceFields,
    YesNoToggle,
  ],
  template: `
    <form class="flex flex-col gap-8" [formRoot]="roasterForm">
      <app-form-section
        number="01"
        title="roasters.form.profileTitle"
        caption="roasters.form.profileCaption"
      >
        <div class="grid gap-4">
          <app-labeled-field
            label="roasters.form.name"
            controlId="name"
            icon="flame"
            [errors]="errorsFor(roasterForm.name(), 'name')"
          >
            <input id="name" type="text" class="field-input" [formField]="roasterForm.name" />
          </app-labeled-field>

          <app-labeled-field
            label="roasters.form.descriptionLabel"
            controlId="description"
            [errors]="errorsFor(roasterForm.description(), 'description')"
          >
            <textarea
              id="description"
              rows="3"
              class="field-input"
              [formField]="roasterForm.description"
            ></textarea>
          </app-labeled-field>

          <app-labeled-field
            label="common.website"
            controlId="website"
            icon="link"
            [errors]="errorsFor(roasterForm.website(), 'website')"
          >
            <input id="website" type="url" class="field-input" [formField]="roasterForm.website" />
          </app-labeled-field>

          <app-labeled-field
            label="common.instagram"
            controlId="instagramUrl"
            icon="link"
            [errors]="errorsFor(roasterForm.instagramUrl(), 'instagramUrl')"
          >
            <input
              id="instagramUrl"
              type="url"
              class="field-input"
              [formField]="roasterForm.instagramUrl"
            />
          </app-labeled-field>

          <app-labeled-field
            label="common.phone"
            controlId="phoneNumber"
            [errors]="errorsFor(roasterForm.phoneNumber(), 'phoneNumber')"
          >
            <input
              id="phoneNumber"
              type="tel"
              autocomplete="tel"
              class="field-input"
              [formField]="roasterForm.phoneNumber"
            />
          </app-labeled-field>

          <app-logo-uploader [formField]="roasterForm.logoUrl" />
          @for (error of errorsFor(roasterForm.logoUrl(), 'logoUrl'); track error.kind) {
            <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
          }

          <app-check-group
            label="roasters.form.classifications"
            [options]="classificationOptions"
            [formField]="roasterForm.classifications"
          />
          @for (
            error of errorsFor(roasterForm.classifications(), 'classifications');
            track error.kind
          ) {
            <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
          }

          <app-yes-no-toggle
            label="roasters.form.membershipOption"
            yesLabel="roasters.detail.available"
            noLabel="roasters.detail.notAvailable"
            [formField]="roasterForm.hasMembershipOption"
          />
        </div>
      </app-form-section>

      <app-form-section
        number="02"
        title="roasters.form.locationTitle"
        caption="roasters.form.locationCaption"
      >
        <div class="grid gap-4 md:grid-cols-6">
          <app-place-fields
            [(country)]="roasterForm.country().value"
            [(state)]="roasterForm.state().value"
            [(city)]="roasterForm.city().value"
            [countryErrors]="errorsFor(roasterForm.country(), 'country')"
            [stateErrors]="errorsFor(roasterForm.state(), 'state')"
            [cityErrors]="errorsFor(roasterForm.city(), 'city')"
          />

          <app-labeled-field
            class="md:col-span-6"
            label="place.address"
            controlId="address"
            icon="pin"
            [errors]="errorsFor(roasterForm.address(), 'address')"
          >
            <input id="address" type="text" class="field-input" [formField]="roasterForm.address" />
          </app-labeled-field>
        </div>
      </app-form-section>

      <app-form-section
        number="03"
        title="roasters.form.photosTitle"
        caption="roasters.form.photosCaption"
      >
        <app-image-uploader [formField]="roasterForm.imageUrls" />
        @for (error of errorsFor(roasterForm.imageUrls(), 'imageUrls'); track error.kind) {
          <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
        }
      </app-form-section>

      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
          <app-icon name="check" [size]="16" />
          {{ (saving() ? 'common.saving' : 'common.save') | transloco }}
        </button>
      </div>
    </form>
  `,
})
export class RoasterForm {
  readonly initialValue = input<RoasterInput>();
  readonly saving = input(false);
  /** Messages the API returned for the last save, by field name. */
  readonly serverErrors = input<FieldErrors>({});
  readonly submitted = output<RoasterInput>();

  protected readonly classificationOptions: CheckOption<CoffeeClassification>[] =
    COFFEE_CLASSIFICATIONS.map((value) => ({
      value,
      labelKey: `options.classification.${value}`,
      icon: COFFEE_CLASSIFICATION_ICONS[value],
    }));

  private readonly geo = inject(GeoService);
  private readonly transloco = inject(TranslocoService);

  private readonly data = linkedSignal<RoasterDraft>(() =>
    toDraft(this.initialValue(), this.geo.defaultCountry(this.transloco.getActiveLang())),
  );

  protected readonly roasterForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      maxLength(path.name, 250, { message: 'errors.tooLong' });
      maxLength(path.phoneNumber, 30, { message: 'errors.tooLong' });
      required(path.country, { message: 'errors.countryRequired' });
      required(path.state, { message: 'errors.stateRequired' });
      required(path.city, { message: 'errors.cityRequired' });
    },
    {
      submission: {
        action: async (field) => {
          this.submitted.emit(toInput(field().value()));
        },
      },
    },
  );

  protected errorsFor(
    state: Parameters<typeof fieldErrors>[0],
    name: string,
  ): ReturnType<typeof fieldErrors> {
    return fieldErrors(state, this.serverErrors(), name);
  }
}
