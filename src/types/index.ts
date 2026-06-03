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

export type RamoConCarrera = Ramo & { carrera: Carrera | null }

// ─── Vistas de agregación (Fase A: ranking ponderado) ──────────────────────────

/** Fila de la vista `profesor_stats`: agregados + score ponderado por profesor. */
export type ProfesorStats = {
  profesor_id: string
  nombre: string
  apellido: string
  avatar_url: string | null
  total_resenas: number
  promedio_general: number | null
  promedio_explicacion: number | null
  promedio_exigencia: number | null
  promedio_accesibilidad: number | null
  /** Ranking ponderado bayesiano (m=3). Úsalo para ordenar, no el promedio crudo. */
  score_ponderado: number | null
}

/** Fila de la vista `ramo_stats`: agregados por ramo. dificultad = promedio de exigencia. */
export type RamoStats = {
  ramo_id: string
  nombre: string
  codigo: string | null
  carrera_id: string | null
  total_resenas: number
  total_profes: number
  promedio_general: number | null
  dificultad: number | null
}

/** Fila de la vista `profesor_ramo_stats`: base de "mejor profe para este ramo". */
export type ProfesorRamoStats = {
  profesor_id: string
  ramo_id: string
  profesor_nombre: string
  profesor_apellido: string
  profesor_avatar_url: string | null
  total_resenas: number
  promedio_general: number | null
  promedio_explicacion: number | null
  promedio_exigencia: number | null
  promedio_accesibilidad: number | null
  score_ponderado: number | null
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
