# okolo-auto — Design Document

> Агрегатор честных отзывов и интерактивная карта автосервисов. Пилот: Иркутск.

**Дата:** 2026-06-04
**Горизонт MVP:** 8 недель, 1 разработчик
**Гипотезы для валидации:**
- A) Пользователи пишут отзывы органически, если убрать барьер удаления
- C) Карта как главный UX предпочтительнее списка/каталога

---

## 1. Стек

| Слой | Технология | Обоснование |
|---|---|---|
| Фронтенд | Next.js 16 App Router + React 19 | Уже в проекте, SSR для SEO |
| Стили | Tailwind CSS 4 + SCSS | Уже в проекте |
| Реактивность | RxJS 7 | Уже установлен; использовать для стейта карты и live-обновлений |
| База данных | PostgreSQL + PostGIS через Supabase | Геозапросы из коробки |
| Авторизация | Supabase Auth (email) | Быстрый старт, без SMS на MVP |
| Хранилище фото | Supabase Storage | Фото к отзывам |
| Карта | Яндекс.Карты JS API v3 | Покрытие РФ, кластеры, кастомные метки |
| Деплой | Vercel + Supabase Cloud | Zero-config CI/CD |
| Парсинг данных | Python + Playwright | Сид-данные из 2GIS |

---

## 2. Схема базы данных

```sql
-- Типы сервисов
create table service_types (
  id   serial primary key,
  name text not null,          -- "Шиномонтаж", "Кузовной ремонт"
  slug text not null unique     -- "tire", "body"
);

-- Автосервисы
create table services (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  address      text not null,
  lat          double precision not null,
  lng          double precision not null,
  location     geography(Point, 4326) generated always as (
                 ST_SetSRID(ST_MakePoint(lng, lat), 4326)
               ) stored,
  type_id      int references service_types(id),
  phone        text,
  website      text,
  hours        jsonb,           -- { mon: "9:00-19:00", ... }
  photos       text[],          -- URL из Supabase Storage
  avg_rating   numeric(3,2) default 0,
  rating_3m    numeric(3,2) default 0,   -- рейтинг за последние 3 мес
  rating_6m    numeric(3,2) default 0,   -- рейтинг за последние 6 мес
  review_count int default 0,
  created_at   timestamptz default now()
);

create index services_location_idx on services using gist(location);
create index services_avg_rating_idx on services(avg_rating);

-- Пользователи (расширяет auth.users Supabase)
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz default now()
);

-- Отзывы
create table reviews (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid references services(id) on delete cascade,
  user_id      uuid references profiles(id) on delete set null,
  rating       smallint not null check (rating between 1 and 5),
  text         text not null check (char_length(text) between 20 and 3000),
  visit_date   date,
  photos       text[],          -- URL из Supabase Storage
  is_deleted   boolean default false,   -- мягкое удаление (только модератором)
  created_at   timestamptz default now(),
  unique(service_id, user_id)   -- один отзыв на сервис
);

create index reviews_service_id_idx on reviews(service_id);
create index reviews_created_at_idx on reviews(created_at desc);
```

### Пересчёт рейтингов (Supabase Function)

```sql
-- Триггер обновляет avg_rating, rating_3m, rating_6m после каждого отзыва
create or replace function update_service_ratings()
returns trigger language plpgsql as $$
begin
  update services set
    avg_rating   = (select coalesce(avg(rating), 0) from reviews
                    where service_id = NEW.service_id and not is_deleted),
    rating_3m    = (select coalesce(avg(rating), 0) from reviews
                    where service_id = NEW.service_id and not is_deleted
                    and created_at > now() - interval '3 months'),
    rating_6m    = (select coalesce(avg(rating), 0) from reviews
                    where service_id = NEW.service_id and not is_deleted
                    and created_at > now() - interval '6 months'),
    review_count = (select count(*) from reviews
                    where service_id = NEW.service_id and not is_deleted)
  where id = NEW.service_id;
  return NEW;
end;
$$;

create trigger reviews_after_change
after insert or update on reviews
for each row execute function update_service_ratings();
```

---

## 3. Архитектура фронтенда

### 3.1 Файловая структура

