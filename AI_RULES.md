# AI Development Rules & Guidelines

This document outlines the core technologies and conventions used in the Cassandra Smith Insurance application to ensure consistency, maintainability, and adherence to best practices.

## 1. Tech Stack Summary

1.  **Framework:** React (v19) with TypeScript for type safety.
2.  **Build Tool:** Vite is used for development and bundling.
3.  **Styling:** Tailwind CSS is the exclusive utility-first CSS framework for all styling and responsive design.
4.  **Routing:** React Router DOM (v7) is used for client-side navigation. All primary routes are defined in `App.tsx`.
5.  **UI Library:** Shadcn/ui components are available and preferred for building high-quality, accessible UI elements.
6.  **Icons:** All icons must be sourced from the `lucide-react` package.
7.  **Component Structure:** Components should be small, focused, and placed in `src/components/`. Pages (routes) are placed in `src/pages/` (though currently defined directly in `App.tsx`, future pages should follow this convention).
8.  **State Management:** Simple, local state management using React hooks (`useState`, `useMemo`, etc.) is preferred.

## 2. Library Usage Rules

| Purpose | Mandatory Library/Tool | Rule |
| :--- | :--- | :--- |
| **Styling** | Tailwind CSS | Use Tailwind utility classes exclusively. Ensure all designs are responsive by default. |
| **UI Components** | Shadcn/ui (or custom components following its style) | Prioritize using or creating components that align with the aesthetic and accessibility standards of shadcn/ui. |
| **Icons** | `lucide-react` | Do not use external icon libraries. |
| **Routing** | `react-router-dom` | Use `NavLink` for navigation links and `useNavigate` for programmatic navigation. |
| **Data Fetching** | Native browser APIs (e.g., `fetch`) or simple React hooks | Avoid introducing complex data fetching libraries unless explicitly required for advanced state management. |
| **Forms** | Native HTML elements with React state | Use standard React state management for forms (as seen in `ContactForm`). |