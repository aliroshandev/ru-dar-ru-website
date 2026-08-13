import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiButton } from './ui-button.component';

@Component({
  standalone: true,
  imports: [UiButton],
  template: ` <button ui-button variant="primary">ذخیره</button> `,
})
class Host {}

describe('UiButton', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  it('renders content and applies primary variant classes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const btn = host.querySelector('button') as HTMLElement;
    expect(btn.textContent).toContain('ذخیره');
    expect(btn.classList.contains('bg-action-primary')).toBe(true);
  });
});
