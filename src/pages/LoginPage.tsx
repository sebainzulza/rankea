import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TrendingUp, Mail, Lock, ArrowRight, Loader2, Smartphone } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import InstalarAppDialog from '@/components/InstalarAppDialog'

const LAST_EMAIL_KEY = 'rankea.lastEmail'

export default function LoginPage() {
  const { user, loading, signInWithMagicLink } = useAuth()
  const { isStandalone, device } = usePWAInstall()
  const [email, setEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)

  const isMobile = device === 'ios' || device === 'android'
  const shouldSuggestInstall = isMobile && !isStandalone

  // Si ya está autenticado, redirige al home
  if (!loading && user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await signInWithMagicLink(email)

    if (error) {
      toast.error(error)
    } else {
      localStorage.setItem(LAST_EMAIL_KEY, email.toLowerCase().trim())
      setEmailSent(true)
      toast.success('¡Revisa tu correo! Te enviamos un link mágico.')
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-secondary/20">
      {/* Logo / Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary rounded-2xl shadow-sm">
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Rankea</h1>
        <p className="text-muted-foreground mt-2">INACAP Temuco · Exclusivo para estudiantes</p>
      </div>

      {shouldSuggestInstall && (
        <button
          type="button"
          onClick={() => setInstallOpen(true)}
          className="w-full max-w-md mb-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-3 text-left"
        >
          <div className="shrink-0 p-2 bg-primary/10 rounded-md border border-primary/20">
            <Smartphone className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Instala Rankea como app (opcional)</p>
            <p className="text-xs text-muted-foreground">
              También puedes usarla como web normal. Instalarla guarda tu sesión y la abre más
              rápido.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      )}

      <Card className="w-full max-w-md border-border/60">
        {!emailSent ? (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Ingresa a la plataforma</CardTitle>
              <CardDescription>
                Solo se permite el acceso con correo <strong>@inacapmail.cl</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo institucional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tunombre@inacapmail.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando link...
                    </>
                  ) : (
                    <>
                      Enviar Magic Link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
                <div className="flex gap-3 text-sm">
                  <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">¿Cómo funciona?</p>
                    <p>Recibirás un link en tu correo. Al hacer clic, quedarás logueado automáticamente. Sin contraseñas que recordar.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">¡Revisa tu bandeja!</h2>
                <p className="text-muted-foreground mt-2">
                  Enviamos un link mágico a <strong className="text-foreground">{email}</strong>.
                  Haz clic en el link para ingresar.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                ¿No llegó? Revisa la carpeta de spam o{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  intenta de nuevo
                </button>
                .
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm">
        Plataforma exclusiva para estudiantes de INACAP Temuco.
        Las reseñas son anónimas y no pueden ser rastreadas por otros usuarios.
      </p>

      {!isStandalone && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Puedes usar Rankea desde el navegador o{' '}
          <button
            type="button"
            onClick={() => setInstallOpen(true)}
            className="text-primary hover:underline font-medium"
          >
            instalarla como app
          </button>
          .
        </p>
      )}

      <InstalarAppDialog open={installOpen} onOpenChange={setInstallOpen} />
    </div>
  )
}
