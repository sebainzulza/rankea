import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Si el proveedor de auth reportó error al canjear el código, Supabase lo
    // deja en la URL como ?error_description=...
    const url = new URL(window.location.href)
    const errorDesc = url.searchParams.get('error_description')
    if (errorDesc) {
      toast.error(errorDesc)
      navigate('/login', { replace: true })
      return
    }

    // Cuando el AuthProvider termina de canjear el ?code=, pasa loading=false.
    // Si aun así no hay sesión, algo falló: volver a login.
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [loading, user, navigate])

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Iniciando sesión...</p>
    </div>
  )
}
