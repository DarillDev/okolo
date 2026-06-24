---
name: okolo-ds-component
description: Создание нового generic-компонента дизайн-системы в репозитории okolo (shared/ds). Покрывает слайс-структуру, signal-inputs/OnPush, систему размеров через :host-context, SCSS на токенах design-system, директивы-маркеры слотов, составной компонент с контролом через DI-токен и контракт-интерфейс, интеграцию с Angular Forms без CVA, дисциплину public API, exportAs, тесты на vitest и грабли eslint (no-input-rename, label-has-associated-control, a11y клика). Использовать при добавлении компонента или директивы в shared/ds, либо при переносе примитива из ui-kit в ds. НЕ для бизнес-компонентов (они в ui-kit/features) — этот скилл только про domain-free примитивы.
---

# Создание ds-компонента (okolo)

Эталоны:

- `src/app/shared/ds/card/` — размерный контейнер со слотами (классический случай).
- `src/app/shared/ds/form-field/` + `src/app/shared/ds/input/` — составной компонент, который находит контрол через DI-токен и контракт-интерфейс; контрол интегрируется с Angular Forms.

У каждого слайса — свой `README.md` по образцу `card/README.md`.

## 0. Куда кладём

`shared/ds` — только **generic** (domain-free). Лакмус: знает доменную модель (`Place`, `Rating`) → это `ui-kit`/`features`, не ds. Формы/CVA (`@angular/forms`, `NgControl`, `ControlValueAccessor`) — это framework, остаётся в ds.

## 1. Слайс-структура

Структура **подстраивается под сложность**. Простой примитив (одна директива/компонент) — плоско в корне слайса; составной — раскладываем по папкам.

```
shared/ds/<name>/
  <name>.component.ts / .html / .scss / .spec.ts   # ИЛИ components/<name>/… если слайс крупный
  directives/<dir>/
    <dir>.directive.ts
    <dir>.directive.spec.ts        # spec на КАЖДУЮ директиву
  config/
    <name>.token.ts                # InjectionToken'ы (DI-координация)
  interfaces/
    <name>-control.interface.ts    # контракт контрола (если составной)
  types/
    <name>-<aspect>.type.ts        # один тип = один файл
  index.ts                          # публичная бочка
  README.md
```

- `card` кладёт компонент в `components/card/`; `form-field` — прямо в корень слайса; `input` — вообще один файл `input.directive.ts`. Все три валидны: не плодим папки без нужды.
- Каждая директива — в своей папке со своим spec. Общую логику директив выносим в абстрактную базу (напр. `*-slot.directive.ts`), её наследуют, но **не экспортируют**.

## 2. Компонент

- standalone (по умолчанию), `changeDetection: ChangeDetectionStrategy.OnPush`
- `selector: 'ds-<name>'`
- инпуты — signal `input()`, объявление `public readonly`
- варианты/состояния — через host-биндинги классов
- булевы флаги — `input(false, { transform: booleanAttribute })`
- типы-объединения выносим в `types/*.type.ts` с именем `TDs<Name><Aspect>` (не инлайн)
- `exportAs: '<name>'` — если потребителю нужен template-ref на компонент/директиву (`#x="<name>"`)

Одна ось класса → `'[class.glass]': "appearance() === 'glass'"`. Несколько осей сразу → массив:

```ts
host: { '[class]': '[size(), appearance(), shape()]' }
```

Angular игнорирует `null`/falsy-элементы массива, поэтому `size()` со значением `null` просто не добавит класс — `.filter(...)` не нужен.

## 3. Система размеров (если компонент размерный)

- общий тип `TDsSize = 'S' | 'M' | 'L' | 'XL'` из `@shared/models` (только **заглавные**)
- инпут `size = input<TDsSize | null>(null)` — `null` = не задавать свой, **наследовать**
- класс размера ставится на хост через `[class]` (см. п. 2)
- наследование — через `:host-context(.S)` (срабатывает, если класс на хосте ИЛИ любом предке); дефолт `M` задан в базовом `:host`
- значения размера прокидываем через приватные переменные `--ds-<name>-*` (pad/radius/fs), которые потребляются в объявлениях. Так размерный радиус выигрывает у радиуса материала (миксина) независимо от специфичности.
- осознанный компромисс: при вложенных конфликтующих контекстах выигрывает не ближайший предок, а правило ниже по коду — задокументировать в шапке scss.

## 4. SCSS

- `@use 'surfaces' as surf;` — работает за счёт `stylePreprocessorOptions.includePaths: ['src/styles/design-system']` в `angular.json`
- только токены: `var(--space-*)`, `var(--radius-*)`, `var(--c-*)`, миксины `surf.ds-*`. Литералы — нельзя; нет токена → завести в `styles/design-system`.
- **не** импортировать в компонент партиалы с `:root` (color/layout/...) — продублируют токены в каждом компоненте. Переменные уже объявлены глобально.
- многоосевая стилизация: дефолты переменных в `:host`, варианты — `:host { &.glass { … } &.pill { … } }`, размеры — `:host-context(.S) { … }`. Объявления потребляют только `--ds-<name>-*`.

## 5. Директивы-маркеры слотов

