import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
} from '@angular/core';
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
})
export class FormFieldComponent {
  private readonly formField = contentChild(FORM_FIELD_CONTROL);
  private readonly errors = contentChildren(ErrorDirective);
  private readonly hints = contentChildren(HintDirective);
  private readonly prefix = contentChild(PrefixDirective);
  private readonly suffix = contentChild(SuffixDirective);

  protected readonly isDisabled = computed(() => this.formField()?.isDisabled() ?? false);
  protected readonly hasPrefix = computed(() => !!this.prefix());
  protected readonly hasSuffix = computed(() => !!this.suffix());
  protected readonly hasHint = computed(() => this.hints().length > 0);
  protected readonly hasError = computed(() => this.errors().length > 0);

  constructor() {
    effect(() => {
      const control = this.formField();
      const hintsIds = this.hints().map((element) => element.id);
      const errorsIds = this.errors().map((element) => element.id);

      if (!control) {
        return;
      }

      control.setDescribedByIds([...hintsIds, ...errorsIds]);
    });
  }

  protected onWrapperClick(event: MouseEvent): void {
    this.formField()?.onContainerClick(event);
  }
}
