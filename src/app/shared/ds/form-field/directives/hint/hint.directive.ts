import { Directive } from '@angular/core';

let nextId = 0;

@Directive({
  selector: 'ds-hint, [dsHint]',
  host: { '[id]': 'id' },
})
export class HintDirective {
  public readonly id = `ds-hint-${nextId++}`;
}
