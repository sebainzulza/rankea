import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, MessageSquare, Users, Gauge } from 'lucide-react'
import type { RamoStats } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dificultadInfo } from '@/lib/ratings'

type Props = { ramo: RamoStats & { carrera_nombre?: string | null } }

export default function RamoCard({ ramo }: Props) {
  const dif = dificultadInfo(ramo.dificultad)
  return (
    <Link to={`/ramo/${ramo.ramo_id}`} className="block">
      <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base leading-tight truncate">{ramo.nombre}</h3>
                  {ramo.carrera_nombre && (
                    <Badge variant="secondary" className="text-xs py-0 mt-1">{ramo.carrera_nombre}</Badge>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {ramo.total_resenas} reseña{ramo.total_resenas !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {ramo.total_profes} profe{ramo.total_profes !== 1 ? 's' : ''}
                </span>
                {ramo.dificultad != null && (
                  <span className={`flex items-center gap-1 font-medium ${dif.className}`}>
                    <Gauge className="h-3.5 w-3.5" />
                    {ramo.dificultad.toFixed(1)} · {dif.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