```
app/
├── layout.tsx                  # Root layout: шрифты, провайдеры
├── page.tsx                    # Главная страница — карта
├── services/
│   └── [id]/
│       └── page.tsx            # Карточка сервиса (SSR)
├── auth/
│   └── page.tsx                # Логин / регистрация
└── globals.scss                # Глобальные стили

components/
├── map/
│   ├── MapContainer.tsx        # Инициализация Яндекс.Карт, ref на ymaps
│   ├── ServiceMarker.tsx       # Кастомная метка с цветом по рейтингу
│   ├── MarkerCluster.tsx       # Кластеризация точек
│   ├── MapControls.tsx         # Кнопки: геолокация, радиус, zoom
│   └── MapSidebar.tsx          # Выезжающая панель со списком сервисов
├── service/
│   ├── ServiceCard.tsx         # Превью на боковой панели
│   ├── ServiceHeader.tsx       # Название, адрес, рейтинг, телефон
│   ├── ServiceRatingBadge.tsx  # Три бейджа: всё время / 6 мес / 3 мес
│   ├── ServiceHours.tsx        # Часы работы с индикатором открыт/закрыт
│   └── ServicePhotos.tsx       # Галерея фото
├── reviews/
│   ├── ReviewList.tsx          # Список с вкладками: все / позитивные / негативные
│   ├── ReviewItem.tsx          # Один отзыв: автор, оценка, дата визита, текст, фото
│   ├── ReviewForm.tsx          # Форма написания отзыва
│   ├── ReviewStars.tsx         # Интерактивные звёзды (1-5)
│   └── ReviewPhotosUpload.tsx  # Загрузка фото к отзыву
├── filters/
│   ├── FilterPanel.tsx         # Панель фильтров поверх карты
│   ├── ServiceTypeFilter.tsx   # Чипы: тип услуги
│   └── RatingFilter.tsx        # Слайдер минимального рейтинга
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Spinner.tsx
    ├── RatingStars.tsx         # Статичное отображение звёзд
    └── Avatar.tsx

lib/
├── supabase/
│   ├── client.ts               # Supabase браузерный клиент
│   ├── server.ts               # Supabase серверный клиент (RSC)
│   └── types.ts                # Типы из Supabase codegen
├── yandex-maps/
│   ├── loader.ts               # Загрузка Яндекс.Карты API (lazy)
│   └── marker-color.ts         # Утилита: рейтинг → цвет метки
├── rxjs/
│   └── map-state.ts            # BehaviorSubject для стейта карты
└── utils/
    ├── rating.ts               # Форматирование рейтинга
    └── distance.ts             # Хэверсин: расстояние между координатами

store/
└── map.store.ts                # RxJS-стейт: viewport, активный сервис, фильтры

hooks/
├── useMapState.ts              # Подписка на RxJS map store
├── useGeolocation.ts           # navigator.geolocation + кэш
├── useServices.ts              # Supabase query с фильтрами
└── useReviews.ts               # Supabase query отзывов по service_id

types/
├── service.ts
├── review.ts
└── user.ts
```

---

### 3.2 Главная страница — карта (`app/page.tsx`)

**Layout:** полноэкранная карта + плавающие элементы поверх.

```
┌─────────────────────────────────────────────────────┐
│  [Логотип]  [Поиск по адресу/услуге]  [Войти]        │  ← Header (48px, backdrop-blur)
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌─────────────────┐                               │
│   │  FilterPanel    │  ← Чипы фильтров (top-left)  │
│   └─────────────────┘                               │
│                                                     │
│              [КАРТА — full screen]                  │
│         ● ●     ●                                   │
│       ●     ●●                                      │
│                    ●                                │
│   ┌──────────────────────┐                          │
│   │  MapSidebar          │  ← Выезжает справа при  │
│   │  ServiceCard × N     │    клике на точку       │
│   │  ...                 │                          │
│   └──────────────────────┘                          │
│                         [📍 Рядом]  [+] [-]         │  ← MapControls (bottom-right)
└─────────────────────────────────────────────────────┘
```

**Поведение:**
- При загрузке карта центрируется на Иркутске (52.2978, 104.2964), zoom 12
- Все точки сервисов загружаются одним запросом (bbox текущего viewport)
- При изменении viewport (pan/zoom) — debounce 300ms, новый запрос по bbox
- Клик на точку → открывает `MapSidebar` с превью `ServiceCard`
- Клик на "Подробнее" в превью → навигация на `/services/[id]`
- Кнопка "Рядом" → `useGeolocation` → карта перемещается, radius selector появляется
- Кластеры при zoom < 13, одиночные метки при zoom ≥ 13

