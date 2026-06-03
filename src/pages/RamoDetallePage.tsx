import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Loader2, BookOpen, Users, Trophy, MessageSquare, Gauge } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { RamoConCarrera, RamoStats, ProfesorRamoStats, Resena } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import RatingStars from '@/components/RatingStars'
import ResenaCard from '@/components/ResenaCard'
import ResenasPaywall from '@/components/ResenasPaywall'
import { dificultadInfo } from '@/lib/ratings'

const medalla = (i: number): string => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`

// ─── Fila "mejor profe para este ramo" ─────────────────────────────────────────
// Ordena por score ponderado, pero muestra el promedio crudo (más intuitivo) + nº reseñas.
function MejorProfeRow({ profe, rank }: { profe: ProfesorRamoStats; rank: number }) {
  const iniciales = `${profe.profesor_nombre[0] ?? ''}${profe.profesor_apellido[0] ?? ''}`.toUpperCase()
  const promedio = profe.promedio_general ?? 0
  return (
    <Link
      to={`/profesor/${profe.profesor_id}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 hover:bg-primary/5 hover:border-primary/40 transition-colors p-3"
    >
      <span className="text-base w-7 text-center shrink-0 tabular-nums">{medalla(rank)}</span>
      <Avatar className="h-9 w-9 shrink-0">
        {profe.profesor_avatar_url && <AvatarImage src={profe.profesor_avatar_url} />}
        <AvatarFallback className="text-xs bg-primary/10 text-primary border border-primary/20">
          {iniciales}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{profe.profesor_nombre} {profe.profesor_apellido}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <RatingStars value={Math.round(promedio)} size="sm" />
          <span className="text-xs font-semibold text-primary">{promedio.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            · {profe.total_resenas} reseña{profe.total_resenas !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Página principal ───────────────────────────────────────────────────────────
export default function RamoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ramo, setRamo] = useState<RamoConCarrera | null>(null)
  const [stats, setStats] = useState<RamoStats | null>(null)
  const [mejoresProfes, setMejoresProfes] = useState<ProfesorRamoStats[]>([])
  const [resenas, setResenas] = useState<Resena[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAportado, setHasAportado] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState(false)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      setLoading(true)
      try {
        const [ramoRes, statsRes, profesRes] = await Promise.all([
          supabase
            .from('ramos')
            .select('id, nombre, codigo, carrera_id, created_at, carrera:carreras(id, nombre, codigo, created_at)')
            .eq('id', id)
            .maybeSingle(),
          supabase.from('ramo_stats').select('*').eq('ramo_id', id).maybeSingle(),
          supabase
            .from('profesor_ramo_stats')
            .select('*')
            .eq('ramo_id', id)
            .order('score_ponderado', { ascending: false }),
        ])

        if (ramoRes.error) throw ramoRes.error
        if (!ramoRes.data) {
          setNoEncontrado(true)
          return
        }
        setRamo(ramoRes.data as unknown as RamoConCarrera)
        setStats((statsRes.data as unknown as RamoStats) ?? null)
        setMejoresProfes((profesRes.data as unknown as ProfesorRamoStats[]) ?? [])

        if (user) {
          const { count, error: countError } = await supabase
            .from('resenas')
            .select('id', { count: 'exact', head: true })
            .eq('autor_id', user.id)
          if (countError) throw countError
          setHasAportado((count ?? 0) > 0)
        } else {
          setHasAportado(false)
        }
      } catch (e) {
        toast.error('No pudimos cargar este ramo.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [id, user])

  useEffect(() => {
    if (!hasAportado || !id) return
    const cargarResenas = async () => {
      const { data, error } = await supabase
        .from('resenas')
        .select('*, profesor:profesores(*)')
        .eq('ramo_id', id)
        .order('created_at', { ascending: false })
      if (error) {
        toast.error('No pudimos cargar las reseñas.')
        console.error(error)
        return
      }
      setResenas((data as unknown as Resena[]) ?? [])
    }
    void cargarResenas()
  }, [hasAportado, id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (noEncontrado || !ramo) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Ramo no encontrado.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    )
  }

  const totalResenas = stats?.total_resenas ?? 0
  const totalProfes = stats?.total_profes ?? 0
  const dif = dificultadInfo(stats?.dificultad ?? null)

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      {/* Header del ramo */}
      <Card className="mb-6 border-border/60 overflow-hidden">
        <div className="h-20 bg-gradient-to-br from-primary/20 to-secondary/40" />
        <CardContent className="px-4 pb-4">
          <div className="flex items-start gap-3 -mt-6 mb-3">
            <div className="p-3 bg-background border border-border rounded-xl shadow-sm shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="pt-6 min-w-0">
              <h1 className="text-xl font-bold leading-tight">{ramo.nombre}</h1>
              {ramo.carrera && (
                <Badge variant="secondary" className="mt-1 text-xs">{ramo.carrera.nombre}</Badge>
              )}
            </div>
          </div>

          {/* Chips de stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-secondary/60 border border-border/70 p-2 text-center">
              <MessageSquare className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-bold leading-none">{totalResenas}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Reseñas</p>
            </div>
            <div className="rounded-lg bg-secondary/60 border border-border/70 p-2 text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-bold leading-none">{totalProfes}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Profes</p>
            </div>
            <div className="rounded-lg bg-secondary/60 border border-border/70 p-2 text-center">
              <Gauge className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className={`text-sm font-bold leading-none ${dif.className}`}>
                {stats?.dificultad != null ? stats.dificultad.toFixed(1) : '–'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{dif.label}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mejores profes para este ramo */}
      {mejoresProfes.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h2 className="font-semibold text-lg">Mejores profes para este ramo</h2>
          </div>
          <div className="space-y-2">
            {mejoresProfes.map((p, i) => (
              <MejorProfeRow key={p.profesor_id} profe={p} rank={i} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ordenados por un ranking ponderado: más reseñas = más confianza, no solo el promedio.
          </p>
        </section>
      )}

      {/* Sección de reseñas */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Reseñas</h2>
        <Button size="sm" onClick={() => navigate('/nueva-resena')}>
          <Plus className="h-4 w-4 mr-1" /> Agregar
        </Button>
      </div>

      {!hasAportado ? (
        <ResenasPaywall />
      ) : resenas.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>Aún no hay reseñas para este ramo.</p>
          <p className="text-sm mt-1">¡Sé el primero en dejar una!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resenas.map((r) => (
            <ResenaCard key={r.id} resena={r} mostrar="profesor" />
          ))}
        </div>
      )}
    </main>
  )
}
