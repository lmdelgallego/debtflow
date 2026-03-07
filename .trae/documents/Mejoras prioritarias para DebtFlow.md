## Diagnóstico rápido (lo más urgente)
- **Seguridad de rutas**: hoy solo se bloquea `/dashboard`; rutas como `/incomes`, `/expenses`, `/instruments` quedan públicas ([middleware.ts](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/middleware.ts), [middleware supabase](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/lib/supabase/middleware.ts)).
- **Bug de login**: siempre redirige aunque el password sea incorrecto y el input de contraseña no es `type="password"` ([signin/page.tsx](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/(auth)/signin/page.tsx#L107-L124)).
- **Bug de paginación**: al cambiar `page` no refetchea porque `loadIncomes()` solo corre en mount ([incomes/page.tsx](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/(root)/(pages)/incomes/page.tsx#L36-L55)).
- **Clases Tailwind inválidas** (no hay `tailwind.config.*`): `pt-15`, `max-w-fix`, `bg-bg-white` ([root layout](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/(root)/layout.tsx#L6-L16), [home](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/page.tsx#L6-L12)).
- **DX/testing**: no hay scripts de `typecheck/test/format` ([package.json](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/package.json#L5-L10)).

## Mejoras recomendadas (prioridad)
1) Cerrar el guard de auth para todas las rutas privadas.
2) Arreglar el flujo de Sign in (no redirigir con error, password oculto, mejor feedback).
3) Arreglar la paginación de Incomes (refetch + estados).
4) Limpiar clases Tailwind inválidas y revisar `overflow-hidden` global (scroll/a11y).
5) Normalizar imports (no usar APIs internas de Next) y limpiar imports muertos.
6) Mover agregaciones de charts a server-side (menos carga en cliente) y validar inputs de acciones.
7) Añadir tooling mínimo: `typecheck`, `format`, `test`, `e2e` + configuración base.

## Plan de implementación (lo que voy a construir)
### 1) Guard de rutas con Supabase (middleware)
- **Objetivo**: permitir solo rutas públicas sin sesión y bloquear el resto.
- **Cambios**: modificar [lib/supabase/middleware.ts](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/lib/supabase/middleware.ts) para:
  - Definir una lista clara de rutas públicas y privadas.
  - Preservar `next` en query para volver después del login.

**Pseudocódigo**
```
const PUBLIC_PATHS = ["/", "/signin", "/signup", "/auth/callback"]
const PRIVATE_PREFIXES = ["/dashboard", "/incomes", "/expenses", "/instruments"]

updateSession(request):
  supabaseResponse = NextResponse.next({ request })
  supabase = createServerClient(...cookies wiring...)
  user = await supabase.auth.getUser()

  pathname = request.nextUrl.pathname
  isPublic = pathname in PUBLIC_PATHS
  isPrivate = PRIVATE_PREFIXES.some(prefix => pathname.startsWith(prefix))

  if (isPublic && user):
    redirect to "/dashboard"

  if (isPrivate && !user):
    redirect to "/signin?next=<pathname+search>"

  return supabaseResponse
```

### 2) Fix de Sign in (lógica + UX)
- **Archivos**: [signin/page.tsx](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/(auth)/signin/page.tsx)
- **Cambios**:
  - `onSubmit`: solo redirigir si `error` es null.
  - `Input` de password: `type="password"`, `autoComplete="current-password"`.
  - Mostrar error de forma consistente (mantener `role="alert"`, `aria-live`).

**Pseudocódigo**
```
onSubmit(data):
  if (submitting) return
  setSubmitting(true)
  setErrorMessage(null)

  { error } = await signInWithPassword(data)
  if (error):
    setSubmitting(false)
    setErrorMessage(error.message)
    return

  router.replace(nextPath)
```

### 3) Fix de paginación en Incomes
- **Archivos**: [incomes/page.tsx](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/(root)/(pages)/incomes/page.tsx)
- **Cambios**:
  - Hacer que el refetch dependa de `page` (y `pageSize`).
  - Evitar estados “stale” al mutar (create/update/delete) y mantener consistencia con la página actual.

**Pseudocódigo**
```
loadIncomes = useCallback(async () => fetchIncomes(page, pageSize), [page, pageSize])
useEffect(() => { loadIncomes() }, [loadIncomes])
```

### 4) Limpieza de Tailwind + scroll base
- **Archivos**: [app/layout.tsx](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/layout.tsx), [app/(root)/layout.tsx](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/(root)/layout.tsx), [app/page.tsx](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/app/page.tsx)
- **Cambios**:
  - Reemplazar clases inválidas por equivalentes reales (`pt-15` → `pt-16` o valor coherente; `max-w-fix` → `max-w-fit`; `bg-bg-white` → `bg-white` o `bg-background`).
  - Revisar `overflow-hidden` global para no romper scroll/teclado (ajustar a contenedores específicos).
  - Ajustar `metadata` y `lang` a español.

### 5) DX mínimo (scripts)
- **Archivo**: [package.json](file:///Users/lmdelgallego/Documents/WORKSPACES/debtflow/package.json)
- **Cambios**:
  - Añadir `typecheck` (tsc), `lint:fix`, y base para `format`/`test` (si añadimos Prettier/Vitest en el siguiente paso).

## Verificación (cómo lo voy a validar)
- Navegación: no se puede entrar a `/incomes` sin sesión; con sesión redirige de `/signin` a `/dashboard`.
- Sign in: con credenciales inválidas no redirige y muestra error.
- Incomes: cambiar página refetchea y la tabla se actualiza.
- UI: home/root layout sin clases Tailwind inválidas y con scroll correcto.

Si confirmas este plan, ejecuto estos cambios primero (1–4) y dejo el proyecto listo para añadir testing/CI en una segunda pasada.