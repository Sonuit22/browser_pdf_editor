# React Application Shell

The frontend now uses React, TypeScript, Vite, React Router, and a small reusable component system. PDF processing is deliberately outside this layer.

## Folders

- `src/components`: shared shell, brand, theme control, and tool card components.
- `src/data`: route-ready tool metadata used by the home grid and tool placeholders.
- `src/pages`: route-level workspace, legal, tool-placeholder, and not-found pages.
- `src/theme`: the persisted light/dark theme provider and hook.
- `src/styles.css`: application-wide tokens, responsive layout, and accessibility states.

## Routes

The shell provides `/`, `/view`, `/edit`, `/merge`, `/split`, `/rotate`, `/compress`, `/sign`, `/protect`, `/organize`, `/optimize`, `/privacy`, and `/terms`. Each PDF tool route is intentionally a placeholder until browser-only processing modules are added.

## Shared UI

`AppShell` owns the skip link, primary navigation, route outlet, live route announcement, and footer. `ThemeToggle` persists the selected theme in local storage. `ToolCard` renders tool metadata consistently across the application.
