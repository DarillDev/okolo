# ds-form-field

Контейнер поля формы дизайн-системы «neon cartograph». Объединяет контрол (`input[dsInput]` и совместимые) с подписью, префиксом, суффиксом, подсказкой и сообщением об ошибке; задаёт материал поверхности, форму углов и размер на токенах дизайн-системы.

Содержимое распределяется по слотам: подпись, префикс, контрол, суффикс, подсказка/ошибка.

## Импорт

Публичный API доступен из бочки компонента `@shared/ds/form-field`. Импортируйте только то, что используется в шаблоне:

```ts
import {
  FormFieldComponent,
  LabelDirective,
  PrefixDirective,
  SuffixDirective,
  HintDirective,
  ErrorDirective,
} from '@shared/ds/form-field';
import { InputDirective } from '@shared/ds/input';

@Component({
  selector: 'app-example',
  imports: [FormFieldComponent, LabelDirective, InputDirective, HintDirective, ErrorDirective],
  templateUrl: './example.component.html',
})
export class ExampleComponent {}
```

## Базовое использование

Ассоциация подписи с контролом выполняется через `exportAs` директивы `dsInput`:

```html
<ds-form-field>
  <label dsLabel [attr.for]="emailInput.id()">Email</label>

  <span dsPrefix>@</span>
  <input dsInput #emailInput="dsInput" [formControl]="emailCtrl" />
  <span dsSuffix>✓</span>

  <span dsHint>Введите рабочий адрес</span>
  <span dsError>{{ emailCtrl | controlErrorText }}</span>
</ds-form-field>
```

## `<ds-form-field>`

Селектор: `ds-form-field`. `exportAs: "formField"`.

| Input        | Тип                    | По умолчанию | Описание                                                                      |
| ------------ | ---------------------- | ------------ | ---------------------------------------------------------------------------- |
| `size`       | `TDsSize \| null`      | `null`       | Размер (отступ, радиус, типографика). `null` — наследовать от предка (ниже).  |
| `appearance` | `TFormFieldAppearance` | `'outline'`  | Материал обёртки: `'outline' \| 'glass' \| 'filled' \| 'ghost'`.             |
| `shape`      | `TFormFieldShape`      | `'box'`      | Форма углов: `'box'` (радиус дизайн-системы) или `'pill'` (полное скругление). |

### Размер и наследование

Размер задаётся шкалой `TDsSize` = `'S' | 'M' | 'L' | 'XL'` и наследуется по дереву через `:host-context`. Если у поля не задан собственный `size`, применяется размер ближайшего предка с классом размера; при отсутствии такового действует значение `M`.

```html
<ds-form-field size="L">…</ds-form-field>

<section class="XL">
  <ds-form-field>…</ds-form-field>
  <!-- XL: значение унаследовано от <section> -->
  <ds-form-field size="S">…</ds-form-field>
  <!-- S: собственное значение имеет приоритет -->
</section>
```

Пресеты:

| Размер       | Отступ (y · x) | Радиус | Размер шрифта |
| ------------ | -------------- | ------ | ------------- |
| `S`          | 8 · 12px       | 8px    | 13px          |
| `M` (дефолт) | 12 · 16px      | 10px   | 14px          |
| `L`          | 16 · 20px      | 14px   | 16px          |
| `XL`         | 20 · 24px      | 14px   | 16px          |

Значение `shape="pill"` переопределяет радиус на полное скругление независимо от размера.

### Слоты (проекция содержимого)

| Слот      | Селектор                  | Директива         | Описание                                       |
| --------- | ------------------------- | ----------------- | ---------------------------------------------- |
| Подпись   | `[dsLabel]`               | `LabelDirective`  | Подпись поля (произвольный элемент, см. ниже)  |
| Префикс   | `ds-prefix`, `[dsPrefix]` | `PrefixDirective` | Содержимое слева от контрола                    |
| Контрол   | _(дефолтный)_             | —                 | Контрол поля: `input[dsInput]` и совместимые    |
| Суффикс   | `ds-suffix`, `[dsSuffix]` | `SuffixDirective` | Содержимое справа от контрола                   |
| Подсказка | `ds-hint`, `[dsHint]`     | `HintDirective`   | Подсказка под полем (скрывается при ошибке)    |
| Ошибка    | `ds-error`, `[dsError]`   | `ErrorDirective`  | Сообщение об ошибке (приоритет над подсказкой) |

### Подпись и атрибут `for`

`LabelDirective` (`[dsLabel]`) применяется к произвольному элементу. Семантику (`<label>`) и связь с контролом (`for`) определяет потребитель. Идентификатор контрола предоставляет директива `dsInput` через `exportAs`:

```html
<ds-form-field>
  <label dsLabel [attr.for]="nameInput.id()">Имя</label>
  <input dsInput #nameInput="dsInput" />
</ds-form-field>
```

## Поведение

- Контрол обнаруживается через токен `FORM_FIELD_CONTROL` (`contentChild`); контрол реализует `IFormFieldControl`.
- Идентификаторы подсказки и ошибки передаются контролу как `aria-describedby` через `effect`.
- При наличии `dsError` подсказка скрывается, блок сообщения получает класс `.error`.
- Клик по обёртке делегируется методу `control.onContainerClick()` (перевод фокуса на контрол).
- Значения `size`, `appearance`, `shape` устанавливаются классами на хосте и разрешаются через CSS-переменные `--ds-field-*`.

## Публичный API

Экспортируется из `@shared/ds/form-field`:

| Имя                    | Вид       | Описание                                          |
| ---------------------- | --------- | ------------------------------------------------- |
| `FormFieldComponent`   | компонент | `<ds-form-field>`                                 |
| `LabelDirective`       | директива | `[dsLabel]`                                       |
| `PrefixDirective`      | директива | `ds-prefix`, `[dsPrefix]`                         |
| `SuffixDirective`      | директива | `ds-suffix`, `[dsSuffix]`                         |
| `HintDirective`        | директива | `ds-hint`, `[dsHint]`                             |
| `ErrorDirective`       | директива | `ds-error`, `[dsError]`                           |
| `FORM_FIELD_CONTROL`   | токен     | DI-токен контрола внутри поля                     |
| `IFormFieldControl`    | интерфейс | Контракт контрола (реализуется, например, `dsInput`) |
| `TFormFieldAppearance` | тип       | `'outline' \| 'glass' \| 'filled' \| 'ghost'`     |
| `TFormFieldShape`      | тип       | `'box' \| 'pill'`                                 |

Размерная шкала `TDsSize` (`'S' \| 'M' \| 'L' \| 'XL'`) — общий тип дизайн-системы, импортируется из `@shared/models`.
