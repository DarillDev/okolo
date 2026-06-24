# dsInput

Директива для нативного `<input>`, которая регистрирует его как контрол внутри `ds-form-field`.

## Использование

```html
<ds-form-field>
  <input dsInput [formControl]="ctrl" />
</ds-form-field>
```

## Inputs

| Input               | Тип                     | По умолчанию | Описание                                       |
| ------------------- | ----------------------- | ------------ | ---------------------------------------------- |
| `id`                | `string`                | авто         | id элемента (генерируется автоматически)       |
| `isDisabled`        | `boolean`               | `false`      | отключить вручную (без формы)                  |
| `emptyStateMatcher` | `(value: T) => boolean` | —            | переопределить логику определения пустого поля |

## Как работает

- Регистрируется через токен `FORM_FIELD_CONTROL` — `form-field` находит его через `contentChild`.
- Сигнал `isEmpty` используется `form-field` для управления floating-label.
- При клике на обёртку `form-field` вызывает `onContainerClick()` → фокус на `<input>`.
- Автоматически подхватывает `aria-describedby` от подключённых `dsError` / `dsHint`.
