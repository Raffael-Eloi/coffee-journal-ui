import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, max, min, required } from '@angular/forms/signals';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { LogoUploader } from '../../../../shared/ui/logo-uploader/logo-uploader';
import { StarRating } from '../../../../shared/ui/star-rating/star-rating';
import { YesNoToggle } from '../../../../shared/ui/yes-no-toggle/yes-no-toggle';
import { RoasterFormValue } from '../../roaster.model';
import { TranslocoPipe } from '@jsverse/transloco';

const EMPTY_VALUE: RoasterFormValue = {
  name: '',
  website: '',
  rate: 0,
  review: '',
  recommend: false,
  hasMembershipOption: false,
  logoUrl: '',
};

@Component({
  selector: 'app-roaster-form',
  imports: [
    TranslocoPipe,
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
            [errors]="roasterForm.name().touched() ? roasterForm.name().errors() : []"
          >
            <input id="name" type="text" class="field-input" [formField]="roasterForm.name" />
          </app-labeled-field>

          <app-labeled-field label="common.website" controlId="website" icon="link">
            <input id="website" type="url" class="field-input" [formField]="roasterForm.website" />
          </app-labeled-field>

          <app-logo-uploader [formField]="roasterForm.logoUrl" />

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
        title="common.experienceTitle"
        caption="roasters.form.verdictCaption"
      >
        <div class="grid items-center gap-6 rounded-xl bg-container-low p-4 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <app-star-rating [formField]="roasterForm.rate" />
            @if (roasterForm.rate().touched()) {
              @for (error of roasterForm.rate().errors(); track error.kind) {
                <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
              }
            }
          </div>
          <app-yes-no-toggle
            label="common.recommendQuestion"
            align="end"
            [formField]="roasterForm.recommend"
          />
        </div>

        <app-labeled-field label="common.review" controlId="review">
          <textarea
            id="review"
            rows="4"
            class="field-input"
            [formField]="roasterForm.review"
          ></textarea>
        </app-labeled-field>
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
  readonly initialValue = input<RoasterFormValue>();
  readonly saving = input(false);
  readonly submitted = output<RoasterFormValue>();

  private readonly data = linkedSignal<RoasterFormValue>(() => this.initialValue() ?? EMPTY_VALUE);

  protected readonly roasterForm = form(
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
