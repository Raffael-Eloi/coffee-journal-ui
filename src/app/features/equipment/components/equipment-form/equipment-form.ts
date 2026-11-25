import { Component, input, linkedSignal, output } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  pattern,
  required,
} from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { FieldErrors } from '../../../../shared/api/validation-errors';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { LogoUploader } from '../../../../shared/ui/logo-uploader/logo-uploader';
import { StarRating } from '../../../../shared/ui/star-rating/star-rating';
import { YesNoToggle } from '../../../../shared/ui/yes-no-toggle/yes-no-toggle';
import {
  EquipmentCategory,
  EquipmentInput,
  UseFrequency,
  USE_FREQUENCIES,
} from '../../equipment.model';

/** The values edited in the form: optional API fields are empty strings, and the frequency is the select value. */
interface EquipmentDraft {
  name: string;
  brand: string;
  model: string;
  review: string;
  rating: number;
  recommend: boolean;
  equipmentCategoryId: string;
  price: number | null;
  currency: string;
  link: string;
  frequencyOfUse: string;
  imageUrl: string;
  purchaseDate: string;
}

const EMPTY_DRAFT: EquipmentDraft = {
  name: '',
  brand: '',
  model: '',
  review: '',
  rating: 0,
  recommend: false,
  equipmentCategoryId: '',
  price: null,
  currency: 'BRL',
  link: '',
  frequencyOfUse: '',
  imageUrl: '',
  purchaseDate: '',
};

function toDraft(input: EquipmentInput | undefined): EquipmentDraft {
  if (!input) return EMPTY_DRAFT;
  return {
    name: input.name,
    brand: input.brand,
    model: input.model ?? '',
    review: input.review,
    rating: input.rating,
    recommend: input.recommend,
    equipmentCategoryId: input.equipmentCategoryId,
    price: input.price,
    currency: input.currency ?? EMPTY_DRAFT.currency,
    link: input.link ?? '',
    frequencyOfUse: String(input.frequencyOfUse),
    imageUrl: input.imageUrl ?? '',
    purchaseDate: input.purchaseDate ?? '',
  };
}

function toInput(draft: EquipmentDraft): EquipmentInput {
  const hasPrice = draft.price !== null;
  return {
    name: draft.name.trim(),
    brand: draft.brand.trim(),
    model: draft.model.trim() || null,
    review: draft.review,
    rating: draft.rating,
    recommend: draft.recommend,
    equipmentCategoryId: draft.equipmentCategoryId,
    // The API wants price and currency together or both empty.
    price: hasPrice ? draft.price : null,
    currency: hasPrice ? draft.currency : null,
    link: draft.link.trim() || null,
    frequencyOfUse: Number(draft.frequencyOfUse) as UseFrequency,
    imageUrl: draft.imageUrl || null,
    purchaseDate: draft.purchaseDate || null,
  };
}

interface FieldStateLike {
  touched(): boolean;
  errors(): readonly { kind: string; message?: string }[];
}

