# ds-card

Карточка-контейнер дизайн-системы «neon cartograph» — стеклянная/панельная поверхность на токенах DS с наследуемым размером, опциональным hover-подъёмом и входной анимацией.

Контент проецируется в три слота: header, body и footer.

## Импорт

Всё публичное доступно из бочки компонента `@shared/ds/card`. Импортируйте ровно то, что используете в шаблоне:

```ts
import { CardComponent, DsCardHeaderDirective, DsCardFooterDirective } from '@shared/ds/card';

@Component({
  selector: 'app-example',
  imports: [CardComponent, DsCardHeaderDirective, DsCardFooterDirective],
  templateUrl: './example.component.html',
})
export class ExampleComponent {}
```

Если слоты не нужны — достаточно одного `CardComponent`.

## Базовое использование

```html
<ds-card>Контент карточки</ds-card>
```

```html
<ds-card appearance="glass" interactive reveal>
  <h3 dsCardHeader>Заголовок</h3>

  Тело карточки — проецируется в дефолтный слот.

  <div dsCardFooter align="end">Действия</div>
</ds-card>
```

## `<ds-card>`

Селектор: `ds-card`.

| Input         | Тип                 | По умолчанию | Описание                                                                                 |
| ------------- | ------------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `size`        | `TDsSize \| null`   | `null`       | Размер (отступ + радиус). `null` — не задавать свой, унаследовать от предка (см. ниже).  |
| `appearance`  | `TDsCardAppearance` | `'panel'`    | Материал поверхности: `'panel'` (с угловой неон-подсветкой) или `'glass'`.               |
| `interactive` | `boolean`           | `false`      | Кликабельная карточка: курсор, hover-подъём, фокус-кольцо, `role="button"` + `tabindex`. |
| `reveal`      | `boolean`           | `false`      | Входная анимация появления снизу.                                                        |

`interactive` и `reveal` — булевы атрибуты, достаточно указать имя без значения:

```html
<ds-card interactive reveal>…</ds-card>
```

### Размер и наследование

Размер задаётся шкалой `TDsSize` = `'S' | 'M' | 'L' | 'XL'` и **наследуется по дереву**. Если у карточки нет своего `size`, она подхватывает размер с ближайшего предка, у которого он задан, вплоть до корня. Если нигде не задан — действует `M`.

Свой размер:

```html
<ds-card size="L">…</ds-card>
```

Унаследованный — задаётся классом размера на любом предке:

```html
<section class="XL">
  <ds-card>…</ds-card>
  <!-- XL: взято с <section> -->
  <ds-card size="S">…</ds-card>
  <!-- S: свой перебивает -->
</section>
```

Пресеты:

| Размер       | Внутренний отступ | Радиус |
| ------------ | ----------------- | ------ |
| `S`          | 16px              | 14px   |
| `M` (дефолт) | 24px              | 22px   |
| `L`          | 32px              | 24px   |
| `XL`         | 40px              | 24px   |

### Слоты

| Слот      | Маркер           | Назначение          |
| --------- | ---------------- | ------------------- |
| Заголовок | `[dsCardHeader]` | Шапка карточки      |
| Тело      | — (дефолтный)    | Основной контент    |
| Подвал    | `[dsCardFooter]` | Действия/мета внизу |

```html
<ds-card>
  <div dsCardHeader>Шапка</div>
  Основной контент
  <div dsCardFooter>Подвал</div>
</ds-card>
```

## `[dsCardHeader]` · `[dsCardFooter]`

Директивы-маркеры слотов заголовка и подвала. Помимо проекции принимают параметры отображения.

| Input   | Тип                | По умолчанию | Описание                                       |
| ------- | ------------------ | ------------ | ---------------------------------------------- |
| `align` | `TDsCardSlotAlign` | `'start'`    | Горизонтальное выравнивание содержимого слота. |

`TDsCardSlotAlign` = `'start' | 'center' | 'end'` — логические значения (RTL-safe); в LTR это слева / по центру / справа.

```html
<ds-card>
  <h3 dsCardHeader align="center">По центру</h3>
  Контент
  <div dsCardFooter align="end">Справа</div>
</ds-card>
```

> Выравнивание применяется к **строчному** содержимому слота (текст, инлайновые иконки). Для flex-раскладок внутри слота используйте собственные стили.

## Полный пример

```ts
import { Component } from '@angular/core';
import { CardComponent, DsCardHeaderDirective, DsCardFooterDirective } from '@shared/ds/card';

@Component({
  selector: 'app-place-card',
  imports: [CardComponent, DsCardHeaderDirective, DsCardFooterDirective],
  template: `
    <ds-card size="L" appearance="glass" interactive reveal>
      <h3 dsCardHeader>АвтоТехЦентр «Тополь»</h3>
      ул. Байкальская, 206/5 · 1.2 км
      <div dsCardFooter align="end">Читать 127 отзывов</div>
    </ds-card>
  `,
})
export class PlaceCardComponent {}
```

## Публичный API

Экспортируется из `@shared/ds`:

| Имя                     | Вид       | Описание                       |
| ----------------------- | --------- | ------------------------------ |
| `CardComponent`         | компонент | `<ds-card>`                    |
| `DsCardHeaderDirective` | директива | `[dsCardHeader]`               |
| `DsCardFooterDirective` | директива | `[dsCardFooter]`               |
| `TDsCardAppearance`     | тип       | `'glass' \| 'panel'`           |
| `TDsCardSlotAlign`      | тип       | `'start' \| 'center' \| 'end'` |

Размерная шкала `TDsSize` (`'S' \| 'M' \| 'L' \| 'XL'`) — общий тип DS, импортируется из `@shared/models`.
