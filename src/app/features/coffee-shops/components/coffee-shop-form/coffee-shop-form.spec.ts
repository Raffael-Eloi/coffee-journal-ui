import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Roaster } from '../../../roasters/roaster.model';
import { CoffeeShopInput } from '../../coffee-shop.model';
import { CoffeeShopForm } from './coffee-shop-form';

const roaster: Roaster = {
  id: 'r1',
  name: 'Origin Roasters',
  description: null,
  website: null,
  instagramUrl: null,
  phoneNumber: null,
  hasMembershipOption: false,
  logoUrl: null,
  city: 'Campinas',
  state: 'São Paulo',
  country: 'Brazil',
  address: null,
  classifications: [],
  imageUrls: [],
  createdAt: '',
  updatedAt: '',
};

/** Portugal is not bundled, so the place fields are plain text inputs and nothing is fetched. */
const baseValue: CoffeeShopInput = {
  name: '',
  description: null,
  website: null,
  instagramUrl: null,
  phoneNumber: null,
  city: 'Lisbon',
  state: 'Lisboa',
  country: 'Portugal',
  address: '',
  timeZone: 'Europe/Lisbon',
  roasterIds: [],
  brewingMethods: [],
  amenities: [],
  openingHours: [],
  imageUrls: [],
};

function setup(initialValue?: Partial<CoffeeShopInput>, withRoasters = true) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(CoffeeShopForm);
  if (withRoasters) fixture.componentRef.setInput('roasters', [roaster]);
  if (initialValue) {
    fixture.componentRef.setInput('initialValue', { ...baseValue, ...initialValue });
  }
  const submitted: CoffeeShopInput[] = [];
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

function check(el: HTMLElement, text: string) {
  const label = Array.from(el.querySelectorAll('label.choice')).find(
    (l) => l.textContent?.trim() === text,
  )!;
  label.querySelector<HTMLInputElement>('input')!.click();
}

describe('CoffeeShopForm', () => {
  it('does not emit and shows errors when the required fields are empty', async () => {
    const { fixture, http, submitted, el } = setup();
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
    expect(alerts).toContain('Address is required');
  });

  it('starts a new shop in the country of the app language', async () => {
    const { fixture, http, el } = setup();
    fixture.detectChanges();
    http.expectOne('/data/geo/US.json').flush({ states: [] });
    await fixture.whenStable();

    const checked = el.querySelector<HTMLInputElement>('input[type="radio"]:checked')!;
    expect(checked.closest('label')!.textContent).toContain('United States');
  });

  it('emits the offer, opening hours and null optional fields when the form is valid', async () => {
    const { fixture, submitted, el } = setup({});
    await fixture.whenStable();

    fill(el, '#name', 'Blue Door');
    fill(el, '#address', 'Rua 1');
    check(el, 'Origin Roasters');
    check(el, 'V60');
    check(el, 'Wi-Fi');
    el.querySelectorAll('button').forEach((b) => {
      if (b.textContent?.includes('Add opening hours')) b.click();
    });
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([
      {
        name: 'Blue Door',
        description: null,
        website: null,
        instagramUrl: null,
        phoneNumber: null,
        city: 'Lisbon',
        state: 'Lisboa',
        country: 'Portugal',
        address: 'Rua 1',
        timeZone: 'Europe/Lisbon',
        roasterIds: ['r1'],
        brewingMethods: [1],
        amenities: [1],
        openingHours: [{ dayOfWeek: 1, opensAt: '08:00:00', closesAt: '18:00:00' }],
        imageUrls: [],
      },
    ]);
  });

  it('shows the saved opening hours without seconds', async () => {
    const { fixture, el } = setup({
      openingHours: [{ dayOfWeek: 6, opensAt: '09:30:00', closesAt: '02:00:00' }],
    });
    await fixture.whenStable();

    expect(el.querySelector<HTMLSelectElement>('#day-0')!.value).toBe('6');
    expect(el.querySelector<HTMLInputElement>('#opens-0')!.value).toBe('09:30');
    expect(el.querySelector<HTMLInputElement>('#closes-0')!.value).toBe('02:00');
  });

  it('shows the messages the API returned next to their field', async () => {
    const { fixture, el } = setup({});
    fixture.componentRef.setInput('serverErrors', { timeZone: ['Unknown time zone'] });
    await fixture.whenStable();

    const field = el.querySelector('#timeZone')!.closest('app-labeled-field')!;
    expect(field.textContent).toContain('Unknown time zone');
  });
});

