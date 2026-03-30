# Frontend Patterns — e-commerce-fe

This document is the **canonical reference** for all coding patterns used in this project. All AI-assisted and manual code must follow these conventions.

---

## 1. Project Structure

```
app/
  [locale]/                  # All routes are locale-scoped
    layout.tsx               # Root layout: fonts, NextIntlClientProvider, AppProvider
    page.tsx                 # Home
    auth/
      login/page.tsx
      register/page.tsx
    products/[id]/page.tsx
    admin/                   # Admin-only section (role-guarded layout)
      layout.tsx
      products/
        new/page.tsx
        [id]/edit/page.tsx
src/
  core/
    api/
      index.ts               # Axios singleton factory (initializeApiClientInstance)
      interface.ts           # IApiResponse<T>, CustomHookMutationParams
    store/
      store.ts               # Redux store + typed hooks (useAppDispatch, useAppSelector)
      auth.slice.ts          # Auth state: accessToken, refreshToken, user
      AppProvider.tsx        # Redux Provider + PersistGate + QueryClientProvider
  features/
    auth/
      api/index.ts           # useMutation hooks
      components/            # LoginForm, RegisterForm
      interfaces/index.ts    # Request/Response interfaces
      schema/index.ts        # Zod schema factories
    product/
      api/
        index.ts             # useQuery hooks + plain async functions
        query-keys.ts        # Query key factory
        mock.ts              # Mock data (USE_MOCK flag)
      components/            # ProductList, ProductDetail, etc.
      interfaces/index.ts
    admin/
      product/               # Follow same structure as product feature
        api/
          index.ts
          query-keys.ts
        components/
        interfaces/index.ts
        schema/index.ts
  shared/
    components/
      base/ui/               # shadcn/ui components (Button, Input, etc.)
      layout/                # Header, Footer
    constants/
      routes.ts              # ROUTES constant
    hooks/
      useAppRouter.ts        # Locale-aware router
    lib/
      utils.ts               # cn() helper
  i18n/
    routing.ts               # Locales: ['en', 'vi'], default: 'en'
    request.ts               # getRequestConfig dynamic import
    translations/
      en/
        index.ts             # Merge all namespaces
        common.json
        auth/
          login.json
          register.json
          index.ts
        product/
          home.json
          list.json
          detail.json
          index.ts
        admin/
          product.json       # Admin product translations
          index.ts
      vi/                    # Mirror structure of en/
```

---

## 2. API Client Pattern

### Singleton factory

```ts
// src/core/api/index.ts
const apiClient = initializeApiClientInstance({
  includeAuthHeader: true,   // default — adds Bearer token
});

const apiClientPublic = initializeApiClientInstance({
  includeAuthHeader: false,  // for public endpoints
});
```

- `baseURL` is read from `NEXT_PUBLIC_API_ENDPOINT`
- **Auth-enabled client** automatically reads the access token from:
  1. `store.getState().auth.accessToken` (Redux in-memory)
  2. `localStorage` `persist:root` fallback (for SSR-safe hydration)

### Response shape

```ts
// src/core/api/interface.ts
interface IApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}
```

Always unwrap with `.then(res => res.data)` or `.then(res => res.data.data)`.

---

## 3. API Hooks Pattern

### Read (useQuery)

```ts
// src/features/product/api/index.ts
const apiClient = initializeApiClientInstance({ includeAuthHeader: false });

const getProduct = async (id: string): Promise<IProductDetail> =>
  apiClient.get<IApiResponse<IProductDetail>>(`/products/${id}`).then(res => res.data.data);

export const useProduct = (id: string) =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
```

### Write (useMutation)

```ts
// src/features/auth/api/index.ts
const authClient = initializeApiClientInstance({});

const login = async (request: ILoginRequest) =>
  authClient.post<IApiResponse<ILoginResponse>>('/auth/login', request).then(res => res.data);

export const useLogin = (
  params: CustomHookMutationParams<IApiResponse<ILoginResponse>, DefaultError, ILoginRequest>,
) =>
  useMutation({
    mutationFn: login,
    ...(params ?? {}),
  });
```

`CustomHookMutationParams` is a typed wrapper allowing callers to pass `onSuccess`, `onError`, `onSettled` as props.

### Query Keys

```ts
// src/features/<feature>/api/query-keys.ts
export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...PRODUCT_QUERY_KEYS.all, 'detail', id] as const,
  categories: () => ['categories'] as const,
};
```

One `query-keys.ts` file per feature.

### Mock flag

```ts
const USE_MOCK = false; // set to true during development before backend is ready
```

When `USE_MOCK = true`, call a `getMock*` function instead of the real API.