**Цветовая схема меток:**

| Рейтинг | Цвет | Hex |
|---|---|---|
| ≥ 4.0 | Зелёный | `#22c55e` |
| 3.0 – 3.9 | Жёлтый | `#eab308` |
| < 3.0 | Красный | `#ef4444` |
| Нет отзывов | Серый | `#94a3b8` |

---

### 3.3 Карточка сервиса (`app/services/[id]/page.tsx`)

**SSR-страница** — данные сервиса и первые 10 отзывов приходят с сервера (важно для SEO).

```
┌─────────────────────────────────────────────────────┐
│  ← Назад на карту                                   │
├─────────────────────────────────────────────────────┤
│  [Галерея фото]                                     │
│                                                     │
│  ServiceHeader                                      │
│  ★★★★☆ 4.2  (38 отзывов)                           │
│  Название сервиса                                   │
│  📍 Улица Карла Маркса, 15  · 1.2 км               │
│  📞 +7 (395) 222-33-44                              │
│  🕐 Открыто до 19:00                                │
│                                                     │
│  ServiceRatingBadge                                 │
│  [Всё время: 4.2] [6 мес: 3.8] [3 мес: 3.5]        │
│                                                     │
│  [Написать отзыв]                                   │
├─────────────────────────────────────────────────────┤
│  ReviewList                                         │
│  [Все (38)] [Позитивные (25)] [Негативные (13)]     │
│                                                     │
│  ★★☆☆☆  Иван П.  ·  Март 2026                      │
│  "Сделали хуже чем было. Взяли деньги и..."        │
│  [фото 1] [фото 2]                                  │
│  ...                                                │
│  [Загрузить ещё]                                    │
└─────────────────────────────────────────────────────┘
```

**Критично:**
- Вкладка "Негативные" открыта по умолчанию при первом посещении если отзывов < 4.0
- Отзывы sorted by `created_at desc` — свежие сначала
- `ServiceRatingBadge` показывает тренд: если `rating_3m` < `avg_rating` — красная стрелка вниз

---

### 3.4 Форма отзыва (`components/reviews/ReviewForm.tsx`)

Открывается как Modal поверх страницы сервиса.

**Шаги формы:**
1. Выбор оценки (1–5 звёзд, интерактивный) — обязательно
2. Текст отзыва (min 20 символов, счётчик) — обязательно
3. Дата визита (datepicker, не позже сегодня) — необязательно
4. Фото результата работы (до 5 фото, Supabase Storage) — необязательно
5. Submit

**Авторизация:**
- Если не авторизован → форма показывает шаг входа через email (Supabase Auth magic link)
- После входа → форма автоматически продолжается с шага где остановился
- На MVP нет SMS — только email magic link

**Валидация:**
- Рейтинг: обязателен
- Текст: min 20, max 3000 символов
- Один отзыв на сервис: проверяется на уровне БД (unique constraint) и на клиенте до отправки

---

### 3.5 Стейт карты через RxJS (`store/map.store.ts`)

```typescript
interface MapState {
  viewport: { center: [number, number]; zoom: number };
  activeServiceId: string | null;
  filters: {
    typeIds: number[];
    minRating: number;
    radius: number | null;      // null = весь viewport
    userLocation: [number, number] | null;
  };
  sidebarOpen: boolean;
}

// BehaviorSubject как единый источник правды для карты
export const mapState$ = new BehaviorSubject<MapState>(initialState);

// Экшены
export const setActiveService = (id: string | null) => ...
export const updateViewport = (viewport: MapState['viewport']) => ...
export const setFilters = (filters: Partial<MapState['filters']>) => ...
```

Компоненты подписываются через `useMapState` hook:
```typescript
export function useMapState<T>(selector: (s: MapState) => T): T {
  const [value, setValue] = useState(() => selector(mapState$.getValue()));
  useEffect(() => {
    const sub = mapState$.pipe(map(selector), distinctUntilChanged()).subscribe(setValue);
    return () => sub.unsubscribe();
  }, [selector]);
  return value;
}
```

