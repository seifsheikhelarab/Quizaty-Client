# AGENTS.md - Quizaty Client

This file provides guidelines for AI agents working on this codebase.

## Project Overview

Quizaty is a quiz/exam management application built with React Router 7, React 19, TypeScript, and TailwindCSS 4. It supports teacher and student roles with Arabic UI.

## Tech Stack

- **Framework**: React Router 7 (full-stack React)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Runtime**: Bun

## Build/Lint/Test Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# TypeScript type checking
npm run typecheck

# Docker build
docker build -t quizaty-client .
```

**Note**: No test framework is currently configured. Do not add tests unless explicitly requested.

## Code Style Guidelines

### Imports & Path Aliases

- Use `~/*` alias for imports from `./app/*` (e.g., `import { apiFetch } from "~/utils/api"`)
- Group imports: React first, then third-party, then local
- Use named exports for components and utilities

### TypeScript

- Enable `strict: true` - all types must be explicit
- Define interfaces for component props (e.g., `NavbarProps`)
- Use proper TypeScript types - avoid `any`
- Use `type` for unions/intersections, `interface` for object shapes

### Naming Conventions

- **Components**: PascalCase (e.g., `Navbar.tsx`, `Spinner.tsx`)
- **Files/Utilities**: camelCase (e.g., `api.ts`, `apiFetch`)
- **Routes**: kebab-case (e.g., `teacher-dashboard.tsx`)
- **CSS Classes**: Tailwind utility classes, kebab-case
- **Props**: camelCase

### Component Structure

```tsx
// 1. Imports
import { useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "~/utils/api";

// 2. Types/Interfaces
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

// 3. Component
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hooks first
  const [state, setState] = useState(false);

  // handlers
  const handleClick = () => { };

  // render
  return <div>...</div>;
}
```

### Error Handling

- Use the `ApiError` class from `~/utils/api` for API errors
- Handle 401 redirects to login for authenticated routes
- Always include error boundaries for async operations
- Show user-friendly Arabic error messages

### API Patterns

- Use `apiFetch` utility for all API calls (handles auth, cookies, errors)
- API_BASE defaults to `http://localhost:7492/api`
- Always include `credentials: "include"` for cookie-based auth

### Styling (TailwindCSS 4)

- Use Arabic RTL classes where needed (text starts from right)
- Use `slate` for grays, `indigo` for primary colors
- Mobile-first responsive design
- Custom animations use `animate-reveal-*` classes

### Routing

- Routes defined in `app/routes.ts`
- Layouts in `app/routes/*-layout.tsx`
- Dynamic segments: `teacher-$id.tsx`

### Best Practices

- No inline styles - use Tailwind classes only
- No `console.log` in production code
- Use `export function` for components (not default export)
- Keep components focused and small
- Extract reusable logic to utilities in `app/utils/`

## File Organization

```
app/
├── components/     # Reusable UI components
├── routes/         # Page routes
├── utils/          # Utility functions (api.ts, etc.)
├── root.tsx        # App root
├── routes.ts       # Route definitions
└── app.css         # Global styles
```

## Environment Variables

Create `.env` with `VITE_API_URL` for API endpoint (defaults to `http://localhost:7492/api`).
