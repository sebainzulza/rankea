import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, MessageSquare, Star, Trash2, BookOpen, User as UserIcon, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Resena, Profesor, Ramo } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ResenaConProfesor = Resena & { profesor: Profesor | null; ramo: Ramo | null }

export default function PerfilPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resenas, setResenas] = useState<ResenaConProfesor[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<ResenaConProfesor | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    const cargar = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('resenas')
        .select('*, profesor:profesores(id, nombre, apellido, avatar_url, created_at), ramo:ramos(id, nombre, codigo, carrera_id, created_at)')
        .eq('autor_id', user.id)
        .order('created_at', { ascending: false })
      if (error) {
        toast.error('No pudimos cargar tus reseñas.')
        console.error(error)
      } else {
        setResenas((data as unknown as ResenaConProfesor[]) ?? [])
      }
      setLoading(false)
    }
    void cargar()
  }, [user])

  const confirmarBorrar = async () => {
    if (!toDelete) return
    setDeleting(true)
    const { error } = await supabase.from('resenas').delete().eq('id', toDelete.id)
    if (error) {
      toast.error('No pudimos borrar la reseña.')
      console.error(error)
    } else {
      setResenas((prev) => prev.filter((r) => r.id !== toDelete.id))
      toast.success('Reseña eliminada.')
    }
    setDeleting(false)
    setToDelete(null)
  }

  const promedioGeneral =
    resenas.length > 0
      ? resenas.reduce((s, r) => s + r.calificacion_general, 0) / resenas.length
      : 0

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      {/* Header */}
      <div className="relative mb-6 rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-xl shadow-sm shrink-0">
            <UserIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
            <p className="text-muted-foreground text-sm mt-1 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200/80 shadow-sm">
          <MessageSquare className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-bold">{resenas.length}</p>
          <p className="text-xs text-muted-foreground">Reseñas publicadas</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200/80 shadow-sm">
          <Star className="h-5 w-5 text-amber-600 fill-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {resenas.length > 0 ? promedioGeneral.toFixed(1) : '–'}
          </p>
          <p className="text-xs text-muted-foreground">Nota promedio que das</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Mis reseñas
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : resenas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <div>
              <p className="font-medium">Aún no publicas reseñas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Publica tu primera reseña y desbloquea todas las demás.
              </p>
            </div>
            <Button onClick={() => navigate('/nueva-resena')}>
              <Plus className="h-4 w-4 mr-1" /> Publicar mi primera reseña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resenas.map((r) => {
            const fecha = new Date(r.created_at).toLocaleDateString('es-CL', {
              year: 'numeric', month: 'short', day: 'numeric',
            })
            return (
              <Card key={r.id} className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {r.profesor ? (
                        <Link
                          to={`/profesor/${r.profesor.id}`}
                          className="font-semibold text-sm hover:text-primary hover:underline"
                        >
                          {r.profesor.nombre} {r.profesor.apellido}
                        </Link>
                      ) : (
                        <span className="font-semibold text-sm text-muted-foreground">Profesor eliminado</span>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {r.ramo && (
                          <Badge variant="secondary" className="text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {r.ramo.nombre}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{r.semestre}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-sm text-amber-900">
                        {r.calificacion_general.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{r.comentario}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground">{fecha}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setToDelete(r)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>¿Eliminar reseña?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Esta acción es permanente. La reseña desaparecerá del perfil de{' '}
              <strong className="text-foreground">
                {toDelete?.profesor
                  ? `${toDelete.profesor.nombre} ${toDelete.profesor.apellido}`
                  : 'este profesor'}
              </strong>.
              {resenas.length === 1 && (
                <span className="block mt-2 text-amber-700">
                  Al quedarte sin reseñas, perderás el acceso a las reseñas de otros profes hasta
                  que publiques una nueva.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarBorrar} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
