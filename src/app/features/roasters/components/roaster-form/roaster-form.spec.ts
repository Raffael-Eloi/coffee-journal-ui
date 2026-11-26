import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RoasterInput } from '../../roaster.model';
import { RoasterForm } from './roaster-form';

/** Portugal is not bundled, so the place fields are plain text inputs and nothing is fetched. */
const initial: RoasterInput = {
  name: '',
  description: null,
  website: null,
  instagramUrl: null,
  phoneNumber: null,
  hasMembershipOption: false,
  logoUrl: null,
  city: 'Lisbon',
  state: 'Lisboa',
  country: 'Portugal',
  address: null,
  classifications: [],
  imageUrls: [],
};

describe('RoasterForm', () => {
  function setup(initialValue?: RoasterInput) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(RoasterForm);
    if (initialValue) fixture.componentRef.setInput('initialValue', initialValue);
    const submitted: RoasterInput[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    const http = TestBed.inject(HttpTestingController);
    return { fixture, http, submitted, el: fixture.nativeElement as HTMLElement };
  }

  function submit(el: HTMLElement) {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  function fill(el: HTMLElement, selector: string, value: string) {
    const control = el.querySelector<HTMLInputElement>(selector)!;
    control.value = value;
    control.dispatchEvent(new Event('input'));
  }

  it('does not emit and shows errors when the required fields are empty', async () => {
    const { fixture, http, submitted, el } = setup();
    // A new roaster starts in the country of the app language, so its states are fetched.
    fixture.detectChanges();
    http.expectOne('/data/geo/US.json').flush({ states: [] });
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([]);
    const alerts = Array.from(el.querySelectorAll('[role="alert"]'))
      .map((a) => a.textContent)
      .join(' ');
    expect(alerts).toContain('Name is required');
    expect(alerts).toContain('State is required');
    expect(alerts).toContain('City is required');
  });

  it('emits null for the optional fields left empty, with the classifications chosen', async () => {
    const { fixture, submitted, el } = setup(initial);
    await fixture.whenStable();

    fill(el, '#name', 'Origin Roasters');
    // Classifications: Gourmet (third) and Specialty (fourth).
    const boxes = el.querySelectorAll<HTMLInputElement>('app-check-group input[type="checkbox"]');
    boxes[2].click();
    boxes[3].click();
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([
      {
        name: 'Origin Roasters',
        description: null,
        website: null,
        instagramUrl: null,
        phoneNumber: null,
        hasMembershipOption: false,
        logoUrl: null,
        city: 'Lisbon',
        state: 'Lisboa',
        country: 'Portugal',
        address: null,
        classifications: [3, 4],
        imageUrls: [],
      },
    ]);
  });

  it('shows the messages the API returned next to their field', async () => {
    const { fixture, el } = setup(initial);
    fixture.componentRef.setInput('serverErrors', { phoneNumber: ['Phone is too long'] });
    await fixture.whenStable();

    const field = el.querySelector('#phoneNumber')!.closest('app-labeled-field')!;
    expect(field.textContent).toContain('Phone is too long');
  });
});
