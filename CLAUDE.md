# okolo

Angular 21 приложение (standalone, signals, zoneless, vitest). Дизайн-система «neon cartograph».

## Архитектура shared

Слои, зависимости только вниз:

```
features/* → shared/ui-kit → shared/ds → styles/design-system
                  ↘ shared/models ↗
```

- `styles/design-system/` — токены + миксины (чистый SCSS, без Angular). Ядро DS.
- `shared/ds/` — generic-примитивы Angular на токенах. Префикс `ds-`, импорт через бочку компонента `@shared/ds/<name>` (единого `@shared/ds` нет). **Домен не знают.**
- `shared/ui-kit/` — бизнес-реализации (домен + кросс-фича) из ds-примитивов. Префикс `ui-`, алиас `@shared/ui-kit`.
- `shared/models/` — доменные типы + общий `TDsSize`. Алиас `@shared/models`.
- `features/*` — экраны и бизнес-логика. Префикс `app-`.

**Лакмус размещения:** импортит доменный тип (`Place`, `Rating`) → `ui-kit`/`features`. Импортит только фреймворк (`@angular/forms`, CVA) и токены → `ds`.

## Правила

- Префиксы селекторов форсятся eslint по слою: `ds` для `shared/ds/**`, `ui` для `shared/ui-kit/**`, `app` — остальное.
- ds-компоненты **не** импортируют доменные модели.
- Публичный API слоя — через `index.ts`-бочку. Абстрактные базы не экспортируются. Без бандл-массивов компонентов (`export const X = [...]`) — импортируем ровно нужное.
- Стили — на токенах design-system, не на литералах. Нет токена — завести в `styles/design-system`.
- `ng lint` форсит a11y-шаблоны и `no-input-rename`: signal-инпуты не алиасить; `<label>` требует явный `for` в шаблоне (рантайм-`for` от директивы линтер не видит); `(click)` на неинтерактивном элементе — только с обоснованным `eslint-disable`.

## Команды

- `nvm use` (Node 22.23.1 из `.nvmrc`), пакетный менеджер — npm
- `ng serve` — dev-сервер
- `ng lint`
- `ng build`
- `ng test --no-watch` (vitest)

## Новый ds-компонент

Используй скилл **`okolo-ds-component`** — слайс-структура, паттерны size/host/тестов, дисциплина public API. Эталон — `src/app/shared/ds/card/` (+ его `README.md`).
