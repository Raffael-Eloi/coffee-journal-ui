import { TestBed } from '@angular/core/testing';
import { StarRating } from './star-rating';

describe('StarRating', () => {
  async function setup() {
    const fixture = TestBed.createComponent(StarRating);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const radios = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    return { fixture, el, radios };
  }

  it('renders five stars with accessible names and none selected', async () => {
    const { el, radios } = await setup();

    expect(radios.length).toBe(5);
    expect(radios.some((r) => r.checked)).toBe(false);
    expect(el.textContent).toContain('1 star');
    expect(el.textContent).toContain('5 stars');
  });

  it('sets the value when a star is chosen', async () => {
    const { fixture, radios } = await setup();

    radios[2].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe(3);
    expect(radios[2].checked).toBe(true);
  });

  it('fills the stars up to the value', async () => {
    const { fixture, el } = await setup();
    fixture.componentInstance.value.set(2);
    await fixture.whenStable();

    expect(el.querySelectorAll('.star-on').length).toBe(2);
  });

  it('emits touch when focus leaves the control', async () => {
    const { fixture, el } = await setup();
    let touched = 0;
    fixture.componentInstance.touch.subscribe(() => touched++);

    el.querySelector('div')!.dispatchEvent(new Event('focusout', { bubbles: true }));

    expect(touched).toBe(1);
  });
});
