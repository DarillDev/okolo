# dsInput

Директива для нативного `<input>`. Регистрирует элемент как контрол внутри `ds-form-field` (реализует `IFormFieldControl`) и отражает состояние формы.

## Импорт

```ts
import { InputDirective } from '@shared/ds/input';
```

## Использование

```html
<ds-form-field>
  <input dsInput [formControl]="ctrl" />
</ds-form-field>

<!-- без интеграции с формой -->
<ds-form-field>
  <input dsInput disabled />
</ds-form-field>
```

Селектор: `input[dsInput]`. `exportAs: "dsInput"`.

Для связи подписи с контролом используйте `exportAs` и сигнал `id`:

```html
<label dsLabel [attr.for]="control.id()">Имя</label>
<input dsInput #control="dsInput" />
```

## Inputs

| Input               | Тип                          | По умолчанию | Описание                                            |
| ------------------- | ---------------------------- | ------------ | --------------------------------------------------- |
| `id`                | `string`                     | автогенерация | Идентификатор элемента                              |
| `disabled`          | `boolean`                    | `false`      | Отключение без интеграции с формой; булев атрибут   |
| `emptyStateMatcher` | `(value: string) => boolean` | —            | Переопределение логики определения пустого значения |

## Публичный API (сигналы)

| Член         | Тип               | Описание                                                                |
| ------------ | ----------------- | ---------------------------------------------------------------------- |
| `id`         | `Signal<string>`  | Идентификатор элемента (для связи с подписью через `for`)              |
| `hasError`   | `Signal<boolean>` | Контрол невалиден и при этом отмечен как touched или dirty             |
| `isDisabled` | `Signal<boolean>` | При интеграции с формой — `control.disabled`, иначе — значение `disabled` |
| `isEmpty`    | `Signal<boolean>` | Значение поля пусто согласно `emptyStateMatcher`                       |

## Поведение

- Регистрируется через токен `FORM_FIELD_CONTROL`; `ds-form-field` обнаруживает контрол через `contentChild`.
- При наличии `NgControl` (реактивная или template-driven форма) состояния `invalid`, `touched`, `dirty`, `disabled` синхронизируются в `ngDoCheck`; без формы отключение определяется значением input `disabled`.
- Host-binding `[disabled]` отключает элемент; `[attr.aria-invalid]` устанавливается при `hasError`.
- При клике по обёртке `ds-form-field` вызывает `onContainerClick()` — фокус переводится на `<input>`.
- Принимает `aria-describedby` от подключённых `dsError` и `dsHint` через `setDescribedByIds()`.