- атрибутный селектор служит и маркером для `ng-content select`, и (если нужно) носителем инпутов
- **чистый маркер** — пустой класс, без логики: `@Directive({ selector: 'ds-prefix, [dsPrefix]' }) export class PrefixDirective {}`
- дуальный селектор `ds-x, [dsX]` — можно как элемент, так и атрибут. Атрибут-only (`[dsLabel]`) — когда директива вешается на конкретный нативный тег.
- директива-маркер **не** тянет на себя чужую ответственность: напр. `dsLabel` не проставляет `for` сам (статический a11y-линтер этого не увидит — см. п. 9). Связь `label`↔контрол делает потребитель через `exportAs` контрола.
- если у слота есть параметры (напр. `align`) — логические значения (`start|center|end`), 1:1 валидные CSS-ключевые слова, пишутся прямо в `[style.text-align]`, без маппинга
- общие host-биндинги/инпуты — в абстрактной базе, конкретные директивы её наследуют

## 6. Составной компонент + контракт контрола

Когда компонент-обёртка должна работать с проецируемым контролом (form-field ↔ input):

- **Контракт** в `interfaces/<name>-control.interface.ts` — только сигналы + методы:
  ```ts
  export interface IFormFieldControl {
    readonly id: Signal<string>;
    readonly isDisabled: Signal<boolean>;
    onContainerClick(event?: MouseEvent): void;
    setDescribedByIds(ids: string[]): void;
  }
  ```
- **Токен контрола** в `config/<name>-control.token.ts`: `new InjectionToken<IFormFieldControl>('FORM_FIELD_CONTROL')`.
- **Токен самого компонента** (для дочерних директив, которым нужна обёртка): `new InjectionToken<FormFieldComponent>('FORM_FIELD')`, провайдится через `useExisting`.
- Контрол регистрируется: `providers: [{ provide: FORM_FIELD_CONTROL, useExisting: InputDirective }]` и `implements IFormFieldControl`.
- Обёртка находит: контрол — `contentChild(FORM_FIELD_CONTROL)`, маркеры слотов — `contentChild/contentChildren(PrefixDirective)`.
- Координация состояния — через сигналы + `effect` (напр. собрать `aria-describedby` из id подсказок/ошибок и отдать контролу).
- Связь подписи: потребитель берёт id у контрола через `exportAs`, не у обёртки:
  ```html
  <label dsLabel [attr.for]="control.id()">…</label>
  <input dsInput #control="dsInput" />
  ```

## 7. Интеграция с Angular Forms (без CVA)

Контрол отражает состояние формы, но не обязан быть `ControlValueAccessor` (значением управляет `DefaultValueAccessor`):

- `private readonly ngControl = inject(NgControl, { optional: true, self: true })`
- состояния `NgControl` (`invalid`/`touched`/`dirty`/`disabled`) — **не сигналы**, поэтому зеркалим их в сигналы в `ngDoCheck` (`implements DoCheck`):
  ```ts
  ngDoCheck(): void {
    const c = this.ngControl?.control;
    if (c) { this.invalid.set(!!c.invalid); this.controlDisabled.set(c.disabled); /*…*/ }
  }
  ```
- наружу — `computed`-сигналы (`hasError`, `isDisabled`, `isEmpty`), которые при наличии формы читают зеркала, иначе — собственные инпуты.
- host: `'[disabled]': 'isDisabled()'`, `'[attr.aria-invalid]': 'hasError() || null'`.

## 8. Публичный API (index.ts)

- экспортируем: компонент, конкретные директивы, публичные типы, **токены и интерфейсы контракта** (нужны потребителю/контролу)
- **не** экспортируем: абстрактные базы, внутренние host-консты, внутренние токены координации, если они не часть API
- **без** бандл-массивов — потребитель импортирует ровно то, что в шаблоне

## 9. Грабли eslint (это CI-гейт — `ng lint`)

- **`no-input-rename`**: инпут нельзя алиасить. Называй инпут публичным именем сразу (`disabled`, не `input(false, { alias: 'isDisabled' })`).
- **`label-has-associated-control`**: `<label>` должен иметь `for`/вложенный контрол **статически** в шаблоне. Рантайм-host-binding `[attr.for]` линтер не видит. Поэтому `for` ставит потребитель явно (через `exportAs` контрола), а директива-маркер его не трогает.
- **`click-events-have-key-events` + `interactive-supports-focus`**: на не-интерактивном контейнере с `(click)` (напр. обёртка, пробрасывающая фокус во вложенный input) — `tabindex` добавлять НЕЛЬЗЯ (двойной таб-стоп). Подавляем осознанно с пояснением:
  ```html
  <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
  ```

## 10. Тесты (vitest)

- host-компонент с **сигналами** для инпутов: `readonly x = signal(...)`, в шаблоне `[x]="x()"`. Меняем через `x.set()` → `detectChanges()`. Обычные поля между двумя `detectChanges` дают `NG0100`.
- директива с `NgControl` — host-компонент с реальным `FormControl` + `ReactiveFormsModule`, директиву достаём через `viewChild.required(...)`; состояния проверяем после `control.markAsTouched()/disable()` + `detectChanges()`.
- проверяем классы / атрибуты / инлайн-стили на host-элементе (`el.classList`, `el.getAttribute`, `el.style.*`)
- тестовую директиву-хелпер в спеке тоже именуем с префиксом `ds` (eslint форсит префикс на весь `shared/ds`, включая спеки)
- запуск: `ng test --no-watch`

## 11. README

Документируем **только публичный API** (абстрактные базы и внутренние консты — нет). Пиши формально, без разговорных оборотов. Разделы: импорт, базовое использование, таблицы инпутов, размеры/наследование, слоты, поведение, полный пример, сводка экспортов. Эталон — `ds/card/README.md`.

## Финальный чек

`ng lint` + `ng build` + `ng test --no-watch` — всё зелёное.
