import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, Star } from 'lucide-react'
import type { Resena } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RatingStars from '@/components/RatingStars'

type Props = {
  resena: Resena
  /**
   * Qué entidad resaltar (y enlazar) en la cabecera:
   * - 'ramo' (default): muestra el ramo → usado en la página de un profesor.
   * - 'profesor': muestra el profe → usado en la página de un ramo.
   */
  mostrar?: 'ramo' | 'profesor'
}

export default function ResenaCard({ resena, mostrar = 'ramo' }: Props) {
  const fecha = new Date(resena.created_at).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const ramo = resena.ramo
  const profesor = resena.profesor

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            {mostrar === 'profesor' && profesor ? (
              <Link to={`/profesor/${profesor.id}`} className="w-fit">
                <Badge
                  variant="secondary"
                  className="text-xs hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {profesor.nombre} {profesor.apellido}
                </Badge>
              </Link>
            ) : ramo ? (
              <Link to={`/ramo/${ramo.id}`} className="w-fit">
                <Badge
                  variant="secondary"
                  className="text-xs hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  {ramo.nombre}
                </Badge>
              </Link>
            ) : null}
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
