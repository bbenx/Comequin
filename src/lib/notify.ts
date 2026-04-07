/** Notifications affichées via le service worker (PWA). */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions & { tag?: string },
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    })
  } catch {
    new Notification(title, { ...options })
  }
}

export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}
