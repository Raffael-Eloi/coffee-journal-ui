import { TestBed } from '@angular/core/testing';
import { YesNoToggle } from './yes-no-toggle';

describe('YesNoToggle', () => {
  async function setup() {
    const fixture = TestBed.createComponent(YesNoToggle);
    fixture.componentRef.setInput('label', 'Recommend to others?');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const radios = () => Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    return { fixture, el, radios };
  }

  it('shows the default labels and starts on "no"', async () => {
    const { el, radios } = await setup();

    expect(el.textContent).toContain('Yes, definitely');
    expect(el.textContent).toContain('Not quite');
    expect(radios()[0].checked).toBe(false);
    expect(radios()[1].checked).toBe(true);
  });

  it('sets checked to true and back to false', async () => {
    const { fixture, radios } = await setup();

    radios()[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.checked()).toBe(true);

    radios()[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it('uses custom labels', async () => {
    const { fixture, el } = await setup();
    fixture.componentRef.setInput('yesLabel', 'Available');
    fixture.componentRef.setInput('noLabel', 'Not available');
    await fixture.whenStable();

    expect(el.textContent).toContain('Available');
    expect(el.textContent).toContain('Not available');
  });
});
