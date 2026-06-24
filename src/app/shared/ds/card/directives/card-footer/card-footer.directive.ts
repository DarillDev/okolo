import { Directive } from '@angular/core';
import { DS_CARD_SLOT_HOST, DsCardSlotDirective } from '../card-slot/card-slot.directive';

/** Маркер слота подвала карточки: `<div dsCardFooter align="end">`. */
@Directive({
  selector: '[dsCardFooter]',
  host: {
    class: 'ds-card-footer',
    ...DS_CARD_SLOT_HOST,
  },
})
export class DsCardFooterDirective extends DsCardSlotDirective {}
