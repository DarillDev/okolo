import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TDsSize } from '@shared/models/types/ds-size.type';
import { TDsCardAppearance } from '../../types/card-appearance.type';

/**
 * Карточка — примитив-контейнер дизайн-системы «neon cartograph».
 *
 * Стеклянная/панельная поверхность с радиусом карточек DS, опциональным
 * hover-подъёмом и входной анимацией. Контент проецируется через слоты:
 * `[dsCardHeader]`, дефолтный и `[dsCardFooter]`.
 */
@Component({
  selector: 'ds-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'size()',
    '[class.glass]': "appearance() === 'glass'",
    '[class.panel]': "appearance() === 'panel'",
    '[class.interactive]': 'interactive()',
    '[class.reveal]': 'reveal()',
    '[attr.role]': "interactive() ? 'button' : null",
    '[attr.tabindex]': 'interactive() ? 0 : null',
  },
})
export class CardComponent {
  /**
   * Размер: пресет внутреннего отступа и радиуса из токенов DS.
   * `null` (по умолчанию) — не задавать свой размер: класс не ставится, и стили
   * подхватывают размер с ближайшего предка через `:host-context` (иначе — `M`).
   */
  public readonly size = input<TDsSize | null>(null);

  /** Материал поверхности. По умолчанию — панель с угловой неон-подсветкой. */
  public readonly appearance = input<TDsCardAppearance>('panel');

  /** Кликабельная карточка: курсор, фокус-кольцо, hover-подъём, role=button. */
  public readonly interactive = input(false, { transform: booleanAttribute });

  /** Входная анимация появления снизу (ds-fade-up). */
  public readonly reveal = input(false, { transform: booleanAttribute });
}
