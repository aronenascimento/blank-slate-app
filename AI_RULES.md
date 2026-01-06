# AI Rules and Project Guidelines

This document outlines the core technologies used in this project and provides rules for library usage to maintain consistency and quality.

## 1. Tech Stack Summary

This application is built using a modern, performance-focused stack:

*   **Frontend Framework:** React (using Vite and SWC for fast development).
*   **Language:** TypeScript for strong typing and improved developer experience.
*   **Styling:** Tailwind CSS for utility-first, responsive styling.
*   **UI Components:** shadcn/ui, built on top of Radix UI primitives.
*   **Routing:** React Router DOM for client-side navigation.
*   **State Management:** TanStack Query for server state management and data fetching.
*   **Forms & Validation:** React Hook Form paired with Zod for schema validation.
*   **Icons:** Lucide React.
*   **Notifications:** Sonner for modern, accessible toasts.

## 2. Library Usage Rules

To ensure a cohesive codebase, please adhere to the following rules when implementing features:

| Feature | Recommended Library/Tool | Rule |
| :--- | :--- | :--- |
| **UI Components** | `shadcn/ui` (Radix UI) | Always use existing shadcn/ui components. Only create new components if a suitable shadcn/ui primitive does not exist. |
| **Styling** | Tailwind CSS | All styling must be done using Tailwind CSS utility classes. Ensure all designs are responsive by default. |
| **Routing** | `react-router-dom` | Use `BrowserRouter`, `Routes`, and `Route` for all application navigation. Use the custom `NavLink` component for navigation links. |
| **Server State/Data Fetching** | `TanStack Query` | Use `useQuery` and `useMutation` for managing asynchronous data fetching and updates. |
| **Forms** | `react-hook-form` & `zod` | Use `react-hook-form` for managing form state and validation. Use `zod` for defining form schemas. |
| **Icons** | `lucide-react` | Use icons exclusively from the `lucide-react` package. |
| **Notifications** | `sonner` | Use the `sonner` library for displaying user feedback (toasts). |
| **Utility Functions** | `src/lib/utils.ts` | Use the `cn` utility function for merging Tailwind classes. |