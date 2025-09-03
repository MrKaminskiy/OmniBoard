# 🎨 Правила дизайна OmniBoard Frontend

## 📋 Основное правило
**Весь дизайн фронтенда должен использовать исключительно компоненты и стили Tabler UI через CDN.**

## ❌ Запрещено использовать:
- Tailwind CSS классы
- Bootstrap классы (кроме тех, что встроены в Tabler UI)
- Кастомные CSS фреймворки
- Inline стили (кроме критически необходимых)

## ✅ Разрешено использовать:
- Tabler UI классы: `card`, `card-body`, `btn`, `alert`, `table`, etc.
- Tabler UI компоненты: `container-xl`, `row`, `col-*`, `page-header`
- Tabler UI утилиты: `d-flex`, `align-items-center`, `text-muted`, `mb-3`
- Tabler Icons: `ti ti-*` классы
- CSS переменные Tabler UI: `var(--tblr-*)`

## 🎯 Примеры правильного использования:

### ✅ Правильно (Tabler UI):
```tsx
<div className="container-xl">
  <div className="page-header d-print-none">
    <div className="container-xl">
      <div className="row g-2 align-items-center">
        <div className="col">
          <h2 className="page-title">Market Overview</h2>
        </div>
      </div>
    </div>
  </div>
  
  <div className="row row-cards mb-4">
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="subheader">Market Cap</div>
          <div className="h1 mb-3">$2.1T</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### ❌ Неправильно (Tailwind):
```tsx
<div className="space-y-6">
  <div className="text-center">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Overview</h1>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Market Cap</h3>
    </div>
  </div>
</div>
```

## 🔧 Компоненты Tabler UI для использования:

### Layout:
- `container-xl` - основной контейнер
- `page-header` - заголовок страницы
- `row`, `col-*` - сетка
- `row-cards` - ряд карточек

### Cards:
- `card` - основная карточка
- `card-header` - заголовок карточки
- `card-body` - тело карточки
- `card-title` - заголовок в карточке

### Buttons:
- `btn` - основная кнопка
- `btn-primary`, `btn-success`, `btn-danger` - варианты
- `btn-sm`, `btn-lg` - размеры

### Tables:
- `table` - основная таблица
- `table-vcenter` - вертикальное выравнивание
- `table-responsive` - адаптивность

### Alerts:
- `alert` - основное уведомление
- `alert-danger`, `alert-success` - варианты
- `alert-title` - заголовок уведомления

### Forms:
- `form-control` - поле ввода
- `form-label` - метка поля
- `form-select` - выпадающий список

### Utilities:
- `d-flex`, `d-block`, `d-none` - display
- `align-items-center`, `justify-content-between` - flexbox
- `text-muted`, `text-success`, `text-danger` - цвета текста
- `mb-3`, `mt-2`, `p-4` - отступы
- `placeholder-glow` - анимация загрузки

## 🚀 Преимущества следования правилам:
1. **Консистентность** - единый стиль по всему приложению
2. **Производительность** - стили загружаются из CDN
3. **Поддержка** - легче поддерживать и обновлять
4. **Профессиональный вид** - готовые компоненты Tabler UI
5. **Responsive** - автоматическая адаптивность

## 📚 Полезные ссылки:
- [Tabler UI Documentation](https://tabler.io/docs)
- [Tabler UI Components](https://tabler.io/docs/components)
- [Tabler Icons](https://tabler-icons.io/)
- [Tabler UI Utilities](https://tabler.io/docs/utilities)

## ⚠️ Важно помнить:
При добавлении новых страниц или компонентов всегда используйте Tabler UI классы. Если нужного компонента нет в Tabler UI, создайте его, используя базовые Tabler UI классы как основу.
