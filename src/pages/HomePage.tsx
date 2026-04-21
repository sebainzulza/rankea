import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Search, Loader2, Trophy, TrendingUp, Users } from 'lucide-react'
import type { Carrera, ProfesorConStats, Ramo } from '@/types'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ProfesorCard from '@/components/ProfesorCard'

type RamoConCarrera = Ramo & { carrera: Carrera | null }

type ProfesorRow = {
  id: string
  nombre: string
  apellido: string
  avatar_url: string | null
  created_at: string
  resenas: { calificacion_general: number; created_at: string; ramo: RamoConCarrera | null }[]
}

type Rango = 'todas' | 'hoy' | 'semana' | 'mes'

type ProfesorFiltrable = ProfesorConStats & {
  ultima_resena_at: number | null
  carreras: Carrera[]
}

function calcularStats(p: ProfesorRow): ProfesorFiltrable {
  const total = p.resenas.length
  const promedio = total
    ? p.resenas.reduce((s, r) => s + r.calificacion_general, 0) / total
    : 0
  const ramosMap = new Map<string, Ramo>()
  const carrerasMap = new Map<string, Carrera>()
  let ultima: number | null = null
  for (const r of p.resenas) {
    if (r.ramo) {
      ramosMap.set(r.ramo.id, r.ramo)
      if (r.ramo.carrera) carrerasMap.set(r.ramo.carrera.id, r.ramo.carrera)
    }
    const t = new Date(r.created_at).getTime()
    if (!Number.isNaN(t) && (ultima === null || t > ultima)) ultima = t
  }
  return {
    id: p.id,
    nombre: p.nombre,
    apellido: p.apellido,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
    promedio_general: promedio,
    total_resenas: total,
    ramos: Array.from(ramosMap.values()),
    carreras: Array.from(carrerasMap.values()),
    ultima_resena_at: ultima,
  }
}

function inicioRango(r: Rango): number | null {
  if (r === 'todas') return null
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (r === 'hoy') return d.getTime()
  if (r === 'semana') { d.setDate(d.getDate() - 7); return d.getTime() }
  if (r === 'mes') { d.setMonth(d.getMonth() - 1); return d.getTime() }
  return null
}

export default function HomePage() {
  const [profesores, setProfesores] = useState<ProfesorFiltrable[]>([])
  const [filtrados, setFiltrados] = useState<ProfesorFiltrable[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [rango, setRango] = useState<Rango>('todas')
  const [carreraId, setCarreraId] = useState<string>('todas')
  const [loading, setLoading] = useState(true)

  const cargarProfesores = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profesores')
        .select('id, nombre, apellido, avatar_url, created_at, resenas(calificacion_general, created_at, ramo:ramos(id, nombre, codigo, carrera_id, created_at, carrera:carreras(id, nombre, codigo, created_at)))')

      if (error) throw error
      const stats = (data as unknown as ProfesorRow[])
        .map(calcularStats)
        .sort((a, b) => {
          // Profes con reseñas primero, ordenados por reseña más reciente (desc).
          // Profes sin reseñas al final, alfabéticos por apellido.
          if (a.ultima_resena_at !== null && b.ultima_resena_at !== null) {
            return b.ultima_resena_at - a.ultima_resena_at
          }
          if (a.ultima_resena_at !== null) return -1
          if (b.ultima_resena_at !== null) return 1
          return a.apellido.localeCompare(b.apellido)
        })
      setProfesores(stats)
      setFiltrados(stats)
    } catch (e) {
      toast.error('No pudimos cargar los profesores.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarProfesores()
  }, [cargarProfesores])

  useEffect(() => {
    const q = busqueda.toLowerCase().trim()
    const desde = inicioRango(rango)
    let res = profesores
    if (q) {
      res = res.filter(
        (p) =>
          `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
          p.ramos.some((r) => r.nombre.toLowerCase().includes(q))
      )
    }
    if (desde !== null) {
      res = res.filter((p) => p.ultima_resena_at !== null && p.ultima_resena_at >= desde)
    }
    if (carreraId !== 'todas') {
      res = res.filter((p) => p.carreras.some((c) => c.id === carreraId))
    }
    setFiltrados(res)
  }, [busqueda, rango, carreraId, profesores])

  const carrerasDisponibles = useMemo(() => {
    const map = new Map<string, Carrera>()
    for (const p of profesores) for (const c of p.carreras) map.set(c.id, c)
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [profesores])

  const top3 = [...profesores].sort((a, b) => b.promedio_general - a.promedio_general).slice(0, 3)

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200/80 shadow-sm">
          <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{profesores.length}</p>
          <p className="text-xs text-muted-foreground">Profesores</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200/80 shadow-sm">
          <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
          <p className="text-lg font-bold">
            {profesores.reduce((acc, p) => acc + p.total_resenas, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Reseñas</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/20 shadow-sm">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">100%</p>
          <p className="text-xs text-muted-foreground">Anónimas</p>
        </div>
      </div>

      {/* Top 3 */}
      {!loading && top3.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            🏆 Top Profesores
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {top3.map((p, i) => (
              <div
                key={p.id}
                className="shrink-0 bg-gradient-to-br from-primary/10 to-secondary/30 border border-primary/20 rounded-xl px-4 py-3 text-center min-w-[110px]"
              >
                <span className="text-lg">{['🥇', '🥈', '🥉'][i]}</span>
                <p className="text-xs font-semibold mt-1 leading-tight">
                  {p.nombre} {p.apellido}
                </p>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {p.promedio_general.toFixed(1)} ⭐
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar profe o ramo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtros por rango temporal */}
      <div className="flex flex-wrap gap-2 mb-4">
        {([
          { key: 'todas', label: 'Todas' },
          { key: 'hoy', label: 'Hoy' },
          { key: 'semana', label: 'Última semana' },
          { key: 'mes', label: 'Último mes' },
        ] as { key: Rango; label: string }[]).map(({ key, label }) => {
          const activo = rango === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setRango(key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activo
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/70'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Filtro por carrera */}
      {carrerasDisponibles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCarreraId('todas')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              carreraId === 'todas'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/70'
            }`}
          >
            Todas las carreras
          </button>
          {carrerasDisponibles.map((c) => {
            const activo = carreraId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCarreraId(c.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activo
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/70'
                }`}
              >
                {c.nombre}
              </button>
            )
          })}
        </div>
      )}

      {/* Resultados */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>
            {rango === 'todas'
              ? 'No encontramos profesores con ese nombre o ramo.'
              : 'No hay profes con reseñas en este rango de tiempo.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Todos los profesores
            </h2>
            <Badge variant="secondary" className="text-xs">{filtrados.length}</Badge>
          </div>
          {filtrados.map((p) => (
            <ProfesorCard key={p.id} profesor={p} />
          ))}
        </div>
      )}
    </main>
  )
}
