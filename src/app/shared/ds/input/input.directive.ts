import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FORM_FIELD_CONTROL, IFormFieldControl } from '../form-field';

let nextdsInputId = 0;

@Directive({
  selector: 'input[dsInput]',
  exportAs: 'dsInput',
  providers: [{ provide: FORM_FIELD_CONTROL, useExisting: InputDirective }],
  host: {
    class: 'ds-input',
    '[id]': 'id()',
    '[attr.aria-invalid]': 'hasError() || null',
    '(input)': '_onInput()',
  },
})
export class InputDirective<T> implements IFormFieldControl {
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  public readonly id = input(`ds-input-${nextdsInputId++}`);
  public readonly emptyStateMatcher = input<((value: T) => boolean) | undefined>(undefined);
  public readonly isDisabledInput = input(false, { alias: 'isDisabled' });

  public readonly hasError = computed(() => {
    const control = this.ngControl?.control;

    return !!control?.invalid && (!!control.touched || !!control.dirty);
  });

  public readonly isEmpty = computed(() => {
    const matcher = this.emptyStateMatcher() ?? this.defaultEmptyStateMatcher;

    return matcher(this.elementRef.nativeElement.value);
  });

  public readonly isDisabled = computed(() => {
    const control = this.ngControl?.control;

    return control ? control.disabled : this.isDisabledInput();
  });

  public onContainerClick(): void {
    this.elementRef.nativeElement.focus();
  }

  protected _onInput(): void {
    // This is a noop function and is used to let Angular know whenever the value changes.
    // Angular will run a new change detection each time the `input` event has been dispatched.
    // It's necessary that Angular recognizes the value change, because when floatingLabel
    // is set to false and Angular forms aren't used, the placeholder won't recognize the
    // value changes and will not disappear.
    // Listening to the input event wouldn't be necessary when the input is using the
    // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
  }

  public setDescribedByIds(ids: string[]): void {
    if (ids.length) {
      this.elementRef.nativeElement.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this.elementRef.nativeElement.removeAttribute('aria-describedby');
    }
  }

  private defaultEmptyStateMatcher(value: T): boolean {
    return value === null || value === undefined || (value as unknown) === '';
  }
}
