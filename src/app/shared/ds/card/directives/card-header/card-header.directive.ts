import { Directive } from '@angular/core';
import { DS_CARD_SLOT_HOST, DsCardSlotDirective } from '../card-slot/card-slot.directive';

/** Маркер слота заголовка карточки: `<div dsCardHeader align="end">`. */
@Directive({
  selector: '[dsCardHeader]',
  host: {
    class: 'ds-card-header',
    ...DS_CARD_SLOT_HOST,
  },
})
export class DsCardHeaderDirective extends DsCardSlotDirective {}
