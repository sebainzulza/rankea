// ─── Entidades del dominio ────────────────────────────────────────────────────

export type Carrera = {
  id: string
  nombre: string
  codigo: string | null
  created_at: string
}

export type Ramo = {
  id: string
  nombre: string
  codigo: string | null
  carrera_id: string | null
  carrera?: Carrera
  created_at: string
}

export type Profesor = {
  id: string
  nombre: string
  apellido: string
  /** URL de foto de perfil (opcional) */
  avatar_url: string | null
  created_at: string
}

export type Resena = {
  id: string
  profesor_id: string
  ramo_id: string
  autor_id: string // UUID del usuario de Supabase Auth
  /** Nota general 1-5 */
  calificacion_general: number
  /** ¿Explica bien? 1-5 */
  calificacion_explicacion: number
  /** ¿Qué tan exigente es? 1-5 */
  calificacion_exigencia: number
  /** ¿Qué tan accesible es fuera de clases? 1-5 */
  calificacion_accesibilidad: number
  comentario: string
  semestre: string // ej: "2024-2"
  created_at: string
  // relaciones cargadas
  ramo?: Ramo
  profesor?: Profesor
}

export type ProfesorConStats = Profesor & {
  promedio_general: number
  total_resenas: number
  ramos: Ramo[]
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string
  email: string
}

// ─── Formularios ──────────────────────────────────────────────────────────────

export type NuevaResenaForm = {
  profesor_nombre: string
  profesor_apellido: string
  ramo_nombre: string
  carrera_nombre: string
  calificacion_general: number
  calificacion_explicacion: number
  calificacion_exigencia: number
  calificacion_accesibilidad: number
  comentario: string
  semestre: string
}
