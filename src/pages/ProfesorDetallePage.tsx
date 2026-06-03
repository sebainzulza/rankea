import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Loader2, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { ProfesorConStats, Ramo, Resena } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import RatingStars from '@/components/RatingStars'
import ResenaCard from '@/components/ResenaCard'
import ResenasPaywall from '@/components/ResenasPaywall'

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
              <Link key={ramo.id} to={`/ramo/${ramo.id}`}>
                <Badge
                  variant="secondary"
                  className="hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  {ramo.nombre}
                </Badge>
              </Link>
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
        <ResenasPaywall />
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
