import { useCallback, useEffect, useState } from 'react'
import { getNotifyPermission, requestNotifyPermission, type NotifyPermission } from './notify'
import { getPlatform, type Platform } from './platform'

/**
 * Estado real del permiso de notificaciones para Ajustes. Consulta (sin pedir nada) al abrir y al volver a la ventana,
 * por si el usuario lo cambió en los ajustes del navegador. `request` es el único punto que solicita permiso.
 */
export function useNotifyStatus(active: boolean): { permission: NotifyPermission | null; platform: Platform; request: () => Promise<void> } {
  const [permission, setPermission] = useState<NotifyPermission | null>(null)
  const refresh = useCallback(() => { void getNotifyPermission().then(setPermission) }, [])

  useEffect(() => {
    if (!active) return
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [active, refresh])

  const request = useCallback(async () => { setPermission(await requestNotifyPermission()) }, [])
  return { permission, platform: getPlatform(), request }
}