@Component({
  selector: 'app-equipment-form',
  imports: [
    TranslocoPipe,
    OptionLabelPipe,
    FormField,
    FormRoot,
    FormSection,
    Icon,
    LabeledField,
    LogoUploader,
    StarRating,
    YesNoToggle,
  ],
  template: `
    <form class="flex flex-col gap-8" [formRoot]="equipmentForm">
      <app-form-section
        number="01"
        title="equipment.form.gearTitle"
        caption="equipment.form.gearCaption"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <app-labeled-field
            label="equipment.form.name"
            controlId="name"
            icon="coffee"
            [errors]="errorsFor(equipmentForm.name(), 'name')"
          >
            <input id="name" type="text" class="field-input" [formField]="equipmentForm.name" />
          </app-labeled-field>

          <app-labeled-field
            label="equipment.form.brand"
            controlId="brand"
            icon="store"
            [errors]="errorsFor(equipmentForm.brand(), 'brand')"
          >
            <input id="brand" type="text" class="field-input" [formField]="equipmentForm.brand" />
          </app-labeled-field>

          <app-labeled-field
            label="equipment.form.model"
            controlId="model"
            icon="note"
            [errors]="errorsFor(equipmentForm.model(), 'model')"
          >
            <input id="model" type="text" class="field-input" [formField]="equipmentForm.model" />
          </app-labeled-field>

          <app-labeled-field
            label="equipment.form.category"
            controlId="equipmentCategoryId"
            [errors]="errorsFor(equipmentForm.equipmentCategoryId(), 'equipmentCategoryId')"
          >
            <select
              id="equipmentCategoryId"
              class="field-input"
              [formField]="equipmentForm.equipmentCategoryId"
            >
              <option value="">{{ 'equipment.form.selectCategory' | transloco }}</option>
              @for (category of categories(); track category.id) {
                <option [value]="category.id">{{ category.name }}</option>
              }
            </select>
          </app-labeled-field>

          <app-labeled-field
            label="equipment.form.frequency"
            controlId="frequencyOfUse"
            [errors]="errorsFor(equipmentForm.frequencyOfUse(), 'frequencyOfUse')"
          >
            <select
              id="frequencyOfUse"
              class="field-input"
              [formField]="equipmentForm.frequencyOfUse"
            >
              <option value="">{{ 'equipment.form.selectFrequency' | transloco }}</option>
              @for (frequency of frequencies; track frequency) {
                <option [value]="frequency">
                  {{ frequency + '' | optionLabel: 'frequency' }}
                </option>
              }
            </select>
          </app-labeled-field>

          <app-labeled-field
            label="equipment.form.purchaseDate"
            controlId="purchaseDate"
            [errors]="errorsFor(equipmentForm.purchaseDate(), 'purchaseDate')"
          >
            <input
              id="purchaseDate"
              type="date"
              class="field-input"
              [formField]="equipmentForm.purchaseDate"
            />
          </app-labeled-field>

          <app-labeled-field
            label="equipment.form.price"
            controlId="price"
            [errors]="[
              ...errorsFor(equipmentForm.price(), 'price'),
              ...errorsFor(equipmentForm.currency(), 'currency'),
            ]"
          >
            <div
              class="flex overflow-hidden rounded-lg border border-outline bg-container-low shadow-sm focus-within:bg-surface"
            >
              <select
                class="border-r border-outline bg-transparent py-2 pr-2 pl-3 font-semibold text-espresso"
                [attr.aria-label]="'equipment.form.currency' | transloco"
                [formField]="equipmentForm.currency"
              >
                @for (currency of currencies; track currency.code) {
                  <option [value]="currency.code">{{ currency.symbol }}</option>
                }
              </select>
              <input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="min-w-0 flex-1 bg-transparent px-3 py-2 text-ink"
                [formField]="equipmentForm.price"
              />
            </div>
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="equipment.form.link"
            controlId="link"
            icon="link"
            [errors]="errorsFor(equipmentForm.link(), 'link')"
          >
            <input id="link" type="url" class="field-input" [formField]="equipmentForm.link" />
          </app-labeled-field>
        </div>
      </app-form-section>

      <app-form-section
        number="02"
        title="common.experienceTitle"
        caption="equipment.form.verdictCaption"
      >
        <div class="grid items-center gap-6 rounded-xl bg-container-low p-4 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <app-star-rating [formField]="equipmentForm.rating" />
            @for (error of errorsFor(equipmentForm.rating(), 'rating'); track error.kind) {
              <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
            }
          </div>
          <app-yes-no-toggle
            label="common.recommendQuestion"
            align="end"
            [formField]="equipmentForm.recommend"
          />
        </div>
        @for (error of errorsFor(equipmentForm.recommend(), 'recommend'); track error.kind) {
          <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
        }

        <app-labeled-field
          label="common.review"
          controlId="review"
          [errors]="errorsFor(equipmentForm.review(), 'review')"
        >
          <textarea
            id="review"
            rows="4"
            class="field-input"
            [formField]="equipmentForm.review"
          ></textarea>
        </app-labeled-field>
      </app-form-section>

      <app-form-section
        number="03"
        title="equipment.form.photoTitle"
        caption="equipment.form.photoCaption"
      >
        <app-logo-uploader textGroup="ui.photoUploader" [formField]="equipmentForm.imageUrl" />
        @for (error of errorsFor(equipmentForm.imageUrl(), 'imageUrl'); track error.kind) {
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
export class EquipmentForm {
  readonly categories = input.required<EquipmentCategory[]>();
  readonly initialValue = input<EquipmentInput>();
  readonly saving = input(false);
  /** Messages the API returned for the last save, by field name. */
  readonly serverErrors = input<FieldErrors>({});
  readonly submitted = output<EquipmentInput>();

  protected readonly frequencies = USE_FREQUENCIES;
  protected readonly currencies = [
    { code: 'BRL', symbol: 'R$' },
    { code: 'USD', symbol: '$' },
  ];

  private readonly data = linkedSignal<EquipmentDraft>(() => toDraft(this.initialValue()));

  protected readonly equipmentForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      maxLength(path.name, 250, { message: 'errors.tooLong' });
      required(path.brand, { message: 'errors.brandRequired' });
      maxLength(path.brand, 250, { message: 'errors.tooLong' });
      maxLength(path.model, 250, { message: 'errors.tooLong' });
      required(path.equipmentCategoryId, { message: 'errors.categoryRequired' });
      required(path.frequencyOfUse, { message: 'errors.frequencyRequired' });
      required(path.review, { message: 'errors.reviewRequired' });
      maxLength(path.review, 4000, { message: 'errors.tooLong' });
      min(path.rating, 1, { message: 'errors.rateRange' });
      max(path.rating, 5, { message: 'errors.rateRange' });
      min(path.price, 0.01, { message: 'errors.priceRange' });
      max(path.price, 99999999.99, { message: 'errors.priceRange' });
      maxLength(path.link, 2000, { message: 'errors.tooLong' });
      pattern(path.link, /^(https?:\/\/.+)?$/i, { message: 'errors.linkInvalid' });
    },
    {
      submission: {
        action: async (field) => {
          this.submitted.emit(toInput(field().value()));
        },
      },
    },
  );

  /** Validation messages for a field once it was touched, then the messages the API returned for it. */
  protected errorsFor(state: FieldStateLike, name: string): { kind: string; message?: string }[] {
    const client = state.touched() ? state.errors() : [];
    const server = (this.serverErrors()[name] ?? []).map((message) => ({
      kind: `server-${message}`,
      message,
    }));
    return [...client, ...server];
  }
}
