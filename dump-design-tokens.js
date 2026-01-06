/**
 * Collect Design Tokens from Computed Styles
 * Собирает: цвета, градиенты, тени, шрифтовые наборы (computed styles)
 *
 * Как использовать:
 * 1) Открой страницу в браузере
 * 2) DevTools → Console
 * 3) Вставь этот код целиком и нажми Enter
 *
 * Результат:
 * - Объект результата копируется в буфер (copy(result))
 * - И дополнительно накапливается в localStorage (ключ gnblast_style_dump)
 */

(() => {
  // Какие computed-свойства собираем (минимально полезный набор)
  const props = [
    "color",
    "backgroundColor",

    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",

    "outlineColor",
    "textDecorationColor",

    "boxShadow",
    "textShadow",

    "backgroundImage" // тут ловим градиенты
  ];

  /**
   * Проверка на "прозрачное/пустое" значение.
   * У разных браузеров могут быть разные форматы записи прозрачности.
   */
  const isTransparent = (v) =>
    !v ||
    v === "transparent" ||
    v === "rgba(0, 0, 0, 0)" ||
    v === "rgb(0 0 0 / 0)";

  /**
   * Вытаскивает из строки все токены цветов:
   * - rgb()/rgba()
   * - hsl()/hsla()
   * - hex (#RGB, #RRGGBB, #RRGGBBAA и т.п.)
   *
   * Нужна для теней, где цвет сидит внутри длинной строки box-shadow/text-shadow.
   */
  const grabColorTokens = (str) => {
    if (!str || typeof str !== "string") return [];
    const out = [];
    const re = /(rgba?\([^)]+\))|(#[0-9a-fA-F]{3,8})|(hsla?\([^)]+\))/g;
    let m;
    while ((m = re.exec(str)) !== null) out.push(m[0]);
    return out;
  };

  // Наборы уникальных значений (Set → без дублей)
  const colors = new Set();
  const gradients = new Set();
  const shadows = new Set();
  const fonts = new Set();

  // Проходим по всем элементам страницы и читаем computed styles
  document.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);

    // Шрифты собираем как "семейство | размер | вес | line-height"
    // (так проще потом сгруппировать типографику)
    fonts.add(`${cs.fontFamily} | ${cs.fontSize} | ${cs.fontWeight} | ${cs.lineHeight}`);

    // Собираем значения интересующих свойств
    for (const p of props) {
      const v = cs[p];
      if (!v) continue;

      // Градиенты: computed background-image может содержать linear-gradient/radial-gradient и т.д.
      if (p === "backgroundImage" && v.includes("gradient")) {
        gradients.add(v);
      }

      // Тени (box-shadow / text-shadow)
      if (p === "boxShadow" || p === "textShadow") {
        if (v !== "none") shadows.add(v);

        // В тенях достаём все цвета и складываем в colors
        grabColorTokens(v).forEach((c) => {
          if (!isTransparent(c)) colors.add(c);
        });
        continue;
      }

      // Любые свойства, содержащие "color" — добавляем как цвета (если не прозрачные)
      if (p.toLowerCase().includes("color")) {
        if (!isTransparent(v)) colors.add(v);
      }

      // backgroundColor тоже отдельно (на случай, если логика выше изменится)
      if (p === "backgroundColor" && !isTransparent(v)) {
        colors.add(v);
      }
    }
  });

  // Финальный результат для этой страницы
  const result = {
    url: location.href,
    collectedAt: new Date().toISOString(),
    colors: [...colors].sort(),
    gradients: [...gradients].sort(),
    shadows: [...shadows].sort(),
    fonts: [...fonts].sort()
  };

  /**
   * Накопительное сохранение в localStorage:
   * удобно, если ты обходишь несколько страниц (каталог, карточка, блог и т.д.)
   */
  const key = "gnblast_style_dump";
  const dump = JSON.parse(localStorage.getItem(key) || "[]");
  dump.push(result);
  localStorage.setItem(key, JSON.stringify(dump));

  // Копируем результат в буфер (в Chrome DevTools работает copy())
  copy(result);

  console.log("✅ Скопировано в буфер и сохранено в localStorage:", result);
})();
