<div align="center">

# Rankea

**App de reseñas anónimas de profesores de INACAP Temuco.**

Hecho por estudiantes, para estudiantes.

[**rankea.dev**](https://rankea.dev) · [Reportar bug / sugerencia](https://github.com/sebainzulza/rankea/issues)

</div>

---

## ¿Qué es Rankea?

Rankea es una **PWA** donde los estudiantes de INACAP Temuco pueden compartir su experiencia con profesores antes de tomar un ramo. La idea es simple: ayudarte a elegir mejor, sin tener que andar preguntando "oye, ¿cómo es el profe X?" en cada grupo de WhatsApp.

- **Anónimo por defecto.** Tu reseña no muestra tu nombre.
- **Solo INACAP Temuco.** Registro restringido a correos `@gmail.com` con verificación por código (OTP).
- **Sin algoritmos raros.** Calificaciones promedio, ordenadas por carrera o ramo.
- **Móvil primero.** Instalable como app desde el navegador.

## Funcionalidades

### 📚 Explorar profesores
- Listado completo con búsqueda por nombre.
- Filtros por **carrera** y **ramo**.
- Cada profe muestra promedio de estrellas, número de reseñas y los ramos que dicta.

### ⭐ Dejar una reseña
- Calificación de 1 a 5 estrellas.
- Comentario libre.
- Se asocia al ramo específico que cursaste.
- **Una reseña por usuario por profesor** (no se puede inflar/spamear).
- Si escribes el nombre de un profesor que ya existe con tipeo distinto, el sistema detecta similitud y te sugiere el correcto (fuzzy matching).

### 💬 Comentarios en reseñas
- Cualquier usuario puede responder a una reseña existente.
- Hilo público bajo cada reseña, también anónimo.

### 👤 Perfil propio
- Lista de tus reseñas hechas.
- Posibilidad de eliminarlas.

### 🔐 Autenticación
- Login con **código OTP** (6-10 dígitos) enviado al correo.
- Sin contraseñas.
- Solo dominios `@gmail.com` (decisión de moderación contra cuentas falsas).
- Powered by **Supabase Auth + Resend**.

### 📱 PWA
- Instalable en Android, iOS y desktop.
- Diálogo de instalación nativo en la primera visita.
- Funciona offline parcialmente (cache de assets).

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite 7 |
| UI | Tailwind CSS v4 + shadcn/ui (Radix) |
| Routing | React Router 7 |
| Backend | Supabase (Postgres + Auth + RLS) |
| Email | Resend (templates de OTP) |
| Hosting | Vercel (Fluid Compute) |
| Analytics | Vercel Web Analytics |
| PWA | vite-plugin-pwa |

## Estructura del proyecto

```
src/
├── pages/                    # Vistas principales (Home, Login, ProfesorDetalle, etc.)
├── components/
│   ├── layout/               # Navbar y layout
│   ├── ui/                   # Primitivos shadcn/ui
│   ├── ProfesorCard.tsx
│   ├── RatingStars.tsx
│   ├── ComentariosDialog.tsx
│   └── InstalarAppDialog.tsx
├── hooks/                    # useAuth, hooks compartidos
├── lib/                      # Cliente Supabase, helpers
└── types/                    # Tipos generados desde la BD
```

## Esquema de la base de datos

Tablas principales en Supabase (todas con **RLS habilitado**):

- `profesores` — catálogo de docentes.
- `carreras` — carreras de INACAP Temuco.
- `ramos` — asignaturas, vinculadas a carreras y profes.
- `resenas` — reseñas (rating + comentario), 1 por (usuario, profesor).
- `comentarios_app` — feedback general de usuarios sobre la app.

Funciones RPC relevantes:
- `find_similar_profesores(nombre)` — fuzzy match para evitar duplicados al crear un profe.

## Desarrollo local

### Requisitos
- Node.js 20+
- Cuenta de Supabase (proyecto propio o acceso al de Rankea)

### Setup

```bash
# 1. Clonar
git clone https://github.com/sebainzulza/rankea.git
cd rankea

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env.local
# Edita .env.local con:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 4. Levantar dev server
npm run dev
```

Abre http://localhost:5173

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Vite dev server con HMR |
| `npm run build` | Build de producción (TS check + Vite build) |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |

## Despliegue

Auto-deploy en Vercel desde la rama `main`. Cada push a `main` genera deploy a producción en `rankea.dev`.

Variables de entorno requeridas en Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- 
## Privacidad y moderación

- Las reseñas son **anónimas para otros usuarios**, pero quedan asociadas a tu cuenta en la BD para evitar spam y permitir borrarlas.
- No se publican datos personales del autor.
- Se reserva el derecho de eliminar reseñas que contengan insultos, datos personales del profesor, o contenido difamatorio.
- Reportar abuso: abrir un [issue](https://github.com/sebainzulza/rankea/issues) o usar el formulario de feedback dentro de la app.

## Contribuir

Este es un proyecto personal de un estudiante de INACAP Temuco, pero las sugerencias y reportes de bugs son bienvenidos vía [issues](https://github.com/sebainzulza/rankea/issues).

## Licencia

Sin licencia pública por ahora — proyecto privado en repo público para portafolio.

---

<div align="center">

Hecho por Sebastián, alias **Beymax** · [@sebainzulza](https://github.com/sebainzulza)

</div>
