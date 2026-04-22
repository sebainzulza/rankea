import { Share, Plus, Smartphone, Download, MoreVertical, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/usePWAInstall'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function InstalarAppDialog({ open, onOpenChange }: Props) {
  const { device, canPromptNatively, promptInstall } = usePWAInstall()

  const handleInstallNative = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Instalar Rankea</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Rankea funciona igual como web normal desde el navegador. Instalarla es{' '}
            <strong className="text-foreground">opcional</strong>: la abres como app desde tu
            pantalla de inicio y{' '}
            <strong className="text-foreground">tu sesión queda guardada</strong> — no tendrás que
            pedir Magic Links cada vez.
          </DialogDescription>
        </DialogHeader>

        {/* CTA nativa (Android / Chrome desktop) */}
        {canPromptNatively && (
          <div className="space-y-3">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Tu navegador soporta instalación directa
              </p>
              <Button onClick={handleInstallNative} className="w-full" size="lg">
                <Download className="h-4 w-4" />
                Instalar ahora
              </Button>
            </div>
          </div>
        )}

        {/* Instrucciones iOS — siempre visibles, la detección de device no es confiable en DevTools/WebViews */}
        <div className="space-y-3">
          <p className="text-sm font-medium">En iPhone (Safari):</p>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  1
                </span>
                <span className="flex-1">
                  Toca el botón de compartir{' '}
                  <Share className="inline h-4 w-4 mx-0.5 -mt-0.5" />
                  en la barra de abajo.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  2
                </span>
                <span className="flex-1">
                  Baja en el menú y selecciona{' '}
                  <strong>"Añadir a pantalla de inicio"</strong>{' '}
                  <Plus className="inline h-4 w-4 mx-0.5 -mt-0.5" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  3
                </span>
                <span className="flex-1">Toca <strong>"Añadir"</strong> arriba a la derecha.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-semibold text-emerald-700">
                  ✓
                </span>
                <span className="flex-1">
                  Abre Rankea desde tu pantalla de inicio y haz login desde ahí.
                </span>
              </li>
            </ol>
          <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-3">
            <p className="text-xs text-amber-900">
              <strong>Importante:</strong> debes usar Safari en iPhone, no Chrome ni otros
              navegadores.
            </p>
          </div>
        </div>

        {/* Instrucciones Android — siempre visibles si no hay prompt nativo */}
        {!canPromptNatively && (
          <div className="space-y-3">
            <p className="text-sm font-medium">En Android (Chrome):</p>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  1
                </span>
                <span className="flex-1">
                  Toca el menú <MoreVertical className="inline h-4 w-4 mx-0.5 -mt-0.5" /> (arriba a la derecha).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  2
                </span>
                <span className="flex-1">
                  Selecciona <strong>"Instalar aplicación"</strong> o{' '}
                  <strong>"Añadir a pantalla de inicio"</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-semibold text-emerald-700">
                  ✓
                </span>
                <span className="flex-1">
                  Abre Rankea desde tu pantalla de inicio y haz login desde ahí.
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Desktop sin prompt nativo */}
        {device === 'desktop' && !canPromptNatively && (
          <div className="rounded-lg bg-secondary border border-border p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">En escritorio:</strong> busca el ícono{' '}
            <Download className="inline h-3.5 w-3.5 mx-0.5" /> en la barra de direcciones de Chrome /
            Edge para instalar. En Firefox o Safari desktop no está disponible — úsala como web
            normal.
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
