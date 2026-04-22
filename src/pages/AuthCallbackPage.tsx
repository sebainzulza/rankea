import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = async () => {
      const url = new URL(window.location.href)
      const errorDesc = url.searchParams.get('error_description')
      if (errorDesc) {
        setError(errorDesc)
        toast.error(errorDesc)
        setTimeout(() => navigate('/login', { replace: true }), 2000)
        return
      }

      const code = url.searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(error.message)
          toast.error(`No se pudo iniciar sesión: ${error.message}`)
          setTimeout(() => navigate('/login', { replace: true }), 2500)
          return
        }
        navigate('/', { replace: true })
        return
      }

      // Flujo implicit (hash con access_token): supabase-js ya lo procesó al cargar
      // el módulo. Damos un tick a onAuthStateChange y redirigimos.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }

    handle()
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {error ? `Error: ${error}` : 'Iniciando sesión...'}
      </p>
    </div>
  )
}
