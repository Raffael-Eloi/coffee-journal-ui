import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, max, min, required } from '@angular/forms/signals';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { StarRating } from '../../../../shared/ui/star-rating/star-rating';
import { YesNoToggle } from '../../../../shared/ui/yes-no-toggle/yes-no-toggle';
import { RoasterFormValue } from '../../roaster.model';

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
  imports: [FormField, FormRoot, FormSection, Icon, LabeledField, StarRating, YesNoToggle],
  template: `
    <form class="flex flex-col gap-8" [formRoot]="roasterForm">
      <app-form-section number="01" title="The Roaster" caption="Roaster profile">
        <div class="grid gap-4">
          <app-labeled-field
            label="Roaster name"
            controlId="name"
            icon="flame"
            [errors]="roasterForm.name().touched() ? roasterForm.name().errors() : []"
          >
            <input id="name" type="text" class="field-input" [formField]="roasterForm.name" />
          </app-labeled-field>

          <app-labeled-field label="Website" controlId="website" icon="link">
            <input id="website" type="url" class="field-input" [formField]="roasterForm.website" />
          </app-labeled-field>

          <app-labeled-field label="Logo URL" controlId="logoUrl" icon="link">
            <input id="logoUrl" type="url" class="field-input" [formField]="roasterForm.logoUrl" />
          </app-labeled-field>

          <app-yes-no-toggle
            label="Membership option"
            yesLabel="Available"
            noLabel="Not available"
            [formField]="roasterForm.hasMembershipOption"
          />
        </div>
      </app-form-section>

      <app-form-section number="02" title="Experience & Verdict" caption="Quality & service">
        <div class="grid items-center gap-6 rounded-xl bg-container-low p-4 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <app-star-rating [formField]="roasterForm.rate" />
            @if (roasterForm.rate().touched()) {
              @for (error of roasterForm.rate().errors(); track error.kind) {
                <p class="field-error" role="alert">{{ error.message }}</p>
              }
            }
          </div>
          <app-yes-no-toggle label="Recommend to others?" align="end" [formField]="roasterForm.recommend" />
        </div>

        <app-labeled-field label="Personal impressions & notes" controlId="review">
          <textarea id="review" rows="4" class="field-input" [formField]="roasterForm.review"></textarea>
        </app-labeled-field>
      </app-form-section>

      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
          <app-icon name="check" [size]="16" />
          {{ saving() ? 'Saving…' : 'Save' }}
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
      required(path.name, { message: 'Name is required' });
      min(path.rate, 1, { message: 'Rate must be between 1 and 5' });
      max(path.rate, 5, { message: 'Rate must be between 1 and 5' });
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
