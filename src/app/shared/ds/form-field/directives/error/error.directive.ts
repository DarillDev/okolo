import { Directive } from '@angular/core';

let nextId = 0;

@Directive({
  selector: 'ds-error, [dsError]',
  host: { '[id]': 'id', role: 'alert' },
})
export class ErrorDirective {
  public readonly id = `ds-error-${nextId++}`;
}
