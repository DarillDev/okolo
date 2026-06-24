import { Directive } from '@angular/core';

let nextId = 0;

@Directive({
  selector: 'ds-hint, [dsHint]',
  host: {
    '[id]': 'id',
    class: 'ds-form-field_hint',
    '[class.ds-form-field_hint--end]': 'align === "end"',
  },
})
export class HintDirective {
  public readonly id = `ds-hint-${nextId++}`;

  public readonly align: 'start' | 'end' = 'start';
}
