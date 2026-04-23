import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Validación liviana de email (no chequea dominio, solo formato básico).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  requestLoginCode: (email: string) => Promise<{ error: string | null }>
  verifyLoginCode: (email: string, token: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const hasHashToken = window.location.hash.includes('access_token=')

      // PKCE: si hay ?code= en la URL, intercambiarlo por sesión antes de decidir
      // si el usuario está autenticado. Esto evita que RequireAuth redirija a
      // /login mientras aún no se ha canjeado el código.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          url.searchParams.delete('code')
          window.history.replaceState({}, '', url.pathname + url.search + url.hash)
        } else {
          console.error('[auth] exchangeCodeForSession:', error)
        }
      }

      // Flujo implicit (#access_token=...): supabase-js lo procesa solo con
      // detectSessionInUrl. Cedemos un tick para que termine.
      if (hasHashToken) {
        await new Promise((r) => setTimeout(r, 50))
      }

      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const requestLoginCode = async (email: string): Promise<{ error: string | null }> => {
    const clean = email.toLowerCase().trim()
    if (!EMAIL_REGEX.test(clean)) {
      return { error: 'Ingresa un correo válido' }
    }

    // El correo entrega un código de 6 dígitos en lugar de un magic link.
    // Aceptamos cualquier dominio (Gmail, Outlook, INACAP, etc.) para evitar
    // problemas de delivery con Microsoft Defender Safe Links de @inacapmail.cl.
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
    })

    if (error) return { error: error.message }
    return { error: null }
  }

  const verifyLoginCode = async (
    email: string,
    token: string,
  ): Promise<{ error: string | null }> => {
    const cleanToken = token.replace(/\s+/g, '')
    const { error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: cleanToken,
      type: 'email',
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, requestLoginCode, verifyLoginCode, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
