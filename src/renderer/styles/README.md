# CSS Architecture & Best Practices

This document outlines the new CSS architecture for the OctoBar project, designed to eliminate styling conflicts and improve maintainability.

## 🏗️ Architecture Overview

```
src/renderer/styles/
├── base.css              # Design system variables and global styles
├── layout.css            # App-level layout and structure
└── README.md             # This documentation

src/renderer/components/
├── Header.css            # Header component styles
├── FilterBar.css         # FilterBar component styles
├── NotificationList.css  # NotificationList component styles
├── NotificationItem.css  # NotificationItem component styles
├── QuickActions.css      # QuickActions component styles
├── FilterSettingsModal.css # FilterSettingsModal component styles
└── SetupWizard.css       # SetupWizard component styles
```

## 🎨 Design System (base.css)

### CSS Custom Properties
All design tokens are defined as CSS custom properties in `:root`:

- **Colors**: Primary, secondary, success, danger, warning, and semantic text colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale (xs, sm, md, base, lg, xl, 2xl, 3xl)
- **Border Radius**: Standardized border radius values
- **Shadows**: Consistent shadow system
- **Transitions**: Standardized transition timings and easing functions
- **Z-Index**: Organized z-index scale for layering

### Benefits
- **Consistency**: All components use the same design tokens
- **Maintainability**: Change colors/spacing in one place
- **Theme Support**: Easy to implement dark mode or custom themes
- **Developer Experience**: Clear naming conventions and predictable values

## 🧩 Component-Specific Styles

Each component has its own CSS file that:
- Uses design system variables for consistency
- Contains only styles relevant to that component
- Follows BEM-like naming conventions
- Includes responsive breakpoints when needed

### Naming Conventions
- Component classes use kebab-case (e.g., `.notification-item`)
- Modifier classes use BEM syntax (e.g., `.notification-item.unread`)
- Utility classes are prefixed (e.g., `.text-truncate`, `.btn-primary`)

## 📱 Responsive Design

- Mobile-first approach with progressive enhancement
- Breakpoints: 400px, 480px, 600px
- CSS custom properties automatically adjust for smaller screens
- Component-specific responsive adjustments

## 🚀 Best Practices

### 1. Use Design System Variables
```css
/* ✅ Good - Uses design system */
.notification-item {
  padding: var(--spacing-base);
  color: var(--color-text-primary);
  border-radius: var(--radius-base);
}

/* ❌ Bad - Hardcoded values */
.notification-item {
  padding: 12px;
  color: #1d1d1f;
  border-radius: 8px;
}
```

### 2. Component Isolation
- Keep component styles in their own files
- Avoid global selectors that could affect other components
- Use specific class names to prevent conflicts

### 3. Responsive Design
- Use CSS custom properties for responsive adjustments
- Test on multiple screen sizes
- Keep mobile experience as the foundation

### 4. Performance
- CSS imports are processed at build time
- No runtime CSS loading overhead
- Efficient selectors and minimal specificity conflicts

## 🔧 Adding New Components

When creating a new component:

1. **Create the component file**: `NewComponent.tsx`
2. **Create the CSS file**: `NewComponent.css`
3. **Import in App.css**: Add `@import './components/NewComponent.css';`
4. **Use design system variables**: Reference colors, spacing, etc. from base.css
5. **Follow naming conventions**: Use kebab-case for class names

### Example New Component CSS
```css
/* NewComponent.css */
.new-component {
  padding: var(--spacing-lg);
  background: var(--color-background-secondary);
  border-radius: var(--radius-base);
}

.new-component__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-base);
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Styles not applying**: Check if the CSS file is imported in `App.css`
2. **Conflicting styles**: Ensure component classes are specific enough
3. **Design system not working**: Verify `base.css` is imported first

### Debugging
- Use browser dev tools to inspect computed styles
- Check CSS custom property values in `:root`
- Verify import order in `App.css`

## 📚 Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [BEM Methodology](https://en.bem.info/methodology/)
- [CSS Architecture Best Practices](https://css-tricks.com/css-architecture/)

## 🔄 Migration Notes

The old monolithic CSS files have been replaced:
- `App.css` (851 lines) → Modular component files + imports
- `SetupWizard.css` (894 lines) → Refactored with design system variables

All existing functionality is preserved while improving maintainability and reducing conflicts.
