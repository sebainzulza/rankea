import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Lock, Plus, Loader2, BookOpen, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { ProfesorConStats, Ramo, Resena } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import RatingStars from '@/components/RatingStars'

// ─── Componente de reseña individual ─────────────────────────────────────────
function ResenaCard({ resena }: { resena: Resena }) {
  const fecha = new Date(resena.created_at).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="w-fit text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              {resena.ramo?.nombre}
            </Badge>
            <span className="text-xs text-muted-foreground">{resena.semestre} · {fecha}</span>
          </div>
          <div className="flex flex-col items-center shrink-0 rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-1.5 min-w-[88px]">
            <span className="text-[10px] uppercase tracking-wider text-amber-700/80 font-semibold leading-none">
              Nota general
            </span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-base leading-none text-amber-900">
                {resena.calificacion_general.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-ratings */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Explicación', val: resena.calificacion_explicacion },
            { label: 'Exigencia', val: resena.calificacion_exigencia },
            { label: 'Accesibilidad', val: resena.calificacion_accesibilidad },
          ].map(({ label, val }) => (
            <div key={label} className="text-center bg-secondary rounded-lg p-2 border border-border/70">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <RatingStars value={val} size="sm" />
            </div>
          ))}
        </div>

        {/* Comentario */}
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          &ldquo;{resena.comentario}&rdquo;
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ProfesorDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profesor, setProfesor] = useState<ProfesorConStats | null>(null)
  const [resenas, setResenas] = useState<Resena[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAportado, setHasAportado] = useState(false)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profesores')
          .select('id, nombre, apellido, avatar_url, created_at, resenas(calificacion_general, ramo:ramos(id, nombre, codigo, carrera_id, created_at))')
          .eq('id', id)
          .maybeSingle()

        if (error) throw error
        if (!data) {
          setProfesor(null)
          return
        }

        const row = data as unknown as {
          id: string; nombre: string; apellido: string; avatar_url: string | null; created_at: string;
          resenas: { calificacion_general: number; ramo: Ramo | null }[]
        }
        const total = row.resenas.length
        const promedio = total ? row.resenas.reduce((s, r) => s + r.calificacion_general, 0) / total : 0
        const ramosMap = new Map<string, Ramo>()
        for (const r of row.resenas) if (r.ramo) ramosMap.set(r.ramo.id, r.ramo)

        setProfesor({
          id: row.id,
          nombre: row.nombre,
          apellido: row.apellido,
          avatar_url: row.avatar_url,
          created_at: row.created_at,
          promedio_general: promedio,
          total_resenas: total,
          ramos: Array.from(ramosMap.values()),
        })

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
        toast.error('No pudimos cargar este profesor.')
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
        .select('*, ramo:ramos(*)')
        .eq('profesor_id', id)
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

  if (!profesor) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Profesor no encontrado.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    )
  }

  const iniciales = `${profesor.nombre[0]}${profesor.apellido[0]}`.toUpperCase()

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      {/* Header del profe */}
      <Card className="mb-6 border-border/60 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/40" />
        <CardContent className="px-4 pb-4">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
              <AvatarFallback className="text-lg bg-primary/10 text-primary border border-primary/20">
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h1 className="text-xl font-bold">{profesor.nombre} {profesor.apellido}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <RatingStars value={Math.round(profesor.promedio_general)} size="sm" />
                <span className="text-sm font-semibold text-primary">
                  {profesor.promedio_general.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({profesor.total_resenas} reseñas)
                </span>
              </div>
            </div>
          </div>

          {/* Ramos */}
          <div className="flex flex-wrap gap-2">
            {profesor.ramos.map((ramo) => (
              <Badge key={ramo.id} variant="secondary">
                <BookOpen className="h-3 w-3 mr-1" />
                {ramo.nombre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sección de reseñas */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Reseñas</h2>
        <Button size="sm" onClick={() => navigate(`/nueva-resena?profesor_id=${profesor.id}`)}>
          <Plus className="h-4 w-4 mr-1" /> Agregar
        </Button>
      </div>

      {/* Paywall "proof of work" — reseñas falsas borrosas + overlay */}
      {!hasAportado ? (
        <div className="relative">
          {/* Cards borrosas de ejemplo (decorativas, no son reseñas reales) */}
          <div
            aria-hidden
            className="space-y-3 blur-md select-none pointer-events-none"
          >
            {[
              { ramo: 'Cálculo I', comentario: 'Explica muy bien la materia, siempre resuelve dudas fuera de clases.', rating: 4.5 },
              { ramo: 'Programación', comentario: 'Exigente pero justo, las evaluaciones reflejan lo que se enseña.', rating: 4.0 },
              { ramo: 'Inglés', comentario: 'Pruebas muy sorpresivas, cuesta seguir el ritmo de la clase.', rating: 2.5 },
            ].map((r, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="w-fit text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {r.ramo}
                    </Badge>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-sm">{r.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">&ldquo;{r.comentario}&rdquo;</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overlay con mensaje */}
          <div className="absolute inset-0 flex items-start justify-center pt-6">
            <Card className="border-primary/30 bg-background/95 shadow-lg max-w-md w-[92%]">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                    <Lock className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-base">Las reseñas están bloqueadas</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    No es de pago — es un <strong className="text-foreground">intercambio</strong>.
                    Publica una reseña tuya sobre cualquier profe que hayas tenido y se
                    desbloquean todas las demás al instante.
                  </p>
                </div>
                <Button onClick={() => navigate('/nueva-resena')} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar mi reseña para desbloquear
                </Button>
                <p className="text-xs text-muted-foreground">
                  Es gratis y 100% anónima.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : resenas.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>Aún no hay reseñas para este profesor.</p>
          <p className="text-sm mt-1">¡Sé el primero en dejar una!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resenas.map((r) => (
            <ResenaCard key={r.id} resena={r} />
          ))}
        </div>
      )}
    </main>
  )
}
