import { useNavigate } from 'react-router-dom'
import { MessageSquare, ChevronRight } from 'lucide-react'
import type { ProfesorConStats } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import RatingStars from '@/components/RatingStars'

type Props = { profesor: ProfesorConStats }

export default function ProfesorCard({ profesor }: Props) {
  const navigate = useNavigate()
  const iniciales = `${profesor.nombre[0]}${profesor.apellido[0]}`.toUpperCase()
  const promedio = profesor.promedio_general ?? 0

  const getColorPromedio = (p: number) => {
    if (p >= 4) return 'text-emerald-600'
    if (p >= 3) return 'text-amber-600'
    return 'text-primary'
  }

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
      onClick={() => navigate(`/profesor/${profesor.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 shrink-0">
            {profesor.avatar_url && <AvatarImage src={profesor.avatar_url} />}
            <AvatarFallback className="text-sm bg-primary/10 text-primary border border-primary/20">
              {iniciales}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base leading-tight">
                  {profesor.nombre} {profesor.apellido}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars value={Math.round(promedio)} size="sm" />
                  <span className={`text-sm font-bold ${getColorPromedio(promedio)}`}>
                    {promedio.toFixed(1)}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            </div>

            {/* Ramos */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profesor.ramos.slice(0, 3).map((ramo) => (
                <Badge key={ramo.id} variant="secondary" className="text-xs py-0">
                  {ramo.nombre}
                </Badge>
              ))}
              {profesor.ramos.length > 3 && (
                <Badge variant="outline" className="text-xs py-0">
                  +{profesor.ramos.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{profesor.total_resenas} reseña{profesor.total_resenas !== 1 ? 's' : ''}</span>
        </div>
      </CardContent>
    </Card>
  )
}
