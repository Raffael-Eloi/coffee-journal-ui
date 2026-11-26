import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { applyEach, form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { GeoService } from '../../../../shared/geo/geo.service';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { FieldErrors, fieldErrors } from '../../../../shared/api/validation-errors';
import { CheckGroup, CheckOption } from '../../../../shared/ui/check-group/check-group';
import { Combobox } from '../../../../shared/ui/combobox/combobox';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { ImageUploader } from '../../../../shared/ui/image-uploader/image-uploader';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { PlaceFields } from '../../../../shared/ui/place-fields/place-fields';
import { Roaster } from '../../../roasters/roaster.model';
import {
  Amenity,
  AMENITIES,
  BREWING_METHODS,
  CoffeeBrewingMethod,
  CoffeeShopInput,
  DAYS_OF_WEEK,
  DayOfWeek,
} from '../../coffee-shop.model';

const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

/** One opening window as edited: the day is the select value and the times are `HH:mm`. */
interface HoursDraft {
  dayOfWeek: string;
  opensAt: string;
  closesAt: string;
}

/** The values edited in the form: optional API fields are empty strings. */
interface CoffeeShopDraft {
  name: string;
  description: string;
  website: string;
  instagramUrl: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
  address: string;
  timeZone: string;
  roasterIds: string[];
  brewingMethods: CoffeeBrewingMethod[];
  amenities: Amenity[];
  openingHours: HoursDraft[];
  imageUrls: string[];
}

const EMPTY_DRAFT: CoffeeShopDraft = {
  name: '',
  description: '',
  website: '',
  instagramUrl: '',
  phoneNumber: '',
  city: '',
  state: '',
  country: '',
  address: '',
  timeZone: DEFAULT_TIME_ZONE,
  roasterIds: [],
  brewingMethods: [],
  amenities: [],
  openingHours: [],
  imageUrls: [],
};

function toDraft(input: CoffeeShopInput | undefined, defaultCountry: string): CoffeeShopDraft {
  if (!input) return { ...EMPTY_DRAFT, country: defaultCountry };
  return {
    name: input.name,
    description: input.description ?? '',
    website: input.website ?? '',
    instagramUrl: input.instagramUrl ?? '',
    phoneNumber: input.phoneNumber ?? '',
    city: input.city,
    state: input.state,
    country: input.country,
    address: input.address,
    timeZone: input.timeZone,
    roasterIds: [...input.roasterIds],
    brewingMethods: [...input.brewingMethods],
    amenities: [...input.amenities],
    openingHours: input.openingHours.map((hours) => ({
      dayOfWeek: String(hours.dayOfWeek),
      opensAt: hours.opensAt.slice(0, 5),
      closesAt: hours.closesAt.slice(0, 5),
    })),
    imageUrls: [...input.imageUrls],
  };
}

function toInput(draft: CoffeeShopDraft): CoffeeShopInput {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    website: draft.website.trim() || null,
    instagramUrl: draft.instagramUrl.trim() || null,
    phoneNumber: draft.phoneNumber.trim() || null,
    city: draft.city,
    state: draft.state,
    country: draft.country,
    address: draft.address.trim(),
    timeZone: draft.timeZone,
    roasterIds: [...draft.roasterIds],
    brewingMethods: [...draft.brewingMethods],
    amenities: [...draft.amenities],
    // Copy rows to plain objects: Signal Forms tags array items with a tracking symbol.
    openingHours: draft.openingHours.map((hours) => ({
      dayOfWeek: Number(hours.dayOfWeek) as DayOfWeek,
      opensAt: `${hours.opensAt}:00`,
      closesAt: `${hours.closesAt}:00`,
    })),
    imageUrls: [...draft.imageUrls],
  };
}

/** The options, plus the current value when it is not among them (for example a saved legacy value). */
function withCurrent(options: readonly string[], current: string): string[] {
  return current === '' || options.includes(current) ? [...options] : [...options, current];
}

