import { format, isAfter, isSameDay, parseISO } from 'date-fns'

/** Affiche l’horaire d’un événement (début seul ou plage début–fin). */
export function formatEventTimeRange(startIso: string, endIso?: string): string {
  if (!endIso?.trim()) {
    try {
      return format(parseISO(startIso), 'HH:mm')
    } catch {
      return '—'
    }
  }
  try {
    const s = parseISO(startIso)
    const e = parseISO(endIso)
    if (!isAfter(e, s)) return format(s, 'HH:mm')
    const t1 = format(s, 'HH:mm')
    const t2 = isSameDay(s, e) ? format(e, 'HH:mm') : format(e, 'dd/MM HH:mm')
    return `${t1} – ${t2}`
  } catch {
    try {
      return format(parseISO(startIso), 'HH:mm')
    } catch {
      return '—'
    }
  }
}
