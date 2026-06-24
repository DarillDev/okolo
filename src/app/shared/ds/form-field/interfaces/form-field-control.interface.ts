import { Signal } from '@angular/core';

export interface IFormFieldControl {
  readonly isEmpty: Signal<boolean>;
  readonly isDisabled: Signal<boolean>;
  readonly id: Signal<string>;

  onContainerClick(event: MouseEvent): void;
  setDescribedByIds(ids: string[]): void;
}