---

## 4. Form Pattern

Every form follows this exact structure:

### Schema (Zod + i18n)

```ts
// src/features/<feature>/schema/index.ts
import { z } from 'zod';

type TranslationFunction = (key: string) => string;

export const createProductSchema = (t: TranslationFunction) =>
  z.object({
    name: z.string().nonempty(t('admin.product.name_required')).max(50, t('admin.product.name_max')),
    price: z.number({ invalid_type_error: t('admin.product.price_invalid') }).min(0),
    // ...
  });
```

- Schema is a **factory** that takes `t` so messages are translated.
- `useMemo(() => createSchema(t), [t])` inside the component.

### Form Component

```tsx
'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const MyForm = () => {
  const t = useTranslations();
  const schema = useMemo(() => createMySchema(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IMyFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 0 },
  });

  const { mutate, isPending } = useMyMutation({});

  const onSubmit = (data: IMyFormData) => {
    mutate(data, {
      onSuccess: (res) => { /* navigate / toast */ },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input {...field} aria-invalid={!!errors.name} />
        )}
      />
      {errors.name && <p className="mt-1.5 text-sm">{errors.name.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? t('common.saving') : t('common.save')}
      </Button>
    </form>
  );
};
```

Rules:
- Always `'use client'`
- Use `Controller` (not `register`) for all fields
- Show `errors.<field>.message` below each field
- Disable submit button when `isPending`
- Use shadcn `Input`, `Button`, `Select`, `Textarea` components
- Never `any` — always typed with `useForm<IMyFormData>`

### Separate form data types from API types

```ts
// IRegisterForm has confirmPassword (UI only)
// IRegisterRequest doesn't (sent to API)
export interface IRegisterForm extends IRegisterRequest {
  confirmPassword: string;
}
```

---

## 5. i18n Pattern

### Adding translations

1. Add keys to `src/i18n/translations/en/<namespace>/<file>.json`
2. Mirror in `src/i18n/translations/vi/<namespace>/<file>.json`
3. If new file: export from `<namespace>/index.ts`, import in root `index.ts`

### CRITICAL: always spread JSON imports in index.ts

Each JSON file has a wrapping key that matches its filename:
```json
// admin/product.json
{ "product": { "name": "...", ... } }
```

The `index.ts` **must spread** the import so the key is not double-nested:
```ts
// ✓ correct — gives { product: { name: "..." } }
const adminMessages = { ...product };

// ✗ wrong — gives { product: { product: { name: "..." } } }
const adminMessages = { product };
```

This matches how `auth/index.ts` works: `{ ...login, ...register }` spreads each JSON.

### Namespace structure

```ts
// messages shape (from root index.ts)
{
  common: { ... },
  auth: { login: {...}, register: {...} },
  product: { home: {...}, list: {...}, detail: {...} },
  admin: { product: { ... } },   // new namespaces follow same pattern
}
```

### Usage

```tsx
// Server component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations();
t('common.email')

// Client component
import { useTranslations } from 'next-intl';
const t = useTranslations();
t('admin.product.create_product')
```

### Translation key naming convention

`<namespace>.<sub-namespace>.<snake_case_key>`

Examples:
- `common.save`
- `admin.product.name_required`
- `auth.login.email_is_required`

---

## 6. State Management (Redux Toolkit)

- Only global, cross-cutting state lives in Redux (auth tokens, user info)
- Server/async state lives in TanStack Query
- UI state lives in component `useState`

```ts
// Usage in components
import { useAppDispatch, useAppSelector } from '@/src/core/store/store';
import { setAccessToken, clearAuth } from '@/src/core/store/auth.slice';

const dispatch = useAppDispatch();
const user = useAppSelector(s => s.auth.user);

dispatch(setAccessToken(token));
dispatch(clearAuth());
```

Adding a new slice:
1. Create `src/core/store/<name>.slice.ts`
2. Add to `combineReducers` in `store.ts`
3. Add to `whitelist` in `persistConfig` only if it should survive refresh

---

## 7. Components & UI

### shadcn/ui base components

Located at `src/shared/components/base/ui/`. Always import from there:

```ts
import { Button }   from '@/src/shared/components/base/ui/button';
import { Input }    from '@/src/shared/components/base/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
                    from '@/src/shared/components/base/ui/select';
import { Textarea } from '@/src/shared/components/base/ui/textarea';
import { Badge }    from '@/src/shared/components/base/ui/badge';
import { Card, CardContent, CardHeader, CardTitle }
                    from '@/src/shared/components/base/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle }
                    from '@/src/shared/components/base/ui/dialog';
```

### Styling

