# Dashboard Shell Architecture

## Layout

`AppLayout` composes the sticky `Header`, responsive `Sidebar`, routed center workspace, `RightPanel`, `StatusBar`, and `Footer`. The center surface only presents a visual upload entry point; it does not read or process files.

## Reusable Components

- `components/ui`: `Button`, `Card`, `Modal`, `LoadingSpinner`, `EmptyState`, and `ErrorState`.
- `components/workspace`: `UploadArea` and `StatusBar`.
- `components/PageContainer`: consistent headings and descriptions for route pages.

## Application Folders

- `config` and `types`: typed sidebar items and workspace route metadata.
- `contexts` and `hooks`: persisted light/dark theme, shell actions, and responsive media queries.
- `layouts`: shared desktop/mobile dashboard structure.
- `pages`: lazy-loaded workspace, legal, and not-found pages.
- `assets` and `services`: reserved for future React assets and browser-only PDF adapters; neither includes PDF processing today.
- `styles`: shared color and surface tokens used by the global stylesheet.

## Performance and Accessibility

Route modules are lazy loaded, static inspector/sidebar components are memoized, and theme state is memoized. The shell includes semantic landmarks, skip navigation, visible focus indicators, keyboard-dismissable dialogs, labeled controls, route announcements, and reduced-motion support.
