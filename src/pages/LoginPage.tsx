import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TrendingUp, Mail, Lock, ArrowRight, Loader2, Smartphone, KeyRound } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import InstalarAppDialog from '@/components/InstalarAppDialog'

const LAST_EMAIL_KEY = 'rankea.lastEmail'

export default function LoginPage() {
  const { user, loading, requestLoginCode, verifyLoginCode } = useAuth()
  const { isStandalone, device } = usePWAInstall()
  const [email, setEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) ?? '')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [installOpen, setInstallOpen] = useState(false)

  const isMobile = device === 'ios' || device === 'android'
  const shouldSuggestInstall = isMobile && !isStandalone

  // Si ya está autenticado, redirige al home
  if (!loading && user) return <Navigate to="/" replace />

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await requestLoginCode(email)

    if (error) {
      toast.error(error)
    } else {
      localStorage.setItem(LAST_EMAIL_KEY, email.toLowerCase().trim())
      setStep('code')
      toast.success('Te enviamos un código. Puede tardar hasta 3 min en llegar.')
    }

    setSubmitting(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)

    const { error } = await verifyLoginCode(email, code)

    if (error) {
      toast.error(
        error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid')
          ? 'El código es incorrecto o expiró. Pide uno nuevo.'
          : error,
      )
      setVerifying(false)
      return
    }

    // El AuthProvider detectará la sesión vía onAuthStateChange y RequireAuth
    // redirigirá al home automáticamente.
    toast.success('¡Bienvenido!')
  }

  const handleResend = async () => {
    setSubmitting(true)
    const { error } = await requestLoginCode(email)
    if (error) {
      toast.error(error)
    } else {
      setCode('')
      toast.success('Nuevo código enviado. Puede tardar hasta 3 min.')
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
        {step === 'email' ? (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Ingresa a la plataforma</CardTitle>
              <CardDescription>
                Solo se permite el acceso con correo <strong>@inacapmail.cl</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestCode} className="space-y-4">
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
                      Enviando código...
                    </>
                  ) : (
                    <>
                      Enviar código
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
                    <p>
                      Recibirás un código de 6 dígitos en tu correo institucional. Lo ingresas aquí
                      y listo, sin contraseñas que recordar.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Ingresa tu código</CardTitle>
              <CardDescription>
                Enviamos un código de 6 dígitos a <strong className="text-foreground">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de acceso</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="pl-9 tracking-widest text-center text-lg"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 flex flex-col gap-2 text-center text-xs text-muted-foreground">
                <p>
                  ¿No llegó el código? Revisa la carpeta de spam o{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={submitting}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    reenvía el código
                  </button>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setCode('')
                  }}
                  className="text-primary hover:underline"
                >
                  Usar otro correo
                </button>
              </div>
            </CardContent>
          </>
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