---

### 3.6 Мобильная версия

На мобильном (< 768px) layout меняется:
- Карта занимает верхние 60% экрана
- `MapSidebar` превращается в bottom sheet — выдвигается снизу при клике на точку
- Фильтры скрыты за кнопкой "Фильтры" → открываются как bottom sheet
- Кнопки управления картой переносятся в правый нижний угол над bottom sheet

---

### 3.7 SEO и SSR

- `/services/[id]` — полный SSR, `generateMetadata` с названием сервиса и городом
- Главная страница — SSR с первичными данными для Иркутска (первые 100 точек)
- Sitemap генерируется через `app/sitemap.ts` по всем сервисам
- OpenGraph карточки для шаринга в соцсетях (превью карточки сервиса)

---

## 4. Development Pipelines

### Pipeline 0 — Подготовка инфраструктуры (Неделя 1)

```
┌─────────────────────────────────────────────────────────┐
│  PIPELINE 0: ИНФРАСТРУКТУРА                             │
├─────────────────────────────────────────────────────────┤
│  [ ] Создать проект Supabase                            │
│  [ ] Применить SQL миграции (schema из раздела 2)       │
│  [ ] Настроить RLS политики (read: public, write: auth) │
│  [ ] Supabase Auth — включить email magic link          │
│  [ ] Supabase Storage — bucket `review-photos` (public) │
│  [ ] Получить API ключ Яндекс.Карт                      │
│  [ ] .env.local с переменными                          │
│  [ ] Vercel проект — подключить репо, set env vars      │
│  [ ] Supabase codegen → lib/supabase/types.ts           │
│  [ ] CI: GitHub Actions → lint + test on PR             │
└─────────────────────────────────────────────────────────┘
Выход: рабочий деплой "Hello World" на Vercel + пустая БД
```

---

### Pipeline 1 — Данные: парсинг и сид (Неделя 2)

```
┌─────────────────────────────────────────────────────────┐
│  PIPELINE 1: ДАННЫЕ                                     │
├─────────────────────────────────────────────────────────┤
│  [ ] Python scraper: 2GIS API → JSON                    │
│       - название, адрес, coords, телефон, категория     │
│       - ~300-500 сервисов Иркутска                      │
│  [ ] Нормализация: категории 2GIS → service_types       │
│  [ ] Seed script: JSON → Supabase (upsert by coords)    │
│  [ ] Ручная проверка: 20-30 записей на корректность     │
│  [ ] Индексы и ANALYZE в PostgreSQL                     │
└─────────────────────────────────────────────────────────┘
Инструменты: Python, Playwright, psycopg2 или supabase-py
Выход: 300+ сервисов в БД с координатами
```

---

### Pipeline 2 — Карта (Недели 3–4)

```
┌─────────────────────────────────────────────────────────┐
│  PIPELINE 2: КАРТА                                      │
├──────────────────────────┬──────────────────────────────┤
│  НЕДЕЛЯ 3               │  НЕДЕЛЯ 4                    │
├──────────────────────────┼──────────────────────────────┤
│  [ ] Yandex Maps loader  │  [ ] Геолокация пользователя │
│  [ ] MapContainer init   │  [ ] Radius selector (1/3/5) │
│  [ ] Точки на карте      │  [ ] Поиск по адресу         │
│  [ ] Цветовые метки      │  [ ] FilterPanel — чипы      │
│  [ ] BBox запрос к БД    │  [ ] RxJS map store          │
│  [ ] Кластеризация       │  [ ] MapSidebar превью       │
│  [ ] Debounce viewport   │  [ ] Mobile bottom sheet     │
└──────────────────────────┴──────────────────────────────┘
Выход: карта с точками, фильтрами и превью сервисов
```

---

### Pipeline 3 — Карточка сервиса и отзывы (Недели 5–6)

