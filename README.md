# design-tokens-from-computed-styles
Сбор цветов, градиентов, теней и шрифтов из computed styles страницы (DOM → JSON).  Скрипт для аудита дизайн-токенов сайта: цвета, градиенты, тени, типографика.
# Computed Style Token Dump

Скрипт для быстрого сбора **дизайн-токенов из computed styles** на любой веб-странице:
- **цвета**
- **градиенты**
- **тени** (box-shadow / text-shadow)
- **шрифтовые наборы** (family / size / weight / line-height)

Полезно для аудита UI, подготовки дизайн-системы, брендбука и сверки фактических стилей сайта.

---

## Что делает

1. Проходит по всем элементам DOM (`document.querySelectorAll("*")`)
2. Читает `getComputedStyle(element)`
3. Собирает уникальные значения в наборы:
   - `colors`
   - `gradients`
   - `shadows`
   - `fonts`
4. Возвращает объект результата:
   - копирует его в буфер обмена через `copy(result)` (Chrome DevTools)
   - **накапливает** результаты по страницам в `localStorage` (ключ `gnblast_style_dump`)

---

## Как использовать (быстрый старт)

1. Открой нужную страницу сайта в браузере
2. Открой DevTools → вкладка **Console**
3. Вставь код из файла `collect-computed-styles.js` и нажми **Enter**
4. Готово:
   - результат окажется в буфере обмена
   - и сохранится в `localStorage`

Повтори на разных страницах (главная, каталог, карточка товара и т.д.) — результаты будут добавляться в общий массив.

---

## Если Console не даёт вставить код (Chrome / Edge)

Иногда DevTools блокирует вставку кода в Console в целях безопасности.

1. Открой DevTools → вкладка **Console**
2. Кликни в поле ввода (внизу)
3. Вручную набери команду:

   ```text
   allow pasting

   ---

## Где лежат накопленные данные

Ключ в localStorage:

- `gnblast_style_dump`

### Забрать всё накопленное разом

Открой Console и выполни:

```js
copy(JSON.parse(localStorage.getItem("gnblast_style_dump") || "[]"));
