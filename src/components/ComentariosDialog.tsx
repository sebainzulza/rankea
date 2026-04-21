import { useState } from 'react'
import { toast } from 'sonner'
import { Send, Loader2, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Tipo = 'problema' | 'sugerencia' | 'otro'

const OPCIONES: { key: Tipo; label: string; icon: typeof AlertTriangle; color: string }[] = [
  { key: 'problema', label: 'Algo no funciona', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
  { key: 'sugerencia', label: 'Idea o sugerencia', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { key: 'otro', label: 'Otro comentario', icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ComentariosDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth()
  const [tipo, setTipo] = useState<Tipo | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setTipo(null)
    setMensaje('')
    setSubmitting(false)
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const canSubmit = tipo !== null && mensaje.trim().length >= 10 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !user) return
    setSubmitting(true)
    const { error } = await supabase.from('comentarios_app').insert({
      tipo,
      mensaje: mensaje.trim(),
      autor_id: user.id,
    })
    setSubmitting(false)
    if (error) {
      console.error(error)
      toast.error('No pudimos enviar tu comentario. Intenta de nuevo.')
      return
    }
    toast.success('¡Gracias! Leo todos los comentarios.')
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dejar un comentario</DialogTitle>
          <DialogDescription>
            ¿Algo que mejorar? ¿Una idea? Cuéntame — leo todos los comentarios y me ayudan a mejorar Rankea.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Selector de tipo */}
          <div>
            <p className="text-sm font-medium mb-2">¿Sobre qué es?</p>
            <div className="grid grid-cols-1 gap-2">
              {OPCIONES.map(({ key, label, icon: Icon, color }) => {
                const activo = tipo === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTipo(key)}
                    className={`flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border transition-all ${
                      activo
                        ? `${color} border-2`
                        : 'bg-secondary/40 border-border hover:bg-secondary/70'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${activo ? '' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${activo ? '' : 'text-foreground'}`}>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <p className="text-sm font-medium mb-2">Tu comentario</p>
            <Textarea
              placeholder="Escribe lo que quieras mejorar, una idea, o lo que sea..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span>Mínimo 10 caracteres.</span>
              <span>{mensaje.length}/1000</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => handleClose(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><Send className="h-4 w-4" /> Enviar comentario</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
