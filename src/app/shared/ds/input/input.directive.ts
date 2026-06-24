import {
  booleanAttribute,
  computed,
  Directive,
  DoCheck,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FORM_FIELD_CONTROL, IFormFieldControl } from '../form-field';

let nextInputId = 0;

@Directive({
  selector: 'input[dsInput]',
  exportAs: 'dsInput',
  providers: [{ provide: FORM_FIELD_CONTROL, useExisting: InputDirective }],
  host: {
    class: 'ds-input',
    '[id]': 'id()',
    '[disabled]': 'isDisabled()',
    '[attr.aria-invalid]': 'hasError() || null',
    '(input)': '_onInput()',
  },
})
export class InputDirective implements IFormFieldControl, DoCheck {
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly invalid = signal(false);
  private readonly touchedOrDirty = signal(false);
  private readonly controlDisabled = signal(false);
  private readonly empty = signal(true);

  public readonly id = input(`ds-input-${nextInputId++}`);
  public readonly disabled = input(false, { transform: booleanAttribute });
  public readonly emptyStateMatcher = input<((value: string) => boolean) | undefined>(undefined);

  public readonly hasError = computed(() => this.invalid() && this.touchedOrDirty());
  public readonly isEmpty = computed(() => this.empty());
  public readonly isDisabled = computed(() =>
    this.ngControl?.control ? this.controlDisabled() : this.disabled(),
  );

  public ngDoCheck(): void {
    const control = this.ngControl?.control;

    if (control) {
      this.invalid.set(!!control.invalid);
      this.touchedOrDirty.set(!!control.touched || !!control.dirty);
      this.controlDisabled.set(control.disabled);
    }

    const matcher = this.emptyStateMatcher() ?? this.defaultEmptyStateMatcher;

    this.empty.set(matcher(this.elementRef.nativeElement.value));
  }

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

  private defaultEmptyStateMatcher(value: string): boolean {
    return value === null || value === undefined || value === '';
  }
}
