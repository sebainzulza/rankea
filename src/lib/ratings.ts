// Helpers de ranking/dificultad compartidos entre Home, página de ramo y tarjetas.
// La fórmula ponderada replica la de las vistas de Postgres (profesor_stats, etc.)
// para que el ranking client-side y el del servidor sean consistentes.

/** Umbral de confianza del ranking ponderado (Bayesiano tipo IMDB). */
export const RANKING_M = 3

/**
 * score = (v/(v+m))*R + (m/(v+m))*C
 * v = nº de reseñas, R = promedio del item, C = promedio global, m = RANKING_M.
 * Profes con pocas reseñas son "jalados" hacia el promedio global hasta acumular evidencia.
 */
export function scorePonderado(promedio: number, total: number, promedioGlobal: number): number {
  if (total <= 0) return promedioGlobal
  return (total / (total + RANKING_M)) * promedio + (RANKING_M / (total + RANKING_M)) * promedioGlobal
}

/** dificultad = promedio de exigencia (1-5). Más alto = más exigente. */
export function dificultadInfo(d: number | null): { label: string; className: string } {
  if (d === null) return { label: 'Sin datos', className: 'text-muted-foreground' }
  if (d >= 4.5) return { label: 'Muy exigente', className: 'text-red-600' }
  if (d >= 3.5) return { label: 'Exigente', className: 'text-orange-600' }
  if (d >= 2.5) return { label: 'Moderado', className: 'text-amber-600' }
  if (d >= 1.5) return { label: 'Llevadero', className: 'text-emerald-600' }
  return { label: 'Fácil', className: 'text-emerald-600' }
}
