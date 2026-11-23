import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
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
  imports: [FormField, FormRoot],
  template: `
    <form class="flex max-w-xl flex-col gap-4" [formRoot]="roasterForm">
      <div class="flex flex-col gap-1">
        <label for="name">Name</label>
        <input id="name" type="text" [class]="inputClass" [formField]="roasterForm.name" />
        @if (roasterForm.name().touched()) {
          @for (error of roasterForm.name().errors(); track error.kind) {
            <p class="text-sm text-red-700" role="alert">{{ error.message }}</p>
          }
        }
      </div>

      <div class="flex flex-col gap-1">
        <label for="website">Website</label>
        <input id="website" type="url" [class]="inputClass" [formField]="roasterForm.website" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="logoUrl">Logo URL</label>
        <input id="logoUrl" type="url" [class]="inputClass" [formField]="roasterForm.logoUrl" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="rate">Rate</label>
        <input id="rate" type="number" [class]="inputClass" [formField]="roasterForm.rate" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="review">Review</label>
        <textarea id="review" rows="4" [class]="inputClass" [formField]="roasterForm.review"></textarea>
      </div>

      <div class="flex items-center gap-2">
        <input id="recommend" type="checkbox" [formField]="roasterForm.recommend" />
        <label for="recommend">Recommend</label>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="hasMembershipOption"
          type="checkbox"
          [formField]="roasterForm.hasMembershipOption"
        />
        <label for="hasMembershipOption">Has membership option</label>
      </div>

      <button
        type="submit"
        class="self-start rounded bg-stone-900 px-4 py-2 text-white disabled:opacity-60"
        [disabled]="saving()"
      >
        {{ saving() ? 'Saving…' : 'Save' }}
      </button>
    </form>
  `,
})
export class RoasterForm {
  readonly initialValue = input<RoasterFormValue>();
  readonly saving = input(false);
  readonly submitted = output<RoasterFormValue>();

  protected readonly inputClass = 'rounded border border-stone-500 bg-white px-3 py-2';

  private readonly data = linkedSignal<RoasterFormValue>(() => this.initialValue() ?? EMPTY_VALUE);

  protected readonly roasterForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'Name is required' });
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
