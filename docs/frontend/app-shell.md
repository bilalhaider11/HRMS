# Frontend: App Shell & Authentication

## Entry Point Chain

```
index.tsx -> App.tsx -> ThemeProvider -> VerifyContextProvider -> BrowserRouter -> AppContent.tsx
```

## Auth Gate (`AppContent.tsx`)

Two render paths based on auth state:

**Unauthenticated** (`!user && !authCheckLoading`):
- `/admin/login` -> LoginPage
- `/admin/register` -> SignUp
- `/` -> `Navigate to="/admin/login"`

**Authenticated** (`user` is set):
- Wraps all features in nested context providers
- Renders sidebar + navbar + route content + footer

### Provider Nesting Order
```
TeamsProvider > InventoryProvider > FinanceProvider > EmployeesProvider
```
Outermost is Teams, innermost is Employees. This matters because TeamsContext loads employee data (from dashboard API) independently.

## VerifyContext (`app/VerifyContext.tsx`)

Global auth state for the application.

### State
| Field | Type | Description |
|-------|------|-------------|
| `user` | `AppUser \| null` | Current logged-in user |
| `authCheckLoading` | `boolean` | True during initial token verification |
| `superAdmin` | `boolean` | Derived: `user !== null` |

### Actions
| Action | Behavior |
|--------|----------|
| `loginUser(email, password)` | Calls `login()` from auth API. On success, stores token + user in localStorage, sets user state. Returns `{ success, message? }` |
| `setUser(user)` | Direct state setter |

### Token Flow
1. On mount, checks `localStorage.getItem("token")`
2. If token exists, calls `verify(token)` from auth API
3. Valid -> sets user from response. Invalid -> clears localStorage.
4. Sets `authCheckLoading = false`

## Auth API (`features/auth/api/auth.tsx`)

Wired to the real backend (Phase 1).

### Functions
- `login(email, password)` — POST `/admin/login` with OAuth2 form data (`username` + `password`). Returns `{ token }`. Token is stored in localStorage.
- `verify(token)` — GET `/admin/company_profile` with `Authorization: Bearer <token>`. Returns `{ user: { name, email } }`.
- `signup(companyName, website, address, phone, email, password)` — POST `/admin/register_admin`. Registers a new admin account.

## ThemeContext (`app/ThemeContext.tsx`)

- Tracks `theme`: `"light" | "dark"`
- On first load, respects system preference via `window.matchMedia("(prefers-color-scheme: dark)")`
- Persists to `localStorage` (overrides system preference on subsequent loads)
- Applies/removes `dark` CSS class on `<html>` element
- Exposes `toggleTheme()` to switch between light and dark

## Sidebar Visibility (`widgets/SideBar.tsx`)

Sidebar items are conditionally shown based on `superAdmin` prop:

| Item | Visible to |
|------|-----------|
| Dashboard | All users |
| Swap | All users (no-op handler) |
| Employees | Super admin only |
| Finance | Super admin only |
| Inventory | Super admin only |
| Teams | Super admin only |
| Settings | All users |

## Layout Structure

```
AppContent
├── SideBar (fixed, 345px, collapsible)
│   ├── Profile section (name, email, settings icon)
│   ├── Navigation buttons (filtered by superAdmin)
│   └── Logout button
├── Main content area (responsive width)
│   ├── NavBar
│   ├── Routes (UserPages.tsx)
│   └── Footer
```

- Sidebar auto-collapses below 1280px viewport width
- On mobile: sidebar overlays with blur backdrop, click-outside-to-close
- Slider toggle with animation classes (`sliderOpen`/`sliderClose`)

## Routing (`widgets/UserPages.tsx`)

All authenticated routes defined here. Page components in `pages/` are thin wrappers that render the feature body components. See individual feature docs for route tables.