describe('CoffeeShopForm place fields', () => {
  const brazil = {
    states: [
      { name: 'Minas Gerais', cities: ['Belo Horizonte', 'Contagem'] },
      { name: 'São Paulo', cities: ['Campinas', 'Santos'] },
    ],
  };

  function chooseCountry(el: HTMLElement, name: string) {
    const label = Array.from(el.querySelectorAll('label.choice')).find((l) =>
      l.textContent?.includes(name),
    )!;
    label.querySelector<HTMLInputElement>('input')!.click();
  }

  const box = (el: HTMLElement, id: string) => el.querySelector<HTMLInputElement>('input#' + id)!;
  const optionTexts = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('[role="option"]')).map((o) => o.textContent?.trim());

  /** Focuses the box, optionally types, then waits for the list. */
  async function open(
    fixture: { whenStable(): Promise<unknown> },
    el: HTMLElement,
    id: string,
    typed?: string,
  ) {
    const input = box(el, id);
    input.dispatchEvent(new Event('focus'));
    if (typed !== undefined) {
      input.value = typed;
      input.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
  }

  async function pick(fixture: { whenStable(): Promise<unknown> }, el: HTMLElement, text: string) {
    const option = Array.from(el.querySelectorAll<HTMLElement>('[role="option"]')).find(
      (o) => o.textContent?.trim() === text,
    )!;
    option.click();
    await fixture.whenStable();
  }

  it('keeps state and city disabled until the parent is chosen, then loads the lists', async () => {
    const { fixture, http, el } = setup({ country: '', state: '', city: '' });
    await fixture.whenStable();
    expect(box(el, 'state').disabled).toBe(true);
    expect(box(el, 'city').disabled).toBe(true);

    chooseCountry(el, 'Brazil');
    fixture.detectChanges();
    http.expectOne('/data/geo/BR.json').flush(brazil);
    await fixture.whenStable();
    expect(box(el, 'state').disabled).toBe(false);

    await open(fixture, el, 'state');
    expect(optionTexts(el)).toEqual(['Minas Gerais', 'São Paulo']);
    await pick(fixture, el, 'Minas Gerais');
    expect(box(el, 'state').value).toBe('Minas Gerais');

    await open(fixture, el, 'city');
    expect(optionTexts(el)).toEqual(['Belo Horizonte', 'Contagem']);
  });

  it('filters the cities by name, ignoring accents and case', async () => {
    const { fixture, http, el } = setup({ country: 'Brazil', state: 'São Paulo', city: '' });
    fixture.detectChanges();
    http.expectOne('/data/geo/BR.json').flush(brazil);
    await fixture.whenStable();

    await open(fixture, el, 'city', 'CAMP');
    expect(optionTexts(el)).toEqual(['Campinas']);

    await open(fixture, el, 'city', 'zzz');
    expect(el.querySelector('[role="listbox"]')?.textContent).toContain('No results');
  });

  it('chooses with the keyboard and clears state and city when the country changes', async () => {
    const { fixture, http, el } = setup({
      country: 'Brazil',
      state: 'Minas Gerais',
      city: 'Contagem',
    });
    fixture.detectChanges();
    http.expectOne('/data/geo/BR.json').flush(brazil);
    await fixture.whenStable();
    expect(box(el, 'city').value).toBe('Contagem');

    await open(fixture, el, 'city', 'b');
    box(el, 'city').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    await fixture.whenStable();
    expect(box(el, 'city').value).toBe('Belo Horizonte');

    chooseCountry(el, 'United States');
    fixture.detectChanges();
    http.expectOne('/data/geo/US.json').flush({ states: [{ name: 'Texas', cities: ['Austin'] }] });
    await fixture.whenStable();

    expect(box(el, 'state').value).toBe('');
    expect(box(el, 'city').value).toBe('');
  });

  it('keeps free-text state and city for a saved country that is not bundled', async () => {
    const { fixture, el } = setup({ country: 'Portugal', state: 'Lisboa', city: 'Lisbon' });
    await fixture.whenStable();

    expect(box(el, 'state').value).toBe('Lisboa');
    expect(box(el, 'city').value).toBe('Lisbon');
    expect(el.querySelector('[role="combobox"]:not(#timeZone)')).toBeNull();
  });
});
