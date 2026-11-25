import { Component, computed, inject, input, linkedSignal, output, resource } from '@angular/core';
import { disabled, form, FormField, FormRoot, max, min, required } from '@angular/forms/signals';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { GEO_COUNTRIES, GeoService } from '../../../../shared/geo/geo.service';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Combobox } from '../../../../shared/ui/combobox/combobox';
import { Icon } from '../../../../shared/ui/icon/icon';
import { ImageUploader } from '../../../../shared/ui/image-uploader/image-uploader';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { StarRating } from '../../../../shared/ui/star-rating/star-rating';
import { YesNoToggle } from '../../../../shared/ui/yes-no-toggle/yes-no-toggle';
import { CoffeeShopFormValue } from '../../coffee-shop.model';
import { TranslocoPipe } from '@jsverse/transloco';

const EMPTY_VALUE: CoffeeShopFormValue = {
  name: '',
  website: '',
  rate: 0,
  review: '',
  recommend: false,
  city: '',
  state: '',
  country: '',
  location: '',
  imageUrls: [],
};

/** The options, plus the current value when it is not among them (for example a saved legacy value). */
function withCurrent(options: readonly string[], current: string): string[] {
  return current === '' || options.includes(current) ? [...options] : [...options, current];
}

@Component({
  selector: 'app-coffee-shop-form',
  imports: [
    TranslocoPipe,
    OptionLabelPipe,
    Combobox,
    FormField,
    FormRoot,
    FormSection,
    Icon,
    ImageUploader,
    LabeledField,
    StarRating,
    YesNoToggle,
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
            [errors]="shopForm.name().touched() ? shopForm.name().errors() : []"
          >
            <input id="name" type="text" class="field-input" [formField]="shopForm.name" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-6"
            label="common.website"
            controlId="website"
            icon="link"
          >
            <input id="website" type="url" class="field-input" [formField]="shopForm.website" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffeeShops.form.country"
            controlId="country"
            icon="globe"
          >
            <select
              id="country"
              class="field-input"
              [formField]="shopForm.country"
              (change)="resetState()"
            >
              <option value="">{{ 'coffeeShops.form.selectCountry' | transloco }}</option>
              @for (country of countryOptions(); track country) {
                <option [value]="country">{{ country | optionLabel: 'country' }}</option>
              }
            </select>
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffeeShops.form.state"
            controlId="state"
            icon="pin"
          >
            @if (customPlace()) {
              <input id="state" type="text" class="field-input" [formField]="shopForm.state" />
            } @else {
              <app-combobox
                inputId="state"
                placeholder="coffeeShops.form.selectState"
                [options]="stateOptions()"
                [formField]="shopForm.state"
                (picked)="resetCity()"
              />
            }
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffeeShops.form.city"
            controlId="city"
            icon="pin"
          >
            @if (customPlace()) {
              <input id="city" type="text" class="field-input" [formField]="shopForm.city" />
            } @else {
              <app-combobox
                inputId="city"
                placeholder="coffeeShops.form.selectCity"
                [options]="cityOptions()"
                [formField]="shopForm.city"
              />
            }
          </app-labeled-field>

          @if (geoData.error()) {
            <p class="field-error md:col-span-6" role="alert">
              {{ 'coffeeShops.form.geoError' | transloco }}
            </p>
          }

          <app-labeled-field
            class="md:col-span-6"
            label="coffeeShops.form.location"
            controlId="location"
            icon="pin"
          >
            <input id="location" type="text" class="field-input" [formField]="shopForm.location" />
          </app-labeled-field>
        </div>
      </app-form-section>

      <app-form-section
        number="02"
        title="common.experienceTitle"
        caption="coffeeShops.form.verdictCaption"
      >
        <div class="grid items-center gap-6 rounded-xl bg-container-low p-4 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <app-star-rating [formField]="shopForm.rate" />
            @if (shopForm.rate().touched()) {
              @for (error of shopForm.rate().errors(); track error.kind) {
                <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
              }
            }
          </div>
          <app-yes-no-toggle
            label="common.recommendQuestion"
            align="end"
            [formField]="shopForm.recommend"
          />
        </div>

        <app-labeled-field label="common.review" controlId="review">
          <textarea
            id="review"
            rows="4"
            class="field-input"
            [formField]="shopForm.review"
          ></textarea>
        </app-labeled-field>
      </app-form-section>

      <app-form-section
        number="03"
        title="coffeeShops.form.photosTitle"
        caption="coffeeShops.form.photosCaption"
      >
        <app-image-uploader [formField]="shopForm.imageUrls" />
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
  readonly initialValue = input<CoffeeShopFormValue>();
  readonly saving = input(false);
  readonly submitted = output<CoffeeShopFormValue>();

  private readonly geo = inject(GeoService);

  private readonly data = linkedSignal<CoffeeShopFormValue>(
    () => this.initialValue() ?? EMPTY_VALUE,
  );

  protected readonly shopForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      disabled(path.state, ({ valueOf }) => !valueOf(path.country));
      disabled(path.city, ({ valueOf }) => !valueOf(path.state));
      min(path.rate, 1, { message: 'errors.rateRange' });
      max(path.rate, 5, { message: 'errors.rateRange' });
    },
    {
      submission: {
        action: async (field) => {
          this.submitted.emit(field().value());
        },
      },
    },
  );
  /** States and cities of the chosen country; idle when the country has no bundled data. */
  protected readonly geoData = resource({
    params: () => this.geo.codeFor(this.shopForm.country().value()),
    loader: ({ params }) => this.geo.load(params),
  });

  /** A saved country outside the bundled ones keeps free-text state and city. */
  protected readonly customPlace = computed(() => {
    const country = this.shopForm.country().value();
    return country !== '' && this.geo.codeFor(country) === undefined;
  });

  protected readonly countryOptions = computed(() =>
    withCurrent(
      GEO_COUNTRIES.map((country) => country.name),
      this.shopForm.country().value(),
    ),
  );

  protected readonly stateOptions = computed(() =>
    withCurrent(
      (this.geoData.value()?.states ?? []).map((state) => state.name),
      this.shopForm.state().value(),
    ),
  );

  protected readonly cityOptions = computed(() => {
    const state = this.shopForm.state().value();
    const cities = this.geoData.value()?.states.find((item) => item.name === state)?.cities ?? [];
    return withCurrent(cities, this.shopForm.city().value());
  });

  protected resetState(): void {
    this.shopForm.state().value.set('');
    this.resetCity();
  }

  protected resetCity(): void {
    this.shopForm.city().value.set('');
  }
}