- Use `cn()` from `@/src/shared/lib/utils` to merge class names
- Use Tailwind utility classes
- Avoid inline styles

---

## 8. Routing

```ts
// src/shared/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PRODUCTS: {
    DETAIL: (id: string) => `/products/${id}`,
  },
  ADMIN: {
    PRODUCTS: {
      LIST: '/admin/products',
      NEW: '/admin/products/new',
      EDIT: (id: string) => `/admin/products/${id}/edit`,
    },
  },
};
```

Use locale-aware navigation:

```ts
import useAppRouter from '@/src/shared/hooks/useAppRouter';
const router = useAppRouter();
router.push(ROUTES.HOME);

// or with Link
import { useLocale } from 'next-intl';
const locale = useLocale();
<Link href={`/${locale}${ROUTES.ADMIN.PRODUCTS.NEW}`}>...</Link>
```

---

## 9. File Upload Pattern (Presigned URLs)

The flow for uploading files to MinIO via `file-service`:

```
1. GET /api/products/new-id        → { product_id: "uuid" }
2. POST /api/files/presigned-url   → { presigned_url, file_path, expires_in }
   body: { file_type: "product", content_type: "image/webp", product_id }
3. PUT <presigned_url> (raw binary) → 200 OK  (direct to MinIO, no auth header)
4. Construct public URL: NEXT_PUBLIC_STORAGE_BASE_URL + "/" + file_path
   e.g.: http://localhost:9000/uav-store/products/<product_id>/<uuid>.webp
5. POST /api/products with images: [{ url, display_order, is_primary }]
```

Environment variables:
```
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8080
NEXT_PUBLIC_STORAGE_BASE_URL=http://localhost:9000
```

Key rules:
- **Never** send the `Authorization` header to MinIO's presigned URL (it will fail)
- Use a plain `fetch` or a dedicated no-auth Axios instance for the PUT
- Store `file_path` (not full URL) for submission; construct display URL from `NEXT_PUBLIC_STORAGE_BASE_URL`

---

## 10. Admin Page Guard

Admin pages live under `app/[locale]/admin/`. The layout wraps them with a role check:

```tsx
// app/[locale]/admin/layout.tsx
'use client';
import { useAppSelector } from '@/src/core/store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(s => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/');
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return <>{children}</>;
}
```

---

## 11. Clean Code Rules

### No nested ternaries in JSX

ESLint enforces this. Whenever rendering logic has more than one condition, extract it into an **independent function with early returns** above the component (or outside the JSX block).

**Bad — nested ternary inside JSX:**

```tsx
<Button>
  {isPending ? <Spinner /> : isUploading ? <UploadIcon /> : 'Save'}
</Button>
```

**Good — helper function with early returns:**

```tsx
function renderButtonLabel({ isPending, isUploading, t }: { isPending: boolean; isUploading: boolean; t: TranslationFn }) {
  if (isPending) return <><Spinner /> {t('common.saving')}</>;
  if (isUploading) return <><UploadIcon /> {t('common.uploading')}</>;
  return t('common.save');
}

// Inside JSX:
<Button>{renderButtonLabel({ isPending, isUploading, t })}</Button>
```

This rule applies to **any conditional rendering** that would require a nested ternary `? ... : ... ? ... : ...`. A single `condition ? a : b` is acceptable. Anything deeper must be extracted.

### General early-return principle

Prefer guard clauses / early returns over deeply nested `if/else` blocks:

```ts
// Bad
function process(data: Data | null) {
  if (data) {
    if (data.items.length > 0) {
      return data.items.map(...);
    } else {
      return [];
    }
  } else {
    return null;
  }
}

// Good
function process(data: Data | null) {
  if (!data) return null;
  if (data.items.length === 0) return [];
  return data.items.map(...);
}
```

---

## 12. Checklist for a New Feature

- [ ] `src/features/<feature>/interfaces/index.ts` — Request/Response types
- [ ] `src/features/<feature>/schema/index.ts` — Zod schema factories (if has form)
- [ ] `src/features/<feature>/api/query-keys.ts` — Query key factory
- [ ] `src/features/<feature>/api/index.ts` — `useQuery` / `useMutation` hooks
- [ ] `src/features/<feature>/components/` — React components (`'use client'`)
- [ ] `app/[locale]/<route>/page.tsx` — Next.js page
- [ ] `src/i18n/translations/en/<namespace>/<file>.json` — English strings
- [ ] `src/i18n/translations/vi/<namespace>/<file>.json` — Vietnamese strings
- [ ] Wire namespace into both `en/index.ts` and `vi/index.ts`
- [ ] Add route to `src/shared/constants/routes.ts`
