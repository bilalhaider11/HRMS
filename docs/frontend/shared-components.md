# Frontend: Shared Components

**Location**: `src/shared/`

Reusable UI components used across features.

## Form Components

| Component | File | Description |
|-----------|------|-------------|
| `FormInput` | `FormInputs.tsx` | Standard form input with label, typically used with Formik |
| `ModalsInput` | `ModalsInput.tsx` | Input variant styled for modal dialogs |
| `SelectField` | `SelectField.tsx` | Custom select/dropdown field |
| `Select` | `Select.tsx` | Alternative select component |
| `FormButton` | `FormButton.tsx` | Submit/action button for forms |

## Layout Components

| Component | File | Description |
|-----------|------|-------------|
| `Box` | `Box.tsx` | Generic container/card component |
| `Modal` | `Modal.tsx` | Base modal overlay |
| `AuthModal` | `AuthModal.tsx` | Modal variant for auth-related dialogs |
| `DeleteModal` | `DeleteModal.tsx` | Confirmation modal for delete operations |
| `SuccessfullModal` | `SuccessfullModal.tsx` | Success notification modal (note spelling) |

## Navigation

| Component | File | Description |
|-----------|------|-------------|
| `Pagination` | `Pagination.tsx` | Page navigation. Props: `totalPosts`, `postsPerPage`, `currentPage`, `currentPageSet` |
| `Button` | `Button.tsx` | Base button component |
| `ImageButton` | `ImageButton.tsx` | Button wrapping an image/icon |

## Utilities

| Component | File | Description |
|-----------|------|-------------|
| `UseIntersectionObserver` | `UseIntersectionObserver.tsx` | Custom hook for intersection observer API |

### `lib/utils.ts`
`cn()` function — merges Tailwind classes using `clsx` + `tailwind-merge`. Used throughout for conditional class composition.

## Widget Components (`src/widgets/`)

| Component | File | Description |
|-----------|------|-------------|
| `SideBar` | `SideBar.tsx` | Main navigation sidebar with superAdmin-gated items |
| `NavBar` | `NavBar.tsx` | Top navigation bar |
| `Footer` | `Footer.tsx` | Page footer |
| `UserPages` | `UserPages.tsx` | Route definitions for authenticated users |

## Component Directory (`src/components/`)

Contains additional UI primitives (e.g., `Button.tsx`). Note this is separate from `src/shared/Button.tsx`.
