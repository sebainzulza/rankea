import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Device = 'ios' | 'android' | 'desktop'

function detectDevice(): Device {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || navigator.vendor || ''
  if (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // iOS Safari
  const iosStandalone = 'standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone
  // Otros navegadores (Android, desktop PWA)
  const displayMode = window.matchMedia?.('(display-mode: standalone)').matches
  return !!(iosStandalone || displayMode)
}

/**
 * Hook para gestionar la instalación de la PWA.
 * - En Android/Chrome desktop captura el `beforeinstallprompt` y expone `promptInstall()`.
 * - En iOS Safari no hay prompt nativo; hay que mostrar instrucciones manuales.
 * - Detecta si la app ya está corriendo como PWA instalada (standalone).
 */
export function usePWAInstall() {
  const [device] = useState<Device>(() => detectDevice())
  const [isStandalone, setIsStandalone] = useState<boolean>(() => detectStandalone())
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    const onInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }
    window.addEventListener('appinstalled', onInstalled)

    const mq = window.matchMedia?.('(display-mode: standalone)')
    const onChange = () => setIsStandalone(detectStandalone())
    mq?.addEventListener?.('change', onChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
      mq?.removeEventListener?.('change', onChange)
    }
  }, [])

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return choice.outcome
  }

  return {
    device,
    isStandalone,
    canPromptNatively: !!deferredPrompt,
    promptInstall,
  }
}
