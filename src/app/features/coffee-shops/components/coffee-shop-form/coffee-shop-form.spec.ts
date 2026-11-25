import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CoffeeShopFormValue } from '../../coffee-shop.model';
import { CoffeeShopForm } from './coffee-shop-form';

describe('CoffeeShopForm', () => {
  function setup() {
    const fixture = TestBed.createComponent(CoffeeShopForm);
    const submitted: CoffeeShopFormValue[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    return { fixture, submitted, el: fixture.nativeElement as HTMLElement };
  }

  function submit(el: HTMLElement) {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('does not emit and shows an error when the name is empty', async () => {
    const { fixture, submitted, el } = setup();
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([]);
    const alerts = Array.from(el.querySelectorAll('[role="alert"]'))
      .map((a) => a.textContent)
      .join(' ');
    expect(alerts).toContain('Name is required');
    expect(alerts).toContain('Rate must be between 1 and 5');
  });

  it('emits the value when the name is filled', async () => {
    const { fixture, submitted, el } = setup();
    await fixture.whenStable();

    const name = el.querySelector<HTMLInputElement>('#name')!;
    name.value = 'Blue Door';
    name.dispatchEvent(new Event('input'));
    el.querySelectorAll<HTMLInputElement>('app-star-rating input[type="radio"]')[3].click();
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted.length).toBe(1);
    expect(submitted[0].name).toBe('Blue Door');
    expect(submitted[0].rate).toBe(4);
  });
});

describe('CoffeeShopForm place fields', () => {
  const brazil = {
    states: [
      { name: 'Minas Gerais', cities: ['Belo Horizonte', 'Contagem'] },
      { name: 'São Paulo', cities: ['Campinas', 'Santos'] },
    ],
  };

  function setup(initialValue?: Partial<CoffeeShopFormValue>) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(CoffeeShopForm);
    if (initialValue) {
      fixture.componentRef.setInput('initialValue', {
        name: 'Blue Door',
        website: '',
        rate: 4,
        review: '',
        recommend: true,
        city: '',
        state: '',
        country: '',
        location: '',
        imageUrls: [],
        ...initialValue,
      });
    }
    const http = TestBed.inject(HttpTestingController);
    return { fixture, http, el: fixture.nativeElement as HTMLElement };
  }

  function chooseCountry(el: HTMLElement, value: string) {
    const select = el.querySelector<HTMLSelectElement>('#country')!;
    select.value = value;
    select.dispatchEvent(new Event('input'));
    select.dispatchEvent(new Event('change'));
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
    const { fixture, http, el } = setup();
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
    const { fixture, http, el } = setup({ country: 'Brazil', state: 'São Paulo' });
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
    expect(el.querySelector('[role="combobox"]')).toBeNull();
  });
});
