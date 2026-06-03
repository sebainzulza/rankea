import { useNavigate } from 'react-router-dom'
import { BookOpen, Lock, Plus, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Reseñas de ejemplo (decorativas, NO son datos reales) que se muestran borrosas
// detrás del overlay del "proof of work".
const EJEMPLOS = [
  { ramo: 'Cálculo I', comentario: 'Explica muy bien la materia, siempre resuelve dudas fuera de clases.', rating: 4.5 },
  { ramo: 'Programación', comentario: 'Exigente pero justo, las evaluaciones reflejan lo que se enseña.', rating: 4.0 },
  { ramo: 'Inglés', comentario: 'Pruebas muy sorpresivas, cuesta seguir el ritmo de la clase.', rating: 2.5 },
]

/**
 * Paywall "proof of work": para leer reseñas hay que publicar una propia.
 * Muestra cards borrosas de ejemplo con un overlay que invita a publicar.
 * Compartido entre la página de profesor y la de ramo.
 */
export default function ResenasPaywall() {
  const navigate = useNavigate()

  return (
    <div className="relative">
      {/* Cards borrosas de ejemplo */}
      <div aria-hidden className="space-y-3 blur-md select-none pointer-events-none">
        {EJEMPLOS.map((r, i) => (
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
            <p className="text-xs text-muted-foreground">Es gratis y 100% anónima.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
