# rank-profesor-inacap · Progreso

## ✅ Sesión 1 — Setup

- React + Vite + TS + Tailwind v4 + shadcn/ui (manual)
- Supabase JS + PWA + react-router-dom
- `.env` con credenciales
- Estructura de páginas y componentes base
- Auth con Magic Link + guard `@inacapmail.cl`

## ✅ Sesión 2 — Backend real + features

### Paso 1 — Tablas en Supabase
- `profesores`, `carreras`, `ramos`, `resenas`, `comentarios_app` creadas y con RLS.
- Policies: `lectura_publica` (SELECT), `insertar_autenticado` (INSERT), `borrar_propias` (DELETE).
- `src/types/database.ts` regenerado desde Supabase (incluye `comentarios_app`).

### Paso 3 — MOCKs reemplazados por queries reales
- `HomePage.tsx`, `ProfesorDetallePage.tsx`, `NuevaResenaPage.tsx` ya usan Supabase.

### Paso 4 — Proof of Work
- `ProfesorDetallePage.tsx` cuenta reseñas del autor (`count exact`) y bloquea lectura hasta aportar.

### Extras de esta sesión
- **Página de perfil** (`/perfil`): lista reseñas propias, permite eliminarlas, stats (total + promedio).
  - Enlace desde el Navbar (chip email en desktop, ícono en móvil).
- **Filtro por carrera** en HomePage (pills arriba de la lista).

### Build
- `npm run build` → verde.

---

## 🔜 Pendiente

### Paso 2 — Config Auth en el dashboard (manual)
Solo lo puedes hacer tú en dashboard.supabase.com:
- Authentication → URL Configuration → Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`
- Activar provider Email (Magic Link)

### Seed de INACAP Temuco (requiere decisión)
Las tablas tienen datos de prueba basura (`aaaa`, `bbbb`...). Antes de sembrar necesito de ti:
1. ¿Borro los profesores/carreras/ramos/reseñas actuales y empiezo limpio?
2. Lista de carreras reales a cargar (o confirmo que tomo las principales de INACAP Temuco).
3. ¿Incluyo profesores reales o esos se van llenando solos a medida que los alumnos los creen?

### Deploy (requiere decisión)
- ¿Vercel o Netlify?
- ¿Dominio?
- Recuerda actualizar Site URL y Redirect URLs en Supabase con la URL de producción.