@Component({
  selector: 'app-coffee-shop-form',
  imports: [
    TranslocoPipe,
    OptionLabelPipe,
    CheckGroup,
    Combobox,
    FormField,
    FormRoot,
    FormSection,
    Icon,
    ImageUploader,
    LabeledField,
    PlaceFields,
  ],
  template: `
    <form class="flex flex-col gap-8" [formRoot]="shopForm">
      <app-form-section
        number="01"
        title="coffeeShops.form.venueTitle"
        caption="coffeeShops.form.venueCaption"
      >
        <div class="grid gap-4 md:grid-cols-6">
          <app-labeled-field
            class="md:col-span-6"
            label="coffeeShops.form.name"
            controlId="name"
            icon="store"
            [errors]="errorsFor(shopForm.name(), 'name')"
          >
            <input id="name" type="text" class="field-input" [formField]="shopForm.name" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-6"
            label="coffeeShops.form.descriptionLabel"
            controlId="description"
            [errors]="errorsFor(shopForm.description(), 'description')"
          >
            <textarea
              id="description"
              rows="3"
              class="field-input"
              [formField]="shopForm.description"
            ></textarea>
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-3"
            label="common.website"
            controlId="website"
            icon="link"
            [errors]="errorsFor(shopForm.website(), 'website')"
          >
            <input id="website" type="url" class="field-input" [formField]="shopForm.website" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-3"
            label="common.instagram"
            controlId="instagramUrl"
            icon="link"
            [errors]="errorsFor(shopForm.instagramUrl(), 'instagramUrl')"
          >
            <input
              id="instagramUrl"
              type="url"
              class="field-input"
              [formField]="shopForm.instagramUrl"
            />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-6"
            label="common.phone"
            controlId="phoneNumber"
            [errors]="errorsFor(shopForm.phoneNumber(), 'phoneNumber')"
          >
            <input
              id="phoneNumber"
              type="tel"
              autocomplete="tel"
              class="field-input"
              [formField]="shopForm.phoneNumber"
            />
          </app-labeled-field>

          <app-place-fields
            [(country)]="shopForm.country().value"
            [(state)]="shopForm.state().value"
            [(city)]="shopForm.city().value"
            [countryErrors]="errorsFor(shopForm.country(), 'country')"
            [stateErrors]="errorsFor(shopForm.state(), 'state')"
            [cityErrors]="errorsFor(shopForm.city(), 'city')"
          />

          <app-labeled-field
            class="md:col-span-6"
            label="place.address"
            controlId="address"
            icon="pin"
            [errors]="errorsFor(shopForm.address(), 'address')"
          >
            <input id="address" type="text" class="field-input" [formField]="shopForm.address" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-6"
            label="coffeeShops.form.timeZone"
            controlId="timeZone"
            icon="globe"
            [errors]="errorsFor(shopForm.timeZone(), 'timeZone')"
          >
            <app-combobox
              inputId="timeZone"
              placeholder="coffeeShops.form.selectTimeZone"
              [options]="timeZoneOptions()"
              [formField]="shopForm.timeZone"
            />
          </app-labeled-field>
        </div>
      </app-form-section>

      <app-form-section
        number="02"
        title="coffeeShops.form.offerTitle"
        caption="coffeeShops.form.offerCaption"
      >
        <app-check-group
          label="coffeeShops.form.roasters"
          emptyText="coffeeShops.form.noRoasters"
          [options]="roasterOptions()"
          [formField]="shopForm.roasterIds"
        />
        @for (error of errorsFor(shopForm.roasterIds(), 'roasterIds'); track error.kind) {
          <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
        }

        <app-check-group
          label="coffeeShops.form.brewingMethods"
          [options]="brewingMethodOptions"
          [formField]="shopForm.brewingMethods"
        />
        @for (error of errorsFor(shopForm.brewingMethods(), 'brewingMethods'); track error.kind) {
          <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
        }

        <app-check-group
          label="coffeeShops.form.amenities"
          [options]="amenityOptions"
          [formField]="shopForm.amenities"
        />
        @for (error of errorsFor(shopForm.amenities(), 'amenities'); track error.kind) {
          <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
        }
      </app-form-section>

      <app-form-section
        number="03"
        title="coffeeShops.form.hoursTitle"
        caption="coffeeShops.form.hoursCaption"
      >
        <p class="text-sm text-husk">{{ 'coffeeShops.form.hoursHint' | transloco }}</p>
        @for (hours of shopForm.openingHours; track $index; let row = $index) {
          <div class="flex flex-col gap-4 rounded-xl bg-canvas p-4">
            <div class="flex items-center justify-between border-b border-container pb-2">
              <span class="text-xs font-semibold tracking-wide text-espresso uppercase">
                {{ 'coffeeShops.form.window' | transloco: { n: row + 1 } }}
              </span>
              <button
                type="button"
                class="rounded p-1 text-husk hover:bg-container hover:text-error"
                [attr.aria-label]="'coffeeShops.form.removeWindow' | transloco: { n: row + 1 }"
                (click)="removeHours(row)"
              >
                <app-icon name="close" [size]="16" />
              </button>
            </div>
            <div class="grid gap-4 md:grid-cols-3">
              <app-labeled-field
                label="coffeeShops.form.day"
                [controlId]="'day-' + row"
                [errors]="errorsFor(hours.dayOfWeek(), 'openingHours[' + row + '].dayOfWeek')"
              >
                <select class="field-input" [id]="'day-' + row" [formField]="hours.dayOfWeek">
                  @for (day of days; track day) {
                    <option [value]="day">{{ day + '' | optionLabel: 'dayOfWeek' }}</option>
                  }
                </select>
              </app-labeled-field>
              <app-labeled-field
                label="coffeeShops.form.opensAt"
                [controlId]="'opens-' + row"
                [errors]="errorsFor(hours.opensAt(), 'openingHours[' + row + '].opensAt')"
              >
                <input
                  type="time"
                  class="field-input"
                  [id]="'opens-' + row"
                  [formField]="hours.opensAt"
                />
              </app-labeled-field>
              <app-labeled-field
                label="coffeeShops.form.closesAt"
                [controlId]="'closes-' + row"
                [errors]="errorsFor(hours.closesAt(), 'openingHours[' + row + '].closesAt')"
              >
                <input
                  type="time"
                  class="field-input"
                  [id]="'closes-' + row"
                  [formField]="hours.closesAt"
                />
              </app-labeled-field>
            </div>
          </div>
        }
        @for (error of hoursErrors(); track error) {
          <p class="field-error" role="alert">{{ error }}</p>
        }
        <button type="button" class="btn btn-ghost gap-2 self-start" (click)="addHours()">
          <app-icon name="plus" [size]="16" />
          {{ 'coffeeShops.form.addWindow' | transloco }}
        </button>
      </app-form-section>

      <app-form-section
        number="04"
        title="coffeeShops.form.photosTitle"
        caption="coffeeShops.form.photosCaption"
      >
        <app-image-uploader [formField]="shopForm.imageUrls" />
        @for (error of errorsFor(shopForm.imageUrls(), 'imageUrls'); track error.kind) {
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
export class CoffeeShopForm {
  readonly roasters = input<Roaster[]>([]);
  readonly initialValue = input<CoffeeShopInput>();
  readonly saving = input(false);
  /** Messages the API returned for the last save, by field name. */
  readonly serverErrors = input<FieldErrors>({});
  readonly submitted = output<CoffeeShopInput>();

  protected readonly days = DAYS_OF_WEEK;
  protected readonly brewingMethodOptions: CheckOption<CoffeeBrewingMethod>[] = BREWING_METHODS.map(
    (value) => ({ value, labelKey: `options.brewingMethod.${value}` }),
  );
  protected readonly amenityOptions: CheckOption<Amenity>[] = AMENITIES.map((value) => ({
    value,
    labelKey: `options.amenity.${value}`,
  }));

  protected readonly roasterOptions = computed<CheckOption<string>[]>(() =>
    this.roasters().map((roaster) => ({ value: roaster.id, label: roaster.name })),
  );

  private readonly geo = inject(GeoService);
  private readonly transloco = inject(TranslocoService);

  private readonly data = linkedSignal<CoffeeShopDraft>(() =>
    toDraft(this.initialValue(), this.geo.defaultCountry(this.transloco.getActiveLang())),
  );

  protected readonly shopForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      maxLength(path.name, 250, { message: 'errors.tooLong' });
      maxLength(path.phoneNumber, 30, { message: 'errors.tooLong' });
      required(path.country, { message: 'errors.countryRequired' });
      required(path.state, { message: 'errors.stateRequired' });
      required(path.city, { message: 'errors.cityRequired' });
      required(path.address, { message: 'errors.addressRequired' });
      required(path.timeZone, { message: 'errors.timeZoneRequired' });
      applyEach(path.openingHours, (row) => {
        required(row.opensAt, { message: 'errors.timeRequired' });
        required(row.closesAt, { message: 'errors.timeRequired' });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitted.emit(toInput(field().value()));
        },
      },
    },
  );

  /** Every IANA time zone the browser knows, plus the current one when it is not among them. */
  protected readonly timeZoneOptions = computed(() =>
    withCurrent(Intl.supportedValuesOf('timeZone'), this.shopForm.timeZone().value()),
  );

  protected errorsFor(
    state: Parameters<typeof fieldErrors>[0],
    name: string,
  ): ReturnType<typeof fieldErrors> {
    return fieldErrors(state, this.serverErrors(), name);
  }

  /** Messages the API returned for the list as a whole, such as a repeated day and opening time. */
  protected hoursErrors(): string[] {
    return this.serverErrors()['openingHours'] ?? [];
  }

  protected addHours(): void {
    this.data.update((value) => ({
      ...value,
      openingHours: [
        ...value.openingHours,
        { dayOfWeek: '1', opensAt: '08:00', closesAt: '18:00' },
      ],
    }));
  }

  protected removeHours(index: number): void {
    this.data.update((value) => ({
      ...value,
      openingHours: value.openingHours.filter((_, i) => i !== index),
    }));
  }
}
