import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Search, Loader2, Trophy, TrendingUp, Users } from 'lucide-react'
import type { Carrera, ProfesorConStats, Ramo, RamoStats } from '@/types'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ProfesorCard from '@/components/ProfesorCard'
import RamoCard from '@/components/RamoCard'
import { scorePonderado } from '@/lib/ratings'

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
type Vista = 'profesores' | 'ramos'
type Orden = 'recientes' | 'ranking'

type ProfesorFiltrable = ProfesorConStats & {
  ultima_resena_at: number | null
  carreras: Carrera[]
}

type ProfesorConScore = ProfesorFiltrable & { score: number }
type RamoFiltrable = RamoStats & { carrera_nombre: string | null }

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

const pill = (activo: boolean) =>
  `text-xs px-3 py-1.5 rounded-full border transition-colors ${
    activo
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/70'
  }`

export default function HomePage() {
  const [profesores, setProfesores] = useState<ProfesorFiltrable[]>([])
  const [ramos, setRamos] = useState<RamoFiltrable[]>([])
  const [vista, setVista] = useState<Vista>('profesores')
  const [busqueda, setBusqueda] = useState('')
  const [rango, setRango] = useState<Rango>('todas')
  const [carreraId, setCarreraId] = useState<string>('todas')
  const [orden, setOrden] = useState<Orden>('recientes')
  const [loading, setLoading] = useState(true)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [profRes, ramoRes, carrRes] = await Promise.all([
        supabase
          .from('profesores')
          .select('id, nombre, apellido, avatar_url, created_at, resenas(calificacion_general, created_at, ramo:ramos(id, nombre, codigo, carrera_id, created_at, carrera:carreras(id, nombre, codigo, created_at)))'),
        supabase.from('ramo_stats').select('*'),
        supabase.from('carreras').select('id, nombre'),
      ])
      if (profRes.error) throw profRes.error
      if (ramoRes.error) throw ramoRes.error
      if (carrRes.error) throw carrRes.error

      setProfesores((profRes.data as unknown as ProfesorRow[]).map(calcularStats))

      const carreraNombre = new Map<string, string>()
      for (const c of (carrRes.data ?? []) as { id: string; nombre: string }[]) {
        carreraNombre.set(c.id, c.nombre)
      }
      const ramosF = ((ramoRes.data as unknown as RamoStats[]) ?? []).map((r) => ({
        ...r,
        carrera_nombre: r.carrera_id ? carreraNombre.get(r.carrera_id) ?? null : null,
      }))
      setRamos(ramosF)
    } catch (e) {
      toast.error('No pudimos cargar los datos.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  // Promedio global (C) para el ranking ponderado.
  const promedioGlobal = useMemo(() => {
    let sum = 0
    let n = 0
    for (const p of profesores) {
      sum += p.promedio_general * p.total_resenas
      n += p.total_resenas
    }
    return n > 0 ? sum / n : 0
  }, [profesores])

  const profesoresConScore = useMemo<ProfesorConScore[]>(
    () =>
      profesores.map((p) => ({
        ...p,
        score: scorePonderado(p.promedio_general, p.total_resenas, promedioGlobal),
      })),
    [profesores, promedioGlobal]
  )

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    const desde = inicioRango(rango)
    let res = profesoresConScore
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
    return [...res].sort((a, b) => {
      if (orden === 'ranking') {
        if (a.total_resenas > 0 && b.total_resenas > 0) return b.score - a.score
        if (a.total_resenas > 0) return -1
        if (b.total_resenas > 0) return 1
        return a.apellido.localeCompare(b.apellido)
      }
      // 'recientes' (default): por reseña más reciente
      if (a.ultima_resena_at !== null && b.ultima_resena_at !== null) {
        return b.ultima_resena_at - a.ultima_resena_at
      }
      if (a.ultima_resena_at !== null) return -1
      if (b.ultima_resena_at !== null) return 1
      return a.apellido.localeCompare(b.apellido)
    })
  }, [profesoresConScore, busqueda, rango, carreraId, orden])

  const ramosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    let res = ramos
    if (q) {
      res = res.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q) ||
          (r.carrera_nombre?.toLowerCase().includes(q) ?? false)
      )
    }
    return [...res].sort((a, b) => b.total_resenas - a.total_resenas || a.nombre.localeCompare(b.nombre))
  }, [ramos, busqueda])

  const carrerasDisponibles = useMemo(() => {
    const map = new Map<string, Carrera>()
    for (const p of profesores) for (const c of p.carreras) map.set(c.id, c)
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [profesores])

  const top3 = useMemo(
    () =>
      profesoresConScore
        .filter((p) => p.total_resenas > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [profesoresConScore]
  )

  const totalResenas = useMemo(() => profesores.reduce((acc, p) => acc + p.total_resenas, 0), [profesores])

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
          <p className="text-lg font-bold">{totalResenas}</p>
          <p className="text-xs text-muted-foreground">Reseñas</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/20 shadow-sm">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">100%</p>
          <p className="text-xs text-muted-foreground">Anónimas</p>
        </div>
      </div>

      {/* Toggle Profesores | Ramos */}
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setVista('profesores')} className={`${pill(vista === 'profesores')} flex-1`}>
          Profesores
        </button>
        <button type="button" onClick={() => setVista('ramos')} className={`${pill(vista === 'ramos')} flex-1`}>
          Ramos
        </button>
      </div>

      {/* Top 3 (solo en vista profesores) */}
      {vista === 'profesores' && !loading && top3.length > 0 && (
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
          placeholder={vista === 'profesores' ? 'Buscar profe o ramo...' : 'Buscar ramo...'}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      {vista === 'profesores' ? (
        <>
          {/* Orden */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">Ordenar:</span>
            <button type="button" onClick={() => setOrden('recientes')} className={pill(orden === 'recientes')}>
              Recientes
            </button>
            <button type="button" onClick={() => setOrden('ranking')} className={pill(orden === 'ranking')}>
              Mejor ranking
            </button>
          </div>

          {/* Filtros por rango temporal */}
          <div className="flex flex-wrap gap-2 mb-4">
            {([
              { key: 'todas', label: 'Todas' },
              { key: 'hoy', label: 'Hoy' },
              { key: 'semana', label: 'Última semana' },
              { key: 'mes', label: 'Último mes' },
            ] as { key: Rango; label: string }[]).map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setRango(key)} className={pill(rango === key)}>
                {label}
              </button>
            ))}
          </div>

          {/* Filtro por carrera */}
          {carrerasDisponibles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button type="button" onClick={() => setCarreraId('todas')} className={pill(carreraId === 'todas')}>
                Todas las carreras
              </button>
              {carrerasDisponibles.map((c) => (
                <button key={c.id} type="button" onClick={() => setCarreraId(c.id)} className={pill(carreraId === c.id)}>
                  {c.nombre}
                </button>
              ))}
            </div>
          )}

          {/* Resultados profesores */}
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
                  {orden === 'ranking' ? 'Ranking de profesores' : 'Todos los profesores'}
                </h2>
                <Badge variant="secondary" className="text-xs">{filtrados.length}</Badge>
              </div>
              {filtrados.map((p) => (
                <ProfesorCard key={p.id} profesor={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Resultados ramos */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : ramosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No encontramos ramos con ese nombre.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Ramos
                </h2>
                <Badge variant="secondary" className="text-xs">{ramosFiltrados.length}</Badge>
              </div>
              {ramosFiltrados.map((r) => (
                <RamoCard key={r.ramo_id} ramo={r} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
