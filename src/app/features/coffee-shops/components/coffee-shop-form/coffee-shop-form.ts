import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, max, min, required } from '@angular/forms/signals';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
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

@Component({
  selector: 'app-coffee-shop-form',
  imports: [
    TranslocoPipe,
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
            label="coffeeShops.form.city"
            controlId="city"
            icon="pin"
          >
            <input id="city" type="text" class="field-input" [formField]="shopForm.city" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffeeShops.form.state"
            controlId="state"
            icon="pin"
          >
            <input id="state" type="text" class="field-input" [formField]="shopForm.state" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffeeShops.form.country"
            controlId="country"
            icon="globe"
          >
            <input id="country" type="text" class="field-input" [formField]="shopForm.country" />
          </app-labeled-field>

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

  private readonly data = linkedSignal<CoffeeShopFormValue>(
    () => this.initialValue() ?? EMPTY_VALUE,
  );

  protected readonly shopForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
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
}
