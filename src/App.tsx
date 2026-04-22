import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/layout/Navbar'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import ProfesorDetallePage from '@/pages/ProfesorDetallePage'
import NuevaResenaPage from '@/pages/NuevaResenaPage'
import PerfilPage from '@/pages/PerfilPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

// Guard que redirige a /login si no hay sesión
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/profesor/:id" element={<RequireAuth><ProfesorDetallePage /></RequireAuth>} />
          <Route path="/nueva-resena" element={<RequireAuth><NuevaResenaPage /></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><PerfilPage /></RequireAuth>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </BrowserRouter>
  )
}
