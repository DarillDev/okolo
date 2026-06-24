import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  input,
} from '@angular/core';
import { TDsSize } from '@shared/models/types/ds-size.type';
import { TFormFieldAppearance } from './types/form-field-appearance.type';
import { TFormFieldShape } from './types/form-field-shape.type';
import { ErrorDirective } from './directives/error/error.directive';
import { HintDirective } from './directives/hint/hint.directive';
import { PrefixDirective } from './directives/prefix/prefix.directive';
import { SuffixDirective } from './directives/suffix/suffix.directive';
import { FORM_FIELD_CONTROL } from './config/form-field-control.token';
import { FORM_FIELD } from './config/form-field.token';

@Component({
  selector: 'ds-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  exportAs: 'formField',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FORM_FIELD, useExisting: FormFieldComponent }],
  host: {
    '[class]': '[size(), appearance(), shape()]',
  },
})
export class FormFieldComponent {
  private readonly control = contentChild(FORM_FIELD_CONTROL);
  private readonly errors = contentChildren(ErrorDirective);
  private readonly hints = contentChildren(HintDirective);
  private readonly prefix = contentChild(PrefixDirective);
  private readonly suffix = contentChild(SuffixDirective);

  public readonly size = input<TDsSize | null>(null);
  public readonly appearance = input<TFormFieldAppearance>('outline');
  public readonly shape = input<TFormFieldShape>('box');

  protected readonly isDisabled = computed(() => this.control()?.isDisabled() ?? false);
  protected readonly hasPrefix = computed(() => !!this.prefix());
  protected readonly hasSuffix = computed(() => !!this.suffix());
  protected readonly hasHint = computed(() => this.hints().length > 0);
  protected readonly hasError = computed(() => this.errors().length > 0);

  constructor() {
    effect(() => {
      const control = this.control();
      const hintsIds = this.hints().map((element) => element.id);
      const errorsIds = this.errors().map((element) => element.id);

      if (!control) {
        return;
      }

      control.setDescribedByIds([...hintsIds, ...errorsIds]);
    });
  }

  protected onWrapperClick(event: MouseEvent): void {
    this.control()?.onContainerClick(event);
  }
}