```
┌─────────────────────────────────────────────────────────┐
│  PIPELINE 3: КАРТОЧКИ И ОТЗЫВЫ                          │
├──────────────────────────┬──────────────────────────────┤
│  НЕДЕЛЯ 5               │  НЕДЕЛЯ 6                    │
├──────────────────────────┼──────────────────────────────┤
│  [ ] /services/[id] SSR  │  [ ] ReviewForm modal        │
│  [ ] ServiceHeader       │  [ ] Stars input             │
│  [ ] ServiceRatingBadge  │  [ ] Photo upload            │
│  [ ] ServiceHours        │  [ ] Supabase Storage upload │
│  [ ] ReviewList          │  [ ] Валидация формы         │
│  [ ] ReviewItem          │  [ ] Submit + оптим. апдейт  │
│  [ ] Вкладки отзывов     │  [ ] Trigger пересчёта ★    │
│  [ ] Pagination          │  [ ] Toast уведомления       │
└──────────────────────────┴──────────────────────────────┘
Выход: полноценная карточка с отзывами и формой
```

---

### Pipeline 4 — Авторизация (Неделя 7)

```
┌─────────────────────────────────────────────────────────┐
│  PIPELINE 4: АВТОРИЗАЦИЯ                                │
├─────────────────────────────────────────────────────────┤
│  [ ] /auth страница — email magic link форма           │
│  [ ] Supabase Auth callback route                       │
│  [ ] Сохранение сессии (Supabase SSR cookie helper)     │
│  [ ] Защита ReviewForm — редирект если не авторизован   │
│  [ ] Создание profile после первого входа               │
│  [ ] Header: аватар / кнопка войти                      │
│  [ ] RLS: только свои данные в profiles                 │
│  [ ] Один отзыв на сервис — проверка на клиенте         │
└─────────────────────────────────────────────────────────┘
Выход: пользователи могут регистрироваться и писать отзывы
```

---

### Pipeline 5 — Полировка и запуск (Неделя 8)

```
┌─────────────────────────────────────────────────────────┐
│  PIPELINE 5: ЗАПУСК                                     │
├─────────────────────────────────────────────────────────┤
│  SEO                                                    │
│  [ ] generateMetadata для /services/[id]                │
│  [ ] app/sitemap.ts                                     │
│  [ ] OpenGraph теги + og:image                          │
│                                                         │
│  Производительность                                     │
│  [ ] Lighthouse audit (цель: Performance > 85)          │
│  [ ] next/image для всех фото                           │
│  [ ] Prefetch карточек сервисов при hover               │
│  [ ] Loading skeletons для карты и списков              │
│                                                         │
│  Мобильный UX                                           │
│  [ ] Тест на iPhone SE (375px) и Android (360px)        │
│  [ ] Touch target минимум 44×44px                       │
│  [ ] Bottom sheet анимация                              │
│                                                         │
│  Запуск                                                 │
│  [ ] Custom domain                                      │
│  [ ] Yandex Webmaster + Google Search Console           │
│  [ ] Публикация в Телеграм-каналах Иркутска             │
│  [ ] Сбор первых 5–10 реальных отзывов вручную          │
└─────────────────────────────────────────────────────────┘
Выход: публичный релиз okolo-auto.ru (или аналог)
```

---

## 5. После MVP — следующие итерации

После валидации гипотез A и C, в порядке приоритета:

| Итерация | Фича | Триггер для запуска |
|---|---|---|
| MVP+1 | SMS верификация отзывов | Появились фейковые отзывы |
| MVP+2 | Тикеты/вопросы (форум) | Пользователи просят "спросить совет" |
| MVP+3 | Кабинет поставщика (free) | Сервисы сами приходят с просьбой ответить |
| MVP+4 | Антирейтинг-страница | Накопилось 50+ отзывов с рейтингом < 3 |
| MVP+5 | Профиль мастера | Запросы от мастеров |
| MVP+6 | Платные профили | Доказана готовность платить |
| MVP+7 | Онлайн-запись | 200+ активных сервисов на платформе |

---

## 6. Переменные окружения

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # только на сервере
NEXT_PUBLIC_YANDEX_MAPS_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Критерии готовности MVP

- [ ] Карта Иркутска загружается за < 3 сек на мобильном 4G
- [ ] На карте отображается минимум 200 сервисов с координатами
- [ ] Пользователь может написать отзыв за < 2 минуты
- [ ] Отзыв нельзя удалить (только мягкое удаление модератором)
- [ ] Страница сервиса индексируется поисковиком (SSR работает)
- [ ] Мобильный UX без критических поломок (iPhone + Android)
