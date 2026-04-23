import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, LogOut, Plus, User, MessageSquareText } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ComentariosDialog from '@/components/ComentariosDialog'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [comentariosOpen, setComentariosOpen] = useState(false)

  const handleConfirmSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
    setConfirmOpen(false)
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="p-1.5 bg-primary rounded-lg">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">Rankea</span>
        </Link>

        {/* Acciones */}
        {user && (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/nueva-resena')}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Reseña</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComentariosOpen(true)}
              className="gap-1.5"
              title="Dejar un comentario"
            >
              <MessageSquareText className="h-4 w-4" />
              <span className="hidden sm:inline">Comentar</span>
            </Button>
            <Link
              to="/perfil"
              className="items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 bg-secondary hover:bg-secondary/70 hover:text-foreground hover:border-primary/40 transition-colors hidden sm:flex"
              title="Mi perfil"
            >
              <User className="h-3 w-3" />
              <span className="max-w-[140px] truncate">{user.email}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/perfil')}
              title="Mi perfil"
              className="sm:hidden"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Diálogo de comentarios */}
      <ComentariosDialog open={comentariosOpen} onOpenChange={setComentariosOpen} />

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <LogOut className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>¿Cerrar sesión?</DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>
                  Tendrás que pedir un nuevo <strong className="text-foreground">código de acceso</strong> a tu
                  correo para volver a entrar.
                </p>
                <div className="rounded-lg bg-secondary border border-border p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">¿Solo quieres salir de la app?</p>
                  <p>
                    Cierra la pestaña o el navegador como siempre — tu sesión queda guardada y la
                    próxima vez entras directo, sin pedir nada.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={signingOut}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Cerrando...' : 'Sí, cerrar sesión'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
