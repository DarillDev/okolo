import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputDirective } from './input.directive';

@Component({
  template: `<input dsInput [formControl]="control" />`,
  imports: [InputDirective, ReactiveFormsModule],
})
class HostComponent {
  public readonly control = new FormControl('', { validators: Validators.required });
  public readonly input = viewChild.required(InputDirective);
}

describe('InputDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    return { fixture, host, input: host.input() };
  }

  it('реактивно отражает ошибку формы (invalid + touched)', () => {
    const { fixture, host, input } = setup();

    expect(input.hasError()).toBe(false);

    host.control.markAsTouched();
    fixture.detectChanges();

    expect(input.hasError()).toBe(true);
  });

  it('реактивно отражает disable/enable формы', () => {
    const { fixture, host, input } = setup();

    expect(input.isDisabled()).toBe(false);

    host.control.disable();
    fixture.detectChanges();
    expect(input.isDisabled()).toBe(true);

    host.control.enable();
    fixture.detectChanges();
    expect(input.isDisabled()).toBe(false);
  });

  it('реактивно отражает пустоту значения', () => {
    const { fixture, host, input } = setup();

    expect(input.isEmpty()).toBe(true);

    host.control.setValue('кофе');
    fixture.detectChanges();

    expect(input.isEmpty()).toBe(false);
  });
});
