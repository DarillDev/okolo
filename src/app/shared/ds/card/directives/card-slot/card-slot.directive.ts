import { Directive, input } from '@angular/core';
import { TDsCardSlotAlign } from '../../types/card-slot-align.type';

/**
 * Общий host-биндинг слотов: выравнивание через инлайновый стиль, чтобы
 * директивы были самодостаточными (без внешнего CSS).
 */
export const DS_CARD_SLOT_HOST = {
  '[style.text-align]': 'align()',
};

/**
 * База слот-директив карточки: презентационные инпуты, общие для header/footer.
 */
@Directive()
export abstract class DsCardSlotDirective {
  /** Горизонтальное выравнивание содержимого слота. */
  public readonly align = input<TDsCardSlotAlign>('start');
}
